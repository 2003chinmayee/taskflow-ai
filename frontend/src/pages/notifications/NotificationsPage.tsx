import { useState, type ElementType, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, CheckCheck, AlertCircle,
  UserPlus, Shield, ClipboardCheck, ArrowRightLeft,
  Clock, MessageSquare, AtSign, Users, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useNotificationSearch } from "../../hooks/useNotificationSearch";
import type { Notification, NotificationType } from "../../types/notification";
import AppHeader from "../../components/layout/AppHeader";

const ICON_MAP: Record<NotificationType, ElementType> = {
  TASK_ASSIGNED: ClipboardCheck,
  TASK_STATUS_CHANGED: ArrowRightLeft,
  TASK_DUE_SOON: Clock,
  TASK_COMMENT_ADDED: MessageSquare,
  COMMENT_MENTION: AtSign,
  PROJECT_MEMBER_ADDED: UserPlus,
  PROJECT_ROLE_CHANGED: Shield,
  ORG_INVITATION_ACCEPTED: Users,
};

const TYPE_LABELS: Record<NotificationType, string> = {
  TASK_ASSIGNED: "Task Assigned",
  TASK_STATUS_CHANGED: "Status Changed",
  TASK_DUE_SOON: "Due Soon",
  TASK_COMMENT_ADDED: "Comment Added",
  COMMENT_MENTION: "Mention",
  PROJECT_MEMBER_ADDED: "Member Added",
  PROJECT_ROLE_CHANGED: "Role Changed",
  ORG_INVITATION_ACCEPTED: "Invitation Accepted",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  const {
    notifications,
    totalPages,
    totalElements,
    isLoading,
    isError,
    refetch,
    page,
    setPage,
    type,
    setType,
    setSearch,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotificationSearch();

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);

    try {
      if (n.taskId && n.projectId) {
        navigate(`/projects/${n.projectId}?openTask=${n.taskId}`);
      } else if (n.projectId) {
        navigate(`/projects/${n.projectId}`);
      } else if (n.organizationId) {
        navigate(`/organization/members`);
      } else {
        toast("This item is no longer available.");
      }
    } catch {
      toast("This item is no longer available.");
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <AppHeader />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-white/40 text-sm mt-1">
              {totalElements > 0 ? `${totalElements} total` : "Loading..."}
            </p>
          </div>
          {hasUnread && (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         bg-white/8 hover:bg-white/12 text-white transition-all disabled:opacity-50 self-start"
            >
              <CheckCheck size={15} />
              Mark all read
            </button>
          )}
        </motion.div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search notifications..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5
                         text-sm text-white placeholder:text-white/25 outline-none
                         focus:border-violet-500/40 transition-all"
            />
          </form>

          <select
            value={type ?? ""}
            onChange={(e) =>
              setType(e.target.value ? (e.target.value as NotificationType) : undefined)
            }
            className="bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white
                       outline-none focus:border-violet-500/40 transition-all"
          >
            <option value="" className="bg-zinc-900">All types</option>
            {(Object.keys(TYPE_LABELS) as NotificationType[]).map((t) => (
              <option key={t} value={t} className="bg-zinc-900">
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/8 bg-white/4 p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 bg-white/10 rounded" />
                    <div className="h-2.5 w-1/4 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle size={28} className="text-red-400 mb-4" />
            <p className="text-white/50 text-sm mb-4">Couldn't load notifications.</p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/8 hover:bg-white/12 text-white transition-all"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20
                            flex items-center justify-center mb-5">
              <Bell size={28} className="text-violet-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No notifications found</h3>
            <p className="text-white/40 text-sm max-w-xs">
              {searchInput || type
                ? "Try a different search term or filter."
                : "You're all caught up."}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="flex flex-col gap-2">
              {notifications.map((n) => {
                const Icon = ICON_MAP[n.type] ?? Bell;
                return (
                  <motion.button
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      !n.read
                        ? "border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10"
                        : "border-white/8 bg-white/4 hover:bg-white/7"
                    }`}
                  >
                    <span className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={15} className="text-white/60" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-snug ${!n.read ? "text-white font-medium" : "text-white/70"}`}>
                        {n.message}
                      </p>
                      <p className="text-white/30 text-xs mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2.5 rounded-xl border border-white/8 text-white/50 hover:text-white
                         hover:bg-white/8 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-white/40 text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-2.5 rounded-xl border border-white/8 text-white/50 hover:text-white
                         hover:bg-white/8 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}