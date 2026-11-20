import { useState } from 'react';
import { BookOpen, CheckCircle2, Search, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { SAFETY_TOPICS } from '../data/safetyCenter';

interface SafetyCenterViewProps {
  simpleLanguageMode: boolean;
  isSpeaking: boolean;
  onSpeakText: (text: string) => void;
  onStopSpeaking: () => void;
}

export function SafetyCenterView({
  simpleLanguageMode,
  isSpeaking,
  onSpeakText,
  onStopSpeaking,
}: SafetyCenterViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'ESSENTIAL'>('ALL');
  const [speakingTopicId, setSpeakingTopicId] = useState<string | null>(null);

  const visibleTopics = SAFETY_TOPICS.filter((topic) => {
    if (filter !== 'ALL' && topic.severity !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        topic.title.toLowerCase().includes(q) ||
        topic.shortRule.toLowerCase().includes(q) ||
        topic.explanation.toLowerCase().includes(q) ||
        topic.scamExample.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-[#11151C] border border-[#222936] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#22C55E]">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Everyday Digital Safety Library</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Safety Center</h1>
            <p className="text-sm text-[#94A3B8] max-w-2xl">
              Short, clear guides designed for students, parents, elderly family members, and online shoppers. Learn the red flags in under a minute.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search OTP, UPI, Digital Arrest..."
              aria-label="Search safety guides"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0E13] border border-[#263042] text-xs text-white placeholder:text-[#64748B] focus:border-[#22C55E] focus:outline-none"
            />
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter safety topics"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#0B0E13] border border-[#222936]"
        >
          {(['ALL', 'CRITICAL', 'HIGH', 'ESSENTIAL'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              aria-pressed={filter === tab}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filter === tab
                  ? 'bg-[#22C55E] text-[#05120A]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab === 'ALL' ? `All Topics (${SAFETY_TOPICS.length})` : tab}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleTopics.map((topic) => {
          const isReadingThis = isSpeaking && speakingTopicId === topic.id;
          const severityColor =
            topic.severity === 'CRITICAL'
              ? 'text-[#F87171]'
              : topic.severity === 'HIGH'
              ? 'text-[#FBBF24]'
              : 'text-[#4ADE80]';

          return (
            <article
              key={topic.id}
              className="rounded-xl bg-[#11151C] border border-[#222936] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-bold tracking-wider ${severityColor}`}>
                    {topic.severity} RULE
                  </span>
                  <button
                    type="button"
                    aria-label={`Read ${topic.title} out loud`}
                    onClick={() => {
                      if (isReadingThis) {
                        setSpeakingTopicId(null);
                        onStopSpeaking();
                      } else {
                        setSpeakingTopicId(topic.id);
                        onSpeakText(
                          `${topic.title}. ${topic.shortRule} ${topic.explanation}`
                        );
                      }
                    }}
                    className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1A2230] transition-colors"
                  >
                    {isReadingThis ? (
                      <VolumeX className="w-4 h-4 text-[#F87171]" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#22C55E]" />
                    )}
                  </button>
                </div>

                <h2 className="text-base font-bold text-white">{topic.title}</h2>

                <p className={`font-semibold text-[#86EFAC] ${simpleLanguageMode ? 'text-base' : 'text-sm'}`}>
                  {topic.shortRule}
                </p>

                <p className="text-xs text-[#CBD5E1] leading-relaxed">{topic.explanation}</p>

                <div className="p-3 rounded-lg bg-[#0B0E13] border border-[#1E2532] space-y-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F87171]">
                    <ShieldAlert className="w-3 h-3" aria-hidden="true" />
                    <span>Common Scam Example</span>
                  </span>
                  <p className="text-xs text-[#E2E8F0] italic leading-relaxed">
                    {topic.scamExample}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1F2633] space-y-1.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                  What To Do
                </span>
                {topic.whatToDo.map((step, i) => (
                  <p key={i} className="text-xs text-[#E2E8F0] flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{step}</span>
                  </p>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
