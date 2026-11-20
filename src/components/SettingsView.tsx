import {
  Bell,
  Globe,
  Info,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import type { AppSettings, LanguageCode } from '../types/scamshield';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onResetAllDemoData: () => void;
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="space-y-0.5 pr-2">
        <label htmlFor={id} className="block text-sm font-semibold text-white cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
          checked
            ? 'bg-[#22C55E] border-[#22C55E]'
            : 'bg-[#1A212E] border-[#334155]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-[#090B0F] transition-transform ${
            checked ? 'translate-x-5.5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsView({
  settings,
  onUpdateSettings,
  onResetAllDemoData,
}: SettingsViewProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-1.5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings & Accessibility</h1>
        <p className="text-sm text-[#94A3B8]">
          Customize real-time protection, everyday Simple Language Mode, multilingual alerts, and privacy controls.
        </p>
      </section>

      {/* Core Protection & Location */}
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 divide-y divide-[#1F2633]">
        <div className="pb-3 flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
          <span>Protection Engine</span>
        </div>

        <ToggleRow
          id="set-protection"
          label="Live Protection Guard"
          description="Automatically inspect incoming simulated messages and isolate high-risk or critical scams."
          checked={settings.protectionEnabled}
          onToggle={() => onUpdateSettings({ protectionEnabled: !settings.protectionEnabled })}
        />

        <ToggleRow
          id="set-location"
          label="Location Risk Zone Protection"
          description="Display warnings when entering simulated high-risk scam zones or areas with elevated QR fraud reports."
          checked={settings.locationProtectionEnabled}
          onToggle={() =>
            onUpdateSettings({ locationProtectionEnabled: !settings.locationProtectionEnabled })
          }
        />
      </section>

      {/* Accessibility & Language */}
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 divide-y divide-[#1F2633]">
        <div className="pb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Globe className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
          <span>Accessibility & Language</span>
        </div>

        <ToggleRow
          id="set-simple-lang"
          label="Simple Language Mode"
          description="Uses larger text, everyday words instead of cybersecurity jargon, and short one-step instructions."
          checked={settings.simpleLanguageMode}
          onToggle={() => onUpdateSettings({ simpleLanguageMode: !settings.simpleLanguageMode })}
        />

        <ToggleRow
          id="set-voice"
          label="Voice Alerts"
          description="Enable spoken warning playback using your browser’s built-in text-to-speech engine."
          checked={settings.voiceAlertsEnabled}
          onToggle={() => onUpdateSettings({ voiceAlertsEnabled: !settings.voiceAlertsEnabled })}
        />

        <ToggleRow
          id="set-auto-speak"
          label="Auto-Speak Critical Threats"
          description="Automatically read scam warnings out loud when a CRITICAL or HIGH risk threat arrives."
          checked={settings.autoSpeakCritical}
          onToggle={() => onUpdateSettings({ autoSpeakCritical: !settings.autoSpeakCritical })}
        />

        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="block text-sm font-semibold text-white">Interface & Warning Language</span>
            <p className="text-xs text-[#94A3B8]">
              Translates navigation, warnings, and voice alerts across English, Hindi, and Telugu.
            </p>
          </div>
          <div className="inline-flex items-center p-1 rounded-lg bg-[#0B0E13] border border-[#263042] self-start">
            {(
              [
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'te', label: 'తెలుగు (Telugu)' },
              ] as Array<{ code: LanguageCode; label: string }>
            ).map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => onUpdateSettings({ language: opt.code })}
                aria-pressed={settings.language === opt.code}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  settings.language === opt.code
                    ? 'bg-[#22C55E] text-[#05120A]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 divide-y divide-[#1F2633]">
        <div className="pb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Bell className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
          <span>Notification Preferences</span>
        </div>

        <ToggleRow
          id="set-notifs"
          label="In-App Threat Notifications"
          description="Track unread high-risk alerts in the top notification menu."
          checked={settings.notificationsEnabled}
          onToggle={() =>
            onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })
          }
        />

        <ToggleRow
          id="set-high-banner"
          label="Prominent High-Risk Zone Banner"
          description="Keep the high-risk area warning visible in the top status bar whenever inside a simulated hotspot."
          checked={settings.highRiskSoundBanner}
          onToggle={() =>
            onUpdateSettings({ highRiskSoundBanner: !settings.highRiskSoundBanner })
          }
        />
      </section>

      {/* Privacy & Prototype Disclosure */}
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Info className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
          <span>Privacy & Prototype Simulation Disclosure</span>
        </div>
        <div className="space-y-2.5 text-xs text-[#CBD5E1] leading-relaxed">
          <p>
            <strong className="text-white">Simulated Monitoring:</strong> ScamShield is an interactive web prototype designed to demonstrate automatic real-time scam detection. Because browsers cannot access private SMS, WhatsApp, or email apps directly, incoming message interception and threat blocking/isolation are simulated inside this workspace.
          </p>
          <p>
            <strong className="text-white">Local Storage & AI Analysis:</strong> Your threat history, report drafts, and settings are stored locally in your browser. When Gemini AI is configured on the server, message text and QR payloads are analyzed to return structured risk explanations; otherwise, ScamShield runs its transparent built-in rule-based engine.
          </p>
          <p>
            <strong className="text-white">Location & Official Reporting:</strong> Location permission is requested only if you click “Share Approximate Location” in Risk Zones, and all risk-zone hotspots are clearly labelled simulated demo data. Cybercrime reports are drafted for your review and are never submitted automatically to police—you stay in complete control before visiting <span className="font-mono text-white">cybercrime.gov.in</span> or calling <span className="font-mono text-white">1930</span>.
          </p>
        </div>

        <div className="pt-3 border-t border-[#1F2633] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
            <span className="inline-flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#22C55E]" aria-hidden="true" />
              <span>Web Speech TTS</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FBBF24]" aria-hidden="true" />
              <span>Simulated Risk Zones</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onResetAllDemoData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#171E29] hover:bg-[#222B3B] border border-[#2D3748] text-xs font-semibold text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
            <span>Reset Prototype State & History</span>
          </button>
        </div>
      </section>
    </div>
  );
}
