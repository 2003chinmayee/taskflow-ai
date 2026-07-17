import { Search, X } from "lucide-react";
import type { CalendarFilters as Filters } from "../../types/calendar";
import type { CalendarTask } from "../../types/calendar";

interface Project {
  id: string;
  name: string;
}

interface CalendarFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  projects: Project[];
  tasks: CalendarTask[];
}

export default function CalendarFilters({ filters, onChange, projects, tasks }: CalendarFiltersProps) {
  const assignees = Array.from(
    new Map(
      tasks
        .filter((t) => t.assigneeId && t.assigneeName)
        .map((t) => [t.assigneeId, t.assigneeName])
    ).entries()
  );

  const hasActiveFilters = filters.projectId || filters.status || filters.priority ||
    filters.assigneeId || filters.mineOnly || filters.includeCompleted === false;

  const clearAll = () => onChange({ includeCompleted: true });

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <select
        value={filters.projectId ?? ""}
        onChange={(e) => onChange({ ...filters, projectId: e.target.value || undefined })}
        className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-500/40 transition-all"
      >
        <option value="" className="bg-zinc-900">All Projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>
        ))}
      </select>

      <select
        value={filters.status ?? ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
        className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-500/40 transition-all"
      >
        <option value="" className="bg-zinc-900">All Status</option>
        <option value="TODO" className="bg-zinc-900">To Do</option>
        <option value="IN_PROGRESS" className="bg-zinc-900">In Progress</option>
        <option value="IN_REVIEW" className="bg-zinc-900">In Review</option>
        <option value="DONE" className="bg-zinc-900">Done</option>
      </select>

      <select
        value={filters.priority ?? ""}
        onChange={(e) => onChange({ ...filters, priority: e.target.value || undefined })}
        className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-500/40 transition-all"
      >
        <option value="" className="bg-zinc-900">All Priority</option>
        <option value="LOW" className="bg-zinc-900">Low</option>
        <option value="MEDIUM" className="bg-zinc-900">Medium</option>
        <option value="HIGH" className="bg-zinc-900">High</option>
        <option value="URGENT" className="bg-zinc-900">Urgent</option>
      </select>

      {assignees.length > 0 && (
        <select
          value={filters.assigneeId ?? ""}
          onChange={(e) => onChange({ ...filters, assigneeId: e.target.value || undefined })}
          className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-500/40 transition-all"
        >
          <option value="" className="bg-zinc-900">All Assignees</option>
          {assignees.map(([id, name]) => (
            <option key={id} value={id ?? ""} className="bg-zinc-900">{name}</option>
          ))}
        </select>
      )}

      <button
        onClick={() => onChange({ ...filters, mineOnly: !filters.mineOnly })}
        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
          filters.mineOnly
            ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
            : "bg-white/5 border-white/8 text-white/50 hover:text-white"
        }`}
      >
        My tasks only
      </button>

      <button
        onClick={() => onChange({ ...filters, includeCompleted: filters.includeCompleted === false })}
        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
          filters.includeCompleted === false
            ? "bg-white/5 border-white/8 text-white/50 hover:text-white"
            : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
        }`}
      >
        {filters.includeCompleted === false ? "Show completed" : "Hide completed"}
      </button>

      {hasActiveFilters && (
        <button onClick={clearAll}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-white/50 hover:text-white border border-white/8 hover:border-white/20 transition-all">
          <X size={12} />
          Clear filters
        </button>
      )}
    </div>
  );
}