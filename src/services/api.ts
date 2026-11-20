import { analyzeMessageRuleBased } from '../logic/threatAnalyzer';
import { analyzeQrRuleBased } from '../logic/qrAnalyzer';
import type { ChannelType, LanguageCode, QrAnalysisResult, ThreatAnalysis } from '../types/scamshield';

export async function analyzeIncomingMessage(params: {
  message: string;
  sender: string;
  channel: ChannelType;
  language: LanguageCode;
}): Promise<ThreatAnalysis> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);
    const res = await fetch('/api/analyze-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as { analysis?: ThreatAnalysis };
    if (data.analysis) {
      return data.analysis;
    }
    throw new Error('Malformed analysis payload');
  } catch {
    const local = analyzeMessageRuleBased(params.message, params.sender, params.channel);
    return {
      ...local,
      aiNote: 'Analyzed locally using ScamShield rule-based fallback engine.',
    };
  }
}

export async function analyzeQrPayload(params: {
  content: string;
  language: LanguageCode;
}): Promise<QrAnalysisResult> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);
    const res = await fetch('/api/analyze-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as { analysis?: QrAnalysisResult };
    if (data.analysis) {
      return data.analysis;
    }
    throw new Error('Malformed QR analysis payload');
  } catch {
    return analyzeQrRuleBased(params.content);
  }
}
