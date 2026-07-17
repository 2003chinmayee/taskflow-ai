import { motion } from "framer-motion";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, format,
} from "date-fns";
import type { CalendarTask } from "../../types/calendar";
import CalendarTaskChip from "./CalendarTaskChip";

interface MonthViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onTaskClick: (task: CalendarTask) => void;
  onDateClick: (date: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthView({ currentDate, tasks, onTaskClick, onDateClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const tasksByDate = (date: Date) =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date));

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-white/8">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2.5 text-center text-white/35 text-[11px] font-medium uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayTasks = tasksByDate(day);
          const inMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.005 }}
              onClick={() => onDateClick(day)}
              className={`min-h-[110px] p-1.5 border-r border-b border-white/6 last:border-r-0 cursor-pointer transition-colors hover:bg-white/[0.03] ${
                !inMonth ? "opacity-30" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className={`text-xs font-medium ${
                  isCurrentDay
                    ? "w-5 h-5 flex items-center justify-center rounded-full bg-violet-600 text-white"
                    : "text-white/50"
                }`}>
                  {format(day, "d")}
                </span>
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-white/30">{dayTasks.length}</span>
                )}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <CalendarTaskChip key={task.id} task={task} onClick={() => onTaskClick(task)} compact />
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-[10px] text-white/30 px-1">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
