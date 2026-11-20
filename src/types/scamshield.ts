export type NavSection =
  | 'dashboard'
  | 'live-protection'
  | 'qr-shield'
  | 'risk-zones'
  | 'threat-history'
  | 'report-protect'
  | 'safety-center'
  | 'settings';

export type LanguageCode = 'en' | 'hi' | 'te';

export type ChannelType = 'SMS' | 'WhatsApp' | 'Email' | 'QR';

export type RiskLevel = 'SAFE' | 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';

export type QrVerdict = 'SAFE' | 'CAUTION' | 'DANGEROUS';

export type ProtectionAction =
  | 'Simulated Block & Isolation'
  | 'Warned User'
  | 'Allowed (Safe)'
  | 'Allowed (Low Risk)'
  | 'Monitoring Off — Manual Review';

export type ReportStatus =
  | 'Not Reported'
  | 'REPORT PREPARED — USER ACTION REQUIRED';

export interface RedFlagItem {
  id: string;
  label: string;
  simpleLabel: string;
  detail: string;
}

export interface ThreatAnalysis {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  scamCategory: string;
  explanation: string;
  simpleExplanation: string;
  redFlags: RedFlagItem[];
  recommendedActions: string[];
  oneStepInstructions: string[];
  confidenceLevel: 'Low' | 'Medium' | 'High';
  suspiciousUrls: string[];
  shouldBlock: boolean;
  analysisSource: 'gemini' | 'rule-engine';
  aiNote?: string;
}

export interface ThreatRecord {
  id: string;
  timestamp: string; // ISO string
  channel: ChannelType;
  sender: string;
  message: string;
  scenarioId?: string;
  analysis: ThreatAnalysis;
  protectionAction: ProtectionAction;
  reportStatus: ReportStatus;
  userMarkedSafe?: boolean;
}

export interface QrAnalysisResult {
  id: string;
  timestamp: string;
  rawContent: string;
  contentType: 'UPI_PAYMENT' | 'URL' | 'PHONE_OR_SMS' | 'PLAIN_TEXT' | 'UNKNOWN';
  verdict: QrVerdict;
  riskScore: number;
  category: string;
  explanation: string;
  simpleExplanation: string;
  redFlags: string[];
  recommendedActions: string[];
  destinationHost?: string;
  upiDetails?: {
    payeeVpa?: string;
    payeeName?: string;
    amount?: string;
    note?: string;
  };
  analysisSource: 'gemini' | 'rule-engine';
}

export interface RiskZoneItem {
  id: string;
  name: string;
  areaLabel: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  scamType: string;
  summary: string;
  safetyTips: string[];
  x: number; // 0-100 map SVG percentage
  y: number; // 0-100 map SVG percentage
  radius: number;
  isDemoData: true;
  recentDemoReportsCount: number;
}

export interface CybercrimeReportDraft {
  id: string;
  sourceThreatId?: string;
  createdAt: string;
  updatedAt: string;
  channel: ChannelType;
  sender: string;
  messageContent: string;
  scamCategory: string;
  riskLevel: RiskLevel;
  riskScore: number;
  aiExplanation: string;
  redFlags: string[];
  suspiciousUrls: string[];
  userNotes: string;
  moneyAlreadyLost: boolean;
  amountLostInr: string;
  userConfirmedReview: boolean;
  status: 'REPORT PREPARED — USER ACTION REQUIRED';
}

export interface AppSettings {
  protectionEnabled: boolean;
  simpleLanguageMode: boolean;
  voiceAlertsEnabled: boolean;
  autoSpeakCritical: boolean;
  language: LanguageCode;
  locationProtectionEnabled: boolean;
  notificationsEnabled: boolean;
  highRiskSoundBanner: boolean;
}

export interface DemoScenario {
  id: string;
  code: string;
  title: string;
  expectedRisk: RiskLevel;
  defaultChannel: Exclude<ChannelType, 'QR'>;
  senderByChannel: Record<Exclude<ChannelType, 'QR'>, string>;
  message: string;
  categoryHint: string;
}

export interface DashboardMetrics {
  threatsDetectedToday: number;
  threatsBlocked: number;
  messagesAnalyzed: number;
  reportsPrepared: number;
  protectionScore: number;
}
