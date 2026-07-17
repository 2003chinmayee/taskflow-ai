import type { CalendarTask } from "../../types/calendar";

const PRIORITY_DOT: Record<string, string> = {
  LOW: "#71717a",
  MEDIUM: "#60a5fa",
  HIGH: "#fbbf24",
  URGENT: "#f87171",
};

interface CalendarTaskChipProps {
  task: CalendarTask;
  onClick: () => void;
  compact?: boolean;
}

export default function CalendarTaskChip({ task, onClick, compact }: CalendarTaskChipProps) {
  const dotColor = PRIORITY_DOT[task.priority] ?? "#71717a";

  const baseClasses = task.overdue
    ? "bg-red-500/15 border-red-500/40 hover:bg-red-500/20"
    : task.dueToday
    ? "bg-amber-500/15 border-amber-500/40 hover:bg-amber-500/20"
    : "bg-white/5 border-white/10 hover:bg-white/8";

  const textClasses = task.overdue ? "text-red-300" : task.dueToday ? "text-amber-200" : "text-white/85";

  if (compact) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded-md border text-left transition-all ${baseClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
        <span className={`text-[11px] font-medium truncate ${textClasses} ${task.status === "DONE" ? "line-through opacity-50" : ""}`}>
          {task.title}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${baseClasses}`}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${textClasses} ${task.status === "DONE" ? "line-through opacity-50" : ""}`}>
          {task.title}
        </p>
        <p className="text-white/35 text-xs truncate mt-0.5">
          {task.projectName}{task.assigneeName ? ` · ${task.assigneeName}` : ""}
        </p>
      </div>
      {task.overdue && (
        <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
          Overdue
        </span>
      )}
    </button>
  );
}