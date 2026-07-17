import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban } from "lucide-react";

interface Project {
  id: string;
  name: string;
  color: string;
}

interface ProjectPickerModalProps {
  open: boolean;
  projects: Project[];
  onSelect: (projectId: string) => void;
  onClose: () => void;
}

export default function ProjectPickerModal({ open, projects, onSelect, onClose }: ProjectPickerModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-semibold text-lg mb-1">Select Project</h2>
            <p className="text-white/40 text-sm mb-5">Which project does this task belong to?</p>

            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-6">No accessible projects</p>
              ) : (
                projects.map((p) => (
                  <button key={p.id} onClick={() => onSelect(p.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 hover:border-white/20 hover:bg-white/8 transition-all text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${p.color}22`, border: `1px solid ${p.color}55`, color: p.color }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-medium truncate">{p.name}</span>
                  </button>
                ))
              )}
            </div>

            <button onClick={onClose}
              className="w-full mt-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}