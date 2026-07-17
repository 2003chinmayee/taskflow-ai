import { motion } from "framer-motion";
import { isSameDay } from "date-fns";
import { CheckSquare2 } from "lucide-react";
import type { CalendarTask } from "../../types/calendar";
import CalendarTaskChip from "./CalendarTaskChip";

interface DayViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onTaskClick: (task: CalendarTask) => void;
  onDateClick: (date: Date) => void;
}

export default function DayView({ currentDate, tasks, onTaskClick, onDateClick }: DayViewProps) {
  const dayTasks = tasks
    .filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), currentDate))
    .sort((a, b) => {
      const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (order[a.priority as keyof typeof order] ?? 4) - (order[b.priority as keyof typeof order] ?? 4);
    });

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 min-h-[400px]">
      {dayTasks.length === 0 ? (
        <div
          onClick={() => onDateClick(currentDate)}
          className="flex flex-col items-center justify-center py-16 text-center cursor-pointer rounded-xl hover:bg-white/[0.02] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
            <CheckSquare2 size={20} className="text-white/20" />
          </div>
          <p className="text-white/40 text-sm font-medium mb-1">No tasks due this day</p>
          <p className="text-white/25 text-xs">Click to add a task</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dayTasks.map((task, i) => (
            <motion.div key={task.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}>
              <CalendarTaskChip task={task} onClick={() => onTaskClick(task)} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}