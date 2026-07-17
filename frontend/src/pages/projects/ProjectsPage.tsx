import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, LayoutGrid, List, Star, FolderOpen, Zap,
  CheckCircle, PauseCircle, MoreHorizontal, Users, CheckSquare,
 Archive, Trash2, ExternalLink,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useOrgStore } from "../../store/orgStore";
import { useProjects } from "../../hooks/useProjects";
import type { Project } from "../../types/project";
import AppHeader from "../../components/layout/AppHeader";

const STATUS_CONFIG = {
  PLANNING:  { label: "Planning",  bg: "bg-violet-500/20", text: "text-violet-300",  dot: "bg-violet-400"  },
  ACTIVE:    { label: "Active",    bg: "bg-emerald-500/20",text: "text-emerald-300", dot: "bg-emerald-400" },
  ON_HOLD:   { label: "On Hold",   bg: "bg-amber-500/20",  text: "text-amber-300",   dot: "bg-amber-400"   },
  COMPLETED: { label: "Completed", bg: "bg-blue-500/20",   text: "text-blue-300",    dot: "bg-blue-400"    },
  CANCELLED: { label: "Cancelled", bg: "bg-red-500/20",    text: "text-red-300",     dot: "bg-red-400"     },
  ARCHIVED:  { label: "Archived",  bg: "bg-zinc-500/20",   text: "text-zinc-400",    dot: "bg-zinc-500"    },
} as const;

const COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#ef4444",
  "#f97316","#eab308","#22c55e","#14b8a6",
  "#3b82f6","#06b6d4","#a855f7","#f43f5e",
];

