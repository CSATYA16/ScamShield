import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { analyzeMessageRuleBased } from './src/logic/threatAnalyzer.ts';
import { analyzeQrRuleBased } from './src/logic/qrAnalyzer.ts';
import type { ChannelType, LanguageCode, QrAnalysisResult, ThreatAnalysis } from './src/types/scamshield.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function languageName(lang: LanguageCode): string {
  if (lang === 'hi') return 'Hindi (Devanagari script, simple everyday Hindi)';
  if (lang === 'te') return 'Telugu (Telugu script, simple everyday Telugu)';
  return 'English (simple everyday English)';
}

const MESSAGE_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    riskLevel: {
      type: Type.STRING,
      description: 'Must be one of: SAFE, LOW, SUSPICIOUS, HIGH, CRITICAL',
    },
    riskScore: {
      type: Type.INTEGER,
      description: 'Integer risk score from 0 (completely safe) to 100 (certain scam)',
    },
    scamCategory: {
      type: Type.STRING,
      description: 'Concise category name such as Digital Arrest & Extortion Scam, Bank KYC / Account Phishing, OTP Hijacking Scam, Fake Job & Advance-Fee Scam, Lottery & Prize Fraud, UPI / QR Payment Fraud, Legitimate Message, or Routine Delivery Notification',
    },
    explanation: {
      type: Type.STRING,
      description: 'Clear 1-2 sentence technical-lite summary of why this message received its risk level.',
    },
    simpleExplanation: {
      type: Type.STRING,
      description: 'Very simple everyday language explanation for someone with limited digital literacy, written in the requested language.',
    },
    redFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING, description: 'Clear indicator title' },
          simpleLabel: { type: Type.STRING, description: 'Everyday short sentence in the requested language, e.g. They are creating urgency.' },
          detail: { type: Type.STRING, description: 'Short 1 sentence explanation' },
        },
        required: ['id', 'label', 'simpleLabel', 'detail'],
      },
    },
    recommendedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Clear short imperative protective actions such as DO NOT CLICK THE LINK, DO NOT SHARE YOUR OTP, DO NOT SEND MONEY',
    },
    oneStepInstructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 to 3 simple numbered steps (Step 1, Step 2, Step 3) in the requested language.',
    },
    confidenceLevel: {
      type: Type.STRING,
      description: 'One of: Low, Medium, High',
    },
    suspiciousUrls: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    shouldBlock: {
      type: Type.BOOLEAN,
      description: 'True only if riskLevel is HIGH or CRITICAL.',
    },
  },
  required: [
    'riskLevel',
    'riskScore',
    'scamCategory',
    'explanation',
    'simpleExplanation',
    'redFlags',
    'recommendedActions',
    'oneStepInstructions',
    'confidenceLevel',
    'suspiciousUrls',
    'shouldBlock',
  ],
};

