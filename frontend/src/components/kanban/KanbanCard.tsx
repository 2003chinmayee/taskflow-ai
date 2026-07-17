import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Flag, Clock, User, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../../types/task';

const PRIORITY_STYLES: Record<string, string> = {
  LOW:    'text-zinc-400 bg-zinc-500/20',
  MEDIUM: 'text-blue-400 bg-blue-500/20',
  HIGH:   'text-amber-400 bg-amber-500/20',
  URGENT: 'text-red-400 bg-red-500/20',
};

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
] as const;

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onChangeStatus?: (taskId: string, status: string) => void;
}

export default function KanbanCard({ task, onEdit, onDelete, onChangeStatus }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative rounded-xl border bg-zinc-900 p-3.5 shadow-sm
                  select-none touch-none
                  transition-all duration-200 cursor-grab active:cursor-grabbing
                  ${isDragging
                    ? 'border-violet-500/50 shadow-lg shadow-violet-500/10'
                    : 'border-white/8 hover:border-white/20 hover:shadow-md'
                  }`}
    >
      {/* Priority badge */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5
                          rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
          <Flag size={9} />
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <p className={`text-sm font-medium leading-snug mb-2.5
                     ${task.status === 'DONE' ? 'line-through text-white/40' : 'text-white'}`}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-white/35 text-xs leading-relaxed mb-2.5 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2.5">
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-[11px] ${
              isOverdue ? 'text-red-400' : 'text-white/35'
            }`}>
              <Clock size={10} />
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.assigneeName && (
            <span className="flex items-center gap-1 text-[11px] text-white/35">
              <User size={10} />
              {task.assigneeName}
            </span>
          )}
        </div>

        {/* Action buttons — always visible on mobile (no hover on
            touch), hover-revealed on desktop to keep the card clean */}
        <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1.5 rounded-lg text-white/35 hover:text-white hover:bg-white/8 transition-all"
          >
            <Pencil size={11} />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1.5 rounded-lg text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Mobile-only status changer — replaces drag-and-drop, which
          can't work when only one column is mounted at a time. */}
      {onChangeStatus && (
        <div className="md:hidden mt-2.5 pt-2.5 border-t border-white/8">
          <select
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            value={task.status}
            onChange={(e) => { e.stopPropagation(); onChangeStatus(task.id, e.target.value); }}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 outline-none focus:border-violet-500/40"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-zinc-900">Move to: {s.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}