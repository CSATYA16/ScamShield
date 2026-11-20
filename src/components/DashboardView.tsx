import {
  AlertTriangle,
  ArrowRight,
  FileWarning,
  MapPin,
  Play,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { DashboardMetrics, NavSection, ThreatRecord } from '../types/scamshield';
import type { UiStrings } from '../data/translations';
import { formatShortTime, RiskLabel } from './RiskText';

interface DashboardViewProps {
  t: UiStrings;
  metrics: DashboardMetrics;
  protectionEnabled: boolean;
  inHighRiskZone: boolean;
  history: ThreatRecord[];
  onStartLiveDemo: () => void;
  onSimulateIncomingThreat: () => void;
  onSimulateHighRiskZone: () => void;
  onNavigate: (section: NavSection) => void;
  onInspectThreat: (record: ThreatRecord) => void;
}

const DEFENSE_STAGES = [
  { step: '01', label: 'Detect', detail: 'Monitors incoming channel signals & intent' },
  { step: '02', label: 'Alert', detail: 'Immediate high-visibility + voice warning' },
  { step: '03', label: 'Isolate', detail: 'Simulated quarantine of harmful links & lures' },
  { step: '04', label: 'Explain', detail: 'Everyday language & one-step red flags' },
  { step: '05', label: 'Protect', detail: 'Clear STOP / Don’t Click / 1930 guidance' },
  { step: '06', label: 'Report', detail: 'Auto-drafted cybercrime.gov.in report' },
];

export function DashboardView({
  t,
  metrics,
  protectionEnabled,
  inHighRiskZone,
  history,
  onStartLiveDemo,
  onSimulateIncomingThreat,
  onSimulateHighRiskZone,
  onNavigate,
  onInspectThreat,
}: DashboardViewProps) {
  return (
    <div className="space-y-8">
      {/* Primary Command Banner */}
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-wide">
              <span
                className={`inline-flex items-center gap-1.5 ${
                  protectionEnabled ? 'text-[#22C55E]' : 'text-[#F59E0B]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>
                  {protectionEnabled ? t.status.protectionActive : t.status.protectionPaused}
                </span>
              </span>
              <span className="text-[#475569]" aria-hidden="true">·</span>
              <span className="text-[#94A3B8]">Real-Time Automatic Simulation Engine</span>
              {inHighRiskZone && (
                <>
                  <span className="text-[#475569]" aria-hidden="true">·</span>
                  <span className="text-[#F87171] inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>High-Risk Demo Zone Active</span>
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t.dashboard.title}
            </h1>
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              {t.dashboard.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onStartLiveDemo}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#05120A] font-display font-bold text-sm transition-colors shadow-[0_0_24px_rgba(34,197,94,0.25)] whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>{t.dashboard.startDemo}</span>
            </button>
            <button
              type="button"
              onClick={onSimulateIncomingThreat}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#171D28] hover:bg-[#1F2736] border border-[#2D3748] text-white font-semibold text-sm transition-colors whitespace-nowrap"
            >
              <Zap className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
              <span>{t.dashboard.simulateThreat}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real Computed KPI Strip */}
      <section aria-label="Protection metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="rounded-xl bg-[#11151C] border border-[#222936] p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-medium text-[#94A3B8]">{t.dashboard.protectionScore}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold text-[#22C55E] tabular-nums">
              {metrics.protectionScore}
            </span>
            <span className="font-mono text-sm text-[#64748B]">/100</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#1E2532] overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-300"
              style={{ width: `${metrics.protectionScore}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl bg-[#11151C] border border-[#222936] p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-[#94A3B8]">{t.dashboard.threatsDetectedToday}</span>
          <span className="font-mono text-3xl font-bold text-[#F87171] tabular-nums">
            {metrics.threatsDetectedToday}
          </span>
          <span className="text-xs text-[#64748B]">Derived from today’s analyzed events</span>
        </div>

        <div className="rounded-xl bg-[#11151C] border border-[#222936] p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-[#94A3B8]">{t.dashboard.threatsBlocked}</span>
          <span className="font-mono text-3xl font-bold text-white tabular-nums">
            {metrics.threatsBlocked}
          </span>
          <span className="text-xs text-[#64748B]">Simulated quarantine count</span>
        </div>

        <div className="rounded-xl bg-[#11151C] border border-[#222936] p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-[#94A3B8]">{t.dashboard.messagesAnalyzed}</span>
          <span className="font-mono text-3xl font-bold text-white tabular-nums">
            {metrics.messagesAnalyzed}
          </span>
          <span className="text-xs text-[#64748B]">Total inspected in session history</span>
        </div>

        <div className="rounded-xl bg-[#11151C] border border-[#222936] p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-[#94A3B8]">{t.dashboard.reportsPrepared}</span>
          <span className="font-mono text-3xl font-bold text-[#FBBF24] tabular-nums">
            {metrics.reportsPrepared}
          </span>
          <span className="text-xs text-[#64748B]">Ready for cybercrime.gov.in</span>
        </div>
      </section>

      {/* Main 2-Column Split: Recent Activity + Protection Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Activity Feed */}
        <section className="lg:col-span-7 rounded-xl bg-[#11151C] border border-[#222936] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F2633] flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">{t.dashboard.recentActivity}</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Click any analyzed event to inspect red flags or prepare a report
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('threat-history')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:text-[#4ADE80] whitespace-nowrap"
            >
              <span>{t.dashboard.viewAllHistory}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-[#94A3B8]">
                No messages have been analyzed yet. Start the live protection demo to watch automatic scam detection in action.
              </p>
              <button
                type="button"
                onClick={onStartLiveDemo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#22C55E] text-[#05120A] text-xs font-bold"
              >
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>{t.dashboard.startDemo}</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#1D2430]">
              {history.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onInspectThreat(item)}
                  className="w-full text-left px-6 py-4 hover:bg-[#151B25] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                      <RiskLabel level={item.analysis.riskLevel} />
                      <span className="text-[#475569]" aria-hidden="true">·</span>
                      <span className="font-medium text-[#CBD5E1]">{item.analysis.scamCategory}</span>
                      <span className="text-[#475569]" aria-hidden="true">·</span>
                      <span className="text-[#94A3B8]">{item.channel}</span>
                      <span className="text-[#475569]" aria-hidden="true">·</span>
                      <span className="font-mono text-[#64748B] tabular-nums">
                        {formatShortTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-[#E2E8F0] truncate">{item.message}</p>
                    <p className="text-xs text-[#64748B]">
                      {item.protectionAction}
                      {item.reportStatus !== 'Not Reported' ? ` · ${item.reportStatus}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-semibold text-[#CBD5E1] tabular-nums">
                      {item.analysis.riskScore}/100
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#64748B]" aria-hidden="true" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Active Protection Pipeline + Quick Defense Modules */}
        <section className="lg:col-span-5 space-y-6">
          <div className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">{t.dashboard.overviewTitle}</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Every simulated message passes through ScamShield’s six-stage safety workflow
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DEFENSE_STAGES.map((stage) => (
                <div
                  key={stage.step}
                  className="p-3 rounded-lg bg-[#0C0F14] border border-[#1E2532] space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#22C55E] tabular-nums">
                      {stage.step}.
                    </span>
                    <span className="text-xs font-semibold text-white">{stage.label}</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-snug">{stage.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-3">
            <h2 className="text-base font-semibold text-white">Rapid Demo Tools</h2>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={onSimulateHighRiskZone}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#161B24] hover:bg-[#1D2430] border border-[#263042] text-left transition-colors"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">
                      Simulate Entering High-Risk Zone
                    </span>
                    <span className="block text-xs text-[#94A3B8]">
                      Trigger location-aware demo alert on Risk Zones map
                    </span>
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#64748B] shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('qr-shield')}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#161B24] hover:bg-[#1D2430] border border-[#263042] text-left transition-colors"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <QrCode className="w-4 h-4 text-[#22C55E] shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">
                      Inspect Suspicious QR Code
                    </span>
                    <span className="block text-xs text-[#94A3B8]">
                      Scan camera, upload QR image, or test fake UPI refund QR
                    </span>
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#64748B] shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('report-protect')}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[#161B24] hover:bg-[#1D2430] border border-[#263042] text-left transition-colors"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <FileWarning className="w-4 h-4 text-[#F87171] shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">
                      Prepare Cybercrime Report (1930)
                    </span>
                    <span className="block text-xs text-[#94A3B8]">
                      Auto-draft evidence for cybercrime.gov.in
                    </span>
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#64748B] shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-[#11151C] border border-[#222936] p-5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white">Lost money to a digital scam?</p>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Call India’s National Cyber Fraud Helpline <span className="font-mono font-semibold text-white">1930</span> immediately and file at{' '}
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#22C55E] hover:underline"
                >
                  cybercrime.gov.in
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
