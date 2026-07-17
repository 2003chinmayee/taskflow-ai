import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckSquare2, Flag, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";
import type { MyTask } from "../../types/dashboard";
import AppHeader from "../../components/layout/AppHeader";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-zinc-400 bg-zinc-500/20",
  MEDIUM: "text-blue-400 bg-blue-500/20",
  HIGH: "text-amber-400 bg-amber-500/20",
  URGENT: "text-red-400 bg-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const STATUS_DOT: Record<string, string> = {
  TODO: "bg-zinc-500",
  IN_PROGRESS: "bg-blue-400",
  IN_REVIEW: "bg-amber-400",
  DONE: "bg-emerald-400",
};

export default function MyTasksPage() {
  const navigate = useNavigate();
  const { myTasks, isLoadingMyTasks } = useDashboard();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const filtered = useMemo(() => {
    return myTasks.filter((t: MyTask) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.projectName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || t.status === statusFilter;
      const matchesPriority = !priorityFilter || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [myTasks, search, statusFilter, priorityFilter]);

  const handleClick = (task: MyTask) => {
    navigate(`/projects/${task.projectId}?openTask=${task.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <AppHeader />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-white/40 text-sm mt-1">
            {myTasks.length > 0 ? `${myTasks.length} assigned to you` : "Loading..."}
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search my tasks..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5
                         text-sm text-white placeholder:text-white/25 outline-none
                         focus:border-violet-500/40 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white
                       outline-none focus:border-violet-500/40 transition-all"
          >
            <option value="" className="bg-zinc-900">All Status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-zinc-900">{label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white
                       outline-none focus:border-violet-500/40 transition-all"
          >
            <option value="" className="bg-zinc-900">All Priority</option>
            <option value="LOW" className="bg-zinc-900">Low</option>
            <option value="MEDIUM" className="bg-zinc-900">Medium</option>
            <option value="HIGH" className="bg-zinc-900">High</option>
            <option value="URGENT" className="bg-zinc-900">Urgent</option>
          </select>
        </div>

        {isLoadingMyTasks ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white/4 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20
                            flex items-center justify-center mb-5">
              <CheckSquare2 size={28} className="text-violet-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No tasks found</h3>
            <p className="text-white/40 text-sm max-w-xs">
              {search || statusFilter || priorityFilter
                ? "Try a different search term or filter."
                : "You have no tasks assigned right now."}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="flex flex-col gap-2">
              {filtered.map((task: MyTask) => (
                <motion.button
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => handleClick(task)}
                  className="w-full flex items-center gap-3 rounded-xl border border-white/8 bg-white/4
                             hover:bg-white/7 hover:border-white/15 p-4 text-left transition-all"
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[task.status] ?? "bg-zinc-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${task.status === "DONE" ? "line-through text-white/40" : "text-white"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: task.projectColor }} />
                      <p className="text-white/30 text-xs truncate">{task.projectName}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.MEDIUM}`}>
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
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}