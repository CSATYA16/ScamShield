import { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileWarning,
  Lock,
  Mail,
  MessageSquare,
  PhoneCall,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { DEMO_SCENARIOS } from '../data/scenarios';
import type { UiStrings } from '../data/translations';
import type {
  AppSettings,
  ChannelType,
  DemoScenario,
  ThreatRecord,
} from '../types/scamshield';
import { formatShortTime, riskColorClasses, RiskLabel } from './RiskText';

type ActiveChannel = Exclude<ChannelType, 'QR'>;

interface LiveProtectionViewProps {
  t: UiStrings;
  settings: AppSettings;
  selectedChannel: ActiveChannel;
  onSelectChannel: (channel: ActiveChannel) => void;
  onToggleProtection: () => void;
  onToggleSimpleLanguage: () => void;
  onToggleVoiceAlerts: () => void;
  isScanning: boolean;
  incomingPreview: {
    sender: string;
    channel: ActiveChannel;
    message: string;
    arrivedAt: string;
  } | null;
  activeRecord: ThreatRecord | null;
  isSpeaking: boolean;
  onSpeakActiveWarning: () => void;
  onStopSpeaking: () => void;
  onTriggerScenario: (scenario: DemoScenario, channelOverride?: ActiveChannel) => void;
  onSimulateNextMessage: () => void;
  onAnalyzeCustomMessage: (sender: string, message: string) => void;
  onPrepareReport: (record: ThreatRecord) => void;
  onMarkSafe: (recordId: string) => void;
}

export function LiveProtectionView({
  t,
  settings,
  selectedChannel,
  onSelectChannel,
  onToggleProtection,
  onToggleSimpleLanguage,
  onToggleVoiceAlerts,
  isScanning,
  incomingPreview,
  activeRecord,
  isSpeaking,
  onSpeakActiveWarning,
  onStopSpeaking,
  onTriggerScenario,
  onSimulateNextMessage,
  onAnalyzeCustomMessage,
  onPrepareReport,
  onMarkSafe,
}: LiveProtectionViewProps) {
  const [customDrawerOpen, setCustomDrawerOpen] = useState(false);
  const [customSender, setCustomSender] = useState('+91 98765 43210');
  const [customMessage, setCustomMessage] = useState('');
  const [customError, setCustomError] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) {
      setCustomError('Please enter a message to simulate arrival.');
      return;
    }
    setCustomError('');
    onAnalyzeCustomMessage(customSender.trim() || 'Unknown Sender', customMessage.trim());
  };

  const isDangerous =
    activeRecord &&
    !activeRecord.userMarkedSafe &&
    (activeRecord.analysis.riskLevel === 'CRITICAL' ||
      activeRecord.analysis.riskLevel === 'HIGH' ||
      activeRecord.analysis.riskLevel === 'SUSPICIOUS');

  const isSafeOrLow =
    activeRecord &&
    (activeRecord.userMarkedSafe ||
      activeRecord.analysis.riskLevel === 'SAFE' ||
      activeRecord.analysis.riskLevel === 'LOW');

  const styles = activeRecord ? riskColorClasses(activeRecord.analysis.riskLevel) : null;

  const localizedSimpleHeadline = activeRecord
    ? activeRecord.userMarkedSafe
      ? t.simpleWarnings.safe
      : activeRecord.analysis.riskLevel === 'CRITICAL'
      ? t.simpleWarnings.critical
      : activeRecord.analysis.riskLevel === 'HIGH'
      ? t.simpleWarnings.high
      : activeRecord.analysis.riskLevel === 'SUSPICIOUS'
      ? t.simpleWarnings.suspicious
      : activeRecord.analysis.riskLevel === 'LOW'
      ? t.simpleWarnings.low
      : t.simpleWarnings.safe
    : '';

  const channelIcon = (ch: ActiveChannel) => {
    if (ch === 'WhatsApp') return MessageSquare;
    if (ch === 'Email') return Mail;
    return Smartphone;
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Protection Control Bar */}
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-2xl font-bold text-white tracking-tight">{t.live.title}</h1>
            <p className="text-sm text-[#94A3B8] max-w-xl">{t.live.subtitle}</p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Protection ON/OFF Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={settings.protectionEnabled}
              onClick={onToggleProtection}
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors whitespace-nowrap ${
                settings.protectionEnabled
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/50 text-[#86EFAC]'
                  : 'bg-[#181E29] border-[#334155] text-[#CBD5E1]'
              }`}
            >
              {settings.protectionEnabled ? (
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
              ) : (
                <ShieldOff className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              )}
              <span>
                {t.live.protectionToggle}: {settings.protectionEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={onSimulateNextMessage}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 text-[#05120A] font-display font-bold text-sm transition-colors whitespace-nowrap"
            >
              <Zap className="w-4 h-4" aria-hidden="true" />
              <span>{t.live.simulateIncoming}</span>
            </button>
          </div>
        </div>

        {/* Channel & Accessibility Controls */}
        <div className="pt-4 border-t border-[#1F2633] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-[#94A3B8]">{t.live.channelLabel}:</span>
            <div
              role="group"
              aria-label="Select simulated message channel"
              className="inline-flex items-center p-1 rounded-lg bg-[#0B0E13] border border-[#222936]"
            >
              {(['SMS', 'WhatsApp', 'Email'] as ActiveChannel[]).map((ch) => {
                const Icon = channelIcon(ch);
                const active = selectedChannel === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => onSelectChannel(ch)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#1D2533] text-white border border-[#334155]'
                        : 'text-[#94A3B8] hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{ch}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={settings.simpleLanguageMode}
              onClick={onToggleSimpleLanguage}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                settings.simpleLanguageMode
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#86EFAC]'
                  : 'bg-[#0B0E13] border-[#222936] text-[#94A3B8] hover:text-white'
              }`}
            >
              Simple Language Mode: {settings.simpleLanguageMode ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={settings.voiceAlertsEnabled}
              onClick={onToggleVoiceAlerts}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                settings.voiceAlertsEnabled
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#86EFAC]'
                  : 'bg-[#0B0E13] border-[#222936] text-[#94A3B8] hover:text-white'
              }`}
            >
              {settings.voiceAlertsEnabled ? (
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>Voice Alerts: {settings.voiceAlertsEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Split: Live Interception Viewport (Left 7 cols) + Scenario Triggers (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Interception & Alert Experience */}
        <div className="lg:col-span-7 space-y-5">
          {/* Simulated Incoming Message Notification Card */}
          <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
                {(() => {
                  const Icon = channelIcon(incomingPreview?.channel ?? selectedChannel);
                  return <Icon className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />;
                })()}
                <span>
                  Incoming {incomingPreview?.channel ?? selectedChannel} Stream
                </span>
                {incomingPreview && (
                  <>
                    <span className="text-[#475569]" aria-hidden="true">·</span>
                    <span className="font-mono text-[#64748B] tabular-nums">
                      {formatShortTime(incomingPreview.arrivedAt)}
                    </span>
                  </>
                )}
              </div>
              <span className="text-xs font-mono text-[#64748B]">
                {isScanning
                  ? 'ANALYZING...'
                  : settings.protectionEnabled
                  ? 'AUTO-INSPECT READY'
                  : 'MONITORING PAUSED'}
              </span>
            </div>

            {!incomingPreview && !activeRecord ? (
              <div className="py-10 px-6 rounded-lg bg-[#0B0E13] border border-[#1E2532] text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 mx-auto flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#22C55E]" aria-hidden="true" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h2 className="text-base font-semibold text-white">
                    Automatic Protection Standing By
                  </h2>
                  <p className="text-sm text-[#94A3B8]">
                    Click “Simulate Incoming Message” or choose any scenario on the right to see ScamShield intercept, scan, isolate, and explain a message automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onSimulateNextMessage}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#05120A] font-display font-bold text-sm transition-colors"
                >
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  <span>{t.live.simulateIncoming}</span>
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-[#0B0E13] border border-[#252E3D] p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-white">
                    From: {incomingPreview?.sender ?? activeRecord?.sender}
                  </span>
                  <span className="text-[#94A3B8]">
                    via {incomingPreview?.channel ?? activeRecord?.channel}
                  </span>
                </div>
                <p className="text-base text-[#F3F5F8] leading-relaxed">
                  “{incomingPreview?.message ?? activeRecord?.message}”
                </p>

                {isScanning && (
                  <div className="pt-3 space-y-2.5" role="status" aria-live="polite">
                    <div className="relative h-1.5 w-full rounded-full bg-[#1C2330] overflow-hidden">
                      <div className="absolute inset-y-0 w-2/5 rounded-full bg-[#22C55E] animate-scan-sweep" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#4ADE80]">{t.live.scanningTitle}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8]">{t.live.scanningDesc}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* THREAT ALERT OR SAFE VERDICT EXPERIENCE */}
          {!isScanning && activeRecord && isDangerous && styles && (
            <section
              role="alert"
              aria-live="assertive"
              className={`rounded-xl border p-6 space-y-6 ${styles.surface} ${styles.border}`}
            >
              {/* Prominent Warning Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#F87171]">
                    <AlertOctagon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="font-display font-extrabold text-sm tracking-wider">
                      {t.live.warningHeader}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {activeRecord.analysis.riskLevel} RISK — {t.live.highRiskSub}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#CBD5E1]">
                    <span className="font-semibold text-white">
                      {activeRecord.analysis.scamCategory}
                    </span>
                    <span className="text-[#64748B]" aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Risk Score {activeRecord.analysis.riskScore}/100
                    </span>
                    <span className="text-[#64748B]" aria-hidden="true">·</span>
                    <span>Confidence: {activeRecord.analysis.confidenceLevel}</span>
                    <span className="text-[#64748B]" aria-hidden="true">·</span>
                    <span>
                      {activeRecord.analysis.analysisSource === 'gemini'
                        ? 'Gemini AI Analysis'
                        : 'ScamShield Rule Engine'}
                    </span>
                  </div>
                </div>

                {/* Voice Alert Button */}
                <button
                  type="button"
                  onClick={isSpeaking ? onStopSpeaking : onSpeakActiveWarning}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0C0F14] hover:bg-[#171E29] border border-[#EF4444]/50 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4 text-[#F87171]" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
                  )}
                  <span>{isSpeaking ? t.live.stopReading : t.live.readOutLoud}</span>
                </button>
              </div>

              {/* Simulated Blocked & Isolated Status Panel */}
              <div className="rounded-lg bg-[#0B0E13] border border-[#EF4444]/35 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#FCA5A5]">
                  <Lock className="w-4 h-4 text-[#EF4444] shrink-0" aria-hidden="true" />
                  <span>
                    {activeRecord.protectionAction === 'Simulated Block & Isolation'
                      ? t.live.blockedBadge
                      : `STATUS: ${activeRecord.protectionAction.toUpperCase()}`}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {t.live.blockedDisclaimer}
                </p>
              </div>

              {/* Simple Language Explanation */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                  {t.live.whyDangerousTitle}
                </h3>
                <p
                  className={`text-white leading-relaxed ${
                    settings.simpleLanguageMode ? 'text-lg font-semibold' : 'text-base'
                  }`}
                >
                  {settings.language !== 'en' && activeRecord.analysis.analysisSource !== 'gemini'
                    ? localizedSimpleHeadline
                    : settings.simpleLanguageMode
                    ? activeRecord.analysis.simpleExplanation
                    : activeRecord.analysis.explanation}
                </p>
                {!settings.simpleLanguageMode && (
                  <p className="text-sm text-[#CBD5E1]">
                    In simple words: {activeRecord.analysis.simpleExplanation}
                  </p>
                )}
              </div>

              {/* Red Flag Cards */}
              {activeRecord.analysis.redFlags.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                    {t.live.redFlagsTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeRecord.analysis.redFlags.map((flag) => (
                      <div
                        key={flag.id}
                        className="p-3.5 rounded-lg bg-[#0B0E13] border border-[#263042] space-y-1"
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle
                            className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <p className="text-sm font-semibold text-white leading-snug">
                            {settings.simpleLanguageMode ? flag.simpleLabel : flag.label}
                          </p>
                        </div>
                        {!settings.simpleLanguageMode && (
                          <p className="text-xs text-[#94A3B8] pl-6 leading-relaxed">
                            {flag.detail}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* One-Step Protective Instructions */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
                  {t.live.whatToDoTitle}
                </h3>
                <ol className="space-y-2">
                  {activeRecord.analysis.oneStepInstructions.map((step, idx) => (
                    <li
                      key={idx}
                      className={`p-3.5 rounded-lg bg-[#0B0E13] border border-[#263042] text-white ${
                        settings.simpleLanguageMode ? 'text-base font-semibold' : 'text-sm'
                      }`}
                    >
                      {step}
                    </li>
                  ))}
                </ol>

                {/* Clear Do-Not Protective Directives */}
                <div className="pt-1 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-[#FCA5A5]">
                  {activeRecord.analysis.recommendedActions.map((act, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" aria-hidden="true" />
                      <span>{act}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Simple Language Mode High-Clarity Stop Banner */}
              {settings.simpleLanguageMode && (
                <div className="rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/60 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-white font-display font-extrabold text-base tracking-wide">
                    <AlertOctagon className="w-5 h-5 text-[#EF4444] shrink-0" aria-hidden="true" />
                    <span>{t.live.stopBtn} — {t.live.dontClickBtn}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#FEE2E2]">
                    Do not reply, do not send money, do not share OTP or PIN.
                  </span>
                </div>
              )}

              {/* Large Accessible Action Buttons */}
              <div className="pt-2 border-t border-[#EF4444]/25 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onPrepareReport(activeRecord)}
                  className={`flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-display font-bold transition-colors whitespace-nowrap ${
                    settings.simpleLanguageMode ? 'py-4 text-base' : 'py-3.5 text-sm'
                  }`}
                >
                  <FileWarning className="w-4 h-4" aria-hidden="true" />
                  <span>{settings.simpleLanguageMode ? 'REPORT THIS' : t.live.prepareReport}</span>
                </button>

                <a
                  href="tel:1930"
                  className={`inline-flex items-center justify-center gap-2 px-5 rounded-lg bg-[#0B0E13] hover:bg-[#171E29] border border-[#334155] text-white font-display font-bold transition-colors whitespace-nowrap ${
                    settings.simpleLanguageMode ? 'py-4 text-base' : 'py-3.5 text-sm'
                  }`}
                >
                  <PhoneCall className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
                  <span>{t.live.callHelp}</span>
                </a>

                <button
                  type="button"
                  onClick={() => onMarkSafe(activeRecord.id)}
                  className={`inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-transparent hover:bg-[#161C26] border border-[#2D3748] text-[#CBD5E1] font-semibold transition-colors whitespace-nowrap ${
                    settings.simpleLanguageMode ? 'py-4 text-base' : 'py-3.5 text-sm'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
                  <span>{t.live.markSafe}</span>
                </button>
              </div>
            </section>
          )}

          {/* SAFE / LOW RISK CONFIRMATION */}
          {!isScanning && activeRecord && isSafeOrLow && (
            <section
              role="status"
              aria-live="polite"
              className="rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/35 p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#4ADE80]">
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    <span className="font-display font-bold text-sm tracking-wide">
                      {activeRecord.userMarkedSafe
                        ? 'MARKED SAFE BY USER'
                        : activeRecord.analysis.riskLevel === 'LOW'
                        ? 'LOW RISK — ROUTINE NOTIFICATION'
                        : t.live.safeHeader}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {activeRecord.analysis.scamCategory}
                  </h2>
                </div>
                <span className="font-mono text-sm font-semibold text-[#86EFAC] tabular-nums">
                  Risk Score {activeRecord.analysis.riskScore}/100
                </span>
              </div>

              <p className="text-sm sm:text-base text-[#E2E8F0] leading-relaxed">
                {settings.simpleLanguageMode
                  ? activeRecord.analysis.simpleExplanation
                  : activeRecord.analysis.explanation}
              </p>

              <div className="pt-2 border-t border-[#22C55E]/25 flex flex-wrap items-center justify-between gap-3 text-xs text-[#A7F3D0]">
                <span>Action: {activeRecord.protectionAction} — Not blocked.</span>
                <span>
                  {activeRecord.analysis.analysisSource === 'gemini'
                    ? 'Verified by Gemini AI'
                    : 'Verified by ScamShield Rule Engine'}
                </span>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Instant Demo Scenarios (A-H) + Optional Custom Message Test */}
        <aside className="lg:col-span-5 space-y-5">
          <section className="rounded-xl bg-[#11151C] border border-[#222936] p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">{t.live.scenariosTitle}</h2>
              <p className="text-xs text-[#94A3B8]">
                Click any scenario below to simulate an immediate incoming {selectedChannel} message
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_SCENARIOS.map((scenario) => {
                const isSelected = activeRecord?.scenarioId === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    disabled={isScanning}
                    onClick={() => onTriggerScenario(scenario, selectedChannel)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-colors disabled:opacity-50 ${
                      isSelected
                        ? 'bg-[#171E29] border-[#22C55E]/50'
                        : 'bg-[#0C0F14] border-[#1F2633] hover:border-[#334155] hover:bg-[#131822]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">
                        {scenario.code}. {scenario.title}
                      </span>
                      <RiskLabel level={scenario.expectedRisk} />
                    </div>
                    <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      “{scenario.message}”
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Secondary Collapsible Custom Message Simulation */}
          <section className="rounded-xl bg-[#11151C] border border-[#222936] overflow-hidden">
            <button
              type="button"
              onClick={() => setCustomDrawerOpen((v) => !v)}
              aria-expanded={customDrawerOpen}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#151B25] transition-colors"
            >
              <div>
                <span className="block text-sm font-semibold text-white">
                  Test Your Own Simulated Message
                </span>
                <span className="block text-xs text-[#94A3B8]">
                  Optional: inject a custom incoming message into Live Protection
                </span>
              </div>
              {customDrawerOpen ? (
                <ChevronUp className="w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
              )}
            </button>

            {customDrawerOpen && (
              <form
                onSubmit={handleCustomSubmit}
                className="px-5 pb-5 pt-2 border-t border-[#1F2633] space-y-3"
              >
                <div className="space-y-1">
                  <label htmlFor="custom-sender" className="block text-xs font-medium text-[#CBD5E1]">
                    Simulated Sender
                  </label>
                  <input
                    id="custom-sender"
                    type="text"
                    value={customSender}
                    onChange={(e) => setCustomSender(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-sm text-white focus:border-[#22C55E] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-message" className="block text-xs font-medium text-[#CBD5E1]">
                    Incoming Message Text
                  </label>
                  <textarea
                    id="custom-message"
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type a suspicious or legitimate message to test real-time analysis..."
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-sm text-white placeholder:text-[#64748B] focus:border-[#22C55E] focus:outline-none"
                  />
                </div>
                {customError && <p className="text-xs text-[#F87171]">{customError}</p>}
                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A2230] hover:bg-[#232D3F] border border-[#334155] text-white text-xs font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-[#22C55E]" aria-hidden="true" />
                  <span>Simulate Arrival on {selectedChannel}</span>
                </button>
              </form>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
