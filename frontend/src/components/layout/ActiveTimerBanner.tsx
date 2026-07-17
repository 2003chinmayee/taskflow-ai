import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Square, Clock } from "lucide-react";
import { useTimeTracking } from "../../hooks/useTimeTracking";

function formatElapsed(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const totalSeconds = Math.max(0, Math.floor((now - start) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function ActiveTimerBanner() {
  const navigate = useNavigate();
  const { activeTimer, isLoadingActiveTimer, stopTimer, isStoppingTimer } = useTimeTracking();
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!activeTimer) return;
    setElapsed(formatElapsed(activeTimer.startedAt));
    const interval = setInterval(() => {
      setElapsed(formatElapsed(activeTimer.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  if (isLoadingActiveTimer || !activeTimer) return null;

  return (
    <button
      onClick={() => navigate(`/projects/${activeTimer.projectId}`)}
      className="flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-xl border border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/15 transition-all"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400" />
      </span>
      <span className="text-white/80 text-xs font-medium truncate max-w-[140px]">{activeTimer.taskTitle}</span>
      <span className="text-violet-300 text-xs font-mono">{elapsed}</span>
      <span
        onClick={(e) => { e.stopPropagation(); stopTimer(activeTimer.taskId); }}
        role="button"
        className="p-1.5 rounded-lg text-white/50 hover:text-red-300 hover:bg-red-500/10 transition-all"
      >
        <Square size={11} fill="currentColor" className={isStoppingTimer ? "opacity-40" : ""} />
      </span>
    </button>
  );
}