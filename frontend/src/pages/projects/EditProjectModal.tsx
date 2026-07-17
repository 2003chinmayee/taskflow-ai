import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, ProjectStatus } from "../../types/project";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#a855f7", "#f43f5e",
];

const STATUSES = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

interface EditProjectModalProps {
  open: boolean;
  project: Project;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    description: string;
    color: string;
    visibility: "PUBLIC" | "PRIVATE";
    status: ProjectStatus;
  }) => void;
  isLoading: boolean;
}

export default function EditProjectModal({
  open, project, onClose, onSave, isLoading,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [color, setColor] = useState(project.color);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(
    project.visibility as "PUBLIC" | "PRIVATE"
  );
  const [status, setStatus] = useState(project.status);

  // Reset fields whenever a fresh project is opened for editing
  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description ?? "");
      setColor(project.color);
      setVisibility(project.visibility as "PUBLIC" | "PRIVATE");
      setStatus(project.status);
    }
  }, [open, project]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description, color, visibility, status });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg rounded-2xl border border-white/10
                       bg-zinc-950 shadow-2xl p-6 overflow-y-auto"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Edit Project</h2>
                <p className="text-white/40 text-sm mt-0.5">Update your project details</p>
              </div>
              <button onClick={onClose}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Project Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing Website 2026"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                             text-white text-sm placeholder:text-white/20 outline-none
                             focus:border-violet-500/50 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                             text-white text-sm placeholder:text-white/20 outline-none
                             focus:border-violet-500/50 resize-none transition-all"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-lg transition-all hover:scale-110"
                      style={{
                        backgroundColor: c,
                        outline: color === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                      }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["PUBLIC", "PRIVATE"] as const).map((v) => (
                    <button key={v} onClick={() => setVisibility(v)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        visibility === v
                          ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                          : "bg-white/4 border-white/8 text-white/50 hover:text-white"
                      }`}>
                      {v === "PUBLIC" ? "🌐 Public" : "🔒 Private"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as typeof project.status)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                             text-white text-sm outline-none focus:border-violet-500/50 transition-all">
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value} className="bg-zinc-900">{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/60
                           hover:text-white hover:bg-white/8 text-sm transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit}
                disabled={!name.trim() || isLoading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white
                           disabled:opacity-40 transition-all"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}