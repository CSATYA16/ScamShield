import type { CybercrimeReportDraft, QrAnalysisResult, ThreatRecord } from '../types/scamshield';

export function buildReportFromThreat(record: ThreatRecord): CybercrimeReportDraft {
  const now = new Date().toISOString();
  return {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceThreatId: record.id,
    createdAt: record.timestamp,
    updatedAt: now,
    channel: record.channel,
    sender: record.sender,
    messageContent: record.message,
    scamCategory: record.analysis.scamCategory,
    riskLevel: record.analysis.riskLevel,
    riskScore: record.analysis.riskScore,
    aiExplanation: record.analysis.explanation,
    redFlags: record.analysis.redFlags.map((rf) => rf.label),
    suspiciousUrls: record.analysis.suspiciousUrls,
    userNotes: '',
    moneyAlreadyLost: false,
    amountLostInr: '',
    userConfirmedReview: false,
    status: 'REPORT PREPARED — USER ACTION REQUIRED',
  };
}

export function buildReportFromQr(qr: QrAnalysisResult): CybercrimeReportDraft {
  const now = new Date().toISOString();
  return {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: qr.timestamp,
    updatedAt: now,
    channel: 'QR',
    sender: qr.upiDetails?.payeeVpa || qr.destinationHost || 'Unknown QR Source',
    messageContent: qr.rawContent,
    scamCategory: qr.category,
    riskLevel: qr.verdict === 'DANGEROUS' ? 'HIGH' : qr.verdict === 'CAUTION' ? 'SUSPICIOUS' : 'SAFE',
    riskScore: qr.riskScore,
    aiExplanation: qr.explanation,
    redFlags: qr.redFlags,
    suspiciousUrls: qr.contentType === 'URL' ? [qr.rawContent] : [],
    userNotes: '',
    moneyAlreadyLost: false,
    amountLostInr: '',
    userConfirmedReview: false,
    status: 'REPORT PREPARED — USER ACTION REQUIRED',
  };
}

export function formatReportAsText(draft: CybercrimeReportDraft): string {
  const lines = [
    '====================================================',
    'SCAMSHIELD — CYBERCRIME INCIDENT REPORT DRAFT',
    '====================================================',
    `Status: ${draft.status}`,
    `Incident Date/Time: ${new Date(draft.createdAt).toLocaleString()}`,
    `Channel: ${draft.channel}`,
    `Sender / Source: ${draft.sender || 'Not specified'}`,
    `Scam Category: ${draft.scamCategory}`,
    `Risk Assessment: ${draft.riskLevel} (Score: ${draft.riskScore}/100)`,
    '',
    '--- SUSPICIOUS MESSAGE / PAYLOAD ---',
    draft.messageContent || '(None provided)',
    '',
    '--- AI ANALYSIS SUMMARY ---',
    draft.aiExplanation || '(None)',
    '',
    '--- RED FLAGS DETECTED ---',
    ...(draft.redFlags.length > 0 ? draft.redFlags.map((f, i) => `${i + 1}. ${f}`) : ['None recorded']),
    '',
    '--- SUSPICIOUS URLS ---',
    ...(draft.suspiciousUrls.length > 0 ? draft.suspiciousUrls : ['None detected']),
    '',
    '--- FINANCIAL LOSS DECLARATION ---',
    `Money Already Lost: ${draft.moneyAlreadyLost ? 'YES — URGENT ACTION REQUIRED' : 'No'}`,
    ...(draft.moneyAlreadyLost && draft.amountLostInr ? [`Reported Amount Lost (INR): ₹${draft.amountLostInr}`] : []),
    '',
    '--- USER NOTES ---',
    draft.userNotes.trim() || '(No additional notes)',
    '',
    '--- OFFICIAL INDIA REPORTING CHANNELS ---',
    'National Cyber Crime Reporting Portal: https://cybercrime.gov.in',
    'Financial Cyber Fraud Helpline: 1930',
    'Note: ScamShield prepares this draft for your review. You must submit it directly on the official portal.',
  ];
  return lines.join('\n');
}
