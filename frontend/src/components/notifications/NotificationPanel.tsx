import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Loader2, AlertCircle, Bell, CheckCheck,
  UserPlus, Shield, ClipboardCheck, ArrowRightLeft,
  Clock, MessageSquare, AtSign, Users,
} from 'lucide-react';
import type { Notification, NotificationType } from '../../types/notification';

interface NotificationPanelProps {
  notifications: Notification[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isMarkingAllAsRead: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<NotificationType, React.ElementType> = {
  TASK_ASSIGNED: ClipboardCheck,
  TASK_STATUS_CHANGED: ArrowRightLeft,
  TASK_DUE_SOON: Clock,
  TASK_COMMENT_ADDED: MessageSquare,
  COMMENT_MENTION: AtSign,
  PROJECT_MEMBER_ADDED: UserPlus,
  PROJECT_ROLE_CHANGED: Shield,
  ORG_INVITATION_ACCEPTED: Users,
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// NEW: groups notifications into Today / Yesterday / This Week / Earlier
type GroupKey = 'Today' | 'Yesterday' | 'This Week' | 'Earlier';
const GROUP_ORDER: GroupKey[] = ['Today', 'Yesterday', 'This Week', 'Earlier'];

function getGroupKey(dateStr: string): GroupKey {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return 'Today';
  if (date >= startOfYesterday) return 'Yesterday';
  if (date >= startOfWeek) return 'This Week';
  return 'Earlier';
}

function groupNotifications(notifications: Notification[]): Map<GroupKey, Notification[]> {
  const groups = new Map<GroupKey, Notification[]>();
  for (const n of notifications) {
    const key = getGroupKey(n.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(n);
  }
  return groups;
}

export default function NotificationPanel({
  notifications,
  isLoading,
  isError,
  onRetry,
  onMarkAsRead,
  onMarkAllAsRead,
  isMarkingAllAsRead,
  onClose,
}: NotificationPanelProps) {
  const navigate = useNavigate();

  const handleClick = (n: Notification) => {
    if (!n.read) onMarkAsRead(n.id);
    onClose();

    try {
      if (n.taskId && n.projectId) {
        navigate(`/projects/${n.projectId}?openTask=${n.taskId}`);
      } else if (n.projectId) {
        navigate(`/projects/${n.projectId}`);
      } else if (n.organizationId) {
        navigate(`/organization/members`);
      } else {
        toast('This item is no longer available.');
      }
    } catch {
      toast('This item is no longer available.');
    }
  };

  const hasUnread = notifications.some((n) => !n.read);
  const cappedNotifications = notifications.slice(0, 15);
  const grouped = groupNotifications(cappedNotifications);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl z-20 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/8">
        <span className="text-white text-sm font-semibold">Notifications</span>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            disabled={isMarkingAllAsRead}
            className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-all disabled:opacity-50"
          >
            <CheckCheck size={12} />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-2 py-2.5">
                <div className="w-8 h-8 rounded-full bg-white/8 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 bg-white/8 rounded animate-pulse" />
                  <div className="h-2.5 w-1/3 bg-white/8 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <AlertCircle size={18} className="text-red-400 mb-2" />
            <p className="text-white/50 text-xs mb-3">Couldn't load notifications.</p>
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/8 hover:bg-white/12 text-white transition-all"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Bell size={18} className="text-white/20 mb-2" />
            <p className="text-white/40 text-xs">No notifications yet</p>
          </div>
        ) : (
          GROUP_ORDER.map((groupKey) => {
            const items = grouped.get(groupKey);
            if (!items || items.length === 0) return null;

            return (
              <div key={groupKey}>
                <div className="px-3.5 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-white/30 sticky top-0 bg-zinc-900">
                  {groupKey}
                </div>
                <div className="divide-y divide-white/5">
                  {items.map((n) => {
                    const Icon = ICON_MAP[n.type] ?? Bell;
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleClick(n)}
                        className={`w-full flex items-start gap-3 px-3.5 py-2.5 text-left transition-all hover:bg-white/5 ${
                          !n.read ? 'bg-violet-500/5' : ''
                        }`}
                      >
                        <span className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon size={14} className="text-white/60" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs leading-snug ${!n.read ? 'text-white font-medium' : 'text-white/70'}`}>
                            {n.message}
                          </p>
                          <p className="text-white/30 text-[10px] mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
       )}
      </div>

      {notifications.length > 0 && (
        <Link
          to="/notifications"
          onClick={onClose}
          className="flex items-center justify-center py-2.5 text-xs font-medium text-violet-400 hover:text-violet-300 border-t border-white/8 transition-all"
        >
          View all notifications
        </Link>
      )}
    </div>
  );
}