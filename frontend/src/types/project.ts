// ─── TypeScript Teaching ───────────────────────────────────────────
// "interface" = defines the shape of an object (like a blueprint)
// In JavaScript you'd just use a plain object with no type safety
// In TypeScript, if you forget a field or use wrong type → compile error!
// Interview tip: "TypeScript interfaces catch bugs at compile time, not runtime"

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description: string | null;   // "string | null" = can be string OR null
  slug: string;
  color: string;
  iconUrl: string | null;
  coverUrl: string | null;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  startDate: string | null;
  dueDate: string | null;
  createdBy: string;
  ownedBy: string;
  pinned: boolean;
  favorite: boolean;
  template: boolean;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  completionPercentage: number;
  createdAt: string ;
  updatedAt: string ;
}

// "type" keyword = alias for a union of string literals
// Much safer than plain strings — only these exact values allowed
export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type ProjectVisibility = 'PUBLIC' | 'PRIVATE' | 'SECRET';

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  archivedProjects: number;
  favoriteProjects: number;
  averageCompletion: number;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  startDate?: string;
  dueDate?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}