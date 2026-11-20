import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import {
  AlertOctagon,
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  FileWarning,
  QrCode,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DEMO_QR_SAMPLES } from '../data/scenarios';
import { analyzeQrPayload } from '../services/api';
import type { LanguageCode, QrAnalysisResult } from '../types/scamshield';
import { qrVerdictClasses } from './RiskText';

interface QrShieldViewProps {
  language: LanguageCode;
  simpleLanguageMode: boolean;
  isSpeaking: boolean;
  onSpeakText: (text: string) => void;
  onStopSpeaking: () => void;
  onPrepareReportFromQr: (qr: QrAnalysisResult) => void;
  onQrAnalyzed: (qr: QrAnalysisResult) => void;
}

function DemoQrThumb({ payload }: { payload: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, payload, {
      width: 84,
      margin: 1,
      color: {
        dark: '#090B0F',
        light: '#F8FAFC',
      },
    }).catch(() => {
      // ignore canvas render issues
    });
  }, [payload]);

  return (
    <canvas
      ref={canvasRef}
      width={84}
      height={84}
      aria-hidden="true"
      className="w-[72px] h-[72px] rounded-md bg-white p-1 shrink-0"
    />
  );
}

export function QrShieldView({
  language,
  simpleLanguageMode,
  isSpeaking,
  onSpeakText,
  onStopSpeaking,
  onPrepareReportFromQr,
  onQrAnalyzed,
}: QrShieldViewProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [result, setResult] = useState<QrAnalysisResult | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const stopCamera = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const runQrAnalysis = async (decodedContent: string, sampleId: string | null = null) => {
    setSelectedSampleId(sampleId);
    setUploadError('');
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 420));
    const analyzed = await analyzeQrPayload({ content: decodedContent, language });
    setResult(analyzed);
    setIsScanning(false);
    onQrAnalyzed(analyzed);
  };

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported in this browser. Upload a QR image or try a demo QR sample below.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          scanCameraFrame();
        }
      });
    } catch {
      setCameraError('Camera permission was denied or no camera was detected. You can upload a QR image or inspect any demo QR sample below.');
      stopCamera();
    }
  };

  const scanCameraFrame = () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = hiddenCanvasRef.current ?? document.createElement('canvas');
      hiddenCanvasRef.current = canvas;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          stopCamera();
          void runQrAnalysis(code.data);
          return;
        }
      }
    }
    rafRef.current = requestAnimationFrame(scanCameraFrame);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setUploadError('Unable to process image canvas.');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (!code || !code.data) {
          setUploadError('No readable QR code was found in that image. Make sure the QR code is clear and well-lit, or test one of the demo QR samples.');
          return;
        }
        void runQrAnalysis(code.data, null);
      };
      img.onerror = () => {
        setUploadError('Could not load that image file. Please upload a PNG, JPG, or WebP QR image.');
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const verdictStyle = result ? qrVerdictClasses(result.verdict) : null;

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">QR Shield</h1>
        <p className="text-sm text-[#94A3B8] max-w-2xl">
          Inspect QR codes before opening links or paying with UPI. Decoding a QR code never automatically makes it safe—ScamShield verifies payment intent, domains, and hidden redirects first.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Scanner / Upload + Inspection Verdict */}
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#05120A] font-display font-bold text-sm transition-colors whitespace-nowrap"
                >
                  <Camera className="w-4 h-4" aria-hidden="true" />
                  <span>Scan with Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-display font-bold text-sm transition-colors whitespace-nowrap"
                >
                  <CameraOff className="w-4 h-4" aria-hidden="true" />
                  <span>Stop Camera</span>
                </button>
              )}

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#171E29] hover:bg-[#202938] border border-[#2D3748] text-white text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap">
                <Upload className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
                <span>Upload QR Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
            </div>

            {cameraActive && (
              <div className="relative rounded-lg overflow-hidden bg-black border border-[#22C55E]/40 aspect-video">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-[#22C55E] rounded-xl shadow-[0_0_0_9999px_rgba(9,11,15,0.45)]" />
                </div>
                <p className="absolute bottom-3 inset-x-0 text-center text-xs font-medium text-white bg-black/60 py-1">
                  Point camera steadily at a QR code to inspect safely...
                </p>
              </div>
            )}

            {cameraError && (
              <p className="text-xs text-[#FBBF24] bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg p-3">
                {cameraError}
              </p>
            )}

            {uploadError && (
              <p className="text-xs text-[#FCA5A5] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3">
                {uploadError}
              </p>
            )}

            {isScanning && (
              <div className="p-6 rounded-lg bg-[#0B0E13] border border-[#222936] space-y-3" role="status">
                <div className="relative h-1.5 w-full rounded-full bg-[#1C2330] overflow-hidden">
                  <div className="absolute inset-y-0 w-2/5 rounded-full bg-[#22C55E] animate-scan-sweep" />
                </div>
                <p className="text-sm font-semibold text-[#4ADE80]">
                  Inspecting decoded QR destination and payment instructions...
                </p>
              </div>
            )}

            {!isScanning && !result && (
              <div className="p-8 rounded-lg bg-[#0B0E13] border border-[#1E2532] text-center space-y-2">
                <QrCode className="w-8 h-8 text-[#64748B] mx-auto" aria-hidden="true" />
                <p className="text-sm font-medium text-white">No QR code scanned yet</p>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                  Upload any QR screenshot, use your camera, or click a live demo QR sample on the right to see ScamShield analyze UPI collect links and phishing URLs.
                </p>
              </div>
            )}
          </section>

          {/* QR Analysis Result Card */}
          {!isScanning && result && verdictStyle && (
            <section
              role={result.verdict === 'DANGEROUS' ? 'alert' : 'status'}
              className={`rounded-xl border p-6 space-y-5 ${verdictStyle.surface} ${verdictStyle.border}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className={`inline-flex items-center gap-2 font-display font-extrabold text-sm tracking-wider ${verdictStyle.text}`}>
                    {result.verdict === 'DANGEROUS' ? (
                      <AlertOctagon className="w-5 h-5" aria-hidden="true" />
                    ) : result.verdict === 'CAUTION' ? (
                      <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    )}
                    <span>QR VERDICT: {result.verdict}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{result.category}</h2>
                  <p className="text-xs text-[#CBD5E1] font-mono tabular-nums">
                    Risk Score {result.riskScore}/100 · Type: {result.contentType.replace('_', ' ')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    isSpeaking
                      ? onStopSpeaking()
                      : onSpeakText(`${result.verdict}. ${result.simpleExplanation}`)
                  }
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0B0E13] hover:bg-[#171E29] border border-[#2D3748] text-xs font-semibold text-white whitespace-nowrap shrink-0"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4 text-[#F87171]" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
                  )}
                  <span>{isSpeaking ? 'Stop Reading' : 'Read Out Loud'}</span>
                </button>
              </div>

              <p className={`text-white leading-relaxed ${simpleLanguageMode ? 'text-lg font-semibold' : 'text-base'}`}>
                {simpleLanguageMode ? result.simpleExplanation : result.explanation}
              </p>

              {!simpleLanguageMode && (
                <p className="text-sm text-[#CBD5E1]">
                  Simple guidance: {result.simpleExplanation}
                </p>
              )}

              {/* Decoded Payload Inspection Box */}
              <div className="rounded-lg bg-[#0B0E13] border border-[#242D3C] p-4 space-y-2">
                <span className="block text-xs font-semibold text-[#94A3B8]">
                  Decoded QR Content (Safely Held — Not Opened)
                </span>
                <p className="font-mono text-xs text-[#E2E8F0] break-all leading-relaxed">
                  {result.rawContent}
                </p>

                {result.upiDetails && (
                  <div className="pt-2 mt-2 border-t border-[#1E2532] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {result.upiDetails.payeeName && (
                      <div>
                        <span className="text-[#64748B]">Payee Name: </span>
                        <span className="text-white font-medium">{result.upiDetails.payeeName}</span>
                      </div>
                    )}
                    {result.upiDetails.payeeVpa && (
                      <div>
                        <span className="text-[#64748B]">UPI ID: </span>
                        <span className="font-mono text-white">{result.upiDetails.payeeVpa}</span>
                      </div>
                    )}
                    {result.upiDetails.amount && (
                      <div>
                        <span className="text-[#64748B]">Requested Debit: </span>
                        <span className="font-mono text-[#F87171] font-semibold">
                          ₹{result.upiDetails.amount}
                        </span>
                      </div>
                    )}
                    {result.upiDetails.note && (
                      <div className="sm:col-span-2">
                        <span className="text-[#64748B]">Note: </span>
                        <span className="text-[#FCD34D]">{result.upiDetails.note}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {result.redFlags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                    Safety Indicators
                  </h3>
                  <ul className="space-y-1.5">
                    {result.redFlags.map((rf, i) => (
                      <li key={i} className="text-sm text-[#E2E8F0] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{rf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                  Recommended Steps
                </h3>
                <ul className="space-y-1.5">
                  {result.recommendedActions.map((act, i) => (
                    <li key={i} className="text-sm font-medium text-white">
                      {i + 1}. {act}
                    </li>
                  ))}
                </ul>
              </div>

              {result.verdict !== 'SAFE' && (
                <div className="pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => onPrepareReportFromQr(result)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-display font-bold text-xs transition-colors"
                  >
                    <FileWarning className="w-4 h-4" aria-hidden="true" />
                    <span>Prepare Cybercrime Report for This QR</span>
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right: Scannable Demo QR Samples */}
        <aside className="lg:col-span-5 rounded-xl bg-[#11151C] border border-[#222936] p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white">Interactive Demo QR Samples</h2>
            <p className="text-xs text-[#94A3B8]">
              Click any real generated QR sample below to test QR Shield detection immediately
            </p>
          </div>

          <div className="space-y-3">
            {DEMO_QR_SAMPLES.map((sample) => {
              const style = qrVerdictClasses(sample.expectedVerdict);
              const isSelected = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  disabled={isScanning}
                  onClick={() => void runQrAnalysis(sample.payload, sample.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-[#171E29] border-[#22C55E]/50'
                      : 'bg-[#0C0F14] border-[#1F2633] hover:border-[#334155] hover:bg-[#131822]'
                  }`}
                >
                  <DemoQrThumb payload={sample.payload} />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {sample.label}
                      </span>
                      <span className={`text-[11px] font-bold tracking-wide shrink-0 ${style.text}`}>
                        {sample.expectedVerdict}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8]">{sample.subtitle}</p>
                    <p className="font-mono text-[11px] text-[#64748B] truncate">{sample.payload}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
