import type { ChannelType, RedFlagItem, RiskLevel, ThreatAnalysis } from '../types/scamshield';

interface RuleSignal {
  id: string;
  weight: number;
  label: string;
  simpleLabel: string;
  detail: string;
  categoryHint?: string;
}

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>()"']+/gi;
const SUSPICIOUS_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'rb.gy',
  'cutt.ly',
  'shorturl',
  'is.gd',
  'ow.ly',
  'ngrok',
  'vercel.app',
  'netlify.app',
  'xyz',
  'top',
  'click',
  'tk',
  'ml',
];

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? [];
  return Array.from(new Set(matches.map((url) => url.replace(/[.,;!?]+$/, ''))));
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 82) return 'CRITICAL';
  if (score >= 62) return 'HIGH';
  if (score >= 38) return 'SUSPICIOUS';
  if (score >= 16) return 'LOW';
  return 'SAFE';
}

export function analyzeMessageRuleBased(
  message: string,
  sender: string = 'Unknown Sender',
  channel: ChannelType = 'SMS'
): ThreatAnalysis {
  const text = `${message} ${sender}`.toLowerCase();
  const body = message.toLowerCase();
  const urls = extractUrls(message);

  const signals: RuleSignal[] = [];
  let categoryScores: Record<string, number> = {
    'Digital Arrest & Extortion Scam': 0,
    'Bank KYC / Account Phishing': 0,
    'OTP Hijacking Scam': 0,
    'Fake Job & Advance-Fee Scam': 0,
    'Lottery & Prize Fraud': 0,
    'UPI / QR Payment Fraud': 0,
    'Suspicious Phishing Attempt': 0,
  };

  // 1. Digital arrest / law enforcement threat
  if (
    /\b(digital arrest|police officer|cbi|cyber cell|arrest warrant|will arrest you|customs department|narcotics|court summons)\b/i.test(
      text
    )
  ) {
    signals.push({
      id: 'impersonation-authority',
      weight: 38,
      label: 'Impersonation of police or government authority',
      simpleLabel: 'They are pretending to be an official person.',
      detail: 'Law enforcement never conducts "digital arrest" or demands money transfers over chat or calls.',
    });
    categoryScores['Digital Arrest & Extortion Scam'] += 55;
  }

  // 2. Direct threats or fear tactics
  if (
    /\b(arrest you|will be blocked|account suspended|account will be blocked|frozen today|legal action|jail|penalty|deactivate|disconnected tonight)\b/i.test(
      body
    )
  ) {
    signals.push({
      id: 'threat-intimidation',
      weight: 26,
      label: 'Threatening language and fear tactics',
      simpleLabel: 'They are threatening you.',
      detail: 'Scammers create fear of arrest or account closure so you act without checking.',
    });
    if (/bank|account|kyc|pan|card/i.test(body)) {
      categoryScores['Bank KYC / Account Phishing'] += 35;
    }
    if (/arrest|police|jail/i.test(body)) {
      categoryScores['Digital Arrest & Extortion Scam'] += 30;
    }
  }

  // 3. Secrecy instruction
  if (/\b(do not tell anyone|don't tell anyone|keep this secret|keep confidential|stay on video call|tell no one)\b/i.test(body)) {
    signals.push({
      id: 'secrecy',
      weight: 28,
      label: 'Demanding secrecy from family or friends',
      simpleLabel: 'They are asking you to keep it secret.',
      detail: 'Real officials never stop you from consulting family members or visiting a branch.',
    });
    categoryScores['Digital Arrest & Extortion Scam'] += 30;
  }

  // 4. OTP / PIN / Password request
  if (
    /\b(send the otp|share.{0,15}otp|enter your upi pin|share.{0,15}pin|tell.{0,12}otp|verify.{0,12}otp|provide.{0,12}otp|cvv|password)\b/i.test(
      body
    )
  ) {
    const isUpiPin = /\b(upi pin|mpin)\b/i.test(body);
    signals.push({
      id: isUpiPin ? 'pin-request' : 'otp-request',
      weight: 44,
      label: isUpiPin ? 'Requesting your UPI PIN to receive money' : 'Requesting your secret OTP or passcode',
      simpleLabel: isUpiPin ? 'They are asking for your secret PIN.' : 'They are asking for an OTP.',
      detail: isUpiPin
        ? 'You NEVER enter a UPI PIN to receive a refund or collect money. A PIN only sends money out.'
        : 'Sharing an OTP gives someone direct access to your bank, wallet, or account.',
    });
    if (isUpiPin) {
      categoryScores['UPI / QR Payment Fraud'] += 50;
    } else {
      categoryScores['OTP Hijacking Scam'] += 55;
    }
  }

  // 5. QR / UPI refund trick
  if (/\b(scan this qr|scan qr|receive your refund|collect your money|upi pin|cashback qr)\b/i.test(body)) {
    signals.push({
      id: 'upi-qr-trick',
      weight: 34,
      label: 'Suspicious QR / UPI payment instruction',
      simpleLabel: 'They are trying to trick you into sending money.',
      detail: 'Scanning a QR code or entering a UPI PIN sends money FROM your account—it does not deposit refunds.',
    });
    categoryScores['UPI / QR Payment Fraud'] += 50;
  }

  // 6. Bank KYC / account update lure
  if (/\b(update your kyc|kyc immediately|kyc expired|pan card update|re-kyc|verify kyc)\b/i.test(body)) {
    signals.push({
      id: 'kyc-lure',
      weight: 32,
      label: 'Fake KYC verification demand',
      simpleLabel: 'They are pretending to be your bank.',
      detail: 'Banks do not ask you to update KYC via random links sent over SMS or WhatsApp.',
    });
    categoryScores['Bank KYC / Account Phishing'] += 45;
  }

  // 7. Money / fee / transfer request
  if (
    /\b(transfer|pay|send money|registration fee|processing fee|deposit|security fee|customs fee)\b/i.test(body) &&
    /(₹|rs\.?|inr|\$|fee|money|amount|\d{3,})/i.test(body)
  ) {
    signals.push({
      id: 'money-request',
      weight: 30,
      label: 'Request for upfront payment or money transfer',
      simpleLabel: 'They are asking for money.',
      detail: 'Demanding money immediately, or asking for fees to unlock a job or prize, is a primary scam signal.',
    });
    if (/job|work-from-home|work from home|hiring|selected|registration/i.test(body)) {
      categoryScores['Fake Job & Advance-Fee Scam'] += 45;
    }
    if (/won|prize|lottery|lakh|crore|jackpot|processing fee/i.test(body)) {
      categoryScores['Lottery & Prize Fraud'] += 45;
    }
  }

  // 8. Fake job / unrealistic reward
  if (/\b(work-from-home job|work from home job|selected for a|earn daily|part-time job|registration fee)\b/i.test(body)) {
    signals.push({
      id: 'fake-job',
      weight: 28,
      label: 'Unsolicited job offer requesting payment',
      simpleLabel: 'This job offer asks you to pay first.',
      detail: 'Genuine employers never charge a registration or onboarding fee to start work.',
    });
    categoryScores['Fake Job & Advance-Fee Scam'] += 45;
  }

  if (/\b(you have won|won ₹|won rs|lottery|lucky draw|claim your prize|lakh|crore)\b/i.test(body)) {
    signals.push({
      id: 'unrealistic-reward',
      weight: 32,
      label: 'Unrealistic prize or lottery claim',
      simpleLabel: 'They are promising free prize money.',
      detail: 'You cannot win a lottery you never entered, and real prizes never require a processing fee.',
    });
    categoryScores['Lottery & Prize Fraud'] += 50;
  }

  // 9. Urgency pressure
  if (/\b(immediately|urgent|today|within \d+ (minutes|hours)|act now|last warning|expires today|now to receive|right now)\b/i.test(body)) {
    signals.push({
      id: 'urgency',
      weight: 18,
      label: 'Artificial urgency to rush your decision',
      simpleLabel: 'They are creating urgency.',
      detail: 'Scammers pressure you to act immediately so you do not have time to verify.',
    });
  }

  // 10. Suspicious URLs or "using this link"
  const mentionsLink = /\b(using this link|click this link|click here|tap the link|open link|verify link)\b/i.test(body);
  const hasSuspiciousUrl = urls.some((url) => {
    const lower = url.toLowerCase();
    return (
      lower.startsWith('http://') ||
      SUSPICIOUS_SHORTENERS.some((d) => lower.includes(d)) ||
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lower) ||
      /(kyc|verify|secure|update|bank|refund|claim|free|prize)/.test(lower)
    );
  });

  if (mentionsLink || hasSuspiciousUrl || urls.length > 0) {
    signals.push({
      id: 'unknown-link',
      weight: hasSuspiciousUrl ? 26 : mentionsLink ? 22 : 10,
      label: urls.length > 0 ? `Contains unverified link (${urls[0]})` : 'Directs you to click an unverified link',
      simpleLabel: 'They are using an unknown link.',
      detail: 'Links in unexpected messages often lead to fake websites designed to steal logins or money.',
    });
    categoryScores['Suspicious Phishing Attempt'] += 25;
  }

  // 11. Package/delivery check — be careful NOT to over-flag legitimate delivery notices!
  const isDeliveryContext = /\b(package|parcel|delivery|courier|shipment)\b/i.test(body);
  const hasHarmfulAsk = signals.some((s) =>
    ['otp-request', 'pin-request', 'money-request', 'unknown-link', 'upi-qr-trick', 'threat-intimidation', 'impersonation-authority'].includes(
      s.id
    )
  );

  // Calculate total score cleanly
  let rawScore = signals.reduce((sum, s) => sum + s.weight, 0);

  // Legitimate appointment / benign delivery handling:
  // If there are NO harmful asks and it looks like a normal informational message
  if (!hasHarmfulAsk && signals.length === 0) {
    if (isDeliveryContext) {
      return {
        riskLevel: 'LOW',
        riskScore: 18,
        scamCategory: 'Routine Delivery Notification',
        explanation:
          'This appears to be a routine delivery update. It does not ask for an OTP, payment, or unknown link—still verify the order before sharing any delivery code at your door.',
        simpleExplanation:
          'This looks like a normal delivery message. It is not asking for money or passwords, so you are safe—just check your order app if unsure.',
        redFlags: [],
        recommendedActions: [
          'Check your official shopping app to confirm you ordered a package',
          'Do not share an OTP over the phone before the delivery person arrives',
        ],
        oneStepInstructions: [
          'Step 1: Check your shopping app to see if you are expecting a parcel.',
          'Step 2: Only share a delivery code in person when your parcel arrives.',
        ],
        confidenceLevel: 'High',
        suspiciousUrls: [],
        shouldBlock: false,
        analysisSource: 'rule-engine',
      };
    }

    return {
      riskLevel: 'SAFE',
      riskScore: 6,
      scamCategory: 'Legitimate Message',
      explanation:
        'No scam indicators were found. This message does not pressure you for money, OTPs, PINs, secrecy, or suspicious links.',
      simpleExplanation:
        'This message looks safe. Nobody is asking you for money, secret codes, or urgent clicks.',
      redFlags: [],
      recommendedActions: [
        'No protective action required',
        'Reply normally if you recognize the sender',
      ],
      oneStepInstructions: [
        'Step 1: This message looks safe to read and follow.',
        'Step 2: If anything still feels unusual later, never share OTPs or PINs.',
      ],
      confidenceLevel: 'High',
      suspiciousUrls: [],
      shouldBlock: false,
      analysisSource: 'rule-engine',
    };
  }

  // Cap score between 0 and 99
  const riskScore = Math.min(99, Math.max(12, rawScore));
  const riskLevel = scoreToRiskLevel(riskScore);
  const shouldBlock = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';

  // Pick top category
  let topCategory = 'Suspicious Scam Attempt';
  let bestCatScore = 0;
  for (const [cat, val] of Object.entries(categoryScores)) {
    if (val > bestCatScore) {
      bestCatScore = val;
      topCategory = cat;
    }
  }

  const redFlags: RedFlagItem[] = signals.map((s) => ({
    id: s.id,
    label: s.label,
    simpleLabel: s.simpleLabel,
    detail: s.detail,
  }));

  // Build context-aware actions & simple explanations
  const recommendedActions: string[] = [];
  const oneStepInstructions: string[] = [];

  if (signals.some((s) => s.id === 'unknown-link')) {
    recommendedActions.push('DO NOT CLICK THE LINK');
  }
  if (signals.some((s) => s.id === 'otp-request')) {
    recommendedActions.push('DO NOT SHARE YOUR OTP');
  }
  if (signals.some((s) => s.id === 'pin-request' || s.id === 'upi-qr-trick')) {
    recommendedActions.push('DO NOT SHARE YOUR PIN');
    recommendedActions.push('DO NOT SCAN THIS QR CODE');
  }
  if (signals.some((s) => s.id === 'money-request' || s.id === 'impersonation-authority' || s.id === 'fake-job' || s.id === 'unrealistic-reward')) {
    recommendedActions.push('DO NOT SEND MONEY');
  }
  recommendedActions.push('DO NOT REPLY');
  recommendedActions.push('VERIFY USING THE OFFICIAL PHONE NUMBER OR WEBSITE');

  // Craft clean 3-step instructions for everyone
  if (topCategory === 'Digital Arrest & Extortion Scam') {
    oneStepInstructions.push(
      'Step 1: Stop talking to this person. Police never do "digital arrest" or ask for money.',
      'Step 2: Do not send any money and do not stay on their call.',
      'Step 3: Tell a family member right now and call 1930 if you feel scared.'
    );
  } else if (topCategory === 'OTP Hijacking Scam') {
    oneStepInstructions.push(
      'Step 1: Do not share your OTP with anyone on chat or phone.',
      'Step 2: Ignore this message and check your order inside the official shopping app.',
      'Step 3: Ask someone you trust if you are unsure.'
    );
  } else if (topCategory === 'UPI / QR Payment Fraud') {
    oneStepInstructions.push(
      'Step 1: Do not scan this QR code and never enter your UPI PIN to receive money.',
      'Step 2: Remember—entering a PIN sends money OUT of your bank account.',
      'Step 3: Block this sender and check your bank app directly.'
    );
  } else if (topCategory === 'Bank KYC / Account Phishing') {
    oneStepInstructions.push(
      'Step 1: Do not click this link.',
      'Step 2: Do not share your bank details, card number, or OTP.',
      'Step 3: Call your bank using the official number on the back of your card.'
    );
  } else {
    oneStepInstructions.push(
      'Step 1: Stop—do not click links, pay any fee, or share codes.',
      'Step 2: Do not reply to this sender.',
      'Step 3: Ask a family member or trusted friend before taking any action.'
    );
  }

  let simpleExplanation =
    'Someone may be trying to trick you into sharing your bank details, secret codes, or sending money.';
  if (topCategory === 'Digital Arrest & Extortion Scam') {
    simpleExplanation =
      'This is a fake police scare trick. Real police never arrest people on a phone call or ask for money to stop an arrest.';
  } else if (topCategory === 'Bank KYC / Account Phishing') {
    simpleExplanation =
      'Someone is pretending to be your bank to scare you into clicking a fake link and stealing your money.';
  } else if (topCategory === 'OTP Hijacking Scam') {
    simpleExplanation =
      'Someone wants your secret OTP code. If you send this code, they can steal money or take over your account.';
  } else if (topCategory === 'Fake Job & Advance-Fee Scam') {
    simpleExplanation =
      'This looks like a fake job offer. Real companies pay you for work—they never ask you to pay a fee first.';
  } else if (topCategory === 'Lottery & Prize Fraud') {
    simpleExplanation =
      'This is a fake prize trick. Scammers promise big prize money so you pay them a "fee" and then they disappear.';
  } else if (topCategory === 'UPI / QR Payment Fraud') {
    simpleExplanation =
      'This is a payment trick. Scanning a QR code or typing your UPI PIN sends your money away—it never brings a refund in.';
  }

  const explanation =
    `Detected ${redFlags.length} high-risk fraud pattern${redFlags.length === 1 ? '' : 's'} on ${channel} consistent with ${topCategory}. ` +
    `${signals[0]?.detail ?? 'Verify independently through official channels before responding.'}`;

  return {
    riskLevel,
    riskScore,
    scamCategory: topCategory,
    explanation,
    simpleExplanation,
    redFlags,
    recommendedActions: Array.from(new Set(recommendedActions)),
    oneStepInstructions,
    confidenceLevel: signals.length >= 2 ? 'High' : 'Medium',
    suspiciousUrls: urls,
    shouldBlock,
    analysisSource: 'rule-engine',
  };
}
