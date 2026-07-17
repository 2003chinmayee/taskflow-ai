import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Star, Archive, Edit3, Users, CheckSquare,
  Calendar, Clock, TrendingUp, Globe, Lock,
  AlertCircle, Activity, CheckSquare2, Plus, Search,
  Flag, Pencil, Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useProject } from "../../hooks/useProjects";
import { useAuthStore } from "../../store/auth.store";
import { useTasks } from "../../hooks/useTasks";
import EditProjectModal from "./EditProjectModal";
import TaskModal from "./TaskModal";
import KanbanBoard from "../../components/kanban/KanbanBoard";
import type { Task } from "../../types/task";
import ProjectMembersCard from "../../components/projects/ProjectMembersCard";
import MyFocusSection from "../../components/projects/MyFocusSection";
import ProjectTimeSummary from "../../components/projects/ProjectTimeSummary";
import AppHeader from "../../components/layout/AppHeader";
import AskAiModal from "../../components/ai/AskAiModal";
import { Sparkles } from "lucide-react";

const STATUS_CONFIG = {
  PLANNING:  { label: "Planning",  bg: "bg-violet-500/20", text: "text-violet-300",  dot: "bg-violet-400"  },
  ACTIVE:    { label: "Active",    bg: "bg-emerald-500/20",text: "text-emerald-300", dot: "bg-emerald-400" },
  ON_HOLD:   { label: "On Hold",   bg: "bg-amber-500/20",  text: "text-amber-300",   dot: "bg-amber-400"   },
  COMPLETED: { label: "Completed", bg: "bg-blue-500/20",   text: "text-blue-300",    dot: "bg-blue-400"    },
  CANCELLED: { label: "Cancelled", bg: "bg-red-500/20",    text: "text-red-300",     dot: "bg-red-400"     },
  ARCHIVED:  { label: "Archived",  bg: "bg-zinc-500/20",   text: "text-zinc-400",    dot: "bg-zinc-500"    },
} as const;

function HeroSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-8 animate-pulse">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/10" />
        <div className="flex-1">
          <div className="h-7 bg-white/10 rounded w-1/3 mb-3" />
          <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useAuthStore((s) => s.user);

  const [favorited, setFavorited] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskConfirm, setDeleteTaskConfirm] = useState<string | null>(null);
  const [taskView, setTaskView] = useState<'list' | 'board'>('list');
  const [askAiOpen, setAskAiOpen] = useState(false);

  
  const {
    project, isLoading, error,
    toggleFavorite, archiveProject,
    updateProject, isUpdating,
  } = useProject(projectId ?? "");

  const {
    tasks, totalTasks, isLoading: tasksLoading,
    search: taskSearch, setSearch: setTaskSearch,
    statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter,
    createTask, isCreating,
    updateTask, isUpdating: isUpdatingTask,
    deleteTask,
  } = useTasks(projectId ?? "");

  // Auto-open a task from a notification link (?openTask=taskId). If the
  // task was deleted or is no longer accessible, tasks.find() simply
  // returns undefined and nothing opens — no crash, and the existing
  // task-detail authorization still applies when it does open.
  useEffect(() => {
    const openTaskId = searchParams.get('openTask');
    if (openTaskId && tasks.length > 0) {
      const target = tasks.find((t) => t.id === openTaskId);
      if (target) {
        setEditingTask(target);
        setTaskModalOpen(true);
      } else {
        toast.error('This item is no longer available.');
      }
      searchParams.delete('openTask');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, tasks]);

if (error) {
    return (
     <>
        <AppHeader />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 mx-auto">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Couldn't load this project</h3>
            <p className="text-white/40 text-sm mb-6">It may have been deleted, or you may not have access to it.</p>
            <button onClick={() => navigate("/projects")}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all">
              Back to Projects
            </button>
          </div>
        </div>
      </>
    );
  }

  const status = project
    ? (STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PLANNING)
    : null;

  const priorityColors: Record<string, string> = {
    LOW: 'text-zinc-400 bg-zinc-500/20',
    MEDIUM: 'text-blue-400 bg-blue-500/20',
    HIGH: 'text-amber-400 bg-amber-500/20',
    URGENT: 'text-red-400 bg-red-500/20',
  };
  const taskStatusColors: Record<string, string> = {
    TODO: 'bg-zinc-500',
    IN_PROGRESS: 'bg-blue-400',
    IN_REVIEW: 'bg-amber-400',
    DONE: 'bg-emerald-400',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <AppHeader />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {isLoading || !project ? (
          <>
            <HeroSkeleton />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/4 p-4 h-24 animate-pulse" />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent" />
              <div className="absolute inset-0 backdrop-blur-2xl border border-white/10 rounded-3xl" />
              <motion.div
                className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ background: project.color }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.35, 0.25] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                   style={{ background: `linear-gradient(90deg, transparent, ${project.color}, transparent)` }} />
              <div className="relative p-8 sm:p-10">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                  <div className="flex items-start gap-5 min-w-0">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${project.color}33, ${project.color}11)`,
                        border: `1px solid ${project.color}55`,
                        boxShadow: `0 8px 32px -8px ${project.color}66`,
                      }}
                    >
                      <span style={{ color: project.color }}>{project.name.charAt(0).toUpperCase()}</span>
                    </motion.div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                        <h1 className="text-[28px] leading-tight font-bold text-white tracking-tight truncate max-w-md">{project.name}</h1>
                        {status && (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text} ring-1 ring-inset ring-white/10`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                            {status.label}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.06] text-white/55 ring-1 ring-inset ring-white/10">
                          {project.visibility === "PRIVATE" ? <Lock size={11} /> : <Globe size={11} />}
                          {project.visibility === "PRIVATE" ? "Private" : "Public"}
                        </span>
                      </div>
                      <p className="text-white/45 text-[15px] max-w-xl mb-4 leading-relaxed font-light">
                        {project.description || <span className="italic text-white/25">No description provided.</span>}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/35 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12.5} className="text-white/25" />
                          Created {new Date(project.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/15" />
                        <span className="flex items-center gap-1.5">
                          <Clock size={12.5} className="text-white/25" />
                          Updated {new Date(project.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => { toggleFavorite(); setFavorited(!favorited); }}
                      className={`p-3 rounded-xl border transition-all duration-200 ${project.favorite ? "border-amber-400/40 bg-amber-400/10 text-amber-400" : "border-white/10 bg-white/[0.03] text-white/40 hover:text-amber-400 hover:border-amber-400/30"}`}>
                      <Star size={16} fill={project.favorite ? "currentColor" : "none"} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => archiveProject()}
                      className="p-3 rounded-xl border border-white/10 bg-white/[0.03] text-white/40 hover:text-white hover:border-white/20 transition-all duration-200">
                      <Archive size={16} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => setAskAiOpen(true)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-violet-300 border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition-all duration-200">
                      <Sparkles size={14} />
                      Ask AI
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setEditOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                      style={{ background: `linear-gradient(135deg, ${project.color}, ${project.color}cc)` }}>
                      <Edit3 size={14} />
                      Edit Project
                    </motion.button>
                    
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              {[
                { icon: CheckSquare, label: "Total Tasks", value: project.taskCount, color: "#a78bfa", bg: "bg-violet-500/10" },
                { icon: TrendingUp,  label: "Completed",   value: project.completedTaskCount, color: "#34d399", bg: "bg-emerald-500/10" },
                { icon: Users,       label: "Members",     value: project.memberCount, color: "#60a5fa", bg: "bg-blue-500/10" },
                { icon: TrendingUp,  label: "Progress",    value: `${Math.round(project.completionPercentage)}%`, color: "#f472b6", bg: "bg-pink-500/10" },
                { icon: Calendar,    label: "Due Date",    value: project.dueDate ? new Date(project.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Not set", color: "#fbbf24", bg: "bg-amber-500/10" },
                { icon: Activity,    label: "Status",      value: status?.label ?? "—", color: "#22d3ee", bg: "bg-cyan-500/10" },
              ].map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }} whileHover={{ y: -3 }}
                  className="group relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-4 overflow-hidden cursor-default transition-colors duration-300 hover:border-white/15">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                       style={{ background: `radial-gradient(circle at 30% 0%, ${stat.color}1a, transparent 70%)` }} />
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3 ring-1 ring-inset ring-white/5`}>
                      <stat.icon size={16} style={{ color: stat.color }} />
                    </div>
                    <div className="text-xl font-bold text-white mb-0.5 tabular-nums">{stat.value}</div>
                    <div className="text-white/35 text-[11px] font-medium tracking-wide uppercase">{stat.label}</div>
                  </div>
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ delay: 0.05 * i + 0.2, duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
                    style={{ background: `linear-gradient(90deg, ${stat.color}99, transparent)` }} />
                </motion.div>
              ))}
            </div>

            {/* Time Tracking Summary */}
            <div className="mt-6">
              <ProjectTimeSummary projectId={projectId ?? ""} />
            </div>

            {/* My Focus — personal task list scoped to this project */}
            {currentUser && (
              <div className="mt-6">
                <MyFocusSection
                  tasks={tasks}
                  currentUserId={currentUser.id}
                  onOpenTask={(task) => { setEditingTask(task); setTaskModalOpen(true); }}
                />
              </div>
            )}

            {/* Activity + Members */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <Activity size={15} className="text-violet-400" />
                    Recent Activity
                  </h3>
                  <span className="text-white/25 text-[11px] uppercase tracking-wide">Live</span>
                </div>
                <div className="relative pl-1">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-white/15 via-white/8 to-transparent" />
                  <div className="space-y-6">
                    {[
                      { text: "Project created", time: new Date(project.createdAt).toLocaleString(), color: "#a78bfa" },
                      { text: "Last updated",    time: new Date(project.updatedAt).toLocaleString(), color: "#60a5fa" },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.08 }} className="relative flex items-start gap-3.5 group">
                        <span className="relative z-10 w-3.5 h-3.5 rounded-full mt-0.5 flex-shrink-0 ring-4 ring-zinc-950 transition-transform duration-300 group-hover:scale-125"
                          style={{ background: item.color, boxShadow: `0 0 12px ${item.color}88` }} />
                        <div>
                          <p className="text-white/75 text-sm font-medium">{item.text}</p>
                          <p className="text-white/30 text-xs mt-0.5">{item.time}</p>
                        </div>
                      </motion.div>
                    ))}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                      className="relative flex items-center gap-3.5 pt-1">
                      <span className="w-3.5 h-3.5 rounded-full mt-0.5 flex-shrink-0 ring-4 ring-zinc-950 bg-white/10 border border-dashed border-white/20" />
                      <p className="text-white/25 text-xs italic">Full activity tracking arrives in a future module.</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

             <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}>
                <ProjectMembersCard projectId={projectId ?? ""} tasks={tasks} />
              </motion.div>
            </div>

            {/* Tasks Section */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }} className="mt-8">

              {/* Tasks header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <CheckSquare2 size={15} className="text-violet-400" />
                  Tasks
                  <span className="text-white/30 text-xs font-normal ml-1">{totalTasks}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl border border-white/8 overflow-hidden">
                    <button onClick={() => setTaskView('list')}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${taskView === 'list' ? 'bg-white/10 text-white' : 'bg-white/4 text-white/40 hover:text-white'}`}>
                      List
                    </button>
                    <button onClick={() => setTaskView('board')}
                      className={`px-3 py-1.5 text-xs font-medium transition-all ${taskView === 'board' ? 'bg-white/10 text-white' : 'bg-white/4 text-white/40 hover:text-white'}`}>
                      Board
                    </button>
                  </div>
                  <button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all">
                    <Plus size={14} />
                    Add Task
                  </button>
                </div>
              </div>

              {/* Filters — only show in list view */}
              {taskView === 'list' && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/40 transition-all" />
                  </div>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-500/40 transition-all">
                    <option value="" className="bg-zinc-900">All Status</option>
                    <option value="TODO" className="bg-zinc-900">To Do</option>
                    <option value="IN_PROGRESS" className="bg-zinc-900">In Progress</option>
                    <option value="IN_REVIEW" className="bg-zinc-900">In Review</option>
                    <option value="DONE" className="bg-zinc-900">Done</option>
                  </select>
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-500/40 transition-all">
                    <option value="" className="bg-zinc-900">All Priority</option>
                    <option value="LOW" className="bg-zinc-900">Low</option>
                    <option value="MEDIUM" className="bg-zinc-900">Medium</option>
                    <option value="HIGH" className="bg-zinc-900">High</option>
                    <option value="URGENT" className="bg-zinc-900">Urgent</option>
                  </select>
                  {(statusFilter || priorityFilter || taskSearch) && (
                    <button onClick={() => { setStatusFilter(''); setPriorityFilter(''); setTaskSearch(''); }}
                      className="px-3 py-2 rounded-xl text-xs text-white/50 hover:text-white border border-white/8 hover:border-white/20 transition-all">
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Board view */}
              {taskView === 'board' ? (
                <KanbanBoard
                  tasks={tasks}
                  isLoading={tasksLoading}
                  onEdit={(task) => { setEditingTask(task); setTaskModalOpen(true); }}
                  onDelete={setDeleteTaskConfirm}
                  onAddTask={() => { setEditingTask(null); setTaskModalOpen(true); }}
                  onUpdateTask={updateTask}
                />
              ) : tasksLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-white/4 animate-pulse" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-white/8 bg-white/[0.02] text-center">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                    <CheckSquare2 size={18} className="text-violet-400" />
                  </div>
                  <p className="text-white/50 text-sm font-medium mb-1">No tasks yet</p>
                  <p className="text-white/25 text-xs mb-4">Add your first task to get started</p>
                  <button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all">
                    Add Task
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <motion.div key={task.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="group flex flex-wrap md:flex-nowrap items-start md:items-center gap-x-3 gap-y-2 px-4 py-3 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 md:mt-0 ${taskStatusColors[task.status]}`} />
                      <div className="flex-1 min-w-0 basis-full md:basis-auto order-1">
                        <p className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'line-through text-white/40' : 'text-white'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-white/30 text-xs truncate mt-0.5">{task.description}</p>
                        )}
                      </div>
                      {/* Edit/Delete — always visible on mobile (no hover on touch), hover-revealed on desktop */}
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all order-2 ml-auto md:ml-0">
                        <button onClick={() => { setEditingTask(task); setTaskModalOpen(true); }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTaskConfirm(task.id)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {/* Priority/due-date/assignee — wraps to its own row on mobile, stays inline on desktop */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 order-3 md:order-none ${priorityColors[task.priority]}`}>
                        <Flag size={10} className="inline mr-1" />
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-white/30 text-xs flex items-center gap-1 flex-shrink-0 order-3 md:order-none">
                          <Clock size={11} />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-white/30 text-xs flex-shrink-0 order-3 md:order-none">{task.assigneeName ?? 'Unassigned'}</span>
                    </motion.div>
                  ))}
                </div>

              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSave={(payload) => {
          if (editingTask) {
            updateTask({ taskId: editingTask.id, payload });
          } else {
            createTask(payload);
          }
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        isLoading={isCreating || isUpdatingTask}
        task={editingTask}
        projectId={projectId ?? ""}
      />

      {deleteTaskConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">Delete Task?</h3>
            <p className="text-white/50 text-sm mb-6">This task will be permanently removed from the project.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTaskConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/8 text-sm transition-all">
                Cancel
              </button>
              <button onClick={() => { deleteTask(deleteTaskConfirm); setDeleteTaskConfirm(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all">
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      <AskAiModal
        open={askAiOpen}
        onClose={() => setAskAiOpen(false)}
        projectId={projectId ?? ""}
        projectName={project?.name ?? ""}
      />

      {project && (
        <EditProjectModal
          open={editOpen}
          project={project}
          onClose={() => setEditOpen(false)}
          onSave={(payload) => {
            updateProject(payload);
            setEditOpen(false);
          }}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
}