import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, MoreVertical, Shield, Trash2, AlertCircle,
  Mail, RefreshCw, XCircle, Clock, CheckCircle2, History,
} from "lucide-react";
import { useOrgStore } from "../../store/orgStore";
import { useAuthStore } from "../../store/auth.store";
import { useOrganizationMembers } from "../../hooks/useOrganizationMembers";
import AppHeader from "../../components/layout/AppHeader";
import type { OrgMember, OrgInvitation, OrgRole, InvitationStatus } from "../../types/organization";

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  ORG_ADMIN:       { bg: "bg-amber-500/20",  text: "text-amber-300" },
  PROJECT_MANAGER: { bg: "bg-blue-500/20",   text: "text-blue-300" },
  MEMBER:          { bg: "bg-violet-500/20", text: "text-violet-300" },
  GUEST:           { bg: "bg-zinc-500/20",   text: "text-zinc-400" },
};

const STATUS_BADGE: Record<InvitationStatus, { bg: string; text: string; icon: any }> = {
  PENDING:  { bg: "bg-amber-500/15",  text: "text-amber-300",  icon: Clock },
  ACCEPTED: { bg: "bg-emerald-500/15", text: "text-emerald-300", icon: CheckCircle2 },
  REVOKED:  { bg: "bg-zinc-500/15",   text: "text-zinc-400",   icon: XCircle },
  EXPIRED:  { bg: "bg-red-500/15",    text: "text-red-300",    icon: AlertCircle },
};

const ORG_ROLES: OrgRole[] = ["ORG_ADMIN", "PROJECT_MANAGER", "MEMBER", "GUEST"];
type TabKey = "active" | "pending" | "history";

