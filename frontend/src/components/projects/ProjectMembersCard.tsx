import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, MoreVertical, Shield, Trash2, AlertCircle, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useProjectMembers } from "../../hooks/useProjectMembers";
import InviteProjectMemberModal from "./InviteProjectMemberModal";
import ChangeProjectRoleModal from "./ChangeProjectRoleModal";
import type { ProjectMember } from "../../types/projectMember";
import type { Task } from "../../types/task";

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  OWNER:   { bg: "bg-amber-500/20",  text: "text-amber-300" },
  MANAGER: { bg: "bg-blue-500/20",   text: "text-blue-300" },
  MEMBER:  { bg: "bg-violet-500/20", text: "text-violet-300" },
  VIEWER:  { bg: "bg-zinc-500/20",   text: "text-zinc-400" },
};

const TASK_STATUS_DOT: Record<string, string> = {
  TODO: "bg-zinc-500",
  IN_PROGRESS: "bg-blue-400",
  IN_REVIEW: "bg-amber-400",
  DONE: "bg-emerald-400",
};

interface ProjectMembersCardProps {
  projectId: string;
  tasks: Task[];
}

export default function ProjectMembersCard({ projectId, tasks }: ProjectMembersCardProps) {
  const currentUser = useAuthStore((s) => s.user);
  const {
    members, isLoading, error,
    availableMembers, isLoadingAvailable,
    addMember, isAdding, addError,
    updateRole, isUpdatingRole,
    removeMember, isRemoving,
  } = useProjectMembers(projectId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleModalMember, setRoleModalMember] = useState<ProjectMember | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<ProjectMember | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const canManage = currentMember?.role === "OWNER" || currentMember?.role === "MANAGER";

  const inviteErrorMessage = (addError as any)?.response?.data?.message ?? null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Users size={15} className="text-blue-400" />
          Members
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs font-medium bg-white/[0.06] px-2 py-0.5 rounded-full">
            {members.length}
          </span>
          {canManage && (
            <button onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all">
              <UserPlus size={12} />
              Invite
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle size={20} className="text-red-400 mb-2" />
          <p className="text-white/40 text-xs">Couldn't load members.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/4 animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
            <Users size={16} className="text-white/20" />
          </div>
          <p className="text-white/30 text-xs">No members yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {members.map((m) => {
            const badge = ROLE_BADGE[m.role] ?? ROLE_BADGE.MEMBER;
            const isYou = m.userId === currentUser?.id;
            const memberTasks = tasks.filter((t) => t.assigneeId === m.userId);
            const isExpanded = expandedMemberId === m.id;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="rounded-xl hover:bg-white/[0.05] transition-all">
                <div className="group flex items-center gap-3 px-3 py-2.5 relative">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                    style={{ background: `hsl(${m.name.charCodeAt(0) * 7}, 65%, 50%)` }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-sm font-medium truncate">{m.name}</span>
                      {isYou && (
                        <span className="text-[10px] font-medium bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full flex-shrink-0">You</span>
                      )}
                    </div>
                    <span className="text-white/35 text-xs truncate block">{m.email}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.bg} ${badge.text}`}>
                    {m.role}
                  </span>

                  {canManage && !m.isOwner && (
                    <div className="relative flex-shrink-0">
                      <button onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={14} />
                      </button>
                      <AnimatePresence>
                        {openMenuId === m.id && (
                          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl z-10 overflow-hidden">
                            <button onClick={() => { setRoleModalMember(m); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/8 transition-all">
                              <Shield size={13} />
                              Change Role
                            </button>
                            <button onClick={() => { setRemoveConfirm(m); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-all">
                              <Trash2 size={13} />
                              Remove
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {memberTasks.length > 0 && (
                  <div className="px-3 pb-2">
                    <button
                      onClick={() => setExpandedMemberId(isExpanded ? null : m.id)}
                      className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-all pl-12"
                    >
                      <ChevronDown size={11} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      {memberTasks.length} {memberTasks.length === 1 ? "task" : "tasks"}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-12 pt-1.5 space-y-1 overflow-hidden"
                        >
                          {memberTasks.map((t) => (
                            <div key={t.id} className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TASK_STATUS_DOT[t.status]}`} />
                              <span className={`text-xs truncate ${t.status === "DONE" ? "text-white/25 line-through" : "text-white/55"}`}>
                                {t.title}
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <InviteProjectMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        availableMembers={availableMembers}
        isLoadingAvailable={isLoadingAvailable}
        onInvite={(userId, role) =>
          addMember(
            { userId, role },
            { onSuccess: () => setInviteOpen(false) }
          )
        }
        isInviting={isAdding}
        inviteError={inviteErrorMessage}
      />

      <ChangeProjectRoleModal
        open={!!roleModalMember}
        member={roleModalMember}
        onClose={() => setRoleModalMember(null)}
        onSave={(role) => {
          if (roleModalMember) updateRole({ userId: roleModalMember.userId, role });
          setRoleModalMember(null);
        }}
        isLoading={isUpdatingRole}
      />

      {removeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">Remove Member?</h3>
            <p className="text-white/50 text-sm mb-6">
              {removeConfirm.name} will lose access to this project immediately.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
                Cancel
              </button>
              <button onClick={() => { removeMember(removeConfirm.userId); setRemoveConfirm(null); }}
                disabled={isRemoving}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-40 transition-all">
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}