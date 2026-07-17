import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useTaskWorkLogs, useTimeTracking } from "../../hooks/useTimeTracking";
import WorkLogModal from "./WorkLogModal";
import type { WorkLog } from "../../types/workLog";

interface WorkLogListProps {
  taskId: string;
  projectId: string;
  currentUserId: string;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function WorkLogList({ taskId, projectId, currentUserId }: WorkLogListProps) {
  const { workLogs, isLoading, error } = useTaskWorkLogs(taskId);
  const { updateWorkLog, isUpdatingWorkLog, deleteWorkLog } = useTimeTracking();

  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<WorkLog | null>(null);

  const totalMinutes = workLogs.reduce((sum, log) => sum + log.durationMinutes, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/70 text-sm font-medium flex items-center gap-1.5">
          <Clock size={14} className="text-violet-400" />
          Work Logs
        </h3>
        {workLogs.length > 0 && (
          <span className="text-white/40 text-xs">Total: {formatDuration(totalMinutes)}</span>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-2 py-4 text-center justify-center">
          <AlertCircle size={14} className="text-red-400" />
          <p className="text-white/40 text-xs">Couldn't load work logs</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-white/4 animate-pulse" />
          ))}
        </div>
      ) : workLogs.length === 0 ? (
        <p className="text-white/25 text-xs text-center py-4">No time logged yet</p>
      ) : (
        <div className="space-y-1.5">
          {workLogs.map((log) => (
            <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.05] transition-all">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{formatDuration(log.durationMinutes)}</span>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/40 text-xs">{log.userName}</span>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/40 text-xs">{new Date(log.logDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </div>
                {log.description && (
                  <p className="text-white/35 text-xs mt-0.5 truncate">{log.description}</p>
                )}
              </div>
              {log.userId === currentUserId && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => setEditingLog(log)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteConfirm(log)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <WorkLogModal
        open={!!editingLog}
        onClose={() => setEditingLog(null)}
        workLog={editingLog}
        isLoading={isUpdatingWorkLog}
        onSave={(payload) => {
          if (editingLog) {
            updateWorkLog({ workLogId: editingLog.id, payload });
          }
          setEditingLog(null);
        }}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4"
             style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">Delete Work Log?</h3>
            <p className="text-white/50 text-sm mb-6">This time entry will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
                Cancel
              </button>
              <button onClick={() => {
                deleteWorkLog({ workLogId: deleteConfirm.id, taskId, projectId });
                setDeleteConfirm(null);
              }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}