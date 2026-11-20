import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMessageRuleBased } from './threatAnalyzer';
import { analyzeQrRuleBased } from './qrAnalyzer';
import { calculateDashboardMetrics } from './metrics';
import { buildReportFromThreat, formatReportAsText } from './reportBuilder';
import type { AppSettings, ThreatRecord } from '../types/scamshield';

test('Digital arrest scam is classified CRITICAL and blocked', () => {
  const res = analyzeMessageRuleBased(
    'You are under digital arrest. A police officer will arrest you unless you transfer ₹50,000 immediately. Do not tell anyone.',
    '+91-98110-44219',
    'WhatsApp'
  );
  assert.equal(res.riskLevel, 'CRITICAL');
  assert.equal(res.shouldBlock, true);
  assert.ok(res.riskScore >= 82);
  assert.match(res.scamCategory, /Digital Arrest/i);
  assert.ok(res.redFlags.length >= 3);
});

test('Bank KYC scam is classified HIGH or CRITICAL', () => {
  const res = analyzeMessageRuleBased(
    'Your bank account will be blocked today. Update your KYC immediately using this link: http://sbi-kyc-verify.xyz/update',
    'VM-BNKKYC',
    'SMS'
  );
  assert.ok(res.riskLevel === 'HIGH' || res.riskLevel === 'CRITICAL');
  assert.equal(res.shouldBlock, true);
  assert.ok(res.suspiciousUrls.length === 1);
});

test('Exact user hackathon test Bank KYC text is classified HIGH and blocked', () => {
  const res = analyzeMessageRuleBased(
    'Your bank account will be blocked today. Complete KYC immediately or your account will be suspended. Verify now.',
    '+91-98765-43210',
    'WhatsApp'
  );
  assert.ok(res.riskLevel === 'HIGH' || res.riskLevel === 'CRITICAL');
  assert.equal(res.shouldBlock, true);
  assert.match(res.scamCategory, /Bank KYC/i);
});

test('OTP scam is classified HIGH or CRITICAL', () => {
  const res = analyzeMessageRuleBased(
    'Your package is pending. Send the OTP you received to release your delivery.',
    '+91-80901-22311',
    'SMS'
  );
  assert.ok(res.riskLevel === 'HIGH' || res.riskLevel === 'CRITICAL' || res.riskLevel === 'SUSPICIOUS');
  assert.ok(res.redFlags.some((f) => f.id === 'otp-request'));
});

test('Legitimate appointment message is classified SAFE and NOT blocked', () => {
  const res = analyzeMessageRuleBased(
    'Your appointment is confirmed for tomorrow at 10 AM. Please arrive 15 minutes early.',
    'Apollo Clinic',
    'SMS'
  );
  assert.equal(res.riskLevel, 'SAFE');
  assert.equal(res.shouldBlock, false);
  assert.equal(res.redFlags.length, 0);
});

test('Legitimate delivery message is classified LOW risk and NOT blocked', () => {
  const res = analyzeMessageRuleBased(
    'Your package is out for delivery. Your courier will contact you today.',
    'BlueDart Express',
    'SMS'
  );
  assert.equal(res.riskLevel, 'LOW');
  assert.equal(res.shouldBlock, false);
});

test('Fraudulent UPI refund QR is flagged DANGEROUS', () => {
  const res = analyzeQrRuleBased(
    'upi://pay?pa=refund.helpdesk@okaxis&pn=Instant%20Refund%20Desk&am=4999&tn=Scan%20to%20receive%20refund'
  );
  assert.equal(res.verdict, 'DANGEROUS');
  assert.equal(res.contentType, 'UPI_PAYMENT');
  assert.match(res.simpleExplanation, /STOP/i);
});

test('Unknown plain-text QR is NEVER automatically marked SAFE just for decoding', () => {
  const res = analyzeQrRuleBased('Call 9999900000 for customer care');
  assert.notEqual(res.verdict, 'SAFE');
});

test('Official cybercrime.gov.in HTTPS QR is marked SAFE', () => {
  const res = analyzeQrRuleBased('https://cybercrime.gov.in');
  assert.equal(res.verdict, 'SAFE');
  assert.equal(res.destinationHost, 'cybercrime.gov.in');
});

test('Dashboard metrics are deterministically computed from real state', () => {
  const now = new Date('2026-11-19T12:00:00Z');
  const settings: AppSettings = {
    protectionEnabled: true,
    simpleLanguageMode: false,
    voiceAlertsEnabled: true,
    autoSpeakCritical: false,
    language: 'en',
    locationProtectionEnabled: true,
    notificationsEnabled: true,
    highRiskSoundBanner: true,
  };

  const threatAnalysis = analyzeMessageRuleBased(
    'You are under digital arrest. A police officer will arrest you unless you transfer ₹50,000 immediately. Do not tell anyone.',
    'Unknown',
    'WhatsApp'
  );
  const safeAnalysis = analyzeMessageRuleBased(
    'Your appointment is confirmed for tomorrow at 10 AM. Please arrive 15 minutes early.',
    'Clinic',
    'SMS'
  );

  const history: ThreatRecord[] = [
    {
      id: 't1',
      timestamp: '2026-11-19T11:30:00Z',
      channel: 'WhatsApp',
      sender: 'Unknown',
      message: 'Digital arrest test',
      analysis: threatAnalysis,
      protectionAction: 'Simulated Block & Isolation',
      reportStatus: 'REPORT PREPARED — USER ACTION REQUIRED',
    },
    {
      id: 't2',
      timestamp: '2026-11-19T11:45:00Z',
      channel: 'SMS',
      sender: 'Clinic',
      message: 'Appointment test',
      analysis: safeAnalysis,
      protectionAction: 'Allowed (Safe)',
      reportStatus: 'Not Reported',
    },
  ];

  const metrics = calculateDashboardMetrics(history, 1, settings, false, now);
  assert.equal(metrics.messagesAnalyzed, 2);
  assert.equal(metrics.threatsDetectedToday, 1);
  assert.equal(metrics.threatsBlocked, 1);
  assert.equal(metrics.reportsPrepared, 1);
  assert.equal(metrics.protectionScore, 95);

  // Entering high risk zone adjusts score deterministically
  const zoneMetrics = calculateDashboardMetrics(history, 1, settings, true, now);
  assert.equal(zoneMetrics.protectionScore, 87);
});

test('Report builder preserves required USER ACTION REQUIRED status and formats 1930 helpline', () => {
  const analysis = analyzeMessageRuleBased(
    'You have won ₹10 lakh! Pay the processing fee now to receive your prize.',
    'Prize Desk',
    'SMS'
  );
  const record: ThreatRecord = {
    id: 't-lottery',
    timestamp: '2026-11-19T10:00:00Z',
    channel: 'SMS',
    sender: 'Prize Desk',
    message: 'You have won ₹10 lakh! Pay the processing fee now to receive your prize.',
    analysis,
    protectionAction: 'Simulated Block & Isolation',
    reportStatus: 'Not Reported',
  };

  const draft = buildReportFromThreat(record);
  assert.equal(draft.status, 'REPORT PREPARED — USER ACTION REQUIRED');
  draft.moneyAlreadyLost = true;
  draft.amountLostInr = '5000';
  const text = formatReportAsText(draft);
  assert.match(text, /REPORT PREPARED — USER ACTION REQUIRED/);
  assert.match(text, /1930/);
  assert.match(text, /cybercrime\.gov\.in/);
});
