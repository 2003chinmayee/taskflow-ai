import { motion } from "framer-motion";
import { Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useProjectTimeSummary } from "../../hooks/useTimeTracking";

interface ProjectTimeSummaryProps {
  projectId: string;
}

export default function ProjectTimeSummary({ projectId }: ProjectTimeSummaryProps) {
  const { summary, isLoading, error } = useProjectTimeSummary(projectId);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <Clock size={15} className="text-violet-400" />
          Time Tracking
        </h3>
        {summary && summary.totalMinutes > 0 && (
          <span className="text-white/70 text-sm font-semibold bg-white/[0.06] px-3 py-1 rounded-full">
            {summary.totalFormatted}
          </span>
        )}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle size={18} className="text-red-400 mb-2" />
          <p className="text-white/40 text-xs">Couldn't load time summary</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-white/4 animate-pulse" />
          ))}
        </div>
      ) : !summary || summary.totalMinutes === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
            <Clock size={16} className="text-white/20" />
          </div>
          <p className="text-white/30 text-xs">No time logged yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-white/35 text-[11px] font-medium uppercase tracking-wide mb-2.5">Top Contributors</p>
            <div className="space-y-1.5">
              {summary.byUser.slice(0, 5).map((u, i) => (
                <div key={u.userId} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                    style={{ background: `hsl(${u.userName.charCodeAt(0) * 7}, 65%, 50%)` }}>
                    {u.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white/70 text-xs flex-1 truncate">{u.userName}</span>
                  <span className="text-white/40 text-xs flex-shrink-0">{u.formatted}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white/35 text-[11px] font-medium uppercase tracking-wide mb-2.5 flex items-center gap-1">
              <TrendingUp size={11} /> Top Tasks
            </p>
            <div className="space-y-1.5">
              {summary.byTask.slice(0, 5).map((t) => (
                <div key={t.taskId} className="flex items-center gap-2.5">
                  <span className="text-white/70 text-xs flex-1 truncate">{t.taskTitle}</span>
                  <span className="text-white/40 text-xs flex-shrink-0">{t.formatted}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}