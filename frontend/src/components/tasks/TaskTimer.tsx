import { useState, useEffect } from "react";
import { Play, Square, Clock } from "lucide-react";
import { useTimeTracking } from "../../hooks/useTimeTracking";

interface TaskTimerProps {
  taskId: string;
  taskTitle: string;
  currentUserRole?: string;
}

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

export default function TaskTimer({ taskId, taskTitle, currentUserRole }: TaskTimerProps) {
  const {
    activeTimer, isLoadingActiveTimer,
    startTimer, isStartingTimer,
    stopTimer, isStoppingTimer,
  } = useTimeTracking();

  const [elapsed, setElapsed] = useState("00:00");

  const isThisTaskRunning = activeTimer?.taskId === taskId;
  const isOtherTaskRunning = !!activeTimer && activeTimer.taskId !== taskId;

  useEffect(() => {
    if (!isThisTaskRunning || !activeTimer) return;
    setElapsed(formatElapsed(activeTimer.startedAt));
    const interval = setInterval(() => {
      setElapsed(formatElapsed(activeTimer.startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [isThisTaskRunning, activeTimer]);

  // VIEWER cannot start/stop timers — hide the control entirely rather
  // than disabling it, per role-gating requirements.
  if (currentUserRole === "VIEWER") {
    return null;
  }

  if (isLoadingActiveTimer) {
    return <div className="h-9 w-28 rounded-xl bg-white/5 animate-pulse" />;
  }

  if (isThisTaskRunning) {
    return (
      <button
        onClick={() => stopTimer(taskId)}
        disabled={isStoppingTimer}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/15 border border-red-500/40 text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition-all"
      >
        <Square size={13} fill="currentColor" />
        {isStoppingTimer ? "Stopping..." : elapsed}
      </button>
    );
  }

  return (
    <button
      onClick={() => startTimer(taskId)}
      disabled={isStartingTimer || isOtherTaskRunning}
      title={isOtherTaskRunning ? `Timer running on "${activeTimer?.taskTitle}" — stop it first` : undefined}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/8 hover:text-white disabled:opacity-40 transition-all"
    >
      <Play size={13} />
      {isStartingTimer ? "Starting..." : isOtherTaskRunning ? "Timer busy" : "Start Timer"}
    </button>
  );
}