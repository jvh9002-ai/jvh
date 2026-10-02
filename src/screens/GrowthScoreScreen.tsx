import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/Sidebar';
import { Card, ScoreRing, ProgressBar, Badge } from '@/components/ui';
import { computeGrowthScores, overallScore } from '@/lib/growth';
import type { Task, GrowthScores } from '@/types/database';
import { TrendingUp, Award, Star } from 'lucide-react';

const scoreMeta: Record<keyof GrowthScores, { emoji: string; color: string; desc: string }> = {
  learning: { emoji: '📚', color: '#0d9488', desc: 'Study habits and knowledge growth' },
  health: { emoji: '💪', color: '#eab308', desc: 'Physical activity and wellness' },
  discipline: { emoji: '🎯', color: '#3b82f6', desc: 'Consistency and daily habits' },
  skills: { emoji: '🛠️', color: '#8b5cf6', desc: 'Skill-building and practice' },
  confidence: { emoji: '✨', color: '#ec4899', desc: 'Personal growth and creativity' },
};

export function GrowthScoreScreen() {
  const { activeMember, members } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [allScores, setAllScores] = useState<Record<string, { scores: GrowthScores; tasks: Task[] }>>({});

  useEffect(() => {
    if (!activeMember) return;
    setLoading(true);
    supabase.from('tasks').select('*').eq('member_id', activeMember.id).order('created_at', { ascending: false })
      .then(({ data }) => { setTasks((data as Task[]) || []); setLoading(false); });
  }, [activeMember]);

  useEffect(() => {
    members.forEach(async (m) => {
      const { data } = await supabase.from('tasks').select('*').eq('member_id', m.id);
      const t = (data as Task[]) || [];
      setAllScores((prev) => ({ ...prev, [m.id]: { scores: computeGrowthScores(t), tasks: t } }));
    });
  }, [members]);

  if (!activeMember) return null;
  const scores = computeGrowthScores(tasks);
  const score = overallScore(scores);
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const total = tasks.length;

  return (
    <div className="min-h-screen">
      <TopBar title="Growth Score" subtitle={`${activeMember.name}'s growth across all areas`} />

      <div className="px-5 lg:px-8 pb-8 space-y-6">
        {/* Overall score */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex flex-col items-center">
              <ScoreRing value={score} size={130} label="Overall" color="#0d9488" />
              <p className="text-2xl font-bold text-gray-900 mt-3">{score}%</p>
              <Badge color="bg-teal-50 text-teal-700 mt-1">{completed}/{total} tasks completed</Badge>
            </div>
            <div className="flex-1 w-full space-y-3">
              {(Object.keys(scoreMeta) as (keyof GrowthScores)[]).map((key) => {
                const meta = scoreMeta[key];
                const val = scores[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-2xl w-8 text-center">{meta.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 capitalize">{key}</span>
                        <span className="font-bold text-gray-900">{val}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${val}%`, backgroundColor: meta.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Category details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(scoreMeta) as (keyof GrowthScores)[]).map((key) => {
            const meta = scoreMeta[key];
            const val = scores[key];
            const catTasks = tasks.filter((t) => {
              const map: Record<string, string> = { kindness: 'discipline', creativity: 'confidence', family: 'discipline', career: 'skills', personal: 'confidence' };
              return (map[t.category] ?? t.category) === key;
            });
            const catDone = catTasks.filter((t) => t.status === 'completed').length;
            return (
              <Card key={key} className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{meta.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 capitalize">{key}</h3>
                    <p className="text-xs text-gray-500">{meta.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreRing value={val} size={56} color={meta.color} />
                  <div className="text-sm text-gray-600">
                    <p><span className="font-bold text-gray-900">{catDone}</span> completed</p>
                    <p className="text-gray-400">{catTasks.length} total tasks</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Level progress */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-amber-500" size={24} />
            <div>
              <h3 className="font-bold text-gray-900">Level: {activeMember.level_name}</h3>
              <p className="text-xs text-gray-500">{activeMember.points} total points</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Star className="text-amber-400" size={20} />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Beginner</span>
                <span className="text-gray-500">Explorer</span>
                <span className="text-gray-500">Achiever</span>
                <span className="text-gray-500">Champion</span>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, (activeMember.points / 500) * 100)}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-amber-500 shadow transition-all"
                  style={{ left: `calc(${Math.min(100, (activeMember.points / 500) * 100)}% - 10px)` }}
                />
              </div>
            </div>
            <TrendingUp className="text-teal-500" size={20} />
          </div>
        </Card>
      </div>
    </div>
  );
}
