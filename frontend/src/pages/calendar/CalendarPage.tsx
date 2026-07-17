import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  format,
} from "date-fns";
import { CalendarDays, AlertCircle } from "lucide-react";
import { useCalendarTasks } from "../../hooks/useCalendarTasks";
import { useProjects } from "../../hooks/useProjects";
import CalendarHeader from "../../components/calendar/CalendarHeader";
import CalendarFilters from "../../components/calendar/CalendarFilters";
import MonthView from "../../components/calendar/MonthView";
import WeekView from "../../components/calendar/WeekView";
import DayView from "../../components/calendar/DayView";
import ProjectPickerModal from "../../components/calendar/ProjectPickerModal";
import CalendarTaskModalWrapper from "../../components/calendar/CalendarTaskModalWrapper";
import AppHeader from "../../components/layout/AppHeader";
import type { CalendarTask, CalendarFilters as Filters } from "../../types/calendar";
import type { Task } from "../../types/task";

type ViewMode = "month" | "week" | "day";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [filters, setFilters] = useState<Filters>({ includeCompleted: true });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [taskModalProjectId, setTaskModalProjectId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { projects } = useProjects();

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (viewMode === "month") {
      return { rangeStart: startOfWeek(startOfMonth(currentDate)), rangeEnd: endOfWeek(endOfMonth(currentDate)) };
    }
    if (viewMode === "week") {
      return { rangeStart: startOfWeek(currentDate), rangeEnd: endOfWeek(currentDate) };
    }
    return { rangeStart: currentDate, rangeEnd: currentDate };
  }, [currentDate, viewMode]);

  const { tasks, isLoading, error, invalidateCalendar } = useCalendarTasks(
    format(rangeStart, "yyyy-MM-dd"),
    format(rangeEnd, "yyyy-MM-dd"),
    filters
  );

  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate((d) => subMonths(d, 1));
    else if (viewMode === "week") setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subDays(d, 1));
  };

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate((d) => addMonths(d, 1));
    else if (viewMode === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addDays(d, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDateClick = (date: Date) => {
    setPendingDate(format(date, "yyyy-MM-dd"));
    setPickerOpen(true);
  };

  const handleNewTaskClick = () => {
    setPendingDate(format(new Date(), "yyyy-MM-dd"));
    setPickerOpen(true);
  };

  const handleProjectSelected = (projectId: string) => {
    setPickerOpen(false);
    setTaskModalProjectId(projectId);
    setEditingTask(null);
  };

  const handleTaskClick = (calTask: CalendarTask) => {
    const asTask: Task = {
      id: calTask.id,
      projectId: calTask.projectId,
      title: calTask.title,
      description: null,
      status: calTask.status as Task["status"],
      priority: calTask.priority as Task["priority"],
      dueDate: calTask.dueDate,
      assigneeId: calTask.assigneeId,
      assigneeName: calTask.assigneeName,
      createdBy: "",
      createdAt: "",
      updatedAt: "",
      position: 0,
      completedAt: null,
    };
    setTaskModalProjectId(calTask.projectId);
    setEditingTask(asTask);
  };

  const closeTaskModal = () => {
    setTaskModalProjectId(null);
    setEditingTask(null);
    setPendingDate(null);
    invalidateCalendar();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <AppHeader />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onNewTask={handleNewTaskClick}
        />

        <CalendarFilters filters={filters} onChange={setFilters} projects={projects} tasks={tasks} />

        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-white/8 bg-white/[0.02]">
            <AlertCircle size={24} className="text-red-400 mb-3" />
            <p className="text-white/50 text-sm mb-1">Couldn't load calendar tasks</p>
            <p className="text-white/25 text-xs">Please try refreshing the page</p>
          </div>
        ) : isLoading ? (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 min-h-[400px] animate-pulse" />
        ) : viewMode === "month" ? (
          <MonthView currentDate={currentDate} tasks={tasks} onTaskClick={handleTaskClick} onDateClick={handleDateClick} />
        ) : viewMode === "week" ? (
          <WeekView currentDate={currentDate} tasks={tasks} onTaskClick={handleTaskClick} onDateClick={handleDateClick} />
        ) : (
          <DayView currentDate={currentDate} tasks={tasks} onTaskClick={handleTaskClick} onDateClick={handleDateClick} />
        )}
      </div>

      <ProjectPickerModal
        open={pickerOpen}
        projects={projects}
        onSelect={handleProjectSelected}
        onClose={() => setPickerOpen(false)}
      />

      {taskModalProjectId && (
        <CalendarTaskModalWrapper
          projectId={taskModalProjectId}
          task={editingTask}
          prefillDate={pendingDate ?? undefined}
          onClose={closeTaskModal}
        />
      )}
    </div>
  );
}