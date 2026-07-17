import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, Sparkles, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AiAnswerResponse, TaskAiActionType } from '../../types/ai';

export interface PromptChip {
  label: string;
  question: string;
  action?: TaskAiActionType;
}

interface HistoryEntry {
  id: string;
  question: string;
  answer: AiAnswerResponse | null;
  error: string | null;
}

interface AskAiPanelProps {
  placeholder?: string;
  promptChips: PromptChip[];
  onAsk: (question: string, action?: TaskAiActionType) => Promise<AiAnswerResponse>;
  renderSuggestions?: (answer: AiAnswerResponse) => React.ReactNode;
}

export default function AskAiPanel({ placeholder, promptChips, onAsk, renderSuggestions }: AskAiPanelProps) {
  const [text, setText] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, isPending]);

  const submit = async (question: string, action?: TaskAiActionType) => {
    const trimmed = question.trim();
    if (!trimmed || isPending) return;

    const entryId = crypto.randomUUID();
    setHistory((prev) => [...prev, { id: entryId, question: trimmed, answer: null, error: null }]);
    setText('');
    setIsPending(true);

    try {
      const answer = await onAsk(trimmed, action);
      setHistory((prev) => prev.map((e) => (e.id === entryId ? { ...e, answer } : e)));
    } catch (err: any) {
      const message = err?.response?.data?.message || 'AI request failed. Please try again.';
      setHistory((prev) => prev.map((e) => (e.id === entryId ? { ...e, error: message } : e)));
    } finally {
      setIsPending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const retry = (entry: HistoryEntry) => {
    setHistory((prev) => prev.filter((e) => e.id !== entry.id));
    submit(entry.question);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 space-y-4" style={{ maxHeight: '420px' }}>
        {history.length === 0 && !isPending && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
              <Sparkles size={18} className="text-violet-400" />
            </div>
            <p className="text-white/50 text-sm mb-4">Ask AI a question, or try one of these:</p>
            <div className="flex flex-wrap justify-center gap-2 px-2">
              {promptChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => submit(chip.question, chip.action)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((entry) => (
          <div key={entry.id} className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-tr-sm bg-violet-600 text-white text-sm">
                {entry.question}
              </div>
            </div>

            {entry.error ? (
              <div className="flex flex-col items-start gap-2 px-1">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={14} />
                  {entry.error}
                </div>
                <button
                  onClick={() => retry(entry)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/8 hover:bg-white/12 text-white transition-all"
                >
                  Retry
                </button>
              </div>
            ) : entry.answer ? (
              <div className="max-w-[95%] space-y-2">
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/6 border border-white/8 text-white/90 text-sm whitespace-pre-wrap leading-relaxed">
                  {entry.answer.answer}
                </div>

                {renderSuggestions && entry.answer.suggestions.length > 0 && (
                  <div>{renderSuggestions(entry.answer)}</div>
                )}

                <div className="flex items-center justify-between px-1">
                  <span className="text-white/30 text-[11px]">
                    Based on {entry.answer.sourceStats.taskCount} task(s), {entry.answer.sourceStats.commentCount} comment(s), and {entry.answer.sourceStats.activityCount} activity event(s).
                  </span>
                  <button
                    onClick={() => handleCopy(entry.id, entry.answer!.answer)}
                    className="flex items-center gap-1 text-white/30 hover:text-white text-[11px] transition-all flex-shrink-0 ml-2"
                  >
                    {copiedId === entry.id ? <Check size={11} /> : <Copy size={11} />}
                    {copiedId === entry.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white/40 text-sm px-1">
                <Loader2 size={14} className="animate-spin" />
                Thinking...
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-white/8 pt-3 mt-3 flex-shrink-0">
        <p className="text-white/25 text-[11px] mb-2 px-1">
          AI suggestions may be incomplete. Review before applying changes.
        </p>
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(text);
              }
            }}
            placeholder={placeholder || 'Ask a question...'}
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-violet-500/50 resize-none transition-all"
          />
          <button
            onClick={() => submit(text)}
            disabled={!text.trim() || isPending}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all flex-shrink-0"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}