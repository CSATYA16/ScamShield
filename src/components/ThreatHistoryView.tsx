import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { ThreatRecord } from '../types/scamshield';
import { formatFullDateTime, RiskLabel } from './RiskText';

type FilterTab = 'All' | 'Critical' | 'High' | 'Suspicious' | 'Safe';

interface ThreatHistoryViewProps {
  history: ThreatRecord[];
  initialSelectedId: string | null;
  onClearInitialSelection: () => void;
  onPrepareReport: (record: ThreatRecord) => void;
  onMarkSafe: (recordId: string) => void;
  onResetHistory: () => void;
}

export function ThreatHistoryView({
  history,
  initialSelectedId,
  onClearInitialSelection,
  onPrepareReport,
  onMarkSafe,
  onResetHistory,
}: ThreatHistoryViewProps) {
  const [filter, setFilter] = useState<FilterTab>('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);

  const effectiveSelectedId = initialSelectedId ?? selectedId;
  const selectedRecord = history.find((r) => r.id === effectiveSelectedId) ?? null;

  const handleSelectRow = (id: string) => {
    onClearInitialSelection();
    setSelectedId(id);
  };

  const handleCloseDetail = () => {
    onClearInitialSelection();
    setSelectedId(null);
  };

  const filtered = history.filter((item) => {
    const level = item.userMarkedSafe ? 'SAFE' : item.analysis.riskLevel;
    if (filter === 'Critical' && level !== 'CRITICAL') return false;
    if (filter === 'High' && level !== 'HIGH') return false;
    if (filter === 'Suspicious' && level !== 'SUSPICIOUS') return false;
    if (filter === 'Safe' && level !== 'SAFE' && level !== 'LOW') return false;

    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        item.message.toLowerCase().includes(q) ||
        item.sender.toLowerCase().includes(q) ||
        item.analysis.scamCategory.toLowerCase().includes(q) ||
        item.channel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tabs: FilterTab[] = ['All', 'Critical', 'High', 'Suspicious', 'Safe'];

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Threat History</h1>
            <p className="text-sm text-[#94A3B8]">
              Complete log of analyzed messages and QR events saved locally in your browser. Click any row to open full forensic details.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#171E29] hover:bg-[#222B3B] border border-[#2D3748] text-xs font-semibold text-[#CBD5E1] transition-colors whitespace-nowrap self-start"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
            <span>Reset Demo Log</span>
          </button>
        </div>

        {/* Filter Controls + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-[#1F2633]">
          <div
            role="group"
            aria-label="Filter threats by risk level"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#0B0E13] border border-[#222936]"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                aria-pressed={filter === tab}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  filter === tab
                    ? 'bg-[#22C55E] text-[#05120A]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search
              className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sender, category, text..."
              aria-label="Search threat history"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-xs text-white placeholder:text-[#64748B] focus:border-[#22C55E] focus:outline-none"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table */}
        <section
          className={`${
            selectedRecord ? 'xl:col-span-7' : 'xl:col-span-12'
          } rounded-xl bg-[#11151C] border border-[#222936] overflow-hidden`}
        >
          {filtered.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-medium text-white">No matching records</p>
              <p className="text-xs text-[#94A3B8]">
                Try switching the risk filter or run a new scenario in Live Protection.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1F2633] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] bg-[#0D1016]">
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Message Preview</th>
                    <th className="py-3 px-4">Risk</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D2430] text-sm">
                  {filtered.map((item) => {
                    const isSelected = selectedRecord?.id === item.id;
                    const displayLevel = item.userMarkedSafe ? 'SAFE' : item.analysis.riskLevel;
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-[#171F2C]' : 'hover:bg-[#141A24]'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-xs text-[#94A3B8] whitespace-nowrap tabular-nums">
                          {formatFullDateTime(item.timestamp)}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-[#CBD5E1] whitespace-nowrap">
                          {item.channel}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <button
                            type="button"
                            onClick={() => handleSelectRow(item.id)}
                            className="text-left group focus-visible:underline"
                          >
                            <span className="block text-xs font-semibold text-white group-hover:text-[#22C55E] transition-colors">
                              {item.analysis.scamCategory}
                            </span>
                            <span className="block text-xs text-[#94A3B8] truncate max-w-[260px]">
                              {item.message}
                            </span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <RiskLabel level={displayLevel} />
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#CBD5E1] whitespace-nowrap">
                          <div>{item.protectionAction}</div>
                          {item.reportStatus !== 'Not Reported' && (
                            <div className="text-[11px] text-[#FBBF24] font-medium mt-0.5">
                              Report Prepared
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-white tabular-nums whitespace-nowrap">
                          {item.analysis.riskScore}/100
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Detail Analysis Panel */}
        {selectedRecord && (
          <aside className="xl:col-span-5 rounded-xl bg-[#11151C] border border-[#2A3547] p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <RiskLabel
                  level={selectedRecord.userMarkedSafe ? 'SAFE' : selectedRecord.analysis.riskLevel}
                />
                <h2 className="text-lg font-bold text-white">
                  {selectedRecord.analysis.scamCategory}
                </h2>
                <p className="text-xs text-[#94A3B8] font-mono tabular-nums">
                  {selectedRecord.channel} · {formatFullDateTime(selectedRecord.timestamp)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDetail}
                aria-label="Close threat detail panel"
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1A2230]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-lg bg-[#0B0E13] border border-[#222936] p-4 space-y-1.5">
              <span className="text-xs font-semibold text-[#94A3B8]">
                Sender: {selectedRecord.sender}
              </span>
              <p className="text-sm text-white leading-relaxed">“{selectedRecord.message}”</p>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                Detection Explanation
              </h3>
              <p className="text-sm text-[#E2E8F0] leading-relaxed">
                {selectedRecord.analysis.simpleExplanation}
              </p>
            </div>

            {selectedRecord.analysis.redFlags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                  Red Flags Detected
                </h3>
                <ul className="space-y-2">
                  {selectedRecord.analysis.redFlags.map((rf) => (
                    <li
                      key={rf.id}
                      className="text-xs text-[#E2E8F0] flex items-start gap-2 bg-[#0B0E13] p-2.5 rounded-lg border border-[#1E2532]"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{rf.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-[#1F2633] text-xs space-y-1 text-[#94A3B8]">
              <div>
                Protection Action:{' '}
                <span className="text-white font-medium">{selectedRecord.protectionAction}</span>
              </div>
              <div>
                Report Status:{' '}
                <span className="text-[#FBBF24] font-medium">{selectedRecord.reportStatus}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onPrepareReport(selectedRecord)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-display font-bold text-xs transition-colors whitespace-nowrap"
              >
                <FileWarning className="w-4 h-4" aria-hidden="true" />
                <span>Prepare Cybercrime Report</span>
              </button>

              {!selectedRecord.userMarkedSafe &&
                selectedRecord.analysis.riskLevel !== 'SAFE' && (
                  <button
                    type="button"
                    onClick={() => onMarkSafe(selectedRecord.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#171E29] hover:bg-[#222B3B] border border-[#2D3748] text-xs font-semibold text-[#CBD5E1]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" aria-hidden="true" />
                    <span>Mark Safe</span>
                  </button>
                )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
