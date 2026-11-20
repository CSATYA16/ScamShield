export interface SafetyTopic {
  id: string;
  title: string;
  shortRule: string;
  explanation: string;
  scamExample: string;
  whatToDo: string[];
  severity: 'CRITICAL' | 'HIGH' | 'ESSENTIAL';
}

export const SAFETY_TOPICS: SafetyTopic[] = [
  {
    id: 'never-share-otp',
    title: 'Never Share OTPs',
    shortRule: 'An OTP is a one-time key to your bank account or login.',
    explanation:
      'Banks, couriers, and government offices never need your SMS OTP over a phone call or chat to verify KYC, cancel an order, or issue a refund.',
    scamExample: '"Your package is pending. Send the 6-digit OTP you just received to release delivery."',
    whatToDo: [
      'Read the full SMS text—it always tells you what the OTP is authorizing.',
      'Never read an OTP aloud to an unknown caller.',
    ],
    severity: 'CRITICAL',
  },
  {
    id: 'never-share-upi-pin',
    title: 'Never Share UPI PINs',
    shortRule: 'You ONLY enter a UPI PIN to send money—never to receive money.',
    explanation:
      'Entering your 4 or 6-digit UPI PIN always authorizes money leaving your bank account. Anyone claiming you must enter your PIN to collect a refund or prize is lying.',
    scamExample: '"Scan this QR code and enter your UPI PIN to receive ₹5,000 refund."',
    whatToDo: [
      'Decline any "Collect Request" sent by strangers or marketplace buyers.',
      'Keep your UPI PIN private even from callers claiming to be bank support.',
    ],
    severity: 'CRITICAL',
  },
  {
    id: 'digital-arrest',
    title: 'Digital Arrest Scams',
    shortRule: 'There is NO such thing as "digital arrest" under Indian law.',
    explanation:
      'Fraudsters dress in fake police uniforms on video calls, claim your Aadhaar or parcel is linked to a crime, tell you not to tell family, and demand "verification transfers".',
    scamExample: '"You are under digital arrest. Stay on video call and transfer ₹50,000 to clear your name. Do not tell anyone."',
    whatToDo: [
      'Disconnect the call immediately and talk to a family member.',
      'Real police never ask for money transfers to cancel an arrest warrant.',
      'Report immediately at 1930 or cybercrime.gov.in.',
    ],
    severity: 'CRITICAL',
  },
  {
    id: 'fake-bank-kyc',
    title: 'Fake Bank & KYC Messages',
    shortRule: 'Banks do not threaten same-day account blocks via random links.',
    explanation:
      'Scammers send urgent SMS or WhatsApp messages warning that your account or PAN will be frozen unless you click a short link and log in.',
    scamExample: '"Your bank account will be blocked today. Update your KYC immediately using this link."',
    whatToDo: [
      'Do not click links inside unexpected banking SMS messages.',
      'Open your official bank app directly or call the helpline printed on your debit card.',
    ],
    severity: 'HIGH',
  },
  {
    id: 'qr-payment-scams',
    title: 'QR Payment Scams',
    shortRule: 'Scanning a payment QR sends money OUT of your account.',
    explanation:
      'Fraudsters send QR images over WhatsApp claiming it will credit a refund, advance payment, or cashback. In public places, scammers also paste fake QR stickers over shop stands.',
    scamExample: '"I sent the ₹2,000 advance—just scan this QR code on PhonePe/GPay to receive it."',
    whatToDo: [
      'Never scan a QR code sent by someone who is supposed to pay YOU.',
      'Verify the merchant name on screen before confirming payment at shops.',
    ],
    severity: 'HIGH',
  },
  {
    id: 'fake-job-scams',
    title: 'Fake Job Scams',
    shortRule: 'Real employers pay you—they never ask for registration fees.',
    explanation:
      'Scammers target students and job seekers with easy work-from-home offers, hotel-rating tasks, or immediate selection letters that demand an upfront deposit.',
    scamExample: '"Congratulations! Selected for WFH job earning ₹4,000/day. Pay ₹2,500 registration fee to begin."',
    whatToDo: [
      'Walk away from any job asking for onboarding, kit, or verification fees.',
      'Confirm job openings directly on the official company careers page.',
    ],
    severity: 'HIGH',
  },
  {
    id: 'lottery-scams',
    title: 'Lottery & Prize Scams',
    shortRule: 'You cannot win a lottery you never entered.',
    explanation:
      'Messages claiming you won lakhs of rupees in a lucky draw always demand a "processing fee", "GST charge", or "transfer tax" upfront.',
    scamExample: '"You have won ₹10 lakh! Pay ₹1,999 processing fee now to release your prize."',
    whatToDo: [
      'Never pay a fee to claim a supposed reward or gift.',
      'Block the sender and delete the message.',
    ],
    severity: 'HIGH',
  },
  {
    id: 'phishing-links',
    title: 'Phishing Links',
    shortRule: 'Look closely at the web address before tapping or typing.',
    explanation:
      'Fake websites imitate banks, courier companies, and government portals using slight spelling changes or cheap domains like .xyz, .top, or .click.',
    scamExample: '"http://sbi-kyc-update.xyz/verify" instead of the real official bank domain.',
    whatToDo: [
      'Check for HTTPS and the exact official domain spelling.',
      'Avoid downloading unknown .apk files sent over WhatsApp or SMS.',
    ],
    severity: 'HIGH',
  },
  {
    id: 'fake-customer-support',
    title: 'Fake Customer Support',
    shortRule: 'Never trust helpline numbers posted in random search results or comments.',
    explanation:
      'Scammers buy ads or post fake support numbers online. When you call, they ask you to install screen-sharing apps (like AnyDesk or TeamViewer) to steal your bank login.',
    scamExample: '"Download this quick support app so our agent can process your ticket refund."',
    whatToDo: [
      'Find support numbers only inside the official app or website.',
      'Never install screen-sharing apps for any customer care agent.',
    ],
    severity: 'HIGH',
  },
  {
    id: 'investment-scams',
    title: 'Investment & Trading Scams',
    shortRule: 'Guaranteed daily high returns are always a red flag.',
    explanation:
      'Fake stock tips, crypto doubling groups, and counterfeit trading apps show fabricated profits to convince you to deposit larger amounts, then lock withdrawals.',
    scamExample: '"VIP stock signals: 300% guaranteed monthly profit—deposit ₹25,000 in our exclusive app today."',
    whatToDo: [
      'Verify brokers and advisors on the official SEBI website.',
      'Never transfer investment funds to random personal bank accounts.',
    ],
    severity: 'HIGH',
  },
  {
    id: 'verify-official-websites',
    title: 'How to Verify Official Websites',
    shortRule: 'Navigate directly—never through an urgent message link.',
    explanation:
      'Government sites in India end in .gov.in or .nic.in. Official banks and major services use verified domains and never ask for PINs or OTPs on login pages.',
    scamExample: 'Official portal: https://cybercrime.gov.in — Fake copycat: http://cybercrime-refund-india.xyz',
    whatToDo: [
      'Type the official website manually or open the verified app from your phone.',
      'Ask a trusted family member when unsure about a website or message.',
    ],
    severity: 'ESSENTIAL',
  },
];
