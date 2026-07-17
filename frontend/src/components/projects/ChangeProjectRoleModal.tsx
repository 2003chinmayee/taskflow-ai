import { motion, AnimatePresence } from "framer-motion";
import type { ProjectMember, ProjectMemberRole } from "../../types/projectMember";

const ROLES: { value: ProjectMemberRole; label: string; desc: string }[] = [
  { value: "MANAGER", label: "Manager", desc: "Can edit project settings and manage members" },
  { value: "MEMBER", label: "Member", desc: "Can create and edit tasks" },
  { value: "VIEWER", label: "Viewer", desc: "Read-only access" },
];

interface ChangeProjectRoleModalProps {
  open: boolean;
  member: ProjectMember | null;
  onClose: () => void;
  onSave: (role: ProjectMemberRole) => void;
  isLoading: boolean;
}

export default function ChangeProjectRoleModal({
  open, member, onClose, onSave, isLoading,
}: ChangeProjectRoleModalProps) {
  if (!member) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-semibold text-lg mb-1">Change Role</h2>
            <p className="text-white/40 text-sm mb-5">{member.name}</p>

            <div className="space-y-2">
              {ROLES.map((r) => (
                <button key={r.value} onClick={() => onSave(r.value)} disabled={isLoading}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    member.role === r.value
                      ? "bg-violet-500/15 border-violet-500/50"
                      : "bg-white/4 border-white/8 hover:border-white/20"
                  } disabled:opacity-50`}>
                  <div className="text-white text-sm font-medium">{r.label}</div>
                  <div className="text-white/40 text-xs mt-0.5">{r.desc}</div>
                </button>
              ))}
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