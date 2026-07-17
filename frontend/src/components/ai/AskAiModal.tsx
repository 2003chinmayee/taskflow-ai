import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import AskAiPanel from './AskAiPanel';
import type { PromptChip } from './AskAiPanel';
import { useProjectAi } from '../../hooks/useProjectAi';

interface AskAiModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

const PROJECT_PROMPT_CHIPS: PromptChip[] = [
  { label: 'Overdue tasks', question: 'What tasks are overdue?' },
  { label: 'Summarize project', question: 'Summarize this project.' },
  { label: 'What to work on next', question: 'What should I work on next?' },
  { label: 'At-risk tasks', question: 'Which tasks are blocked or at risk?' },
  { label: 'Workload', question: 'Who has the most pending work?' },
  { label: "Today's priorities", question: "Give me today's priorities." },
];

export default function AskAiModal({ open, onClose, projectId, projectName }: AskAiModalProps) {
  const { askAsync } = useProjectAi(projectId);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl p-6"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-400" />
                  Ask AI
                </h2>
                <p className="text-white/40 text-sm mt-0.5">{projectName}</p>
              </div>
              <button onClick={onClose}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8">
                ✕
              </button>
            </div>

            <AskAiPanel
              placeholder="Ask about this project..."
              promptChips={PROJECT_PROMPT_CHIPS}
              onAsk={async (question) => {
                const res = await askAsync(question);
                return res.data.data;
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}