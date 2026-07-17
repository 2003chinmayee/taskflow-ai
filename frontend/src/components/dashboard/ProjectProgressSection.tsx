import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FolderKanban, ArrowRight, Users, Calendar } from "lucide-react";
import type { ProjectProgress } from "../../types/dashboard";

interface ProjectProgressSectionProps {
  projects: ProjectProgress[];
  isLoading: boolean;
}

export default function ProjectProgressSection({ projects, isLoading }: ProjectProgressSectionProps) {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <FolderKanban size={15} className="text-violet-400" />
          Project Progress
        </h3>
        {projects.length > 0 && (
          <button onClick={() => navigate("/projects")}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-all">
            View all <ArrowRight size={12} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/4 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl border border-white/8 bg-white/[0.02]">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3 text-lg">
            🚀
          </div>
          <p className="text-white/30 text-xs">Create your first project to start managing work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.slice(0, 6).map((p, i) => (
            <motion.button key={p.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }} whileHover={{ y: -3 }}
              onClick={() => navigate(`/projects/${p.id}`)}
              aria-label={`Open project ${p.name}`}
              className="w-full text-left rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-5 hover:border-white/15 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: `${p.color}22`, border: `1px solid ${p.color}55`, color: p.color }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-white text-sm font-semibold truncate">{p.name}</p>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-white/40">Progress</span>
                  <span className="text-white/60 font-medium">{Math.round(p.completionPercentage)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.completionPercentage}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-full rounded-full" style={{ background: p.color }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-white/35 text-xs">
                <span className="flex items-center gap-1"><Users size={11} />{p.memberCount}</span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {p.dueDate ? new Date(p.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No due date"}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}