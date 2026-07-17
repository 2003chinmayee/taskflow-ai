import { useState } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import type { AiSuggestion } from '../../types/ai';

interface SuggestionCardProps {
  suggestion: AiSuggestion;
  canApply: boolean;
  isApplying: boolean;
  onApply: (suggestedValue: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  TITLE: 'Suggested title',
  DESCRIPTION: 'Suggested description',
  PRIORITY: 'Suggested priority',
  SUBTASKS: 'Suggested subtasks',
};

export default function SuggestionCard({ suggestion, canApply, isApplying, onApply }: SuggestionCardProps) {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    onApply(suggestion.suggestedValue);
    setApplied(true);
  };

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={12} className="text-violet-400" />
        <span className="text-violet-300 text-xs font-medium">
          {TYPE_LABELS[suggestion.type] || 'Suggestion'}
        </span>
      </div>

      <p className="text-white/85 text-sm whitespace-pre-wrap leading-relaxed mb-3">
        {suggestion.suggestedValue}
      </p>

      {suggestion.applicable ? (
        canApply ? (
          <button
            onClick={handleApply}
            disabled={isApplying || applied}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white transition-all"
          >
            {isApplying ? (
              <Loader2 size={12} className="animate-spin" />
            ) : applied ? (
              <Check size={12} />
            ) : null}
            {applied ? 'Applied' : isApplying ? 'Applying...' : 'Apply'}
          </button>
        ) : (
          <p className="text-white/30 text-[11px] italic">
            You don't have permission to apply changes to this task.
          </p>
        )
      ) : (
        <p className="text-white/30 text-[11px] italic">
          Copy this text manually — applying subtasks directly isn't supported yet.
        </p>
      )}
    </div>
  );
}