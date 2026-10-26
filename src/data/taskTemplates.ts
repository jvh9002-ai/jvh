export interface TaskTemplate {
  id: string;
  title: string;
  category: any;
  points: number;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'morning-routine',
    title: 'Morning Routine',
    category: 'discipline',
    points: 10,
  },
  {
    id: 'exercise',
    title: 'Exercise',
    category: 'health',
    points: 10,
  },
  {
    id: 'study',
    title: 'Study Time',
    category: 'learning',
    points: 15,
  },
];
