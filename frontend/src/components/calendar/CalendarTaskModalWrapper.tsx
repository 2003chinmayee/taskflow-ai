import TaskModal from "../../pages/projects/TaskModal";
import { useTasks } from "../../hooks/useTasks";
import type { Task } from "../../types/task";

interface CalendarTaskModalWrapperProps {
  projectId: string;
  task?: Task | null;
  prefillDate?: string;
  onClose: () => void;
}

export default function CalendarTaskModalWrapper({
  projectId, task, prefillDate, onClose,
}: CalendarTaskModalWrapperProps) {
  const { createTask, updateTask, isCreating, isUpdating } = useTasks(projectId);

  const effectiveTask = task
    ? task
    : prefillDate
    ? ({ dueDate: prefillDate } as Task)
    : null;

  return (
    <TaskModal
      open={true}
      onClose={onClose}
      task={effectiveTask}
      isLoading={isCreating || isUpdating}
      onSave={(payload) => {
        if (task) {
          updateTask({ taskId: task.id, payload });
        } else {
          createTask(payload);
        }
        onClose();
      }}
    />
  );
}