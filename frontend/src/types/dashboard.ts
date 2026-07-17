export interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  archivedProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  teamMembers: number;
  myAssignedTasks: number;
}

export interface MyTask {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  status: string;
  priority: string;
  dueDate: string | null;
  overdue: boolean;
}

export interface UpcomingDeadline {
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  dueDate: string;
}

export interface ProjectProgress {
  id: string;
  name: string;
  color: string;
  status: string;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  completionPercentage: number;
  dueDate: string | null;
}

export interface ActivityItem {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface TodaysFocus {
  dueToday: UpcomingDeadline[];
  inReview: UpcomingDeadline[];
  overdue: UpcomingDeadline[];
}