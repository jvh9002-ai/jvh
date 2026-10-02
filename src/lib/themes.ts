import type { Role } from '@/types/database';

export interface ThemeConfig {
  name: string;
  primary: string;
  primaryDark: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  gradient: string;
  cardGradient: string;
  fontScale: number;
}

export const themes: Record<Role, ThemeConfig> = {
  parent: {
    name: 'Premium Dashboard',
    primary: '#0f766e',
    primaryDark: '#115e59',
    accent: '#f59e0b',
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    gradient: 'from-teal-600 via-emerald-600 to-teal-700',
    cardGradient: 'from-slate-50 to-teal-50',
    fontScale: 1,
  },
  child: {
    name: 'Fun & Colorful',
    primary: '#ec4899',
    primaryDark: '#db2777',
    accent: '#fbbf24',
    bg: '#fff7ed',
    surface: '#ffffff',
    text: '#1f2937',
    textMuted: '#6b7280',
    gradient: 'from-pink-400 via-orange-400 to-amber-400',
    cardGradient: 'from-pink-50 to-orange-50',
    fontScale: 1.1,
  },
  teen: {
    name: 'Modern & Motivational',
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    accent: '#06b6d4',
    bg: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    gradient: 'from-indigo-500 via-purple-500 to-blue-500',
    cardGradient: 'from-slate-800 to-slate-700',
    fontScale: 1,
  },
  college: {
    name: 'Professional',
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    accent: '#10b981',
    bg: '#f1f5f9',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#475569',
    gradient: 'from-blue-600 via-blue-700 to-sky-700',
    cardGradient: 'from-blue-50 to-slate-50',
    fontScale: 1,
  },
};

export function getTheme(role: Role): ThemeConfig {
  return themes[role];
}
