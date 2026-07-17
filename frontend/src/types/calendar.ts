export interface CalendarTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  overdue: boolean;
  dueToday: boolean;
  projectId: string;
  projectName: string;
  projectColor: string;
  assigneeId: string | null;
  assigneeName: string | null;
}

export interface CalendarFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  mineOnly?: boolean;
  includeCompleted?: boolean;
}
