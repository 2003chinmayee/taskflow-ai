import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

type ViewMode = "month" | "week" | "day";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewTask: () => void;
}

export default function CalendarHeader({
  currentDate, viewMode, onViewModeChange, onPrev, onNext, onToday, onNewTask,
}: CalendarHeaderProps) {
  const label = viewMode === "month"
    ? currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : viewMode === "week"
    ? `Week of ${currentDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
    : currentDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-white/8 overflow-hidden">
          <button onClick={onPrev}
            className="p-2.5 text-white/50 hover:text-white hover:bg-white/8 transition-all">
            <ChevronLeft size={16} />
          </button>
          <button onClick={onToday}
            className="px-3 py-2.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/8 border-x border-white/8 transition-all">
            Today
          </button>
          <button onClick={onNext}
            className="p-2.5 text-white/50 hover:text-white hover:bg-white/8 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
        <h2 className="text-white font-semibold text-lg">{label}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex rounded-xl border border-white/8 overflow-hidden">
          {(["month", "week", "day"] as const).map((mode) => (
            <button key={mode} onClick={() => onViewModeChange(mode)}
              className={`px-3.5 py-2 text-xs font-medium capitalize transition-all ${
                viewMode === mode ? "bg-white/10 text-white" : "bg-white/4 text-white/40 hover:text-white"
              }`}>
              {mode}
            </button>
          ))}
        </div>
        <button onClick={onNewTask}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all">
          <Plus size={14} />
          New Task
        </button>
      </div>
    </div>
  );
}