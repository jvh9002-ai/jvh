import type { Task, Member, GrowthScores } from '@/types/database';

export function computeGrowthScores(tasks: Task[]): GrowthScores {
  const categories = ['learning', 'health', 'discipline', 'skills', 'confidence'] as const;
  const totals: Record<string, { done: number; total: number }> = {};
  categories.forEach((c) => (totals[c] = { done: 0, total: 0 }));

  tasks.forEach((t) => {
    const key = t.category;
    if (key in totals) {
      totals[key].total += 1;
      if (t.status === 'completed') totals[key].done += 1;
    } else {
      // map creativity/kindness/family/career/personal into closest bucket
      const map: Record<string, string> = {
        kindness: 'discipline',
        creativity: 'confidence',
        family: 'discipline',
        career: 'skills',
        personal: 'confidence',
      };
      const bucket = map[key] ?? 'learning';
      totals[bucket].total += 1;
      if (t.status === 'completed') totals[bucket].done += 1;
    }
  });

  const pct = (d: number, t: number) => (t === 0 ? 0 : Math.round((d / t) * 100));

  return {
    learning: pct(totals.learning.done, totals.learning.total),
    health: pct(totals.health.done, totals.health.total),
    discipline: pct(totals.discipline.done, totals.discipline.total),
    skills: pct(totals.skills.done, totals.skills.total),
    confidence: pct(totals.confidence.done, totals.confidence.total),
  };
}

export function overallScore(scores: GrowthScores): number {
  return Math.round(
    (scores.learning + scores.health + scores.discipline + scores.skills + scores.confidence) / 5
  );
}

export function levelFromPoints(points: number): Member['level_name'] {
  if (points >= 500) return 'Champion';
  if (points >= 200) return 'Achiever';
  if (points >= 50) return 'Explorer';
  return 'Beginner';
}

export function nextLevelThreshold(points: number): number {
  if (points < 50) return 50;
  if (points < 200) return 200;
  if (points < 500) return 500;
  return 1000;
}

export function levelProgress(points: number): number {
  if (points < 50) return (points / 50) * 100;
  if (points < 200) return ((points - 50) / 150) * 100;
  if (points < 500) return ((points - 200) / 300) * 100;
  return Math.min(100, ((points - 500) / 500) * 100);
}
