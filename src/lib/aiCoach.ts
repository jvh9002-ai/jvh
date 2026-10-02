import type { Task, Member, GrowthScores } from '@/types/database';
import { computeGrowthScores, overallScore } from './growth';

interface CoachContext {
  member: Member;
  tasks: Task[];
  scores: GrowthScores;
  totalPoints: number;
}

function weakestAreas(scores: GrowthScores): string[] {
  return Object.entries(scores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([k]) => k);
}

function strongestAreas(scores: GrowthScores): string[] {
  return Object.entries(scores)
    .filter((e) => e[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k);
}

const parentAdvice = [
  'Consistency matters more than intensity. Small daily tasks build stronger habits than occasional big pushes.',
  'Praise effort, not just results. Recognizing when your child tries hard builds resilience.',
  'Let your child choose one task themselves each week — autonomy boosts motivation.',
  'Connect tasks to real-life outcomes so children see the purpose, not just the points.',
  'Balance learning tasks with health and kindness to raise well-rounded kids.',
];

const childPraise = [
  'Amazing work! Every mission you complete makes you stronger and smarter!',
  'You are leveling up! Keep going to unlock awesome rewards!',
  'Fantastic job! Your family is proud of you!',
  'You are becoming a Champion! Keep completing your daily missions!',
];

const teenMotivation = [
  'Discipline now means freedom later. Every task you finish is an investment in your future self.',
  'Track your skills consistently — what gets measured gets improved.',
  'Break big goals into weekly chunks. Progress compounds faster than you think.',
  'Your confidence grows every time you follow through on a commitment to yourself.',
];

const collegeGuidance = [
  'Build projects alongside your coursework. Employers hire demonstrated skills, not just transcripts.',
  'Networking is a skill. Reach out to one professional in your field this week.',
  'Treat your career roadmap as a living document. Review and adjust monthly.',
  'Ship something publicly every month — a blog post, a repo, a project. Visibility creates opportunity.',
];

export function generateCoachResponse(
  message: string,
  ctx: CoachContext,
  role: Member['role']
): string {
  const lower = message.toLowerCase();
  const score = overallScore(ctx.scores);
  const weak = weakestAreas(ctx.scores);
  const strong = strongestAreas(ctx.scores);
  const completedToday = ctx.tasks.filter((t) => t.status === 'completed').length;
  const pending = ctx.tasks.filter((t) => t.status === 'pending').length;

  if (role === 'parent') {
    if (lower.includes('suggest') || lower.includes('advice') || lower.includes('help')) {
      const tip = parentAdvice[Math.floor(Math.random() * parentAdvice.length)];
      const childName = ctx.member.name;
      const weakStr = weak.join(' and ');
      return `${tip}\n\nBased on ${childName}'s recent activity, focus areas are ${weakStr}. Their overall growth score is ${score}%. ${completedToday} tasks completed, ${pending} still pending this period.`;
    }
    if (lower.includes('progress') || lower.includes('report')) {
      return `${ctx.member.name}'s growth score is ${score}%. Strongest areas: ${strong.join(', ') || 'still building'}. Areas to improve: ${weak.join(', ')}. ${completedToday} of ${ctx.tasks.length} tasks completed. I recommend adding more ${weak[0]} tasks next week.`;
    }
    return `Here's a parenting insight: ${parentAdvice[0]}\n\n${ctx.member.name} currently has ${ctx.totalPoints} points and a growth score of ${score}%. Ask me for suggestions, progress analysis, or improvement ideas!`;
  }

  if (role === 'child') {
    if (lower.includes('reward') || lower.includes('points')) {
      return `You have ${ctx.totalPoints} points! Complete more missions to earn rewards. You are a ${ctx.member.level_name} — keep going to level up!`;
    }
    const praise = childPraise[Math.floor(Math.random() * childPraise.length)];
    return `${praise}\n\nYou have completed ${completedToday} missions and have ${pending} left. Your growth score is ${score}%!`;
  }

  if (role === 'teen') {
    if (lower.includes('goal') || lower.includes('plan')) {
      return `Let's break your goals into weekly milestones. Focus on ${weak[0]} this week — it's your lowest area at ${ctx.scores[weak[0] as keyof GrowthScores]}%. Add 3 small tasks in that category and track daily.\n\nYour overall growth score is ${score}%. You're doing best in ${strong.join(' and ') || 'building momentum'}.`;
    }
    if (lower.includes('career') || lower.includes('skill')) {
      return `For career prep: pick one skill to deepen this month, build one project around it, and share it publicly. Your skills score is ${ctx.scores.skills}% and confidence is ${ctx.scores.confidence}%. Both grow through consistent action.`;
    }
    const motiv = teenMotivation[Math.floor(Math.random() * teenMotivation.length)];
    return `${motiv}\n\nYour current growth score is ${score}%. ${completedToday} tasks done, ${pending} pending. Focus on ${weak[0]} to level up faster.`;
  }

  // college
  if (lower.includes('career') || lower.includes('job') || lower.includes('internship')) {
    return `Career action plan: (1) Update your resume with your latest ${strong[0] ?? 'skill'} projects. (2) Apply to 3 internships this week. (3) Connect with 2 alumni in your target field. Your skills score is ${ctx.scores.skills}% — strong${ctx.scores.skills > 60 ? '' : ', but needs work'}.`;
  }
  if (lower.includes('roadmap') || lower.includes('plan')) {
    return `Here's a 3-month roadmap based on your profile:\n• Month 1: Strengthen ${weak[0]} fundamentals — add daily tasks\n• Month 2: Build a portfolio project applying ${strong[0] ?? 'your top skill'}\n• Month 3: Network and apply — target 5 connections and 10 applications\n\nCurrent growth score: ${score}%. ${completedToday} tasks completed this period.`;
  }
  const guide = collegeGuidance[Math.floor(Math.random() * collegeGuidance.length)];
  return `${guide}\n\nYour growth score is ${score}%. Skills: ${ctx.scores.skills}%, Confidence: ${ctx.scores.confidence}%. ${completedToday}/${ctx.tasks.length} tasks done.`;
}

export function generateWeeklyReport(ctx: CoachContext, role: Member['role']): {
  summary: string;
  recommendations: string;
} {
  const score = overallScore(ctx.scores);
  const weak = weakestAreas(ctx.scores);
  const strong = strongestAreas(ctx.scores);
  const completed = ctx.tasks.filter((t) => t.status === 'completed').length;
  const total = ctx.tasks.length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const summary = `${ctx.member.name} completed ${completed} of ${total} tasks this week (${completionRate}% completion rate). Overall growth score: ${score}%. Strongest areas: ${strong.join(', ') || 'building baseline'}. Areas needing attention: ${weak.join(', ')}. Total points earned: ${ctx.totalPoints}.`;

  const recs: Record<Member['role'], string> = {
    parent: `Next week: (1) Add 2 more ${weak[0]} tasks for ${ctx.member.name}. (2) Celebrate the ${strong[0] ?? 'progress'} achievement to reinforce good habits. (3) Consider a family activity that combines learning and bonding. (4) Review and adjust point values to keep tasks motivating.`,
    child: `Next week goals: (1) Complete ${Math.max(3, total - completed + 3)} missions to level up! (2) Try a new ${weak[0]} activity — it will be fun! (3) Keep up the great work in ${strong[0] ?? 'everything'}! (4) Ask your parent about a new reward to work toward!`,
    teen: `Next week: (1) Set 1 specific goal in ${weak[0]} and break it into 3 tasks. (2) Maintain your ${strong[0] ?? 'current'} streak. (3) Spend 20 minutes daily on skill-building. (4) Track your time to identify where you can be more efficient.`,
    college: `Next week: (1) Add a ${weak[0]} task to your weekly plan — aim for 80%+ there. (2) Leverage your ${strong[0] ?? 'top'} strength in a project or application. (3) Schedule one networking coffee/chat. (4) Update your resume with this week's accomplishments.`,
  };

  return { summary, recommendations: recs[role] };
}

export function buildCoachContext(member: Member, tasks: Task[]): CoachContext {
  const scores = computeGrowthScores(tasks);
  return {
    member,
    tasks,
    scores,
    totalPoints: member.points,
  };
}
