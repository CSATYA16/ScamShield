import { analyzeMessageRuleBased } from '../logic/threatAnalyzer';
import type { ThreatRecord } from '../types/scamshield';

export function createInitialDemoHistory(): ThreatRecord[] {
  const now = Date.now();
  const min = 60 * 1000;

  const kycMsg =
    'Your bank account will be blocked today. Update your KYC immediately using this link: http://bank-kyc-verify.xyz/login';
  const upiMsg =
    'Scan this QR code to receive your refund. Enter your UPI PIN to collect your money.';
  const apptMsg =
    'Your appointment is confirmed for tomorrow at 10 AM. Please arrive 15 minutes early.';

  return [
    {
      id: 'seed-kyc-1',
      timestamp: new Date(now - 24 * min).toISOString(),
      channel: 'SMS',
      sender: 'AD-BNKALT',
      message: kycMsg,
      scenarioId: 'bank-kyc',
      analysis: analyzeMessageRuleBased(kycMsg, 'AD-BNKALT', 'SMS'),
      protectionAction: 'Simulated Block & Isolation',
      reportStatus: 'Not Reported',
    },
    {
      id: 'seed-upi-2',
      timestamp: new Date(now - 52 * min).toISOString(),
      channel: 'WhatsApp',
      sender: '+91 88261 55091 (Marketplace Buyer)',
      message: upiMsg,
      scenarioId: 'upi-scam',
      analysis: analyzeMessageRuleBased(upiMsg, '+91 88261 55091', 'WhatsApp'),
      protectionAction: 'Simulated Block & Isolation',
      reportStatus: 'Not Reported',
    },
    {
      id: 'seed-appt-3',
      timestamp: new Date(now - 95 * min).toISOString(),
      channel: 'SMS',
      sender: 'VK-APOLOC',
      message: apptMsg,
      scenarioId: 'legit-appointment',
      analysis: analyzeMessageRuleBased(apptMsg, 'VK-APOLOC', 'SMS'),
      protectionAction: 'Allowed (Safe)',
      reportStatus: 'Not Reported',
    },
  ];
}
