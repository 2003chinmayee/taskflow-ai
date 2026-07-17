import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Flame, AlertTriangle, Clock, Eye } from "lucide-react";
import type { UpcomingDeadline, TodaysFocus } from "../../types/dashboard";

interface TodaysFocusSectionProps {
  focus: TodaysFocus | undefined;
  isLoading: boolean;
}

function FocusRow({ item, tone }: { item: UpcomingDeadline; tone: "red" | "amber" | "blue" }) {
  const navigate = useNavigate();
  const toneClasses = {
    red: "text-red-400 bg-red-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    blue: "text-blue-400 bg-blue-500/10",
  }[tone];

  return (
    <button
      onClick={() => navigate(`/projects/${item.projectId}`)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all text-left focus:outline-none focus:ring-2 focus:ring-violet-500"
      aria-label={`Open task ${item.taskTitle} in ${item.projectName}`}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.projectColor }} />
      <div className="min-w-0 flex-1">
        <p className="text-white text-sm font-medium truncate">{item.taskTitle}</p>
        <p className="text-white/30 text-xs truncate">{item.projectName}</p>
      </div>
      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${toneClasses}`}>
        {new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
      </span>
    </button>
  );
}

export default function TodaysFocusSection({ focus, isLoading }: TodaysFocusSectionProps) {
  const totalCount = (focus?.overdue.length ?? 0) + (focus?.dueToday.length ?? 0) + (focus?.inReview.length ?? 0);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-5">
        <Flame size={15} className="text-orange-400" />
        Today's Focus
      </h3>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-white/4 animate-pulse" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3 text-lg">
            🎉
          </div>
          <p className="text-white/30 text-xs">All clear for today!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {focus!.overdue.length > 0 && (
            <div>
              <p className="text-red-400/70 text-[11px] font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5 px-3">
                <AlertTriangle size={11} /> Overdue ({focus!.overdue.length})
              </p>
              <div className="space-y-1">
                {focus!.overdue.slice(0, 5).map((t) => <FocusRow key={t.taskId} item={t} tone="red" />)}
              </div>
            </div>
          )}
          {focus!.dueToday.length > 0 && (
            <div>
              <p className="text-amber-400/70 text-[11px] font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5 px-3">
                <Clock size={11} /> Due Today ({focus!.dueToday.length})
              </p>
              <div className="space-y-1">
                {focus!.dueToday.slice(0, 5).map((t) => <FocusRow key={t.taskId} item={t} tone="amber" />)}
              </div>
            </div>
          )}
          {focus!.inReview.length > 0 && (
            <div>
              <p className="text-blue-400/70 text-[11px] font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5 px-3">
                <Eye size={11} /> In Review ({focus!.inReview.length})
              </p>
              <div className="space-y-1">
                {focus!.inReview.slice(0, 5).map((t) => <FocusRow key={t.taskId} item={t} tone="blue" />)}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}