import {
  Activity,
  BookOpen,
  FileWarning,
  History,
  LayoutDashboard,
  MapPin,
  QrCode,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { NavSection } from '../types/scamshield';
import type { UiStrings } from '../data/translations';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  t: UiStrings;
  protectionEnabled: boolean;
  inHighRiskZone: boolean;
  threatCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeSection,
  onSelectSection,
  t,
  protectionEnabled,
  inHighRiskZone,
  threatCount,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems: Array<{
    id: NavSection;
    label: string;
    icon: typeof LayoutDashboard;
    hint?: string;
  }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'live-protection', label: t.nav.liveProtection, icon: Activity },
    { id: 'qr-shield', label: t.nav.qrShield, icon: QrCode },
    {
      id: 'risk-zones',
      label: t.nav.riskZones,
      icon: MapPin,
      hint: inHighRiskZone ? 'Alert' : undefined,
    },
    {
      id: 'threat-history',
      label: t.nav.threatHistory,
      icon: History,
      hint: threatCount > 0 ? String(threatCount) : undefined,
    },
    { id: 'report-protect', label: t.nav.reportProtect, icon: FileWarning },
    { id: 'safety-center', label: t.nav.safetyCenter, icon: BookOpen },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const handleSelect = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0D1016] border-r border-[#1F2633]">
      <div className="flex items-center justify-between px-5 h-16 border-b border-[#1F2633]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-[#22C55E]" aria-hidden="true" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white whitespace-nowrap">
            ScamShield
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161C26] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#171E29] text-white border border-[#2A3446]'
                  : 'text-[#94A3B8] hover:text-[#F3F5F8] hover:bg-[#131822] border border-transparent'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#22C55E]' : 'text-[#64748B]'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </span>
              {item.hint && (
                <span
                  className={`font-mono text-xs tabular-nums ${
                    item.id === 'risk-zones' && inHighRiskZone
                      ? 'text-[#F87171] font-semibold'
                      : 'text-[#64748B]'
                  }`}
                >
                  {item.hint}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1F2633]">
        <div className="px-3 py-2.5 rounded-lg bg-[#11151C] border border-[#1F2633] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8]">Protection Guard</span>
            <span
              className={`font-mono font-semibold ${
                protectionEnabled ? 'text-[#22C55E]' : 'text-[#F59E0B]'
              }`}
            >
              {protectionEnabled ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Interactive safety prototype with simulated interception.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 no-print">{navContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full">{navContent}</div>
        </div>
      )}
    </>
  );
}
