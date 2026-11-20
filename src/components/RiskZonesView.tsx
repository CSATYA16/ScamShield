import { useState } from 'react';
import {
  AlertTriangle,
  Compass,
  LocateFixed,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SIMULATED_RISK_ZONES } from '../data/riskZones';
import type { UiStrings } from '../data/translations';
import type { RiskZoneItem } from '../types/scamshield';

interface RiskZonesViewProps {
  t: UiStrings;
  locationProtectionEnabled: boolean;
  onToggleLocationProtection: (enabled: boolean) => void;
  activeSimulatedZoneId: string | null;
  onSimulateEnterHighRisk: () => void;
  onExitSimulatedZone: () => void;
  isSpeaking: boolean;
  onSpeakText: (text: string) => void;
  onStopSpeaking: () => void;
}

export function RiskZonesView({
  t,
  locationProtectionEnabled,
  onToggleLocationProtection,
  activeSimulatedZoneId,
  onSimulateEnterHighRisk,
  onExitSimulatedZone,
  isSpeaking,
  onSpeakText,
  onStopSpeaking,
}: RiskZonesViewProps) {
  const [selectedZone, setSelectedZone] = useState<RiskZoneItem>(SIMULATED_RISK_ZONES[0]);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const activeZone = activeSimulatedZoneId
    ? SIMULATED_RISK_ZONES.find((z) => z.id === activeSimulatedZoneId) ?? null
    : null;

  const requestApproximateLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Round to ~1km approximate precision for privacy
        setCoords({
          lat: Math.round(pos.coords.latitude * 100) / 100,
          lng: Math.round(pos.coords.longitude * 100) / 100,
        });
        setGeoStatus('granted');
        onToggleLocationProtection(true);
      },
      () => {
        setGeoStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 7000 }
    );
  };

  const handleLocationToggle = () => {
    if (locationProtectionEnabled) {
      onToggleLocationProtection(false);
    } else {
      onToggleLocationProtection(true);
    }
  };

  const userDotPosition = activeZone ? { x: activeZone.x, y: activeZone.y } : { x: 48, y: 50 };

  const riskColor = (level: RiskZoneItem['riskLevel']) => {
    if (level === 'HIGH') return { fill: '#EF4444', text: 'text-[#F87171]' };
    if (level === 'MODERATE') return { fill: '#F59E0B', text: 'text-[#FBBF24]' };
    return { fill: '#22C55E', text: 'text-[#4ADE80]' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FBBF24]">
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>{t.riskZones.demoLabel} — Prototype Demonstration Map</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{t.riskZones.title}</h1>
            <p className="text-sm text-[#94A3B8] max-w-2xl">{t.riskZones.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={locationProtectionEnabled}
              onClick={handleLocationToggle}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors whitespace-nowrap ${
                locationProtectionEnabled
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/45 text-[#86EFAC]'
                  : 'bg-[#171E29] border-[#2D3748] text-[#CBD5E1]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Location Protection: {locationProtectionEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {activeZone ? (
              <button
                key="exit-zone-btn"
                type="button"
                onClick={onExitSimulatedZone}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#171E29] hover:bg-[#222B3B] border border-[#334155] text-white font-semibold text-sm whitespace-nowrap"
              >
                <span>{t.riskZones.leaveZone}</span>
              </button>
            ) : (
              <button
                key="enter-zone-btn"
                type="button"
                onClick={() => {
                  onSimulateEnterHighRisk();
                  setSelectedZone(SIMULATED_RISK_ZONES[0]);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-display font-bold text-sm whitespace-nowrap"
              >
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                <span>{t.riskZones.simulateEnter}</span>
              </button>
            )}
          </div>
        </div>

        {/* Explicit Opt-in Location Permission Row */}
        <div className="pt-4 border-t border-[#1F2633] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[#94A3B8]">
            {geoStatus === 'granted' && coords ? (
              <span className="text-[#86EFAC] font-mono tabular-nums">
                Approximate location granted (~1 km radius): {coords.lat.toFixed(2)}°, {coords.lng.toFixed(2)}°
              </span>
            ) : geoStatus === 'denied' ? (
              <span className="text-[#FBBF24]">
                Location permission unavailable or declined. Using simulated demonstration coordinates.
              </span>
            ) : (
              <span>
                ScamShield only asks for browser location permission when you click “Share Approximate Location”.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={requestApproximateLocation}
            disabled={geoStatus === 'requesting'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C0F14] hover:bg-[#171E29] border border-[#263042] text-white font-semibold transition-colors whitespace-nowrap"
          >
            <LocateFixed className="w-3.5 h-3.5 text-[#22C55E]" aria-hidden="true" />
            <span>
              {geoStatus === 'requesting'
                ? 'Requesting...'
                : geoStatus === 'granted'
                ? 'Refresh Approximate Location'
                : 'Share Approximate Location'}
            </span>
          </button>
        </div>
      </section>

      {/* Active High-Risk Zone Alert Banner */}
      {activeZone && (
        <section
          role="alert"
          aria-live="assertive"
          className="rounded-xl bg-[#EF4444]/12 border border-[#EF4444]/45 p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#F87171]">
                <ShieldAlert className="w-5 h-5" aria-hidden="true" />
                <span className="font-display font-extrabold text-sm tracking-wider">
                  {t.riskZones.alertHeading}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {activeZone.name} · {activeZone.scamType} ({t.riskZones.demoLabel})
              </h2>
              <p className="text-sm text-[#E2E8F0] max-w-3xl leading-relaxed">
                {t.riskZones.alertBody}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                isSpeaking
                  ? onStopSpeaking()
                  : onSpeakText(`${t.riskZones.alertHeading}. ${t.riskZones.alertBody}`)
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B0E13] hover:bg-[#171E29] border border-[#EF4444]/40 text-xs font-semibold text-white whitespace-nowrap shrink-0"
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4 text-[#F87171]" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
              )}
              <span>{isSpeaking ? 'Stop Alert Audio' : 'Read Zone Alert Out Loud'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {activeZone.safetyTips.map((tip, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-[#0B0E13] border border-[#EF4444]/25 text-xs text-[#E2E8F0] leading-relaxed"
              >
                <span className="font-mono font-bold text-[#F87171] mr-1.5">0{i + 1}.</span>
                {tip}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Stylized City Safety Map + Zone Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 rounded-xl bg-[#11151C] border border-[#222936] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-white">
              Interactive Safety Map · <span className="text-[#FBBF24]">SIMULATED DEMO DATA</span>
            </span>
            <div className="flex items-center gap-4 text-[#94A3B8]">
              <span className="text-[#F87171] font-semibold">High Risk</span>
              <span className="text-[#FBBF24] font-semibold">Moderate</span>
              <span className="text-[#4ADE80] font-semibold">Low</span>
            </div>
          </div>

          {/* Stylized Vector Grid Map */}
          <div className="relative rounded-lg bg-[#090C11] border border-[#1E2532] aspect-[16/10] overflow-hidden">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full"
              aria-label="Simulated city scam risk zones map"
            >
              {/* Subtle Street / Sector Grid */}
              <g stroke="#18202D" strokeWidth="0.35">
                {[15, 30, 45, 60, 75, 90].map((v) => (
                  <line key={`v-${v}`} x1={v} y1={0} x2={v} y2={100} />
                ))}
                {[20, 40, 60, 80].map((h) => (
                  <line key={`h-${h}`} x1={0} y1={h} x2={100} y2={h} />
                ))}
              </g>
              {/* Stylized Arterial Roads */}
              <path
                d="M 0 52 Q 35 44, 60 54 T 100 46"
                fill="none"
                stroke="#232D3F"
                strokeWidth="1.2"
              />
              <path
                d="M 48 0 Q 44 45, 55 100"
                fill="none"
                stroke="#232D3F"
                strokeWidth="1.0"
              />

              {/* Risk Zone Shaded Circles */}
              {SIMULATED_RISK_ZONES.map((zone) => {
                const col = riskColor(zone.riskLevel);
                const isSelected = selectedZone.id === zone.id;
                return (
                  <g key={zone.id}>
                    <circle
                      cx={zone.x}
                      cy={zone.y}
                      r={zone.radius}
                      fill={col.fill}
                      fillOpacity={isSelected ? 0.24 : 0.14}
                      stroke={col.fill}
                      strokeOpacity={isSelected ? 0.9 : 0.5}
                      strokeWidth={isSelected ? 0.7 : 0.4}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive Zone Pin Buttons */}
            {SIMULATED_RISK_ZONES.map((zone) => {
              const col = riskColor(zone.riskLevel);
              const isSelected = selectedZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  aria-label={`${zone.name} (${zone.riskLevel} risk simulated demo zone)`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-transform hover:scale-105 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#090B0F] border-white text-white z-20 shadow-lg'
                      : 'bg-[#0C1017]/90 border-[#2C3648] text-[#E2E8F0] z-10'
                  }`}
                >
                  <span className={`inline-flex items-center gap-1 ${col.text}`}>
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    <span>{zone.name.split(' ')[0]}</span>
                  </span>
                </button>
              );
            })}

            {/* User Location Indicator */}
            <div
              style={{ left: `${userDotPosition.x}%`, top: `${userDotPosition.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-500"
            >
              <span className="block w-8 h-8 rounded-full border border-[#22C55E]/60 animate-radar-ring absolute -inset-2" />
              <span className="relative flex items-center justify-center w-4 h-4 rounded-full bg-[#22C55E] border-2 border-[#090B0F] shadow-[0_0_12px_#22C55E]" />
            </div>

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-[#94A3B8] pointer-events-none">
              <span className="bg-[#090B0F]/90 px-2 py-1 rounded border border-[#1E2532]">
                Green marker: Your {activeZone ? 'simulated high-risk position' : 'approximate safe zone'}
              </span>
              <span className="bg-[#090B0F]/90 px-2 py-1 rounded border border-[#1E2532] font-mono text-[#FBBF24]">
                SIMULATED DEMO DATA
              </span>
            </div>
          </div>

          <p className="text-xs text-[#64748B] leading-relaxed">
            Transparency notice: All hotspots shown above are clearly marked simulated demonstration data created for testing location-aware warnings. ScamShield does not invent or claim real-world police crime statistics.
          </p>
        </section>

        {/* Right Column: Selected Zone Inspector + Zone List */}
        <aside className="lg:col-span-5 space-y-5">
          <section className="rounded-xl bg-[#11151C] border border-[#222936] p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={`font-bold tracking-wide ${riskColor(selectedZone.riskLevel).text}`}>
                  {selectedZone.riskLevel} RISK ZONE
                </span>
                <span className="font-mono text-[#64748B] tabular-nums">
                  {selectedZone.recentDemoReportsCount} demo reports
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{selectedZone.name}</h2>
              <p className="text-xs text-[#94A3B8]">{selectedZone.areaLabel}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0B0E13] border border-[#1E2532] space-y-1.5">
              <p className="text-xs font-semibold text-[#FBBF24]">Primary Demo Pattern: {selectedZone.scamType}</p>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">{selectedZone.summary}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                Practical Safety Tips Here
              </h3>
              <ul className="space-y-2">
                {selectedZone.safetyTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-[#E2E8F0] leading-relaxed">
                    {idx + 1}. {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-xl bg-[#11151C] border border-[#222936] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">All Simulated Demo Zones</h3>
            <div className="space-y-2">
              {SIMULATED_RISK_ZONES.map((z) => {
                const col = riskColor(z.riskLevel);
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedZone(z)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedZone.id === z.id
                        ? 'bg-[#171E29] border-[#22C55E]/45'
                        : 'bg-[#0C0F14] border-[#1F2633] hover:border-[#334155]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">{z.name}</span>
                      <span className={`text-[11px] font-bold ${col.text}`}>{z.riskLevel}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{z.scamType}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
