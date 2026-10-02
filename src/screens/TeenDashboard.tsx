import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/Sidebar';
import { Card, ProgressBar, Badge, Button, ScoreRing } from '@/components/ui';
import { computeGrowthScores, overallScore } from '@/lib/growth';
import type { Task, Goal } from '@/types/database';
import { Flame, Target, TrendingUp, CheckCircle, Circle, Zap, Award, Sparkles, Briefcase, Clock } from 'lucide-react';

export function TeenDashboard() {
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-blue-600/30 pointer-events-none" />
      <div className="relative">
        <div className="px-5 lg:px-8 py-4 lg:py-6">
          <h1 className="text-xl lg:text-2xl font-bold text-white">What's good, {m.name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Let's make today count.</p>
        </div>

        <div className="px-5 lg:px-8 pb-8 space-y-5">
          {/* Hero stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4 bg-slate-900 border-slate-800">
              <Flame className="text-orange-400" size={20} />
              <p className="text-2xl font-bold text-white mt-2">{m.points}</p>
              <p className="text-xs text-slate-400">Total Points</p>
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
              <Zap className="text-indigo-400" size={20} />
              <p className="text-2xl font-bold text-white mt-2">{completed}</p>
              <p className="text-xs text-slate-400">Completed</p>
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
              <Target className="text-cyan-400" size={20} />
              <p className="text-2xl font-bold text-white mt-2">{goals.length}</p>
              <p className="text-xs text-slate-400">Active Goals</p>
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
              <TrendingUp className="text-emerald-400" size={20} />
              <p className="text-2xl font-bold text-white mt-2">{score}%</p>
              <p className="text-xs text-slate-400">Growth Score</p>
            </Card>
          </div>

          {/* Growth breakdown */}
          <Card className="p-5 bg-slate-900 border-slate-800">
            <h3 className="font-bold text-white mb-4">Growth Breakdown</h3>
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <ScoreRing value={score} size={100} label="Overall" color="#6366f1" />
              <div className="flex-1 w-full space-y-2.5">
                {Object.entries(scores).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400 capitalize w-24">{k}</span>
                    <div className="flex-1"><ProgressBar value={v} color="bg-indigo-500" className="bg-slate-800" /></div>
                    <span className="font-semibold text-white w-10 text-right">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Personal Goals</h2>
              <Button onClick={() => navigate('/tasks')} variant="ghost" className="text-indigo-400 text-xs">Manage</Button>
            </div>
            <div className="space-y-3">
              {goals.length === 0 && !loading && (
                <Card className="p-5 bg-slate-900 border-slate-800">
                  <p className="text-slate-400 text-sm text-center">No goals yet. Set your first goal to start tracking progress.</p>
                </Card>
              )}
              {goals.map((g) => (
                <Card key={g.id} className="p-4 bg-slate-900 border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-white">{g.title}</p>
                    <Badge color="bg-indigo-500/20 text-indigo-300">{g.progress}%</Badge>
                  </div>
                  <ProgressBar value={g.progress} color="bg-gradient-to-r from-indigo-500 to-purple-500" className="bg-slate-800" />
                  {g.target_date && <p className="text-xs text-slate-500 mt-2">Target: {g.target_date}</p>}
                </Card>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Tasks</h2>
              <Badge color="bg-slate-800 text-slate-300">{pending.length} pending</Badge>
            </div>
            <div className="space-y-2">
              {pending.slice(0, 5).map((task) => (
                <Card key={task.id} className="p-3 flex items-center gap-3 bg-slate-900 border-slate-800">
                  <button onClick={() => completeTask(task)} className="w-7 h-7 rounded-full border-2 border-indigo-500/50 hover:bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Circle className="text-indigo-500/50" size={14} />
                  </button>
                  <span className="text-sm font-medium text-slate-200 flex-1">{task.title}</span>
                  <Badge color="bg-indigo-500/20 text-indigo-300">+{task.points}</Badge>
                </Card>
              ))}
              {pending.length === 0 && !loading && (
                <Card className="p-5 bg-slate-900 border-slate-800">
                  <p className="text-slate-400 text-sm text-center">All caught up. You're on fire.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Sparkles, label: 'AI Coach', to: '/coach' },
              { icon: Award, label: 'Report', to: '/report' },
              { icon: Briefcase, label: 'Rewards', to: '/rewards' },
            ].map((a) => (
              <Card key={a.label} className="p-4 flex flex-col items-center gap-2 bg-slate-900 border-slate-800 hover:border-indigo-500/50" onClick={() => navigate(a.to)}>
                <a.icon className="text-indigo-400" size={22} />
                <span className="text-xs font-medium text-slate-300">{a.label}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