// ─── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({
  project, onFavorite, onDelete, onArchive, onClick,
}: {
  project: Project;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onClick: (p: Project) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.PLANNING;
  const pct = Math.round(project.completionPercentage);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm
                 hover:border-white/20 hover:bg-white/7 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onClick(project)}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
           style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
               style={{ backgroundColor: project.color + "33", border: `1px solid ${project.color}44` }}>
            <span style={{ color: project.color }}>
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(project.id); }}
              className={`p-1.5 rounded-lg transition-all ${
                project.favorite
                  ? "text-amber-400 bg-amber-400/10"
                  : "text-white/30 hover:text-amber-400 opacity-0 group-hover:opacity-100"
              }`}
            >
              <Star size={13} fill={project.favorite ? "currentColor" : "none"} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-1.5 rounded-lg text-white/30 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <MoreHorizontal size={14} />
              </button>

              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-8 w-44 rounded-xl border border-white/10
                             bg-zinc-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {[
                    { icon: ExternalLink, label: "Open",    action: () => onClick(project),                              danger: false },
                    { icon: Archive,      label: "Archive", action: () => { onArchive(project.id); setMenuOpen(false); }, danger: false },
                    { icon: Trash2,       label: "Delete",  action: () => { onDelete(project.id);  setMenuOpen(false); }, danger: true  },
                  ].map(({ icon: Icon, label, action, danger }) => (
                    <button key={label} onClick={action}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                        danger ? "text-red-400 hover:bg-red-500/10" : "text-white/70 hover:text-white hover:bg-white/8"
                      }`}>
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-white font-semibold text-sm mb-1.5 line-clamp-1">{project.name}</h3>
        <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mb-4 min-h-[2rem]">
          {project.description || "No description yet."}
        </p>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/30 text-xs">Progress</span>
            <span className="text-white/50 text-xs font-medium">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}99)` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white/30 text-xs">
            <span className="flex items-center gap-1"><Users size={11} /> {project.memberCount}</span>
            <span className="flex items-center gap-1"><CheckSquare size={11} /> {project.completedTaskCount}/{project.taskCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Create Project Modal ──────────────────────────────────────────────────────
function CreateProjectModal({
  open, onClose, onCreate, isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; description: string; color: string; visibility: "PUBLIC" | "PRIVATE" }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description, color, visibility });
    setName("");
    setDescription("");
    setColor("#6366f1");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg rounded-2xl border border-white/10
                       bg-zinc-950 shadow-2xl p-6 overflow-y-auto"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">New Project</h2>
                <p className="text-white/40 text-sm mt-0.5">Create a new project workspace</p>
              </div>
              <button onClick={onClose}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Project Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing Website 2026"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                             text-white text-sm placeholder:text-white/20 outline-none
                             focus:border-violet-500/50 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                             text-white text-sm placeholder:text-white/20 outline-none
                             focus:border-violet-500/50 resize-none transition-all"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-lg transition-all hover:scale-110"
                      style={{
                        backgroundColor: c,
                        outline: color === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                      }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["PUBLIC", "PRIVATE"] as const).map((v) => (
                    <button key={v} onClick={() => setVisibility(v)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        visibility === v
                          ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                          : "bg-white/4 border-white/8 text-white/50 hover:text-white"
                      }`}>
                      {v === "PUBLIC" ? "🌐 Public" : "🔒 Private"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/60
                           hover:text-white hover:bg-white/8 text-sm transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit}
                disabled={!name.trim() || isLoading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white
                           disabled:opacity-40 transition-all"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                {isLoading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10" />
        <div className="w-16 h-5 rounded-full bg-white/10" />
      </div>
      <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-3 bg-white/10 rounded w-full mb-1" />
      <div className="h-3 bg-white/10 rounded w-2/3 mb-4" />
      <div className="h-1.5 bg-white/10 rounded-full mb-4" />
      <div className="w-20 h-3 bg-white/10 rounded" />
    </div>
  );
}

// ─── Projects Page ─────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentOrg } = useOrgStore();
  const { projects, stats, isLoading, createProject, isCreating, toggleFavorite, deleteProject, archiveProject } = useProjects();

  const filtered = projects.filter((p: Project) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Toaster position="top-right" toastOptions={{
        style: { background: "#18181b", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" },
      }} />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

     <AppHeader />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-white/40 text-sm mt-1">
              {stats ? `${stats.totalProjects} projects · ${stats.activeProjects} active` : "Loading..."}
            </p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-violet-600 hover:bg-violet-500 text-white transition-all
                       hover:shadow-lg hover:shadow-violet-500/25 self-start">
            <Plus size={15} />
            New Project
          </button>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              { icon: FolderOpen,  label: "Total",     value: stats.totalProjects,     color: "text-violet-400",  bg: "bg-violet-500/10"  },
              { icon: Zap,         label: "Active",    value: stats.activeProjects,    color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { icon: CheckCircle, label: "Completed", value: stats.completedProjects, color: "text-blue-400",    bg: "bg-blue-500/10"    },
              { icon: PauseCircle, label: "On Hold",   value: stats.onHoldProjects,    color: "text-amber-400",   bg: "bg-amber-500/10"   },
              { icon: Star,        label: "Favorites", value: stats.favoriteProjects,  color: "text-pink-400",    bg: "bg-pink-500/10"    },
{ icon: Archive,     label: "Archived",  value: stats.archivedProjects,  color: "text-zinc-400",    bg: "bg-zinc-500/10"    },
            ].map(({ icon: Icon, label, value, color, bg }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-white/8 bg-white/4 p-4">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={15} className={color} />
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
                <div className="text-white/40 text-xs">{label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Search + View */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5
                         text-sm text-white placeholder:text-white/25 outline-none
                         focus:border-violet-500/40 transition-all" />
          </div>
          <div className="flex rounded-xl border border-white/8 overflow-hidden">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`p-2.5 transition-all ${
                  view === v ? "bg-white/10 text-white" : "bg-white/4 text-white/40 hover:text-white"
                }`}>
                {v === "grid" ? <LayoutGrid size={15} /> : <List size={15} />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20
                            flex items-center justify-center mb-5">
              <FolderOpen size={28} className="text-violet-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No projects yet</h3>
            <p className="text-white/40 text-sm max-w-xs mb-6">
              Create your first project to start organizing your work.
            </p>
            <button onClick={() => setModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500
                         text-white text-sm font-semibold transition-all">
              Create your first project
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div layout
              className={view === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"}>
              {filtered.map((project: Project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onFavorite={toggleFavorite}
                  onDelete={(id) => setDeleteConfirm(id)}
                  onArchive={(id: string) => archiveProject(id)}
                  onClick={(p: Project) => navigate(`/projects/${p.id}`)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {deleteConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
       style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
      <h3 className="text-white font-semibold text-lg mb-2">Delete Project?</h3>
      <p className="text-white/50 text-sm mb-6">
        This action cannot be undone. The project and all its data will be permanently deleted.
      </p>
      <div className="flex gap-3">
        <button onClick={() => setDeleteConfirm(null)}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60
                     hover:text-white hover:bg-white/8 text-sm transition-all">
          Cancel
        </button>
        <button onClick={() => { deleteProject(deleteConfirm); setDeleteConfirm(null); }}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600
                     text-white text-sm font-semibold transition-all">
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createProject}
        isLoading={isCreating}
      />
    </div>
  );
}