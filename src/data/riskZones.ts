import type { RiskZoneItem } from '../types/scamshield';

export const SIMULATED_RISK_ZONES: RiskZoneItem[] = [
  {
    id: 'zone-central-market',
    name: 'Central Market Transit Hub',
    areaLabel: 'Commercial District · SIMULATED DEMO DATA',
    riskLevel: 'HIGH',
    scamType: 'Fake QR Payment Stickers',
    summary:
      'Simulated demonstration hotspot showing elevated reports of tampered QR stickers placed over legitimate vendor payment stands.',
    safetyTips: [
      'Always read the payee name aloud to the shopkeeper before entering your UPI PIN.',
      'Check if a paper sticker has been pasted on top of the original merchant QR stand.',
      'Never scan a QR code to "receive" a refund or cashback.',
    ],
    x: 34,
    y: 38,
    radius: 13,
    isDemoData: true,
    recentDemoReportsCount: 14,
  },
  {
    id: 'zone-tech-corridor',
    name: 'East Tech Park & Hostels',
    areaLabel: 'Campus & Office Belt · SIMULATED DEMO DATA',
    riskLevel: 'HIGH',
    scamType: 'Fake Job & Registration Fee Scams',
    summary:
      'Simulated demonstration hotspot modeling high-frequency fake internship, work-from-home, and onboarding fee lures targeting students and job seekers.',
    safetyTips: [
      'Genuine employers never ask for a registration, laptop, or security deposit fee.',
      'Verify job offer letters on the company official careers website.',
      'Do not join unverified Telegram or WhatsApp "paid review task" groups.',
    ],
    x: 69,
    y: 32,
    radius: 12,
    isDemoData: true,
    recentDemoReportsCount: 11,
  },
  {
    id: 'zone-station-plaza',
    name: 'South Station & Parcel Plaza',
    areaLabel: 'Transit Corridor · SIMULATED DEMO DATA',
    riskLevel: 'MODERATE',
    scamType: 'Fraudulent Payment Collection & OTP Lures',
    summary:
      'Simulated demonstration hotspot highlighting suspicious courier-hold SMS links and counterfeit ticket refund calls.',
    safetyTips: [
      'Track deliveries only inside the official shopping or courier app.',
      'Never share OTPs over phone calls to "release" a pending parcel.',
      'Use only official transport apps for ticket cancellations and refunds.',
    ],
    x: 56,
    y: 67,
    radius: 11,
    isDemoData: true,
    recentDemoReportsCount: 6,
  },
  {
    id: 'zone-civic-square',
    name: 'West Residential Sector',
    areaLabel: 'Neighborhood Zone · SIMULATED DEMO DATA',
    riskLevel: 'LOW',
    scamType: 'Occasional Impersonation Calls',
    summary:
      'Simulated demonstration zone with low modeled incident density—primarily occasional fake utility bill disconnection or KYC messages.',
    safetyTips: [
      'Check electricity or bank account status in the official provider app.',
      'Hang up immediately if a caller threatens police action or "digital arrest".',
    ],
    x: 24,
    y: 72,
    radius: 9,
    isDemoData: true,
    recentDemoReportsCount: 2,
  },
];
