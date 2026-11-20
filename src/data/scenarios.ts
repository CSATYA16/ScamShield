import type { DemoScenario, QrVerdict } from '../types/scamshield';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'digital-arrest',
    code: 'A',
    title: 'Digital Arrest Scam',
    expectedRisk: 'CRITICAL',
    defaultChannel: 'WhatsApp',
    senderByChannel: {
      WhatsApp: '+91 98114 02918 (Unverified "Cyber Police")',
      SMS: 'VM-CYBPRT',
      Email: 'notice.officer@cyber-arrest-india.xyz',
    },
    message:
      'You are under digital arrest. A police officer will arrest you unless you transfer ₹50,000 immediately. Do not tell anyone.',
    categoryHint: 'Digital Arrest & Extortion Scam',
  },
  {
    id: 'bank-kyc',
    code: 'B',
    title: 'Bank KYC Scam',
    expectedRisk: 'HIGH',
    defaultChannel: 'SMS',
    senderByChannel: {
      SMS: 'AD-BNKALT',
      WhatsApp: '+91 70422 88310 (Bank KYC Desk)',
      Email: 'alerts@bank-kyc-update-now.top',
    },
    message:
      'Your bank account will be blocked today. Update your KYC immediately using this link: http://bank-kyc-verify.xyz/login',
    categoryHint: 'Bank KYC / Account Phishing',
  },
  {
    id: 'otp-scam',
    code: 'C',
    title: 'OTP Scam',
    expectedRisk: 'CRITICAL',
    defaultChannel: 'SMS',
    senderByChannel: {
      SMS: '+91 81309 44512',
      WhatsApp: 'Courier Dispatch Helpdesk',
      Email: 'delivery-hold@parcel-release.click',
    },
    message:
      'Your package is pending. Send the OTP you received to release your delivery.',
    categoryHint: 'OTP Hijacking Scam',
  },
  {
    id: 'fake-job',
    code: 'D',
    title: 'Fake Job Scam',
    expectedRisk: 'HIGH',
    defaultChannel: 'WhatsApp',
    senderByChannel: {
      WhatsApp: '+91 93548 11902 (HR Recruiter)',
      SMS: 'QP-HRJOBS',
      Email: 'onboarding@fast-wfh-careers.xyz',
    },
    message:
      'Congratulations! You have been selected for a work-from-home job. Pay ₹2,500 registration fee to begin.',
    categoryHint: 'Fake Job & Advance-Fee Scam',
  },
  {
    id: 'lottery-scam',
    code: 'E',
    title: 'Lottery Scam',
    expectedRisk: 'HIGH',
    defaultChannel: 'Email',
    senderByChannel: {
      Email: 'claims@mega-lucky-draw-2026.top',
      SMS: 'JD-PRZWIN',
      WhatsApp: 'National Prize Committee (+91 90123 77411)',
    },
    message:
      'You have won ₹10 lakh! Pay the processing fee now to receive your prize.',
    categoryHint: 'Lottery & Prize Fraud',
  },
  {
    id: 'upi-scam',
    code: 'F',
    title: 'UPI Scam',
    expectedRisk: 'HIGH',
    defaultChannel: 'WhatsApp',
    senderByChannel: {
      WhatsApp: '+91 88261 55091 (Marketplace Buyer)',
      SMS: '+91 88261 55091',
      Email: 'refunds@instant-upi-claim.click',
    },
    message:
      'Scan this QR code to receive your refund. Enter your UPI PIN to collect your money.',
    categoryHint: 'UPI / QR Payment Fraud',
  },
  {
    id: 'legit-appointment',
    code: 'G',
    title: 'Legitimate Message',
    expectedRisk: 'SAFE',
    defaultChannel: 'SMS',
    senderByChannel: {
      SMS: 'VK-APOLOC',
      WhatsApp: 'City Care Diagnostics',
      Email: 'appointments@citycarediagnostics.in',
    },
    message:
      'Your appointment is confirmed for tomorrow at 10 AM. Please arrive 15 minutes early.',
    categoryHint: 'Legitimate Message',
  },
  {
    id: 'legit-delivery',
    code: 'H',
    title: 'Legitimate Delivery',
    expectedRisk: 'LOW',
    defaultChannel: 'SMS',
    senderByChannel: {
      SMS: 'AX-BLUDRT',
      WhatsApp: 'Express Parcel Updates',
      Email: 'tracking@expressparcel.in',
    },
    message:
      'Your package is out for delivery. Your courier will contact you today.',
    categoryHint: 'Routine Delivery Notification',
  },
];

export interface DemoQrSample {
  id: string;
  label: string;
  subtitle: string;
  expectedVerdict: QrVerdict;
  payload: string;
}

export const DEMO_QR_SAMPLES: DemoQrSample[] = [
  {
    id: 'qr-upi-refund',
    label: 'Fake Refund UPI QR',
    subtitle: 'Claims ₹4,999 refund via UPI collect',
    expectedVerdict: 'DANGEROUS',
    payload:
      'upi://pay?pa=instant.refunddesk@okaxis&pn=Customer%20Refund%20Verify&am=4999&tn=Enter%20PIN%20to%20receive%20refund',
  },
  {
    id: 'qr-kyc-phish',
    label: 'Phishing KYC Portal QR',
    subtitle: 'Shortened / spoofed bank KYC domain',
    expectedVerdict: 'DANGEROUS',
    payload: 'http://sbi-kyc-update-alert.xyz/verify-pan-now',
  },
  {
    id: 'qr-merchant-caution',
    label: 'Unverified Street Payment QR',
    subtitle: 'Standard UPI payment requiring payee check',
    expectedVerdict: 'CAUTION',
    payload: 'upi://pay?pa=localvendor92@ybl&pn=Metro%20Corner%20Stall&cu=INR',
  },
  {
    id: 'qr-official-safe',
    label: 'Official Cybercrime Portal QR',
    subtitle: 'Verified HTTPS gov.in portal',
    expectedVerdict: 'SAFE',
    payload: 'https://cybercrime.gov.in',
  },
];