export default function OrganizationMembersPage() {
  const { currentOrg } = useOrgStore();
  const currentUser = useAuthStore((s) => s.user);
  const orgId = currentOrg?.id ?? "";

  const {
    members, isLoadingMembers, membersError, refetchMembers,
    pendingInvitations, isLoadingPending, pendingError, refetchPending,
    invitationHistory, isLoadingHistory, historyError, refetchHistory,
    inviteMember, isInviting,
    resendInvitation,
    revokeInvitation,
    changeRole,
    removeMember,
  } = useOrganizationMembers(orgId);

  const [tab, setTab] = useState<TabKey>("active");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("MEMBER");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [roleMenuId, setRoleMenuId] = useState<string | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<OrgMember | null>(null);
  const [cancelInviteConfirm, setCancelInviteConfirm] = useState<OrgInvitation | null>(null);

  const isCurrentUserAdmin = currentOrg?.currentUserRole === "ORG_ADMIN";
  const activeAdminCount = members.filter((m) => m.role === "ORG_ADMIN").length;

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    inviteMember(
      { email: inviteEmail.trim(), role: inviteRole },
      { onSuccess: () => { setInviteOpen(false); setInviteEmail(""); setInviteRole("MEMBER"); } }
    );
  };

  if (!isCurrentUserAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <AppHeader />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <AlertCircle size={28} className="text-red-400 mb-3" />
          <h2 className="text-white font-semibold text-lg mb-1">Access denied</h2>
          <p className="text-white/40 text-sm">You need admin access to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AppHeader />

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Team</h1>
            <p className="text-white/40 text-sm mt-1">Manage organization members and invitations</p>
          </div>
          <button onClick={() => setInviteOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all flex-shrink-0">
            <UserPlus size={15} />
            Invite Member
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 mb-6 border-b border-white/8">
          <button onClick={() => setTab("active")}
            className={`px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              tab === "active" ? "border-violet-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
            }`}>
            <span className="sm:hidden">Active ({members.length})</span>
            <span className="hidden sm:inline">Active Members ({members.length})</span>
          </button>
          <button onClick={() => setTab("pending")}
            className={`px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              tab === "pending" ? "border-violet-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
            }`}>
            <span className="sm:hidden">Pending ({pendingInvitations.length})</span>
            <span className="hidden sm:inline">Pending Invitations ({pendingInvitations.length})</span>
          </button>
          <button onClick={() => setTab("history")}
            className={`px-2.5 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              tab === "history" ? "border-violet-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
            }`}>
            <span className="sm:hidden">History</span>
            <span className="hidden sm:inline">Invitation History</span>
          </button>
        </div>

       <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
          {/* Column headers — desktop only */}
          <div className="hidden md:grid grid-cols-[minmax(0,2fr)_120px_140px_120px_80px] gap-3 px-5 py-3 border-b border-white/8 text-white/30 text-[11px] font-semibold uppercase tracking-wide">
            <span>Person / Email</span>
            <span>Role</span>
            <span>{tab === "active" ? "Joined" : "Invited"}</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {tab === "active" && (
            membersError ? <ErrorState onRetry={refetchMembers} /> :
            isLoadingMembers ? <SkeletonRows /> :
            members.length === 0 ? <EmptyState icon={Users} text="No members found" /> :
            <div className="divide-y divide-white/[0.05]">
              {members.map((m) => {
                const badge = ROLE_BADGE[m.role] ?? ROLE_BADGE.MEMBER;
                const isYou = m.userId === currentUser?.id;
                const isLastAdmin = m.role === "ORG_ADMIN" && activeAdminCount <= 1;
                return (
                  <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_120px_140px_120px_80px] gap-2 md:gap-3 items-center px-5 py-3.5 hover:bg-white/[0.03] transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                        style={{ background: `hsl(${m.name.charCodeAt(0) * 7}, 65%, 50%)` }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-sm font-medium truncate">{m.name}</span>
                          {isYou && <span className="text-[10px] font-medium bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full flex-shrink-0">You</span>}
                          {m.isOwner && <span className="text-[10px] font-medium bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded-full flex-shrink-0">Owner</span>}
                        </div>
                        <span className="text-white/35 text-xs truncate block">{m.email}</span>
                        <span className="text-white/30 text-[11px] md:hidden block mt-0.5">
                          Joined {new Date(m.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`hidden md:inline-flex w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                      {m.role.replace("_", " ")}
                    </span>
                    <span className="hidden md:block text-white/40 text-xs">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </span>
                    <span className="hidden md:inline-flex w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                      Active
                    </span>
                    <div className="flex items-center justify-between md:justify-end gap-2">
                      <span className={`md:hidden text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {m.role.replace("_", " ")}
                      </span>
                      {!isYou && !m.isOwner && (
                        <div className="relative flex-shrink-0">
                          <button onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
                            <MoreVertical size={16} />
                          </button>
                          <AnimatePresence>
                            {openMenuId === m.id && (
                              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl z-20 overflow-hidden">
                                <div className="relative">
                                  <button onClick={() => setRoleMenuId(roleMenuId === m.id ? null : m.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/8 transition-all">
                                    <Shield size={13} />
                                    Change Role
                                  </button>
                                  {roleMenuId === m.id && (
                                    <div className="border-t border-white/8">
                                      {ORG_ROLES.filter((r) => r !== m.role).map((r) => (
                                        <button key={r}
                                          disabled={isLastAdmin}
                                          onClick={() => {
                                            changeRole({ memberId: m.userId, role: r });
                                            setRoleMenuId(null); setOpenMenuId(null);
                                          }}
                                          className="w-full text-left px-3 py-2 text-[11px] text-white/50 hover:text-white hover:bg-white/8 transition-all disabled:opacity-30">
                                          → {r.replace("_", " ")}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button
                                  disabled={isLastAdmin}
                                  onClick={() => { setRemoveConfirm(m); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent">
                                  <Trash2 size={13} />
                                  Remove
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {tab === "pending" && (
            pendingError ? <ErrorState onRetry={refetchPending} /> :
            isLoadingPending ? <SkeletonRows /> :
            pendingInvitations.length === 0 ? <EmptyState icon={Mail} text="No pending invitations" /> :
            <div className="divide-y divide-white/[0.05]">
              {pendingInvitations.map((inv) => (
                <InvitationRow key={inv.id} inv={inv} onResend={resendInvitation} onCancel={(id) => {
                  const target = pendingInvitations.find((p) => p.id === id);
                  if (target) setCancelInviteConfirm(target);
                }} />
              ))}
            </div>
          )}

          {tab === "history" && (
            historyError ? <ErrorState onRetry={refetchHistory} /> :
            isLoadingHistory ? <SkeletonRows /> :
            invitationHistory.length === 0 ? <EmptyState icon={History} text="No invitation history" /> :
            <div className="divide-y divide-white/[0.05]">
              {invitationHistory.map((inv) => (
                <InvitationRow key={inv.id} inv={inv} readOnly />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {inviteOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setInviteOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}>
              <h2 className="text-white font-semibold text-lg mb-1">Invite to Organization</h2>
              <p className="text-white/40 text-sm mb-5">Send an invitation by email</p>

              <label className="text-white/60 text-xs mb-1.5 block">Email</label>
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@example.com" type="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all mb-4" />

              <label className="text-white/60 text-xs mb-1.5 block">Role</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 transition-all mb-6">
                {ORG_ROLES.map((r) => (
                  <option key={r} value={r} className="bg-zinc-900">{r.replace("_", " ")}</option>
                ))}
              </select>

              <div className="flex gap-3">
                <button onClick={() => setInviteOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
                  Cancel
                </button>
                <button onClick={handleInvite} disabled={!inviteEmail.trim() || isInviting}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold disabled:opacity-40 transition-all">
                  {isInviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Invitation Confirm */}
      {cancelInviteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">Cancel invitation?</h3>
            <p className="text-white/50 text-sm mb-6">
              This person will no longer be able to use this invitation link.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelInviteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
                Keep invitation
              </button>
              <button onClick={() => { revokeInvitation(cancelInviteConfirm.id); setCancelInviteConfirm(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">
                Cancel invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm */}
      {removeConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">Remove Member?</h3>
            <p className="text-white/50 text-sm mb-6">
              {removeConfirm.name} will lose access to this organization and all its projects immediately.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
                Cancel
              </button>
              <button onClick={() => { removeMember(removeConfirm.userId); setRemoveConfirm(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvitationRow({
  inv, onResend, onCancel, readOnly = false,
}: {
  inv: OrgInvitation;
  onResend?: (id: string) => void;
  onCancel?: (id: string) => void;
  readOnly?: boolean;
}) {
  const status = STATUS_BADGE[inv.status];
  const StatusIcon = status.icon;
  const roleBadge = ROLE_BADGE[inv.role] ?? ROLE_BADGE.MEMBER;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_120px_140px_120px_80px] gap-2 md:gap-3 items-center px-5 py-3.5 hover:bg-white/[0.03] transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
          <Mail size={14} className="text-white/40" />
        </div>
        <div className="min-w-0">
          <span className="text-white text-sm font-medium truncate block">{inv.inviteeEmail}</span>
          <span className="text-white/35 text-xs truncate block">Invited by {inv.invitedByName}</span>
        </div>
      </div>
      <span className={`hidden md:inline-flex w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
        {inv.role.replace("_", " ")}
      </span>
      <span className="hidden md:block text-white/40 text-xs">
        {new Date(inv.createdAt).toLocaleDateString()}
      </span>
      <span className={`hidden md:inline-flex w-fit items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
        <StatusIcon size={11} />
        {inv.status}
      </span>
      <div className="flex items-center justify-between md:justify-end gap-2">
        <span className={`md:hidden flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
          <StatusIcon size={11} />
          {inv.status}
        </span>
        {!readOnly && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onResend?.(inv.id)} title="Resend"
              className="p-1.5 rounded-lg text-white/40 hover:text-violet-400 hover:bg-white/8 transition-all">
              <RefreshCw size={15} />
            </button>
            <button onClick={() => onCancel?.(inv.id)} title="Cancel"
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/8 transition-all">
              <XCircle size={15} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SkeletonRows() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-white/4 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
        <Icon size={16} className="text-white/20" />
      </div>
      <p className="text-white/30 text-sm">{text}</p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle size={20} className="text-red-400 mb-2" />
      <p className="text-white/40 text-sm mb-4">Couldn't load data.</p>
      <button onClick={() => onRetry()}
        className="px-4 py-2 rounded-lg text-xs font-medium bg-white/8 hover:bg-white/12 text-white transition-all">
        Retry
      </button>
    </div>
  );
}