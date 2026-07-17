import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckSquare2, Clock, ArrowRight, Flag } from "lucide-react";
import type { MyTask } from "../../types/dashboard";

const priorityColors: Record<string, string> = {
  LOW: 'text-zinc-400 bg-zinc-500/20',
  MEDIUM: 'text-blue-400 bg-blue-500/20',
  HIGH: 'text-amber-400 bg-amber-500/20',
  URGENT: 'text-red-400 bg-red-500/20',
};

interface MyTasksSectionProps {
  tasks: MyTask[];
  isLoading: boolean;
}

export default function MyTasksSection({ tasks, isLoading }: MyTasksSectionProps) {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <CheckSquare2 size={15} className="text-violet-400" />
          My Tasks
        </h3>
        {tasks.length > 0 && (
          <button onClick={() => navigate("/my-tasks")}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-all">
            View all <ArrowRight size={12} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/4 animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
            <CheckSquare2 size={16} className="text-white/20" />
          </div>
          <p className="text-white/30 text-xs">No tasks assigned to you</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {tasks.slice(0, 6).map((task) => (
            <motion.button key={task.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(`/projects/${task.projectId}?openTask=${task.id}`)}
              aria-label={`Open task ${task.title} in ${task.projectName}`}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all text-left focus:outline-none focus:ring-2 focus:ring-violet-500">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: task.projectColor }} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'line-through text-white/40' : 'text-white'}`}>
                  {task.title}
                </p>
                <p className="text-white/30 text-xs truncate mt-0.5">{task.projectName}</p>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityColors[task.priority] ?? priorityColors.MEDIUM}`}>
                <Flag size={9} className="inline mr-1" />
                {task.priority}
              </span>
              {task.dueDate && (
                <span className={`text-xs flex items-center gap-1 flex-shrink-0 ${task.overdue ? "text-red-400" : "text-white/30"}`}>
                  <Clock size={11} />
                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}