import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus } from "lucide-react";
import type { AvailableMember, ProjectMemberRole } from "../../types/projectMember";

interface InviteProjectMemberModalProps {
  open: boolean;
  onClose: () => void;
  availableMembers: AvailableMember[];
  isLoadingAvailable: boolean;
  onInvite: (userId: string, role: ProjectMemberRole) => void;
  isInviting: boolean;
  inviteError?: string | null;
}

export default function InviteProjectMemberModal({
  open, onClose, availableMembers, isLoadingAvailable, onInvite, isInviting, inviteError,
}: InviteProjectMemberModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [role, setRole] = useState<ProjectMemberRole>("MEMBER");

  const filtered = availableMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = () => {
    setSearch(""); setSelectedUserId(null); setRole("MEMBER");
    onClose();
  };

  const handleInvite = () => {
    if (!selectedUserId) return;
    onInvite(selectedUserId, role);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl p-6"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold text-lg">Invite Member</h2>
                <p className="text-white/40 text-sm mt-0.5">Add an organization member to this project</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8">✕</button>
            </div>

            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all" />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 mb-4">
              {isLoadingAvailable ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/4 animate-pulse" />
                ))
              ) : filtered.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-6">
                  {availableMembers.length === 0 ? "No available organization members to add." : "No matches found."}
                </p>
              ) : (
                filtered.map((m) => (
                  <button key={m.userId} onClick={() => setSelectedUserId(m.userId)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                      selectedUserId === m.userId
                        ? "bg-violet-500/15 border-violet-500/50"
                        : "bg-white/4 border-white/8 hover:border-white/20"
                    }`}>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium truncate">{m.name}</div>
                      <div className="text-white/40 text-xs truncate">{m.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {selectedUserId && (
              <div className="mb-4">
                <label className="text-white/60 text-xs mb-1.5 block">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["MEMBER", "MANAGER"] as const).map((r) => (
                    <button key={r} onClick={() => setRole(r)}
                      className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                        role === r
                          ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                          : "bg-white/4 border-white/8 text-white/50 hover:text-white"
                      }`}>
                      {r === "MEMBER" ? "Member" : "Manager"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {inviteError && (
              <p className="text-red-400 text-xs mb-3">{inviteError}</p>
            )}

            <div className="flex items-center gap-3">
              <button onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
                Cancel
              </button>
              <button onClick={handleInvite} disabled={!selectedUserId || isInviting}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold disabled:opacity-40 transition-all flex items-center justify-center gap-1.5">
                <UserPlus size={14} />
                {isInviting ? "Inviting..." : "Invite"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}