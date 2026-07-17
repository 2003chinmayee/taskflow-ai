import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useOrgActions } from "../../hooks/useOrganization";

interface InviteOrgMemberModalProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
}

const ROLES = [
  { value: "MEMBER", label: "Member" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "GUEST", label: "Guest" },
];

export default function InviteOrgMemberModal({ open, onClose, orgId }: InviteOrgMemberModalProps) {
  const { inviteMember, isInviting } = useOrgActions();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  const handleClose = () => { setEmail(""); setRole("MEMBER"); onClose(); };

  const handleInvite = () => {
    if (!email.trim()) return;
    inviteMember({ orgId, email: email.trim(), role });
    handleClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto py-10"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl p-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white font-semibold text-lg mb-1">Invite to Organization</h2>
            <p className="text-white/40 text-sm mb-5">Send an invitation by email</p>

            <label className="text-white/60 text-xs mb-1.5 block">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all mb-4" />

            <label className="text-white/60 text-xs mb-1.5 block">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition-all mb-6">
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-zinc-900">{r.label}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
                Cancel
              </button>
              <button onClick={handleInvite} disabled={!email.trim() || isInviting}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold disabled:opacity-40 transition-all flex items-center justify-center gap-1.5">
                <UserPlus size={14} />
                {isInviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}