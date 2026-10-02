import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/Sidebar';
import { Card, ProgressBar, Badge, Button, ScoreRing } from '@/components/ui';
import { computeGrowthScores, overallScore } from '@/lib/growth';
import type { Task, Goal } from '@/types/database';
import { Briefcase, TrendingUp, CheckCircle, Circle, Target, Award, Sparkles, FileText, Calendar } from 'lucide-react';

export function CollegeDashboard() {
  const { activeMember } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeMember) return;
    Promise.all([
      supabase.from('tasks').select('*').eq('member_id', activeMember.id).order('created_at', { ascending: false }),
      supabase.from('goals').select('*').eq('member_id', activeMember.id).order('created_at', { ascending: false }),
    ]).then(([t, g]) => {
      setTasks((t.data as Task[]) || []);
      setGoals((g.data as Goal[]) || []);
      setLoading(false);
    });
  }, [activeMember]);

  if (!activeMember) return null;
  const m = activeMember;
  const scores = computeGrowthScores(tasks);
  const score = overallScore(scores);
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending');

  const completeTask = async (task: Task) => {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', task.id);
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: 'completed' } : t)));
    await supabase.from('members').update({ points: m.points + task.points }).eq('id', m.id);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title={`${m.name}'s Dashboard`} subtitle="Career & Skill Development" />

      <div className="px-5 lg:px-8 pb-8 space-y-6">
        {/* Hero */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-sky-700 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Growth Score</p>
              <p className="text-4xl font-bold mt-1">{score}%</p>
              <p className="text-blue-100 text-sm mt-2">{completed} tasks completed · {pending.length} pending</p>
            </div>
            <div className="hidden sm:block">
              <Briefcase className="text-white/30" size={64} />
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <Target className="text-blue-600" size={20} />
            <p className="text-2xl font-bold text-gray-900 mt-2">{goals.length}</p>
            <p className="text-xs text-gray-500">Career Goals</p>
          </Card>
          <Card className="p-5">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-2xl font-bold text-gray-900 mt-2">{completed}</p>
            <p className="text-xs text-gray-500">Tasks Done</p>
          </Card>
          <Card className="p-5">
            <TrendingUp className="text-blue-600" size={20} />
            <p className="text-2xl font-bold text-gray-900 mt-2">{scores.skills}%</p>
            <p className="text-xs text-gray-500">Skills Score</p>
          </Card>
          <Card className="p-5">
            <Award className="text-amber-600" size={20} />
            <p className="text-2xl font-bold text-gray-900 mt-2">{m.points}</p>
            <p className="text-xs text-gray-500">Total Points</p>
          </Card>
        </div>

        {/* Career roadmap */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-600" size={20} />
            <h3 className="font-bold text-gray-900">Career Roadmap</h3>
          </div>
          {goals.length === 0 && !loading ? (
            <p className="text-gray-400 text-sm">No goals yet. Create your career roadmap to start tracking progress.</p>
          ) : (
            <div className="space-y-4">
              {goals.map((g, i) => (
                <div key={g.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${g.progress >= 100 ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-700'}`}>
                      {i + 1}
                    </div>
                    {i < goals.length - 1 && <div className="w-0.5 h-full bg-gray-200 flex-1 min-h-[20px]" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="font-semibold text-gray-900">{g.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{g.category}</p>
                    <div className="mt-2"><ProgressBar value={g.progress} color="bg-blue-600" /></div>
                    {g.target_date && <p className="text-xs text-gray-400 mt-1">Target: {g.target_date}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Score breakdown */}
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Growth Score Breakdown</h3>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ScoreRing value={score} size={100} label="Overall" color="#2563eb" />
            <div className="flex-1 w-full space-y-2.5">
              {Object.entries(scores).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 capitalize w-24">{k}</span>
                  <div className="flex-1"><ProgressBar value={v} color="bg-blue-600" /></div>
                  <span className="font-semibold text-gray-900 w-10 text-right">{v}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Current Tasks</h2>
            <Button onClick={() => navigate('/tasks')} variant="secondary" className="text-xs">Manage All</Button>
          </div>
          <div className="space-y-2">
            {pending.slice(0, 5).map((task) => (
              <Card key={task.id} className="p-3 flex items-center gap-3">
                <button onClick={() => completeTask(task)} className="w-7 h-7 rounded-full border-2 border-blue-300 hover:bg-blue-50 flex items-center justify-center shrink-0">
                  <Circle className="text-blue-300" size={14} />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{task.category}</p>
                </div>
                <Badge color="bg-blue-50 text-blue-700">+{task.points} pts</Badge>
              </Card>
            ))}
            {pending.length === 0 && !loading && (
              <Card className="p-5 text-center">
                <p className="text-gray-400 text-sm">No pending tasks. Great productivity!</p>
              </Card>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Sparkles, label: 'AI Coach', to: '/coach', color: 'bg-blue-50 text-blue-600' },
            { icon: FileText, label: 'Report', to: '/report', color: 'bg-slate-50 text-slate-600' },
            { icon: Award, label: 'Rewards', to: '/rewards', color: 'bg-amber-50 text-amber-600' },
          ].map((a) => (
            <Card key={a.label} className="p-4 flex flex-col items-center gap-2" onClick={() => navigate(a.to)}>
              <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center`}>
                <a.icon size={20} />
              </div>
              <span className="text-xs font-medium text-gray-700">{a.label}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
