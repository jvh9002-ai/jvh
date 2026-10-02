export type Role = 'parent' | 'child' | 'teen' | 'college';

export type TaskCategory =
  | 'learning'
  | 'health'
  | 'discipline'
  | 'kindness'
  | 'creativity'
  | 'skills'
  | 'career'
  | 'family'
  | 'personal';

export type TaskStatus = 'pending' | 'completed';

export type LevelName = 'Beginner' | 'Explorer' | 'Achiever' | 'Champion';

export interface Family {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Member {
  id: string;
  family_id: string;
  name: string;
  role: Role;
  age: number;
  avatar_emoji: string;
  points: number;
  level_name: LevelName;
  created_at: string;
}

export interface Task {
  id: string;
  member_id: string;
  title: string;
  category: TaskCategory;
  points: number;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  member_id: string;
  title: string;
  category: string;
  progress: number;
  target_date: string | null;
  created_at: string;
}

export interface Reward {
  id: string;
  family_id: string;
  member_id: string | null;
  title: string;
  points_required: number;
  redeemed: boolean;
  created_at: string;
}

export interface GrowthScores {
  learning: number;
  health: number;
  discipline: number;
  skills: number;
  confidence: number;
}

export interface GrowthReport {
  id: string;
  member_id: string;
  week_start: string;
  scores: GrowthScores;
  summary: string;
  recommendations: string;
  created_at: string;
}

export interface AiMessage {
  id: string;
  family_id: string;
  member_id: string | null;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
