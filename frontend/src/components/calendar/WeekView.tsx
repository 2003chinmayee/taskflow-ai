import { motion } from "framer-motion";
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, format } from "date-fns";
import type { CalendarTask } from "../../types/calendar";
import CalendarTaskChip from "./CalendarTaskChip";

interface WeekViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onTaskClick: (task: CalendarTask) => void;
  onDateClick: (date: Date) => void;
}

export default function WeekView({ currentDate, tasks, onTaskClick, onDateClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const tasksByDate = (date: Date) =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
      {days.map((day, i) => {
        const dayTasks = tasksByDate(day);
        const isCurrentDay = isToday(day);

        return (
          <motion.div
            key={day.toISOString()}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onDateClick(day)}
            className={`rounded-2xl border p-4 cursor-pointer transition-all min-h-[220px] ${
              isCurrentDay
                ? "border-violet-500/40 bg-violet-500/[0.04]"
                : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/40 text-[11px] font-medium uppercase tracking-wide">
                  {format(day, "EEE")}
                </p>
                <p className={`text-lg font-bold mt-0.5 ${isCurrentDay ? "text-violet-300" : "text-white"}`}>
                  {format(day, "d")}
                </p>
              </div>
              {dayTasks.length > 0 && (
                <span className="text-[11px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                  {dayTasks.length}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {dayTasks.length === 0 ? (
                <p className="text-white/20 text-xs italic">No tasks</p>
              ) : (
                dayTasks.map((task) => (
                  <CalendarTaskChip key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}