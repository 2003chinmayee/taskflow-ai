import { formatDistanceToNow } from 'date-fns';
import {
  Loader2,
  AlertCircle,
  History,
  FilePlus,
  Pencil,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
  Play,
  Square,
  Clock,
  MessageSquare,
  Paperclip,
} from 'lucide-react';
import { useTaskActivity } from '../../hooks/useTaskActivity';
import type { Activity, ActivityType } from '../../types/activity';

interface ActivityTabProps {
  taskId: string;
  active: boolean;
}

// Maps each backend enum value to an icon. Falls back to a generic
// clock/history icon for any type not explicitly listed, so this never
// crashes if new activity types are added later.
const ICON_MAP: Partial<Record<ActivityType, React.ElementType>> = {
  TASK_CREATED: FilePlus,
  TASK_UPDATED: Pencil,
  TASK_COMPLETED: CheckCircle2,
  TASK_DELETED: Trash2,
  TASK_STATUS_CHANGED: ArrowRightLeft,
  TIMER_STARTED: Play,
  TIMER_STOPPED: Square,
  WORK_LOG_CREATED: Clock,
  WORK_LOG_UPDATED: Clock,
  WORK_LOG_DELETED: Clock,
  TASK_COMMENT_CREATED: MessageSquare,
  TASK_COMMENT_UPDATED: MessageSquare,
  TASK_COMMENT_DELETED: MessageSquare,
  TASK_ATTACHMENT_UPLOADED: Paperclip,
  TASK_ATTACHMENT_DELETED: Paperclip,
};

// Some existing backend descriptions (comments/attachments) include a
// trailing "on task \"Title\"" phrase left over from project-level
// logging. Since Activity here is already scoped to a single task, that
// part is redundant — strip it and lowercase the first letter so every
// row reads uniformly as "{Actor} {description}".
function toReadableDescription(raw: string): string {
  let text = raw.trim();
  // Strips redundant trailing task-reference phrases left over from
  // project-level logging (e.g. "... on task \"X\"", "... to task \"X\"",
  // "... from task \"X\""). Activity here is already scoped to one task,
  // so repeating its title in every row is noise.
  text = text.replace(/\s*(on|to|from) task ["“][^"”]*["”]\s*$/i, '');
  if (text.length > 0) {
    text = text.charAt(0).toLowerCase() + text.slice(1);
  }
  return text;
}

function ActivityRow({ activity }: { activity: Activity }) {
  const Icon = ICON_MAP[activity.type] ?? History;
  const description = toReadableDescription(activity.description);
  const timestamp = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-white/60" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/85 leading-snug">
          <span className="font-medium text-white">{activity.userName}</span>{' '}
          {description}
        </p>
        <p className="text-xs text-white/35 mt-0.5">{timestamp}</p>
      </div>
    </div>
  );
}

export default function ActivityTab({ taskId, active }: ActivityTabProps) {
  const {
    activities,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadOlder,
    retryInitial,
  } = useTaskActivity(taskId, active);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-1" style={{ maxHeight: '400px' }}>
        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/8 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-40 bg-white/8 rounded animate-pulse" />
                  <div className="h-2.5 w-20 bg-white/8 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle size={20} className="text-red-400 mb-2" />
            <p className="text-white/50 text-sm mb-3">{error}</p>
            <button
              onClick={retryInitial}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/8 hover:bg-white/12 text-white transition-all"
            >
              Retry
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <History size={20} className="text-white/20 mb-2" />
            <p className="text-white/40 text-sm">No activity yet</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/5">
              {activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center py-3">
                <button
                  onClick={loadOlder}
                  disabled={isLoadingMore}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white border border-white/8 hover:border-white/20 transition-all disabled:opacity-50"
                >
                  {isLoadingMore && <Loader2 size={12} className="animate-spin" />}
                  Load older activity
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}