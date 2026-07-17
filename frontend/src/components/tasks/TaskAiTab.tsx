import AskAiPanel from '../ai/AskAiPanel';
import type { PromptChip } from '../ai/AskAiPanel';
import SuggestionCard from '../ai/SuggestionCard';
import { useTaskAi } from '../../hooks/useTaskAi';
import type { AiAnswerResponse } from '../../types/ai';

interface TaskAiTabProps {
  taskId: string;
  currentUserRole: string;
}

const TASK_PROMPT_CHIPS: PromptChip[] = [
  { label: 'Summarize', question: 'Summarize task discussion.', action: 'SUMMARIZE' },
  { label: 'What changed', question: 'What has changed recently?', action: 'WHAT_CHANGED' },
  { label: 'Next steps', question: 'Suggest next steps.', action: 'SUGGEST_NEXT_STEPS' },
  { label: 'Improve description', question: 'Create a clearer task description.', action: 'IMPROVE_DESCRIPTION' },
  { label: 'Suggest subtasks', question: 'Turn this task into subtasks.', action: 'SUGGEST_SUBTASKS' },
];

export default function TaskAiTab({ taskId, currentUserRole }: TaskAiTabProps) {
  const {
    askAsync,
    applyTitle, isApplyingTitle,
    applyDescription, isApplyingDescription,
    applyPriority, isApplyingPriority,
  } = useTaskAi(taskId);

  const canApply = currentUserRole !== 'VIEWER';

  const isApplyingForType = (type: string) => {
    if (type === 'TITLE') return isApplyingTitle;
    if (type === 'DESCRIPTION') return isApplyingDescription;
    if (type === 'PRIORITY') return isApplyingPriority;
    return false;
  };

  const applyForType = (type: string, value: string) => {
    if (type === 'TITLE') applyTitle(value);
    else if (type === 'DESCRIPTION') applyDescription(value);
    else if (type === 'PRIORITY') applyPriority(value);
  };

  return (
    <AskAiPanel
      placeholder="Ask about this task, or request a change..."
      promptChips={TASK_PROMPT_CHIPS}
      onAsk={async (question, action) => {
        const res = await askAsync({ question, action: action || 'FREEFORM' });
        return res.data.data;
      }}
      renderSuggestions={(answer: AiAnswerResponse) => (
        <div className="space-y-2">
          {answer.suggestions.map((s, i) => (
            <SuggestionCard
              key={i}
              suggestion={s}
              canApply={canApply}
              isApplying={isApplyingForType(s.type)}
              onApply={(value) => applyForType(s.type, value)}
            />
          ))}
        </div>
      )}
    />
  );
}