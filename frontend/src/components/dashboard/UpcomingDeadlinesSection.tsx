import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import type { UpcomingDeadline } from "../../types/dashboard";

function daysUntil(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff} days`;
}

interface UpcomingDeadlinesSectionProps {
  deadlines: UpcomingDeadline[];
  isLoading: boolean;
}

export default function UpcomingDeadlinesSection({ deadlines, isLoading }: UpcomingDeadlinesSectionProps) {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-5">
        <CalendarClock size={15} className="text-amber-400" />
        Upcoming Deadlines
      </h3>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-white/4 animate-pulse" />
          ))}
        </div>
      ) : deadlines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
            <CalendarClock size={16} className="text-white/20" />
          </div>
          <p className="text-white/30 text-xs">No upcoming deadlines</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {deadlines.map((d, i) => (
            <motion.button key={d.taskId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i }}
              onClick={() => navigate(`/calendar`)}
              aria-label={`Open ${d.taskTitle} in calendar`}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all text-left focus:outline-none focus:ring-2 focus:ring-violet-500">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.projectColor }} />
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{d.taskTitle}</p>
                <p className="text-white/30 text-xs truncate">{d.projectName}</p>
              </div>
              <span className="text-amber-300 text-xs font-medium flex-shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {daysUntil(d.dueDate)}
              </span>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}