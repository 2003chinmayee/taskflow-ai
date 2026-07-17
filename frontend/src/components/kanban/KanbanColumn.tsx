import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Task } from '../../types/task';
import KanbanCard from './KanbanCard';

const COLUMN_CONFIG = {
  TODO:        { label: 'To Do',       dot: 'bg-zinc-500',    accent: 'border-zinc-500/30'  },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-blue-400',    accent: 'border-blue-400/30'  },
  IN_REVIEW:   { label: 'In Review',   dot: 'bg-amber-400',   accent: 'border-amber-400/30' },
  DONE:        { label: 'Done',        dot: 'bg-emerald-400', accent: 'border-emerald-400/30'},
} as const;

interface KanbanColumnProps {
  status: keyof typeof COLUMN_CONFIG;
  tasks: Task[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddTask: () => void;
  fullWidth?: boolean;
  onChangeStatus?: (taskId: string, status: string) => void;
}

export default function KanbanColumn({
  status, tasks, isLoading, onEdit, onDelete, onAddTask, fullWidth, onChangeStatus,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status];

  return (
    <div className={fullWidth ? "flex flex-col w-full" : "flex flex-col w-72 flex-shrink-0"}>
      {/* Column header */}
      <div className={`flex items-center justify-between mb-3 pb-3
                       border-b ${config.accent}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-white/80 text-sm font-semibold">{config.label}</span>
          <span className="text-white/30 text-xs bg-white/8 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 rounded-lg text-white/25 hover:text-white hover:bg-white/8 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl min-h-[120px] transition-colors duration-200 p-1.5
                    ${isOver ? 'bg-white/[0.04] ring-1 ring-violet-500/30' : 'bg-transparent'}`}
      >
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/4 animate-pulse" />
            ))}
          </div>
        ) : (
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChangeStatus={onChangeStatus}
                />
              ))}
            </div>
          </SortableContext>
        )}

        {/* Empty state */}
        {!isLoading && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className={`w-1.5 h-8 rounded-full ${config.dot} opacity-20 mb-3`} />
            <p className="text-white/20 text-xs">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
