import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Menu,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  User,
} from 'lucide-react';
import type { LanguageCode, NavSection, ThreatRecord } from '../types/scamshield';
import type { UiStrings } from '../data/translations';
import { formatShortTime, RiskLabel } from './RiskText';

interface TopBarProps {
  t: UiStrings;
  protectionEnabled: boolean;
  inHighRiskZone: boolean;
  language: LanguageCode;
  simpleLanguageMode: boolean;
  onChangeLanguage: (lang: LanguageCode) => void;
  onNavigate: (section: NavSection) => void;
  onSelectHistoryItem: (record: ThreatRecord) => void;
  recentAlerts: ThreatRecord[];
  unreadAlertsCount: number;
  onMarkAlertsRead: () => void;
  onOpenMobileMenu: () => void;
}

export function TopBar({
  t,
  protectionEnabled,
  inHighRiskZone,
  language,
  simpleLanguageMode,
  onChangeLanguage,
  onNavigate,
  onSelectHistoryItem,
  recentAlerts,
  unreadAlertsCount,
  onMarkAlertsRead,
  onOpenMobileMenu,
}: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090B0F]/95 backdrop-blur-md border-b border-[#1F2633] px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4 no-print">
      {/* Left: Mobile menu + Brand (mobile) + Global Protection Status */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-lg text-[#CBD5E1] hover:text-white hover:bg-[#161C26] transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="lg:hidden flex items-center gap-1.5 text-white font-display font-bold text-sm sm:text-base whitespace-nowrap shrink-0"
        >
          <ShieldCheck className="w-4.5 h-4.5 text-[#22C55E] shrink-0" aria-hidden="true" />
          <span>ScamShield</span>
        </button>

        <button
          key={inHighRiskZone ? 'zone-alert' : protectionEnabled ? 'active' : 'paused'}
          type="button"
          onClick={() => onNavigate(inHighRiskZone ? 'risk-zones' : 'live-protection')}
          className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide whitespace-nowrap shrink-0 ${
            inHighRiskZone
              ? 'bg-red-500/15 border-red-500/50 text-red-300 hover:bg-red-500/25'
              : protectionEnabled
              ? 'bg-[#22C55E]/10 border-[#22C55E]/35 text-[#86EFAC] hover:bg-[#22C55E]/15'
              : 'bg-[#F59E0B]/10 border-[#F59E0B]/35 text-[#FCD34D] hover:bg-[#F59E0B]/15'
          }`}
        >
          {inHighRiskZone ? (
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" aria-hidden="true" />
          ) : protectionEnabled ? (
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E] shrink-0" aria-hidden="true" />
          ) : (
            <ShieldOff className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" aria-hidden="true" />
          )}
          <span>
            {inHighRiskZone
              ? t.status.highRiskArea
              : protectionEnabled
              ? t.status.protectionActive
              : t.status.protectionPaused}
          </span>
        </button>
      </div>

      {/* Right: Language Switcher + Notification Indicator + User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Compact mobile language selector (prevents 390px header crowding) */}
        <select
          aria-label="Select language"
          value={language}
          onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
          className="sm:hidden px-2 py-1.5 rounded-lg bg-[#11151C] border border-[#222936] text-xs font-semibold text-white focus:border-[#22C55E] focus:outline-none"
        >
          <option value="en">EN</option>
          <option value="hi">हिं</option>
          <option value="te">తె</option>
        </select>

        <div
          role="group"
          aria-label="Language selector"
          className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#11151C] border border-[#222936]"
        >
          {(
            [
              { code: 'en', label: 'EN', full: 'English' },
              { code: 'hi', label: 'हिं', full: 'Hindi' },
              { code: 'te', label: 'తె', full: 'Telugu' },
            ] as const
          ).map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onChangeLanguage(item.code)}
              aria-label={`Switch language to ${item.full}`}
              aria-pressed={language === item.code}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                language === item.code
                  ? 'bg-[#22C55E] text-[#05120A]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              const next = !notifOpen;
              setNotifOpen(next);
              setProfileOpen(false);
              if (next) onMarkAlertsRead();
            }}
            aria-label={`Notifications (${unreadAlertsCount} unread)`}
            aria-expanded={notifOpen}
            className="relative p-2 rounded-lg bg-[#11151C] border border-[#222936] text-[#CBD5E1] hover:text-white hover:border-[#334155] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-md bg-[#EF4444] text-white font-mono text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#11151C] border border-[#263042] shadow-2xl overflow-hidden z-40">
              <div className="px-4 py-3 border-b border-[#1F2633] flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Recent Threat Alerts</span>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    onNavigate('threat-history');
                  }}
                  className="text-xs font-medium text-[#22C55E] hover:underline"
                >
                  Open history
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#1D2430]">
                {recentAlerts.length === 0 ? (
                  <p className="p-4 text-xs text-[#94A3B8]">
                    No suspicious alerts recorded yet. Run a Live Protection simulation to inspect alerts here.
                  </p>
                ) : (
                  recentAlerts.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        onSelectHistoryItem(item);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#161C26] transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <RiskLabel level={item.analysis.riskLevel} />
                        <span className="font-mono text-[11px] text-[#64748B] tabular-nums">
                          {formatShortTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white truncate">
                        {item.analysis.scamCategory}
                      </p>
                      <p className="text-xs text-[#94A3B8] line-clamp-1">{item.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            aria-label="User profile and safety preferences"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-[#11151C] border border-[#222936] hover:border-[#334155] transition-colors"
          >
            <span className="w-6 h-6 rounded-md bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span className="hidden md:inline text-xs font-medium text-[#E2E8F0] whitespace-nowrap">
              Protected Citizen
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#11151C] border border-[#263042] shadow-2xl p-4 space-y-3 z-40">
              <div>
                <p className="text-sm font-semibold text-white">Protected Citizen</p>
                <p className="text-xs text-[#94A3B8]">Personal Safety Profile</p>
              </div>
              <div className="pt-2 border-t border-[#1F2633] space-y-1.5 text-xs text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Simple Language</span>
                  <span className="font-mono text-white">
                    {simpleLanguageMode ? 'ON' : 'STANDARD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Helpline (India)</span>
                  <span className="font-mono text-[#22C55E]">1930</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate('settings');
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#181F2B] hover:bg-[#1F2937] text-xs font-medium text-white transition-colors"
              >
                Open Protection Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate('report-protect');
                }}
                className="w-full py-2 px-3 rounded-lg border border-[#EF4444]/40 text-[#FCA5A5] hover:bg-[#EF4444]/10 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Emergency Report & 1930</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
