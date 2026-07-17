export interface WorkLog {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  description: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  durationMinutes: number;
  logDate: string;
  running: boolean;
  createdAt: string;
}

export interface ActiveTimer {
  workLogId: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  startedAt: string;
}

export interface CreateManualWorkLogRequest {
  durationMinutes: number;
  logDate: string;
  description?: string;
}

export interface UpdateWorkLogRequest {
  durationMinutes?: number;
  logDate?: string;
  description?: string;
}

export interface TimeSummaryByUser {
  userId: string;
  userName: string;
  totalMinutes: number;
  formatted: string;
}

export interface TimeSummaryByTask {
  taskId: string;
  taskTitle: string;
  totalMinutes: number;
  formatted: string;
}

export interface ProjectTimeSummary {
  totalMinutes: number;
  totalFormatted: string;
  byUser: TimeSummaryByUser[];
  byTask: TimeSummaryByTask[];
}

export interface WorkLogPageResponse {
  content: WorkLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}