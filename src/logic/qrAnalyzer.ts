import type { QrAnalysisResult, QrVerdict } from '../types/scamshield';

const TRUSTED_OFFICIAL_DOMAINS = [
  'cybercrime.gov.in',
  'rbi.org.in',
  'npci.org.in',
  'uidai.gov.in',
  'gov.in',
  'nic.in',
];

const SHORTENER_HOSTS = [
  'bit.ly',
  'tinyurl.com',
  'rb.gy',
  't.co',
  'cutt.ly',
  'is.gd',
  'shorturl.at',
  'ow.ly',
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.click', '.loan', '.zip', '.buzz'];

export function parseUpiUri(content: string): QrAnalysisResult['upiDetails'] | undefined {
  if (!content.toLowerCase().startsWith('upi://pay')) return undefined;
  try {
    const queryIndex = content.indexOf('?');
    const params = new URLSearchParams(queryIndex >= 0 ? content.slice(queryIndex + 1) : '');
    return {
      payeeVpa: params.get('pa') || undefined,
      payeeName: params.get('pn') || undefined,
      amount: params.get('am') || undefined,
      note: params.get('tn') || undefined,
    };
  } catch {
    return undefined;
  }
}

export function analyzeQrRuleBased(rawContent: string): QrAnalysisResult {
  const trimmed = rawContent.trim();
  const lower = trimmed.toLowerCase();
  const timestamp = new Date().toISOString();
  const id = `qr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // 1. UPI / Payment QR Analysis
  if (lower.startsWith('upi://') || lower.includes('upi://pay') || /\b(pa=[a-z0-9.\-_]+@[a-z]+)/i.test(trimmed)) {
    const upiDetails = parseUpiUri(trimmed);
    const redFlags: string[] = [];
    let score = 48; // All payment QRs require caution by default

    const noteLower = (upiDetails?.note ?? '').toLowerCase();
    const nameLower = (upiDetails?.payeeName ?? '').toLowerCase();
    const combinedUpi = `${noteLower} ${nameLower} ${lower}`;

    if (/\b(refund|cashback|prize|reward|lottery|receive|claim|bonus|kyc|penalty|police)\b/i.test(combinedUpi)) {
      score += 44;
      redFlags.push('QR payment note claims "refund", "cashback", or "prize" — scanning a UPI QR sends money OUT of your account.');
    }
    if (upiDetails?.amount && Number(upiDetails.amount) > 0) {
      score += 18;
      redFlags.push(`Pre-filled payment amount detected (₹${upiDetails.amount}) that will debit your account immediately upon PIN entry.`);
    }
    if (/\b(verify|support|helpdesk|care|refund|official)\b/i.test(upiDetails?.payeeVpa ?? '')) {
      score += 22;
      redFlags.push(`Suspicious impersonation UPI handle (${upiDetails?.payeeVpa}) pretending to be support or refund desk.`);
    }
    if (!upiDetails?.payeeName) {
      score += 12;
      redFlags.push('Missing verified merchant name in UPI payload.');
    }

    const riskScore = Math.min(98, score);
    const verdict: QrVerdict = riskScore >= 70 ? 'DANGEROUS' : 'CAUTION';

    return {
      id,
      timestamp,
      rawContent: trimmed,
      contentType: 'UPI_PAYMENT',
      verdict,
      riskScore,
      category: verdict === 'DANGEROUS' ? 'Fraudulent UPI Payment QR' : 'UPI Payment Request — Verify Payee',
      explanation:
        verdict === 'DANGEROUS'
          ? 'This QR code triggers an outgoing UPI money transfer while disguising itself as a refund, reward, or support request.'
          : 'This QR code initiates a UPI payment from your bank account. Never scan it to receive money; verify the exact merchant name before paying.',
      simpleExplanation:
        verdict === 'DANGEROUS'
          ? 'STOP. This QR code may take you to a dangerous website or trick you into making a payment.'
          : 'BE CAREFUL. This QR code sends money out of your bank account. Only pay if you are standing at a trusted shop and checked the name.',
      redFlags:
        redFlags.length > 0
          ? redFlags
          : ['Initiates a financial debit from your UPI account when approved with your PIN.'],
      recommendedActions:
        verdict === 'DANGEROUS'
          ? [
              'STOP — Do not scan this QR in any UPI app',
              'Never enter your UPI PIN to receive a refund or prize',
              'Prepare a cybercrime report if someone sent you this code',
            ]
          : [
              'Confirm the merchant name matches the shop you are paying',
              'Never enter your UPI PIN if someone promised you a refund',
              'Double-check the exact amount before approving',
            ],
      upiDetails,
      analysisSource: 'rule-engine',
    };
  }

  // 2. URL QR Analysis
  if (/^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed)) {
    const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    let host = '';
    let pathname = '';
    let protocol = 'https:';
    try {
      const parsed = new URL(normalizedUrl);
      host = parsed.hostname.toLowerCase();
      pathname = `${parsed.pathname}${parsed.search}`.toLowerCase();
      protocol = parsed.protocol;
    } catch {
      host = trimmed;
    }

    const redFlags: string[] = [];
    let score = 20; // Never mark an unknown external URL 0% safe just because it decoded

    if (protocol === 'http:') {
      score += 28;
      redFlags.push('Unencrypted HTTP link — your data is not protected.');
    }
    if (SHORTENER_HOSTS.some((s) => host === s || host.endsWith(`.${s}`))) {
      score += 36;
      redFlags.push(`Hidden redirect via URL shortener (${host}) masks the real destination.`);
    }
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(host)) {
      score += 45;
      redFlags.push('Direct IP address link instead of a legitimate domain name.');
    }
    if (SUSPICIOUS_TLDS.some((tld) => host.endsWith(tld))) {
      score += 30;
      redFlags.push(`High-risk domain extension frequently used in phishing campaigns (${host}).`);
    }
    if (
      /(kyc|verify|bank|sbi|hdfc|icici|paytm|phonepe|gpay|refund|lottery|prize|login|update-account|free-gift)/i.test(
        `${host}${pathname}`
      ) &&
      !TRUSTED_OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))
    ) {
      score += 42;
      redFlags.push('Domain or path mimics banking, KYC, refund, or login verification.');
    }
    if (/\.(apk|exe|scr|zip|msi)(\?|$)/i.test(pathname)) {
      score += 48;
      redFlags.push('Attempts to download an executable or Android APK file that can steal OTPs.');
    }

    const isOfficialTrusted =
      protocol === 'https:' && TRUSTED_OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));

    if (isOfficialTrusted && redFlags.length === 0) {
      return {
        id,
        timestamp,
        rawContent: trimmed,
        contentType: 'URL',
        verdict: 'SAFE',
        riskScore: 10,
        category: 'Verified Official Portal Link',
        explanation: `Points to an official HTTPS domain (${host}) with no redirect or phishing indicators.`,
        simpleExplanation: `This QR code opens the official website (${host}). Still check the address bar in your browser before entering personal details.`,
        redFlags: [],
        recommendedActions: [
          'Verify the browser address bar shows HTTPS and the exact official domain',
          'Never share OTPs or UPI PINs even on external websites',
        ],
        destinationHost: host,
        analysisSource: 'rule-engine',
      };
    }

    const riskScore = Math.min(98, score);
    const verdict: QrVerdict = riskScore >= 65 ? 'DANGEROUS' : 'CAUTION';

    return {
      id,
      timestamp,
      rawContent: trimmed,
      contentType: 'URL',
      verdict,
      riskScore,
      category: verdict === 'DANGEROUS' ? 'Phishing / Malicious QR Destination' : 'Unverified External Website',
      explanation:
        verdict === 'DANGEROUS'
          ? `This QR code points to a high-risk destination (${host}) exhibiting phishing or redirect indicators.`
          : `This QR code opens an unverified website (${host}). Decoding a QR code does not guarantee the website is trustworthy.`,
      simpleExplanation:
        verdict === 'DANGEROUS'
          ? 'STOP. This QR code may take you to a dangerous website or trick you into making a payment.'
          : 'BE CAREFUL. This QR opens an unknown website. Only open it if you trust who gave it to you, and never enter bank details or OTPs.',
      redFlags:
        redFlags.length > 0
          ? redFlags
          : [`Unverified external domain (${host}) — confirm source before visiting.`],
      recommendedActions:
        verdict === 'DANGEROUS'
          ? [
              'STOP — Do not open this link',
              'Do not install any app or enter banking credentials',
              'Report this suspicious QR code',
            ]
          : [
              'Check whether you recognize the website address before opening',
              'Do not enter passwords, OTPs, or payment information',
            ],
      destinationHost: host,
      analysisSource: 'rule-engine',
    };
  }

  // 3. Phone / SMS trigger QR
  if (/^(tel:|smsto:|sms:)/i.test(trimmed)) {
    return {
      id,
      timestamp,
      rawContent: trimmed,
      contentType: 'PHONE_OR_SMS',
      verdict: 'CAUTION',
      riskScore: 52,
      category: 'Phone Call / SMS Trigger QR',
      explanation: 'This QR code triggers a phone call or pre-written SMS message. Scammers sometimes use SMS-trigger QRs to forward OTPs or link SIM services.',
      simpleExplanation: 'BE CAREFUL. This QR code tries to make a phone call or send a text message from your phone.',
      redFlags: ['Automatically initiates an outbound phone call or SMS message.'],
      recommendedActions: [
        'Do not confirm sending any pre-written SMS',
        'Verify the phone number independently before calling',
      ],
      analysisSource: 'rule-engine',
    };
  }

  // 4. Plain text / informational QR — still check if text contains scam lures!
  const hasScamLure = /\b(otp|upi pin|send money|transfer|kyc|digital arrest|lottery|won ₹)\b/i.test(lower);
  if (hasScamLure) {
    return {
      id,
      timestamp,
      rawContent: trimmed,
      contentType: 'PLAIN_TEXT',
      verdict: 'DANGEROUS',
      riskScore: 84,
      category: 'Suspicious Scam Text Inside QR',
      explanation: 'Even though this QR code contains plain text, its instructions match known financial or OTP scam patterns.',
      simpleExplanation: 'STOP. This QR code may take you to a dangerous website or trick you into making a payment.',
      redFlags: ['Text inside QR requests money, OTP, PIN, or urgent action.'],
      recommendedActions: ['Ignore these instructions', 'Do not share OTPs, PINs, or transfer money'],
      analysisSource: 'rule-engine',
    };
  }

  return {
    id,
    timestamp,
    rawContent: trimmed,
    contentType: 'PLAIN_TEXT',
    verdict: 'CAUTION',
    riskScore: 22,
    category: 'Unverified Plain-Text QR Content',
    explanation: 'Decoded plain text with no clickable link or payment URI detected. Always verify the source—a readable QR code is not automatically verified.',
    simpleExplanation: 'This QR code only contains plain text and no payment link. Still double-check where it came from before following any instructions.',
    redFlags: ['Source is unverified — never trust unknown printed QR stickers in public places.'],
    recommendedActions: ['Read the text carefully before acting on it', 'Never call unknown helpline numbers printed on street stickers'],
    analysisSource: 'rule-engine',
  };
}
