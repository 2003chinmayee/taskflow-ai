import { motion } from "framer-motion";
import { FolderKanban, Activity, Archive, CheckSquare, TrendingUp, Clock, AlertTriangle, Users, User } from "lucide-react";
import type { DashboardOverview } from "../../types/dashboard";

interface OverviewStatsProps {
  overview: DashboardOverview | undefined;
  isLoading: boolean;
}

export default function OverviewStats({ overview, isLoading }: OverviewStatsProps) {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-white/4 p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    { icon: FolderKanban, label: "Total Projects", value: overview.totalProjects, color: "#a78bfa", bg: "bg-violet-500/10", emptyCaption: null },
    { icon: Activity, label: "Active Projects", value: overview.activeProjects, color: "#34d399", bg: "bg-emerald-500/10", emptyCaption: "No active projects" },
    { icon: Archive, label: "Archived", value: overview.archivedProjects, color: "#94a3b8", bg: "bg-zinc-500/10", emptyCaption: null },
    { icon: CheckSquare, label: "Total Tasks", value: overview.totalTasks, color: "#60a5fa", bg: "bg-blue-500/10", emptyCaption: "No tasks yet" },
    { icon: TrendingUp, label: "Completed", value: overview.completedTasks, color: "#34d399", bg: "bg-emerald-500/10", emptyCaption: null },
    { icon: Clock, label: "In Progress", value: overview.inProgressTasks, color: "#fbbf24", bg: "bg-amber-500/10", emptyCaption: null },
    { icon: AlertTriangle, label: "Overdue", value: overview.overdueTasks, color: "#f87171", bg: "bg-red-500/10", emptyCaption: "You're all caught up 🎉" },
    { icon: Users, label: "Team Members", value: overview.teamMembers, color: "#22d3ee", bg: "bg-cyan-500/10", emptyCaption: null },
    { icon: User, label: "My Tasks", value: overview.myAssignedTasks, color: "#f472b6", bg: "bg-pink-500/10", emptyCaption: "Nothing assigned to you" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <motion.div key={stat.label}
          initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.03 * i, duration: 0.4 }} whileHover={{ y: -3 }}
          className="group relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-4 overflow-hidden cursor-default transition-colors duration-300 hover:border-white/15">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
               style={{ background: `radial-gradient(circle at 30% 0%, ${stat.color}1a, transparent 70%)` }} />
          <div className="relative">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3 ring-1 ring-inset ring-white/5`}>
              <stat.icon size={16} style={{ color: stat.color }} />
            </div>
            <div className={`text-xl font-bold mb-0.5 tabular-nums ${stat.label === "Overdue" && stat.value > 0 ? "text-red-400" : "text-white"}`}>
              {stat.value}
            </div>
            <div className="text-white/35 text-[11px] font-medium tracking-wide uppercase">{stat.label}</div>
            {stat.value === 0 && stat.emptyCaption && (
              <div className="text-white/25 text-[10px] mt-1 leading-snug">{stat.emptyCaption}</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}