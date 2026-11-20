import type { LanguageCode } from '../types/scamshield';

export interface UiStrings {
  brandTag: string;
  nav: {
    dashboard: string;
    liveProtection: string;
    qrShield: string;
    riskZones: string;
    threatHistory: string;
    reportProtect: string;
    safetyCenter: string;
    settings: string;
  };
  status: {
    protectionActive: string;
    protectionPaused: string;
    highRiskArea: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    startDemo: string;
    simulateThreat: string;
    threatsDetectedToday: string;
    threatsBlocked: string;
    messagesAnalyzed: string;
    reportsPrepared: string;
    protectionScore: string;
    overviewTitle: string;
    recentActivity: string;
    viewAllHistory: string;
  };
  live: {
    title: string;
    subtitle: string;
    protectionToggle: string;
    simulateIncoming: string;
    channelLabel: string;
    scenariosTitle: string;
    scanningTitle: string;
    scanningDesc: string;
    warningHeader: string;
    highRiskSub: string;
    safeHeader: string;
    safeSub: string;
    blockedBadge: string;
    blockedDisclaimer: string;
    readOutLoud: string;
    stopReading: string;
    prepareReport: string;
    callHelp: string;
    markSafe: string;
    stopBtn: string;
    dontClickBtn: string;
    redFlagsTitle: string;
    whatToDoTitle: string;
    whyDangerousTitle: string;
  };
  riskZones: {
    title: string;
    subtitle: string;
    simulateEnter: string;
    leaveZone: string;
    alertHeading: string;
    alertBody: string;
    demoLabel: string;
  };
  report: {
    title: string;
    subtitle: string;
    statusLabel: string;
    urgentTitle: string;
    urgentBody: string;
    openPortal: string;
    call1930: string;
    copyReport: string;
    downloadReport: string;
  };
  simpleWarnings: {
    critical: string;
    high: string;
    suspicious: string;
    safe: string;
    low: string;
    stepPrefix: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, UiStrings> = {
  en: {
    brandTag: 'AI Digital Safety',
    nav: {
      dashboard: 'Dashboard',
      liveProtection: 'Live Protection',
      qrShield: 'QR Shield',
      riskZones: 'Risk Zones',
      threatHistory: 'Threat History',
      reportProtect: 'Report & Protect',
      safetyCenter: 'Safety Center',
      settings: 'Settings',
    },
    status: {
      protectionActive: 'PROTECTION ACTIVE',
      protectionPaused: 'PROTECTION PAUSED',
      highRiskArea: 'HIGH-RISK ZONE ALERT',
    },
    dashboard: {
      title: 'Protection Overview',
      subtitle: 'Automatic real-time scam detection, simulated threat isolation, and guided reporting.',
      startDemo: 'Start Live Protection Demo',
      simulateThreat: 'Simulate Incoming Threat',
      threatsDetectedToday: 'Threats Detected Today',
      threatsBlocked: 'Threats Blocked (Simulated)',
      messagesAnalyzed: 'Messages Analyzed',
      reportsPrepared: 'Reports Prepared',
      protectionScore: 'Current Protection Score',
      overviewTitle: 'Active Defense Pipeline',
      recentActivity: 'Recent Activity Feed',
      viewAllHistory: 'View all history',
    },
    live: {
      title: 'Live Protection',
      subtitle: 'Simulated automatic interception across SMS, WhatsApp, and Email with instant AI threat analysis.',
      protectionToggle: 'Live Protection',
      simulateIncoming: 'Simulate Incoming Message',
      channelLabel: 'Active Channel',
      scenariosTitle: 'Demo Scenarios — Test Instant Detection',
      scanningTitle: 'ScamShield AI is scanning incoming message...',
      scanningDesc: 'Checking sender claims, urgency, payment requests, OTP/PIN lures, and links.',
      warningHeader: 'SCAMSHIELD WARNING',
      highRiskSub: 'THIS MESSAGE MAY BE A SCAM.',
      safeHeader: 'MESSAGE LOOKS SAFE',
      safeSub: 'No scam warning signs were found in this message.',
      blockedBadge: 'SIMULATED: BLOCKED & ISOLATED',
      blockedDisclaimer:
        'Prototype notice: Blocking and isolation are simulated inside ScamShield for demonstration. This web app does not access or block your phone SMS, WhatsApp, or email.',
      readOutLoud: 'Read Warning Out Loud',
      stopReading: 'Stop Reading',
      prepareReport: 'Prepare Cybercrime Report',
      callHelp: 'Call 1930 for Help',
      markSafe: 'This Is Safe',
      stopBtn: 'STOP',
      dontClickBtn: "DON'T CLICK",
      redFlagsTitle: 'Why ScamShield Flagged This',
      whatToDoTitle: 'What You Should Do Next',
      whyDangerousTitle: 'Simple Explanation',
    },
    riskZones: {
      title: 'Risk Zones — Location Safety',
      subtitle: 'Location-aware scam alerts using clearly marked simulated demonstration zones.',
      simulateEnter: 'Simulate Entering High-Risk Zone',
      leaveZone: 'Exit Simulated Zone',
      alertHeading: 'YOU ARE ENTERING A HIGH-RISK AREA',
      alertBody:
        'Recent reports in this demonstration area indicate elevated scam activity. Be careful with unknown QR codes, payment requests, and people asking for OTPs or bank details.',
      demoLabel: 'SIMULATED DEMO DATA',
    },
    report: {
      title: 'Report & Protect',
      subtitle: 'Review your auto-filled incident details before submitting directly on India’s official cybercrime portal.',
      statusLabel: 'REPORT PREPARED — USER ACTION REQUIRED',
      urgentTitle: 'ACT IMMEDIATELY',
      urgentBody:
        'Call 1930. Report at cybercrime.gov.in. Contact your bank or payment provider right away. Save screenshots and transaction details.',
      openPortal: 'Open Official Cybercrime Portal',
      call1930: 'Call 1930',
      copyReport: 'Copy Report',
      downloadReport: 'Download / Print Report',
    },
    simpleWarnings: {
      critical: 'DANGER — STOP NOW. Someone is trying to scare or trick you into sending money or secret codes.',
      high: 'HIGH RISK — THIS MESSAGE MAY BE A SCAM. Do not click links, share OTP/PIN, or pay money.',
      suspicious: 'BE CAREFUL — This message has warning signs. Verify using an official number first.',
      safe: 'THIS IS SAFE — No scam tricks or money demands were detected.',
      low: 'LOW RISK — Routine notification. Just avoid sharing OTPs over unknown phone calls.',
      stepPrefix: 'Step',
    },
  },
  hi: {
    brandTag: 'एआई डिजिटल सुरक्षा',
    nav: {
      dashboard: 'डैशबोर्ड',
      liveProtection: 'लाइव सुरक्षा',
      qrShield: 'QR शील्ड',
      riskZones: 'जोखिम क्षेत्र',
      threatHistory: 'खतरा इतिहास',
      reportProtect: 'रिपोर्ट और सुरक्षा',
      safetyCenter: 'सुरक्षा केंद्र',
      settings: 'सेटिंग्स',
    },
    status: {
      protectionActive: 'सुरक्षा सक्रिय है',
      protectionPaused: 'सुरक्षा रुकी हुई है',
      highRiskArea: 'उच्च-जोखिम क्षेत्र चेतावनी',
    },
    dashboard: {
      title: 'सुरक्षा अवलोकन',
      subtitle: 'स्वचालित रीयल-टाइम स्कैम पहचान, सिम्युलेटेड ब्लॉक और आसान रिपोर्टिंग सहायता।',
      startDemo: 'लाइव सुरक्षा डेमो शुरू करें',
      simulateThreat: 'आने वाला खतरा जांचें',
      threatsDetectedToday: 'आज मिले खतरे',
      threatsBlocked: 'रोके गए खतरे (डेमो)',
      messagesAnalyzed: 'जांचे गए संदेश',
      reportsPrepared: 'तैयार रिपोर्ट',
      protectionScore: 'वर्तमान सुरक्षा स्कोर',
      overviewTitle: 'सक्रिय सुरक्षा चरण',
      recentActivity: 'हाल की गतिविधि',
      viewAllHistory: 'पूरा इतिहास देखें',
    },
    live: {
      title: 'लाइव सुरक्षा',
      subtitle: 'SMS, WhatsApp और ईमेल पर आने वाले संदिग्ध संदेशों की तुरंत स्वचालित AI जांच।',
      protectionToggle: 'लाइव सुरक्षा',
      simulateIncoming: 'नया संदेश सिम्युलेट करें',
      channelLabel: 'चैनल चुनें',
      scenariosTitle: 'डेमो उदाहरण — तुरंत पहचान आज़माएं',
      scanningTitle: 'ScamShield AI इस संदेश की जांच कर रहा है...',
      scanningDesc: 'जल्दबाज़ी, धमकी, पैसे की मांग, OTP/PIN और संदिग्ध लिंक की जांच जारी है।',
      warningHeader: 'SCAMSHIELD चेतावनी',
      highRiskSub: 'यह संदेश धोखाधड़ी (स्कैम) हो सकता है।',
      safeHeader: 'यह संदेश सुरक्षित लगता है',
      safeSub: 'इस संदेश में धोखाधड़ी का कोई संकेत नहीं मिला।',
      blockedBadge: 'सिम्युलेटेड: ब्लॉक और अलग किया गया',
      blockedDisclaimer:
        'प्रोटोटाइप सूचना: यह ब्लॉक केवल डेमो के लिए सिम्युलेट किया गया है। यह वेब ऐप आपके फोन के SMS या WhatsApp को ब्लॉक नहीं करता।',
      readOutLoud: 'चेतावनी ज़ोर से सुनें',
      stopReading: 'पढ़ना रोकें',
      prepareReport: 'साइबर क्राइम रिपोर्ट तैयार करें',
      callHelp: 'मदद के लिए 1930 कॉल करें',
      markSafe: 'यह सुरक्षित है',
      stopBtn: 'रुकें (STOP)',
      dontClickBtn: 'लिंक न दबाएं',
      redFlagsTitle: 'यह संदेश संदिग्ध क्यों है',
      whatToDoTitle: 'अब आपको क्या करना चाहिए',
      whyDangerousTitle: 'सरल भाषा में समझें',
    },
    riskZones: {
      title: 'जोखिम क्षेत्र — लोकेशन सुरक्षा',
      subtitle: 'सिम्युलेटेड डेमो डेटा पर आधारित स्थान-आधारित स्कैम चेतावनी।',
      simulateEnter: 'उच्च-जोखिम क्षेत्र में प्रवेश सिम्युलेट करें',
      leaveZone: 'डेमो क्षेत्र से बाहर निकलें',
      alertHeading: 'आप उच्च-जोखिम क्षेत्र में प्रवेश कर रहे हैं',
      alertBody:
        'इस डेमो क्षेत्र में संदिग्ध QR कोड और भुगतान धोखाधड़ी की अधिक घटनाएं दिखाई गई हैं। अनजान QR कोड स्कैन न करें और OTP या बैंक जानकारी साझा न करें।',
      demoLabel: 'सिम्युलेटेड डेमो डेटा',
    },
    report: {
      title: 'रिपोर्ट और सुरक्षा',
      subtitle: 'आधिकारिक साइबर क्राइम पोर्टल पर भेजने से पहले अपनी रिपोर्ट की जांच और संपादन करें।',
      statusLabel: 'REPORT PREPARED — USER ACTION REQUIRED',
      urgentTitle: 'तुरंत कार्रवाई करें',
      urgentBody:
        '1930 पर कॉल करें। cybercrime.gov.in पर रिपोर्ट करें। तुरंत अपने बैंक या पेमेंट ऐप से संपर्क करें और स्क्रीनशॉट सुरक्षित रखें।',
      openPortal: 'आधिकारिक पोर्टल खोलें',
      call1930: '1930 पर कॉल करें',
      copyReport: 'रिपोर्ट कॉपी करें',
      downloadReport: 'रिपोर्ट डाउनलोड / प्रिंट करें',
    },
    simpleWarnings: {
      critical: 'खतरा — तुरंत रुकें। कोई आपको डराकर पैसे या गोपनीय कोड (OTP/PIN) लेने की कोशिश कर रहा है।',
      high: 'उच्च जोखिम — यह संदेश स्कैम हो सकता है। लिंक पर क्लिक न करें, OTP/PIN न बताएं और पैसे न भेजें।',
      suspicious: 'सावधान रहें — इस संदेश में संदिग्ध संकेत हैं। पहले आधिकारिक नंबर से पुष्टि करें।',
      safe: 'यह सुरक्षित है — इसमें पैसे या OTP की कोई मांग नहीं मिली।',
      low: 'कम जोखिम — सामान्य सूचना। किसी अनजान कॉलर को OTP न बताएं।',
      stepPrefix: 'कदम',
    },
  },
  te: {
    brandTag: 'AI డిజిటల్ భద్రత',
    nav: {
      dashboard: 'డాష్‌బోర్డ్',
      liveProtection: 'లైవ్ ప్రొటెక్షన్',
      qrShield: 'QR షీల్డ్',
      riskZones: 'రిస్క్ జోన్లు',
      threatHistory: 'ముప్పు చరిత్ర',
      reportProtect: 'రిపోర్ట్ & రక్షణ',
      safetyCenter: 'భద్రతా కేంద్రం',
      settings: 'సెట్టింగ్స్',
    },
    status: {
      protectionActive: 'రక్షణ అమలులో ఉంది',
      protectionPaused: 'రక్షణ ఆపివేయబడింది',
      highRiskArea: 'అధిక-ప్రమాద ప్రాంత హెచ్చరిక',
    },
    dashboard: {
      title: 'భద్రతా అవలోకనం',
      subtitle: 'రియల్-టైమ్ స్కామ్ గుర్తింపు, సిమ్యులేటెడ్ బ్లాకింగ్ మరియు సులభమైన రిపోర్ట్ తయారీ.',
      startDemo: 'లైవ్ ప్రొటెక్షన్ డెమో ప్రారంభించండి',
      simulateThreat: 'వచ్చే ముప్పును పరీక్షించండి',
      threatsDetectedToday: 'ఈరోజు గుర్తించిన ముప్పులు',
      threatsBlocked: 'నిరోధించిన ముప్పులు (డెమో)',
      messagesAnalyzed: 'విశ్లేషించిన సందేశాలు',
      reportsPrepared: 'సిద్ధం చేసిన రిపోర్టులు',
      protectionScore: 'ప్రస్తుత భద్రతా స్కోరు',
      overviewTitle: 'రక్షణ ప్రక్రియ',
      recentActivity: 'ఇటీవలి కార్యకలాపాలు',
      viewAllHistory: 'మొత్తం చరిత్ర చూడండి',
    },
    live: {
      title: 'లైవ్ ప్రొటెక్షన్',
      subtitle: 'SMS, WhatsApp మరియు ఇమెయిల్ సందేశాల తక్షణ స్వయంచాలక AI తనిఖీ.',
      protectionToggle: 'లైవ్ ప్రొటెక్షన్',
      simulateIncoming: 'కొత్త సందేశాన్ని సిమ్యులేట్ చేయండి',
      channelLabel: 'ఛానెల్ ఎంచుకోండి',
      scenariosTitle: 'డెమో సందర్భాలు — తక్షణ గుర్తింపు పరీక్షించండి',
      scanningTitle: 'ScamShield AI ఈ సందేశాన్ని తనిఖీ చేస్తోంది...',
      scanningDesc: 'బెదిరింపులు, డబ్బు అభ్యర్థనలు, OTP/PIN మరియు అనుమానాస్పద లింక్‌లను పరిశీలిస్తోంది.',
      warningHeader: 'SCAMSHIELD హెచ్చరిక',
      highRiskSub: 'ఈ సందేశం మోసం (స్కామ్) కావచ్చు.',
      safeHeader: 'ఈ సందేశం సురక్షితంగా ఉంది',
      safeSub: 'ఈ సందేశంలో ఎటువంటి మోసపూరిత సంకేతాలు కనిపించలేదు.',
      blockedBadge: 'సిమ్యులేటెడ్: బ్లాక్ & వేరు చేయబడింది',
      blockedDisclaimer:
        'ప్రోటోటైప్ గమనిక: బ్లాకింగ్ అనేది డెమో కోసం మాత్రమే సిమ్యులేట్ చేయబడింది. ఈ వెబ్ యాప్ మీ ఫోన్ SMS లేదా WhatsApp ను బ్లాక్ చేయదు.',
      readOutLoud: 'హెచ్చరికను బిగ్గరగా చదవండి',
      stopReading: 'చదవడం ఆపండి',
      prepareReport: 'సైబర్ క్రైమ్ రిపోర్ట్ సిద్ధం చేయండి',
      callHelp: 'సహాయం కోసం 1930 కాల్ చేయండి',
      markSafe: 'ఇది సురక్షితం',
      stopBtn: 'ఆగండి (STOP)',
      dontClickBtn: 'లింక్ నొక్కకండి',
      redFlagsTitle: 'ఇది ఎందుకు ప్రమాదకరం',
      whatToDoTitle: 'తర్వాత ఏమి చేయాలి',
      whyDangerousTitle: 'సులభమైన వివరణ',
    },
    riskZones: {
      title: 'రిస్క్ జోన్లు — లొకేషన్ భద్రత',
      subtitle: 'సిమ్యులేటెడ్ డెమో డేటాతో ప్రాంతీయ స్కామ్ హెచ్చరికలు.',
      simulateEnter: 'అధిక-ప్రమాద ప్రాంత ప్రవేశం సిమ్యులేట్ చేయండి',
      leaveZone: 'డెమో ప్రాంతం నుండి బయటకు వెళ్ళండి',
      alertHeading: 'మీరు అధిక-ప్రమాద ప్రాంతంలోకి ప్రవేశిస్తున్నారు',
      alertBody:
        'ఈ డెమో ప్రాంతంలో అనుమానాస్పద QR కోడ్‌లు మరియు చెల్లింపు మోసాల నివేదికలు ఎక్కువగా ఉన్నాయి. తెలియని QR కోడ్‌లను స్కాన్ చేయవద్దు మరియు OTP లేదా బ్యాంక్ వివరాలు పంచుకోవద్దు.',
      demoLabel: 'సిమ్యులేటెడ్ డెమో డేటా',
    },
    report: {
      title: 'రిపోర్ట్ & రక్షణ',
      subtitle: 'అధికారిక సైబర్ క్రైమ్ పోర్టల్‌లో సమర్పించే ముందు మీ రిపోర్ట్‌ను సరిచూసుకోండి.',
      statusLabel: 'REPORT PREPARED — USER ACTION REQUIRED',
      urgentTitle: 'వెంటనే స్పందించండి',
      urgentBody:
        '1930 కు కాల్ చేయండి. cybercrime.gov.in లో ఫిర్యాదు చేయండి. వెంటనే మీ బ్యాంకును సంప్రదించి స్క్రీన్‌షాట్‌లను భద్రపరచండి.',
      openPortal: 'అధికారిక పోర్టల్ తెరవండి',
      call1930: '1930 కు కాల్ చేయండి',
      copyReport: 'రిపోర్ట్ కాపీ చేయండి',
      downloadReport: 'రిపోర్ట్ డౌన్‌లోడ్ / ప్రింట్',
    },
    simpleWarnings: {
      critical: 'ప్రమాదం — వెంటనే ఆగండి. ఎవరో మిమ్మల్ని భయపెట్టి డబ్బు లేదా OTP/PIN తీసుకోవడానికి ప్రయత్నిస్తున్నారు.',
      high: 'అధిక ప్రమాదం — ఈ సందేశం మోసం కావచ్చు. లింక్ నొక్కకండి, OTP/PIN చెప్పకండి, డబ్బు పంపకండి.',
      suspicious: 'జాగ్రత్త — ఇందులో అనుమానాస్పద సంకేతాలు ఉన్నాయి. ముందుగా అధికారిక నంబర్‌తో నిర్ధారించుకోండి.',
      safe: 'ఇది సురక్షితం — ఎటువంటి డబ్బు లేదా OTP అభ్యర్థనలు లేవు.',
      low: 'తక్కువ ప్రమాదం — సాధారణ సమాచారం. తెలియని కాల్‌లో OTP చెప్పకండి.',
      stepPrefix: 'దశ',
    },
  },
};

export function getSpeechLangCode(lang: LanguageCode): string {
  if (lang === 'hi') return 'hi-IN';
  if (lang === 'te') return 'te-IN';
  return 'en-IN';
}
