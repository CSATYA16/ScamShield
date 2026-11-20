import { useState } from 'react';
import {
  AlertOctagon,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  PhoneCall,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { formatReportAsText } from '../logic/reportBuilder';
import type { UiStrings } from '../data/translations';
import type { CybercrimeReportDraft, ThreatRecord } from '../types/scamshield';
import { formatFullDateTime } from './RiskText';

interface ReportProtectViewProps {
  t: UiStrings;
  draft: CybercrimeReportDraft | null;
  savedReports: CybercrimeReportDraft[];
  threatHistory: ThreatRecord[];
  onUpdateDraft: (updated: CybercrimeReportDraft) => void;
  onSaveDraft: (draft: CybercrimeReportDraft) => void;
  onCreateFromThreat: (record: ThreatRecord) => void;
}

export function ReportProtectView({
  t,
  draft,
  savedReports,
  threatHistory,
  onUpdateDraft,
  onSaveDraft,
  onCreateFromThreat,
}: ReportProtectViewProps) {
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [portalNotice, setPortalNotice] = useState('');

  const suspiciousHistory = threatHistory.filter(
    (r) => !r.userMarkedSafe && r.analysis.riskLevel !== 'SAFE'
  );

  const handleCopy = async () => {
    if (!draft) return;
    const text = formatReportAsText(draft);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!draft) return;
    const text = formatReportAsText(draft);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scamshield-report-${draft.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!draft) return;
    onSaveDraft({
      ...draft,
      updatedAt: new Date().toISOString(),
      status: 'REPORT PREPARED — USER ACTION REQUIRED',
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handlePortalClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!draft?.userConfirmedReview) {
      e.preventDefault();
      setPortalNotice(
        'Please review your report details and check the confirmation box below before opening the official cybercrime portal.'
      );
      return;
    }
    setPortalNotice('');
    handleSave();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">{t.report.title}</h1>
          <span className="font-mono text-xs font-bold text-[#FBBF24]">
            {t.report.statusLabel}
          </span>
        </div>
        <p className="text-sm text-[#94A3B8] max-w-3xl">{t.report.subtitle}</p>
      </section>

      {/* Urgent Financial Loss Banner (Shown when user checks "Money already lost") */}
      {draft?.moneyAlreadyLost && (
        <section
          role="alert"
          className="rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/55 p-6 space-y-4"
        >
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-[#EF4444] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-white tracking-wide">
                {t.report.urgentTitle}: FINANCIAL FRAUD RESPONSE
              </h2>
              <p className="text-sm sm:text-base text-[#FEE2E2] font-medium leading-relaxed">
                {t.report.urgentBody}
              </p>
              <ul className="text-sm text-white space-y-1 pt-1">
                <li>1. Call <span className="font-mono font-bold">1930</span> immediately (National Cyber Fraud Helpline).</li>
                <li>2. Report online at <span className="font-mono font-bold">https://cybercrime.gov.in</span>.</li>
                <li>3. Contact your bank or UPI payment provider to freeze suspicious transfers.</li>
                <li>4. Save screenshots, UTR/transaction IDs, sender phone numbers, and chat logs.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-display font-bold text-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              <span>{t.report.call1930}</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0B0E13] hover:bg-[#171E29] border border-[#EF4444]/50 text-white font-display font-bold text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
              <span>Open cybercrime.gov.in</span>
            </a>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Editable Report Preview */}
        <section className="lg:col-span-8 rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-5 print-surface">
          {!draft ? (
            <div className="py-10 text-center space-y-4">
              <FileText className="w-10 h-10 text-[#64748B] mx-auto" aria-hidden="true" />
              <div className="space-y-1 max-w-md mx-auto">
                <h2 className="text-base font-semibold text-white">No Active Report Draft Selected</h2>
                <p className="text-sm text-[#94A3B8]">
                  Select any detected scam from the list on the right—or click “Prepare Cybercrime Report” directly from a Live Protection alert—to auto-fill your report draft.
                </p>
              </div>
              {suspiciousHistory[0] && (
                <button
                  type="button"
                  onClick={() => onCreateFromThreat(suspiciousHistory[0])}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#05120A] font-display font-bold text-sm"
                >
                  <span>Auto-Fill From Latest Threat</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1F2633]">
                <div>
                  <span className="block text-xs font-mono font-semibold text-[#FBBF24]">
                    STATUS: {draft.status}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    Editable Incident Report Preview
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#94A3B8] tabular-nums">
                  {formatFullDateTime(draft.createdAt)}
                </span>
              </div>

              {/* Financial Loss Switch */}
              <div className="p-4 rounded-lg bg-[#0B0E13] border border-[#263042] space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.moneyAlreadyLost}
                    onChange={(e) =>
                      onUpdateDraft({ ...draft, moneyAlreadyLost: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 accent-[#EF4444]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      Money has already been lost or transferred
                    </span>
                    <span className="block text-xs text-[#94A3B8]">
                      Check this if you already paid, shared an OTP, or saw money debited from your account.
                    </span>
                  </span>
                </label>

                {draft.moneyAlreadyLost && (
                  <div className="pl-7 max-w-xs space-y-1">
                    <label htmlFor="amount-lost" className="block text-xs font-medium text-[#CBD5E1]">
                      Approximate Amount Lost (₹ INR)
                    </label>
                    <input
                      id="amount-lost"
                      type="text"
                      value={draft.amountLostInr}
                      onChange={(e) =>
                        onUpdateDraft({ ...draft, amountLostInr: e.target.value })
                      }
                      placeholder="e.g. 50000"
                      className="w-full px-3 py-2 rounded-lg bg-[#11151C] border border-[#EF4444]/40 text-sm text-white font-mono focus:outline-none focus:border-[#EF4444]"
                    />
                  </div>
                )}
              </div>

              {/* Editable Incident Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="rep-channel" className="block text-xs font-medium text-[#CBD5E1]">
                    Channel
                  </label>
                  <select
                    id="rep-channel"
                    value={draft.channel}
                    onChange={(e) =>
                      onUpdateDraft({
                        ...draft,
                        channel: e.target.value as CybercrimeReportDraft['channel'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-sm text-white focus:border-[#22C55E] focus:outline-none"
                  >
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="QR">QR</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rep-sender" className="block text-xs font-medium text-[#CBD5E1]">
                    Sender Phone / Email / Handle
                  </label>
                  <input
                    id="rep-sender"
                    type="text"
                    value={draft.sender}
                    onChange={(e) => onUpdateDraft({ ...draft, sender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-sm text-white focus:border-[#22C55E] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="rep-category" className="block text-xs font-medium text-[#CBD5E1]">
                    Scam Category & Risk Assessment
                  </label>
                  <input
                    id="rep-category"
                    type="text"
                    value={draft.scamCategory}
                    onChange={(e) => onUpdateDraft({ ...draft, scamCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-sm text-white focus:border-[#22C55E] focus:outline-none"
                  />
                  <p className="text-xs text-[#94A3B8] font-mono tabular-nums">
                    Assessed Risk: {draft.riskLevel} ({draft.riskScore}/100)
                  </p>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="rep-message" className="block text-xs font-medium text-[#CBD5E1]">
                    Suspicious Message / Email / QR Content
                  </label>
                  <textarea
                    id="rep-message"
                    rows={3}
                    value={draft.messageContent}
                    onChange={(e) => onUpdateDraft({ ...draft, messageContent: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-sm text-white focus:border-[#22C55E] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="rep-explanation" className="block text-xs font-medium text-[#CBD5E1]">
                    AI Analysis Summary
                  </label>
                  <textarea
                    id="rep-explanation"
                    rows={2}
                    value={draft.aiExplanation}
                    onChange={(e) => onUpdateDraft({ ...draft, aiExplanation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-sm text-white focus:border-[#22C55E] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <span className="block text-xs font-medium text-[#CBD5E1]">
                    Detected Red Flags & Suspicious URLs
                  </span>
                  <div className="p-3 rounded-lg bg-[#0B0E13] border border-[#1E2532] text-xs text-[#CBD5E1] space-y-1.5">
                    {draft.redFlags.length > 0 ? (
                      draft.redFlags.map((rf, i) => <div key={i}>• {rf}</div>)
                    ) : (
                      <div className="text-[#64748B]">No red flags attached</div>
                    )}
                    {draft.suspiciousUrls.length > 0 && (
                      <div className="pt-1.5 border-t border-[#1E2532] font-mono text-[#FCA5A5] break-all">
                        URLs: {draft.suspiciousUrls.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="rep-notes" className="block text-xs font-medium text-[#CBD5E1]">
                    Additional User Notes (Transaction IDs, call duration, etc.)
                  </label>
                  <textarea
                    id="rep-notes"
                    rows={2}
                    value={draft.userNotes}
                    onChange={(e) => onUpdateDraft({ ...draft, userNotes: e.target.value })}
                    placeholder="Add any extra context, bank reference numbers, or caller details..."
                    className="w-full px-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-sm text-white placeholder:text-[#64748B] focus:border-[#22C55E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Explicit Human Confirmation Before Leaving App */}
              <div className="p-4 rounded-lg bg-[#0B0E13] border border-[#263042] space-y-2 no-print">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.userConfirmedReview}
                    onChange={(e) => {
                      setPortalNotice('');
                      onUpdateDraft({ ...draft, userConfirmedReview: e.target.checked });
                    }}
                    className="mt-1 w-4 h-4 accent-[#22C55E]"
                  />
                  <span className="text-xs text-[#CBD5E1] leading-relaxed">
                    I have reviewed this report draft. I understand ScamShield does <strong className="text-white">not</strong> submit police reports automatically, and I will submit this directly on the official National Cyber Crime Reporting Portal (<span className="font-mono text-white">cybercrime.gov.in</span>).
                  </span>
                </label>
                {portalNotice && <p className="text-xs text-[#FBBF24] pl-7">{portalNotice}</p>}
              </div>

              {/* Functional Export & Official Portal Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3 no-print">
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handlePortalClick}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#05120A] font-display font-bold text-xs sm:text-sm transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span>{t.report.openPortal}</span>
                </a>

                <a
                  href="tel:1930"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-display font-bold text-xs sm:text-sm transition-colors whitespace-nowrap"
                >
                  <PhoneCall className="w-4 h-4" aria-hidden="true" />
                  <span>{t.report.call1930}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-[#171E29] hover:bg-[#222B3B] border border-[#2D3748] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
                  )}
                  <span>{copied ? 'Copied to Clipboard' : t.report.copyReport}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-[#171E29] hover:bg-[#222B3B] border border-[#2D3748] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
                  <span>Download (.txt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-[#171E29] hover:bg-[#222B3B] border border-[#2D3748] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <Printer className="w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg border border-[#22C55E]/40 text-[#86EFAC] hover:bg-[#22C55E]/10 text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <span>{savedToast ? 'Draft Saved' : 'Save Draft'}</span>
                </button>
              </div>
            </>
          )}
        </section>

        {/* Right: Official India Resources + Select Incident to Draft */}
        <aside className="lg:col-span-4 space-y-5 no-print">
          <section className="rounded-xl bg-[#11151C] border border-[#222936] p-5 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <ShieldAlert className="w-4 h-4 text-[#EF4444]" aria-hidden="true" />
              <h2 className="text-sm font-bold">Official India Cybercrime Channels</h2>
            </div>
            <div className="space-y-3 text-xs text-[#CBD5E1]">
              <div className="p-3 rounded-lg bg-[#0B0E13] border border-[#1E2532] space-y-1">
                <span className="block text-[#94A3B8]">National Cyber Crime Reporting Portal</span>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-semibold text-[#22C55E] hover:underline"
                >
                  https://cybercrime.gov.in
                </a>
              </div>
              <div className="p-3 rounded-lg bg-[#0B0E13] border border-[#1E2532] space-y-1">
                <span className="block text-[#94A3B8]">Financial Cyber Fraud Helpline (24×7)</span>
                <a href="tel:1930" className="font-mono text-lg font-bold text-white hover:text-[#22C55E]">
                  1930
                </a>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-[#11151C] border border-[#222936] p-5 space-y-3">
            <h2 className="text-sm font-bold text-white">
              Auto-Fill From Detected Threats ({suspiciousHistory.length})
            </h2>
            {suspiciousHistory.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                No suspicious threats detected yet. Run a Live Protection demo scenario first.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {suspiciousHistory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onCreateFromThreat(item)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      draft?.sourceThreatId === item.id
                        ? 'bg-[#171E29] border-[#22C55E]/50'
                        : 'bg-[#0C0F14] border-[#1F2633] hover:border-[#334155]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate">
                        {item.analysis.scamCategory}
                      </span>
                      <span className="font-mono text-[#F87171] shrink-0">
                        {item.analysis.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] truncate mt-0.5">{item.message}</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {savedReports.length > 0 && (
            <section className="rounded-xl bg-[#11151C] border border-[#222936] p-5 space-y-2.5">
              <h2 className="text-sm font-bold text-white">
                Prepared Report Drafts ({savedReports.length})
              </h2>
              <div className="space-y-2">
                {savedReports.map((rep) => (
                  <button
                    key={rep.id}
                    type="button"
                    onClick={() => onUpdateDraft(rep)}
                    className="w-full text-left p-3 rounded-lg bg-[#0C0F14] hover:bg-[#141A24] border border-[#1F2633] space-y-0.5"
                  >
                    <span className="block text-xs font-semibold text-white truncate">
                      {rep.scamCategory}
                    </span>
                    <span className="block text-[11px] font-mono text-[#FBBF24]">
                      {rep.status}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
