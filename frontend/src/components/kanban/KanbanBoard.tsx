import { useState } from 'react';
import { Circle, Loader2, Eye, CheckCircle2 } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import toast from 'react-hot-toast';
import type { Task, TaskStatus, UpdateTaskPayload } from '../../types/task';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

interface KanbanBoardProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddTask: () => void;
  onUpdateTask: (params: { taskId: string; payload: UpdateTaskPayload }) => void;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: typeof Circle }> = {
  TODO: { label: 'To Do', icon: Circle },
  IN_PROGRESS: { label: 'In Progress', icon: Loader2 },
  IN_REVIEW: { label: 'In Review', icon: Eye },
  DONE: { label: 'Done', icon: CheckCircle2 },
};

export default function KanbanBoard({
  tasks, isLoading, onEdit, onDelete, onAddTask, onUpdateTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [mobileTab, setMobileTab] = useState<TaskStatus>('TODO');
  // Optimistic local override: taskId → status
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, TaskStatus>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Merge optimistic overrides into tasks
  const resolvedTasks = tasks.map(t =>
    optimisticStatus[t.id] ? { ...t, status: optimisticStatus[t.id] } : t
  );

  const tasksByStatus = (status: TaskStatus) =>
    resolvedTasks.filter(t => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // overId is either a column status or another task's id
    const overStatus = STATUSES.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : tasks.find(t => t.id === overId)?.status;

    if (!overStatus) return;

    const currentStatus = optimisticStatus[activeId] ??
      tasks.find(t => t.id === activeId)?.status;

    if (currentStatus !== overStatus) {
      setOptimisticStatus(prev => ({ ...prev, [activeId]: overStatus }));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      // dropped outside — revert
      setOptimisticStatus(prev => {
        const next = { ...prev };
        delete next[active.id as string];
        return next;
      });
      return;
    }

    const activeId = active.id as string;
    const newStatus = optimisticStatus[activeId];
    const originalStatus = tasks.find(t => t.id === activeId)?.status;

    if (!newStatus || newStatus === originalStatus) {
      setOptimisticStatus(prev => {
        const next = { ...prev };
        delete next[activeId];
        return next;
      });
      return;
    }

    // Fire backend update
    onUpdateTask({
      taskId: activeId,
      payload: { status: newStatus },
    });

    // Clear optimistic override — real data from React Query will take over
    setOptimisticStatus(prev => {
      const next = { ...prev };
      delete next[activeId];
      return next;
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Desktop/tablet: side-by-side columns, unchanged */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus(status)}
              isLoading={isLoading}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddTask={onAddTask}
            />
          ))}
        </div>
      </div>

      {/* Mobile: single-column tab view — no horizontal board scroll,
          matches Jira/Asana mobile pattern. User picks one status at a
          time via tabs, sees that column full-width. */}
      <div className="md:hidden">
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const count = tasksByStatus(status).length;
            const active = mobileTab === status;
            return (
              <button
                key={status}
                onClick={() => setMobileTab(status)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <config.icon size={13} />
                {config.label}
                <span className="text-white/30">({count})</span>
              </button>
            );
          })}
        </div>
        <KanbanColumn
          status={mobileTab}
          tasks={tasksByStatus(mobileTab)}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddTask={onAddTask}
          fullWidth
          onChangeStatus={(taskId, newStatus) => {
            onUpdateTask({ taskId, payload: { status: newStatus as TaskStatus } });
          }}
        />
      </div>

      {/* Drag overlay — shows floating card while dragging */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105">
            <KanbanCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