const QR_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      description: 'Must be one of: SAFE, CAUTION, DANGEROUS. Never return SAFE for unknown/unverified URLs or UPI payment requests.',
    },
    riskScore: {
      type: Type.INTEGER,
      description: 'Integer 0 to 100',
    },
    category: {
      type: Type.STRING,
    },
    explanation: {
      type: Type.STRING,
    },
    simpleExplanation: {
      type: Type.STRING,
      description: 'Everyday simple explanation in requested language. For DANGEROUS start with STOP.',
    },
    redFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    recommendedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    'verdict',
    'riskScore',
    'category',
    'explanation',
    'simpleExplanation',
    'redFlags',
    'recommendedActions',
  ],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: Boolean(getGeminiClient()),
    });
  });

  app.post('/api/analyze-message', async (req, res) => {
    const {
      message,
      sender = 'Unknown Sender',
      channel = 'SMS',
      language = 'en',
    } = req.body as {
      message?: string;
      sender?: string;
      channel?: ChannelType;
      language?: LanguageCode;
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const fallback = analyzeMessageRuleBased(message, sender, channel);
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        analysis: {
          ...fallback,
          aiNote: 'Analyzed locally with ScamShield rule engine (Gemini API key not configured).',
        },
      });
    }

    try {
      const prompt = [
        `Channel: ${channel}`,
        `Sender: ${sender}`,
        `Target Language for simpleExplanation, redFlags.simpleLabel, and oneStepInstructions: ${languageName(language)}`,
        `Message: """${message.trim()}"""`,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are ScamShield, a consumer cybersecurity analyst protecting everyday people in India and globally from digital scams. ' +
            'Analyze the message carefully for: sender identity claims, urgency/threats, requests for money/fees, OTP/PIN/password requests, ' +
            'suspicious URLs, impersonation (police/digital arrest/bank/courier), secrecy instructions, unrealistic rewards, and UPI/QR refund tricks. ' +
            'CRITICAL RULE: Do NOT label legitimate routine messages (such as normal appointment reminders or routine courier out-for-delivery notices without OTP/link/payment demands) as scams. ' +
            'For legitimate routine messages, return riskLevel SAFE or LOW, empty redFlags, and shouldBlock false. ' +
            'Keep simpleExplanation and oneStepInstructions compassionate, direct, jargon-free, and strictly in the requested target language.',
          responseMimeType: 'application/json',
          responseSchema: MESSAGE_ANALYSIS_SCHEMA,
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('Empty Gemini response');
      }

      const parsed = JSON.parse(rawText) as Partial<ThreatAnalysis>;
      const validLevels = new Set(['SAFE', 'LOW', 'SUSPICIOUS', 'HIGH', 'CRITICAL']);
      const riskLevel = validLevels.has(String(parsed.riskLevel))
        ? (parsed.riskLevel as ThreatAnalysis['riskLevel'])
        : fallback.riskLevel;

      const normalized: ThreatAnalysis = {
        riskLevel,
        riskScore:
          typeof parsed.riskScore === 'number'
            ? Math.max(0, Math.min(100, Math.round(parsed.riskScore)))
            : fallback.riskScore,
        scamCategory: parsed.scamCategory || fallback.scamCategory,
        explanation: parsed.explanation || fallback.explanation,
        simpleExplanation: parsed.simpleExplanation || fallback.simpleExplanation,
        redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : fallback.redFlags,
        recommendedActions:
          Array.isArray(parsed.recommendedActions) && parsed.recommendedActions.length > 0
            ? parsed.recommendedActions
            : fallback.recommendedActions,
        oneStepInstructions:
          Array.isArray(parsed.oneStepInstructions) && parsed.oneStepInstructions.length > 0
            ? parsed.oneStepInstructions
            : fallback.oneStepInstructions,
        confidenceLevel:
          parsed.confidenceLevel === 'Low' ||
          parsed.confidenceLevel === 'Medium' ||
          parsed.confidenceLevel === 'High'
            ? parsed.confidenceLevel
            : fallback.confidenceLevel,
        suspiciousUrls:
          Array.isArray(parsed.suspiciousUrls) && parsed.suspiciousUrls.length > 0
            ? parsed.suspiciousUrls
            : fallback.suspiciousUrls,
        shouldBlock: riskLevel === 'CRITICAL' || riskLevel === 'HIGH',
        analysisSource: 'gemini',
      };

      return res.json({ analysis: normalized });
    } catch (err) {
      console.error('[ScamShield] Gemini message analysis fallback triggered:', err instanceof Error ? err.message : err);
      return res.json({
        analysis: {
          ...fallback,
          aiNote: 'Gemini analysis temporarily unavailable; analyzed with ScamShield rule-based fallback engine.',
        },
      });
    }
  });

  app.post('/api/analyze-qr', async (req, res) => {
    const { content, language = 'en' } = req.body as {
      content?: string;
      language?: LanguageCode;
    };

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'QR content is required.' });
    }

    const fallback = analyzeQrRuleBased(content);
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ analysis: fallback });
    }

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Decoded QR Payload: """${content.trim()}"""\nTarget language for simpleExplanation: ${languageName(language)}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are ScamShield QR Shield. Analyze the decoded QR code payload for phishing URLs, URL shorteners, unencrypted HTTP, ' +
            'fraudulent UPI payment/refund requests, impersonation handles, APK downloads, or suspicious payment instructions. ' +
            'CRITICAL RULE: Never classify a QR code as SAFE merely because it decoded cleanly. Only official verified HTTPS domains like gov.in/cybercrime.gov.in with no suspicious path should be SAFE. ' +
            'Any UPI payment QR that mentions refund/cashback/prize/PIN must be DANGEROUS. Normal unverified merchant UPI QRs or unknown websites must be CAUTION.',
          responseMimeType: 'application/json',
          responseSchema: QR_ANALYSIS_SCHEMA,
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('Empty Gemini QR response');
      }

      const parsed = JSON.parse(rawText) as Partial<QrAnalysisResult>;
      const validVerdicts = new Set(['SAFE', 'CAUTION', 'DANGEROUS']);
      const verdict = validVerdicts.has(String(parsed.verdict))
        ? (parsed.verdict as QrAnalysisResult['verdict'])
        : fallback.verdict;

      const merged: QrAnalysisResult = {
        ...fallback,
        verdict,
        riskScore:
          typeof parsed.riskScore === 'number'
            ? Math.max(0, Math.min(100, Math.round(parsed.riskScore)))
            : fallback.riskScore,
        category: parsed.category || fallback.category,
        explanation: parsed.explanation || fallback.explanation,
        simpleExplanation: parsed.simpleExplanation || fallback.simpleExplanation,
        redFlags: Array.isArray(parsed.redFlags) && parsed.redFlags.length > 0 ? parsed.redFlags : fallback.redFlags,
        recommendedActions:
          Array.isArray(parsed.recommendedActions) && parsed.recommendedActions.length > 0
            ? parsed.recommendedActions
            : fallback.recommendedActions,
        analysisSource: 'gemini',
      };

      return res.json({ analysis: merged });
    } catch (err) {
      console.error('[ScamShield] Gemini QR analysis fallback triggered:', err instanceof Error ? err.message : err);
      return res.json({ analysis: fallback });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScamShield server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
