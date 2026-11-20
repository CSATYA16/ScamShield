import { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { LiveProtectionView } from './components/LiveProtectionView';
import { QrShieldView } from './components/QrShieldView';
import { RiskZonesView } from './components/RiskZonesView';
import { ThreatHistoryView } from './components/ThreatHistoryView';
import { ReportProtectView } from './components/ReportProtectView';
import { SafetyCenterView } from './components/SafetyCenterView';
import { SettingsView } from './components/SettingsView';
import { DEMO_SCENARIOS } from './data/scenarios';
import { createInitialDemoHistory } from './data/seedHistory';
import { TRANSLATIONS } from './data/translations';
import { calculateDashboardMetrics } from './logic/metrics';
import { buildReportFromQr, buildReportFromThreat } from './logic/reportBuilder';
import { analyzeIncomingMessage } from './services/api';
import { speakWarning, stopSpeaking } from './utils/speech';
import {
  checkAndroidNotificationAccess,
  isNativeAndroid,
  openAppNotificationSettings,
  requestAndroidNotificationAccess,
  subscribeToNativeThreats,
  triggerNativeTestNotification,
  type NotificationAccessStatus,
} from './services/androidBridge';
import type {
  AppSettings,
  ChannelType,
  CybercrimeReportDraft,
  DemoScenario,
  NavSection,
  ProtectionAction,
  QrAnalysisResult,
  ThreatRecord,
} from './types/scamshield';

type ActiveChannel = Exclude<ChannelType, 'QR'>;

const STORAGE_KEYS = {
  history: 'scamshield_history_v1',
  reports: 'scamshield_reports_v1',
  settings: 'scamshield_settings_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  protectionEnabled: true,
  simpleLanguageMode: false,
  voiceAlertsEnabled: true,
  autoSpeakCritical: false,
  language: 'en',
  locationProtectionEnabled: true,
  notificationsEnabled: true,
  highRiskSoundBanner: true,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  );
  const [history, setHistory] = useState<ThreatRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.history, createInitialDemoHistory())
  );
  const [savedReports, setSavedReports] = useState<CybercrimeReportDraft[]>(() =>
    loadFromStorage(STORAGE_KEYS.reports, [])
  );

  // Live Protection working state
  const [selectedChannel, setSelectedChannel] = useState<ActiveChannel>('WhatsApp');
  const [isScanning, setIsScanning] = useState(false);
  const [incomingPreview, setIncomingPreview] = useState<{
    sender: string;
    channel: ActiveChannel;
    message: string;
    arrivedAt: string;
  } | null>(null);
  const [activeRecord, setActiveRecord] = useState<ThreatRecord | null>(null);
  const scenarioCursorRef = useRef(0);

  // Risk Zone simulated state
  const [activeSimulatedZoneId, setActiveSimulatedZoneId] = useState<string | null>(null);

  // Report & History cross-navigation state
  const [activeReportDraft, setActiveReportDraft] = useState<CybercrimeReportDraft | null>(null);
  const [historyFocusId, setHistoryFocusId] = useState<string | null>(null);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(2);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = TRANSLATIONS[settings.language];

  // Persist to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // storage full / disabled
    }
  }, [settings]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(savedReports));
    } catch {
      // ignore
    }
  }, [savedReports]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Android Native Notification Bridge Status & Live Subscription
  const [androidAccessStatus, setAndroidAccessStatus] = useState<NotificationAccessStatus>({
    isGranted: true,
    isConnected: false,
    status: isNativeAndroid() ? 'NOT_LISTENING' : 'WEB_SIMULATION',
  });

  useEffect(() => {
    let mounted = true;
    const syncStatus = async () => {
      const s = await checkAndroidNotificationAccess();
      if (mounted) setAndroidAccessStatus(s);
    };
    void syncStatus();

    const handleWindowFocus = () => {
      void syncStatus();
    };
    window.addEventListener('focus', handleWindowFocus);

    const unsubscribe = subscribeToNativeThreats((nativeThreat) => {
      setActiveRecord(nativeThreat);
      setIncomingPreview({
        sender: nativeThreat.sender,
        channel: nativeThreat.channel as ActiveChannel,
        message: nativeThreat.message,
        arrivedAt: nativeThreat.timestamp,
      });
      setHistory((prev) => [nativeThreat, ...prev]);

      if (
        nativeThreat.analysis.riskLevel === 'CRITICAL' ||
        nativeThreat.analysis.riskLevel === 'HIGH' ||
        nativeThreat.analysis.riskLevel === 'SUSPICIOUS'
      ) {
        setUnreadAlertsCount((c) => c + 1);
      }

      if (
        settings.voiceAlertsEnabled &&
        settings.autoSpeakCritical &&
        (nativeThreat.analysis.riskLevel === 'CRITICAL' || nativeThreat.analysis.riskLevel === 'HIGH')
      ) {
        const spoken = `${t.live.warningHeader}. ${nativeThreat.analysis.scamCategory}. ${nativeThreat.analysis.simpleExplanation}`;
        handleSpeakText(spoken);
      }

      setActiveSection('live-protection');
    });

    return () => {
      mounted = false;
      window.removeEventListener('focus', handleWindowFocus);
      unsubscribe();
    };
  }, [settings.voiceAlertsEnabled, settings.autoSpeakCritical, t.live.warningHeader]);

  const handleRequestAndroidAccess = async () => {
    await requestAndroidNotificationAccess();
    const updated = await checkAndroidNotificationAccess();
    setAndroidAccessStatus(updated);
  };

  const handleOpenAppNotificationSettings = async () => {
    await openAppNotificationSettings();
    const updated = await checkAndroidNotificationAccess();
    setAndroidAccessStatus(updated);
  };

  const handleTriggerNativeTestAlert = async (
    scenario?: DemoScenario
  ): Promise<{ success: boolean; error?: string }> => {
    const sc = scenario ?? DEMO_SCENARIOS[0];
    const channel = sc.defaultChannel;
    const sender = sc.senderByChannel[channel];
    const message = sc.message;

    if (isNativeAndroid()) {
      const result = await triggerNativeTestNotification({
        sender,
        channel,
        message,
      });

      if (result.success) {
        if (result.threat) {
          setActiveRecord(result.threat);
          setIncomingPreview({
            sender,
            channel,
            message,
            arrivedAt: result.threat.timestamp,
          });
          setHistory((prev) => [result.threat!, ...prev]);
          setUnreadAlertsCount((c) => c + 1);
          setActiveSection('live-protection');
        }
        return { success: true };
      }

      return {
        success: false,
        error: result.error || 'Failed to trigger native notification.',
      };
    }

    void runLiveInterception({
      sender,
      channel,
      message,
      scenarioId: sc.id,
      forceEnableProtection: true,
    });
    return { success: true };
  };

  const inHighRiskZone = Boolean(activeSimulatedZoneId);

  const metrics = useMemo(
    () => calculateDashboardMetrics(history, savedReports.length, settings, inHighRiskZone),
    [history, savedReports.length, settings, inHighRiskZone]
  );

  const recentAlerts = useMemo(
    () =>
      history.filter(
        (r) =>
          !r.userMarkedSafe &&
          (r.analysis.riskLevel === 'CRITICAL' ||
            r.analysis.riskLevel === 'HIGH' ||
            r.analysis.riskLevel === 'SUSPICIOUS')
      ),
    [history]
  );

  const handleSpeakText = (text: string) => {
    setIsSpeaking(true);
    const started = speakWarning(text, settings.language, () => setIsSpeaking(false));
    if (!started) {
      setIsSpeaking(false);
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  // Core Automatic Live Interception Pipeline
  const runLiveInterception = async (params: {
    sender: string;
    channel: ActiveChannel;
    message: string;
    scenarioId?: string;
    forceEnableProtection?: boolean;
  }) => {
    stopSpeaking();
    setIsSpeaking(false);

    const guardActive = params.forceEnableProtection ? true : settings.protectionEnabled;
    if (params.forceEnableProtection && !settings.protectionEnabled) {
      updateSettings({ protectionEnabled: true });
    }

    const arrivedAt = new Date().toISOString();
    setIncomingPreview({
      sender: params.sender,
      channel: params.channel,
      message: params.message,
      arrivedAt,
    });
    setActiveRecord(null);
    setIsScanning(true);

    // Purposeful scanning delay so the user visibly experiences DETECT -> SCAN -> ALERT
    const minScanDelay = new Promise((resolve) => window.setTimeout(resolve, 680));
    const [analysis] = await Promise.all([
      analyzeIncomingMessage({
        message: params.message,
        sender: params.sender,
        channel: params.channel,
        language: settings.language,
      }),
      minScanDelay,
    ]);

    let protectionAction: ProtectionAction = 'Allowed (Safe)';
    if (!guardActive) {
      protectionAction = 'Monitoring Off — Manual Review';
    } else if (analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH') {
      protectionAction = 'Simulated Block & Isolation';
    } else if (analysis.riskLevel === 'SUSPICIOUS') {
      protectionAction = 'Warned User';
    } else if (analysis.riskLevel === 'LOW') {
      protectionAction = 'Allowed (Low Risk)';
    }

    const newRecord: ThreatRecord = {
      id: `thr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: arrivedAt,
      channel: params.channel,
      sender: params.sender,
      message: params.message,
      scenarioId: params.scenarioId,
      analysis,
      protectionAction,
      reportStatus: 'Not Reported',
    };

    setIsScanning(false);
    setActiveRecord(newRecord);
    setHistory((prev) => [newRecord, ...prev]);

    if (
      settings.notificationsEnabled &&
      (analysis.riskLevel === 'CRITICAL' ||
        analysis.riskLevel === 'HIGH' ||
        analysis.riskLevel === 'SUSPICIOUS')
    ) {
      setUnreadAlertsCount((c) => c + 1);
    }

    // Optional Auto-Speak when Voice Alerts + Auto-Speak are ON
    if (
      settings.voiceAlertsEnabled &&
      settings.autoSpeakCritical &&
      (analysis.riskLevel === 'CRITICAL' || analysis.riskLevel === 'HIGH')
    ) {
      const spoken = `${t.live.warningHeader}. ${analysis.scamCategory}. ${analysis.simpleExplanation}`;
      handleSpeakText(spoken);
    }
  };

  const handleTriggerScenario = (scenario: DemoScenario, channelOverride?: ActiveChannel) => {
    const channel = channelOverride ?? scenario.defaultChannel;
    setSelectedChannel(channel);
    void runLiveInterception({
      sender: scenario.senderByChannel[channel],
      channel,
      message: scenario.message,
      scenarioId: scenario.id,
    });
  };

  const handleSimulateNextMessage = () => {
    const scenario = DEMO_SCENARIOS[scenarioCursorRef.current % DEMO_SCENARIOS.length];
    scenarioCursorRef.current += 1;
    handleTriggerScenario(scenario, selectedChannel);
  };

  // One-click Hackathon Demo Journey from Dashboard
  const handleStartLiveDemo = () => {
    const digitalArrest = DEMO_SCENARIOS[0];
    setActiveSection('live-protection');
    setSelectedChannel(digitalArrest.defaultChannel);
    void runLiveInterception({
      sender: digitalArrest.senderByChannel[digitalArrest.defaultChannel],
      channel: digitalArrest.defaultChannel,
      message: digitalArrest.message,
      scenarioId: digitalArrest.id,
      forceEnableProtection: true,
    });
  };

  const handleSimulateIncomingThreatFromDashboard = () => {
    const scamScenarios = DEMO_SCENARIOS.filter((s) => s.expectedRisk !== 'SAFE' && s.expectedRisk !== 'LOW');
    const scenario = scamScenarios[scenarioCursorRef.current % scamScenarios.length];
    scenarioCursorRef.current += 1;
    setActiveSection('live-protection');
    setSelectedChannel(scenario.defaultChannel);
    void runLiveInterception({
      sender: scenario.senderByChannel[scenario.defaultChannel],
      channel: scenario.defaultChannel,
      message: scenario.message,
      scenarioId: scenario.id,
      forceEnableProtection: true,
    });
  };

  const handlePrepareReportFromThreat = (record: ThreatRecord) => {
    const existing = savedReports.find((r) => r.sourceThreatId === record.id);
    const draft = existing ?? buildReportFromThreat(record);
    setActiveReportDraft(draft);

    // Ensure it's saved in prepared reports list so dashboard metric updates immediately
    if (!existing) {
      setSavedReports((prev) => [draft, ...prev]);
    }
    setHistory((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? { ...item, reportStatus: 'REPORT PREPARED — USER ACTION REQUIRED' }
          : item
      )
    );
    if (activeRecord?.id === record.id) {
      setActiveRecord((prev) =>
        prev ? { ...prev, reportStatus: 'REPORT PREPARED — USER ACTION REQUIRED' } : null
      );
    }
    setActiveSection('report-protect');
  };

  const handlePrepareReportFromQr = (qr: QrAnalysisResult) => {
    const draft = buildReportFromQr(qr);
    setActiveReportDraft(draft);
    setSavedReports((prev) => [draft, ...prev]);
    setActiveSection('report-protect');
  };

  const handleQrAnalyzed = (qr: QrAnalysisResult) => {
    // Also record QR scans in Threat History so dashboard metrics reflect real QR activity!
    const riskLevel =
      qr.verdict === 'DANGEROUS' ? 'HIGH' : qr.verdict === 'CAUTION' ? 'SUSPICIOUS' : 'SAFE';
    const record: ThreatRecord = {
      id: qr.id,
      timestamp: qr.timestamp,
      channel: 'QR',
      sender: qr.upiDetails?.payeeVpa || qr.destinationHost || 'Scanned QR Code',
      message: qr.rawContent,
      analysis: {
        riskLevel,
        riskScore: qr.riskScore,
        scamCategory: qr.category,
        explanation: qr.explanation,
        simpleExplanation: qr.simpleExplanation,
        redFlags: qr.redFlags.map((rf, i) => ({
          id: `qr-rf-${i}`,
          label: rf,
          simpleLabel: rf,
          detail: rf,
        })),
        recommendedActions: qr.recommendedActions,
        oneStepInstructions: qr.recommendedActions.map((a, i) => `Step ${i + 1}: ${a}`),
        confidenceLevel: 'High',
        suspiciousUrls: qr.contentType === 'URL' ? [qr.rawContent] : [],
        shouldBlock: qr.verdict === 'DANGEROUS',
        analysisSource: qr.analysisSource,
      },
      protectionAction:
        qr.verdict === 'DANGEROUS'
          ? 'Simulated Block & Isolation'
          : qr.verdict === 'CAUTION'
          ? 'Warned User'
          : 'Allowed (Safe)',
      reportStatus: 'Not Reported',
    };
    setHistory((prev) => [record, ...prev]);
    if (qr.verdict === 'DANGEROUS') {
      setUnreadAlertsCount((c) => c + 1);
    }
  };

  const handleSaveReportDraft = (draft: CybercrimeReportDraft) => {
    setActiveReportDraft(draft);
    setSavedReports((prev) => {
      const idx = prev.findIndex((r) => r.id === draft.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = draft;
        return next;
      }
      return [draft, ...prev];
    });
    if (draft.sourceThreatId) {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === draft.sourceThreatId
            ? { ...item, reportStatus: 'REPORT PREPARED — USER ACTION REQUIRED' }
            : item
        )
      );
    }
  };

  const handleMarkSafe = (recordId: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === recordId
          ? { ...item, userMarkedSafe: true, protectionAction: 'Allowed (Safe)' }
          : item
      )
    );
    if (activeRecord?.id === recordId) {
      setActiveRecord((prev) =>
        prev ? { ...prev, userMarkedSafe: true, protectionAction: 'Allowed (Safe)' } : null
      );
    }
  };

  const handleSimulateEnterHighRiskZone = () => {
    setActiveSimulatedZoneId('zone-central-market');
    if (!settings.locationProtectionEnabled) {
      updateSettings({ locationProtectionEnabled: true });
    }
    setActiveSection('risk-zones');
  };

  const handleInspectThreatFromAnywhere = (record: ThreatRecord) => {
    setHistoryFocusId(record.id);
    setActiveSection('threat-history');
  };

  const handleResetDemoData = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setHistory(createInitialDemoHistory());
    setSavedReports([]);
    setActiveReportDraft(null);
    setActiveRecord(null);
    setIncomingPreview(null);
    setActiveSimulatedZoneId(null);
    setSettings(DEFAULT_SETTINGS);
    setUnreadAlertsCount(2);
  };

  const speakActiveLiveWarning = () => {
    if (!activeRecord) return;
    const text = [
      t.live.warningHeader,
      activeRecord.analysis.scamCategory,
      activeRecord.analysis.simpleExplanation,
      ...activeRecord.analysis.oneStepInstructions,
    ].join('. ');
    handleSpeakText(text);
  };

  return (
    <div className="min-h-screen bg-[#090B0F] text-[#F3F5F8] flex">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        t={t}
        protectionEnabled={settings.protectionEnabled}
        inHighRiskZone={inHighRiskZone}
        threatCount={history.length}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          t={t}
          protectionEnabled={settings.protectionEnabled}
          inHighRiskZone={inHighRiskZone}
          language={settings.language}
          simpleLanguageMode={settings.simpleLanguageMode}
          onChangeLanguage={(lang) => updateSettings({ language: lang })}
          onNavigate={setActiveSection}
          onSelectHistoryItem={handleInspectThreatFromAnywhere}
          recentAlerts={recentAlerts}
          unreadAlertsCount={unreadAlertsCount}
          onMarkAlertsRead={() => setUnreadAlertsCount(0)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {activeSection === 'dashboard' && (
            <DashboardView
              t={t}
              metrics={metrics}
              protectionEnabled={settings.protectionEnabled}
              inHighRiskZone={inHighRiskZone}
              history={history}
              onStartLiveDemo={handleStartLiveDemo}
              onSimulateIncomingThreat={handleSimulateIncomingThreatFromDashboard}
              onSimulateHighRiskZone={handleSimulateEnterHighRiskZone}
              onNavigate={setActiveSection}
              onInspectThreat={handleInspectThreatFromAnywhere}
            />
          )}

          {activeSection === 'live-protection' && (
            <LiveProtectionView
              t={t}
              settings={settings}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              onToggleProtection={() =>
                updateSettings({ protectionEnabled: !settings.protectionEnabled })
              }
              onToggleSimpleLanguage={() =>
                updateSettings({ simpleLanguageMode: !settings.simpleLanguageMode })
              }
              onToggleVoiceAlerts={() =>
                updateSettings({ voiceAlertsEnabled: !settings.voiceAlertsEnabled })
              }
              isScanning={isScanning}
              incomingPreview={incomingPreview}
              activeRecord={activeRecord}
              isSpeaking={isSpeaking}
              onSpeakActiveWarning={speakActiveLiveWarning}
              onStopSpeaking={handleStopSpeaking}
              onTriggerScenario={handleTriggerScenario}
              onSimulateNextMessage={handleSimulateNextMessage}
              onAnalyzeCustomMessage={(sender, message) =>
                void runLiveInterception({
                  sender,
                  channel: selectedChannel,
                  message,
                })
              }
              onPrepareReport={handlePrepareReportFromThreat}
              onMarkSafe={handleMarkSafe}
              androidAccessStatus={androidAccessStatus}
              onRequestAndroidAccess={handleRequestAndroidAccess}
              onOpenAppNotificationSettings={handleOpenAppNotificationSettings}
              onTriggerNativeTestAlert={handleTriggerNativeTestAlert}
            />
          )}

          {activeSection === 'qr-shield' && (
            <QrShieldView
              language={settings.language}
              simpleLanguageMode={settings.simpleLanguageMode}
              isSpeaking={isSpeaking}
              onSpeakText={handleSpeakText}
              onStopSpeaking={handleStopSpeaking}
              onPrepareReportFromQr={handlePrepareReportFromQr}
              onQrAnalyzed={handleQrAnalyzed}
            />
          )}

          {activeSection === 'risk-zones' && (
            <RiskZonesView
              t={t}
              locationProtectionEnabled={settings.locationProtectionEnabled}
              onToggleLocationProtection={(enabled) =>
                updateSettings({ locationProtectionEnabled: enabled })
              }
              activeSimulatedZoneId={activeSimulatedZoneId}
              onSimulateEnterHighRisk={() => setActiveSimulatedZoneId('zone-central-market')}
              onExitSimulatedZone={() => setActiveSimulatedZoneId(null)}
              isSpeaking={isSpeaking}
              onSpeakText={handleSpeakText}
              onStopSpeaking={handleStopSpeaking}
            />
          )}

          {activeSection === 'threat-history' && (
            <ThreatHistoryView
              history={history}
              initialSelectedId={historyFocusId}
              onClearInitialSelection={() => setHistoryFocusId(null)}
              onPrepareReport={handlePrepareReportFromThreat}
              onMarkSafe={handleMarkSafe}
              onResetHistory={() => {
                setHistory(createInitialDemoHistory());
                setHistoryFocusId(null);
              }}
            />
          )}

          {activeSection === 'report-protect' && (
            <ReportProtectView
              t={t}
              draft={activeReportDraft}
              savedReports={savedReports}
              threatHistory={history}
              onUpdateDraft={setActiveReportDraft}
              onSaveDraft={handleSaveReportDraft}
              onCreateFromThreat={handlePrepareReportFromThreat}
            />
          )}

          {activeSection === 'safety-center' && (
            <SafetyCenterView
              simpleLanguageMode={settings.simpleLanguageMode}
              isSpeaking={isSpeaking}
              onSpeakText={handleSpeakText}
              onStopSpeaking={handleStopSpeaking}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              onResetAllDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
