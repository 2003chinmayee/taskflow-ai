import { motion } from "framer-motion";
import { User, Flag, Clock } from "lucide-react";
import type { Task } from "../../types/task";

interface MyFocusSectionProps {
  tasks: Task[];
  currentUserId: string;
  onOpenTask: (task: Task) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-zinc-400 bg-zinc-500/20",
  MEDIUM: "text-blue-400 bg-blue-500/20",
  HIGH: "text-amber-400 bg-amber-500/20",
  URGENT: "text-red-400 bg-red-500/20",
};

export default function MyFocusSection({ tasks, currentUserId, onOpenTask }: MyFocusSectionProps) {
  const myTasks = tasks.filter((t) => t.assigneeId === currentUserId);

  if (myTasks.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-5">
        <User size={15} className="text-violet-400" />
        My Focus
        <span className="text-white/30 text-xs font-normal ml-1">{myTasks.length}</span>
      </h3>

      <div className="space-y-1">
        {myTasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onOpenTask(task)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all text-left focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${task.status === "DONE" ? "bg-emerald-400" : "bg-blue-400"}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${task.status === "DONE" ? "line-through text-white/40" : "text-white"}`}>
                {task.title}
              </p>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.MEDIUM}`}>
              <Flag size={9} className="inline mr-1" />
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="text-white/30 text-xs flex items-center gap-1 flex-shrink-0">
                <Clock size={11} />
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}