export type TaskAiActionType =
  | 'SUMMARIZE'
  | 'WHAT_CHANGED'
  | 'SUGGEST_NEXT_STEPS'
  | 'IMPROVE_DESCRIPTION'
  | 'SUGGEST_SUBTASKS'
  | 'FREEFORM';

export interface AiSuggestion {
  type: string; // "TITLE" | "DESCRIPTION" | "PRIORITY" | "SUBTASKS"
  currentValue: string;
  suggestedValue: string;
  applicable: boolean;
}

export interface AiSourceStats {
  taskCount: number;
  commentCount: number;
  activityCount: number;
}

export interface AiAnswerResponse {
  answer: string;
  suggestions: AiSuggestion[];
  sourceStats: AiSourceStats;
  disclaimer: string;
}