import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/Sidebar';
import { Card, ProgressBar, Badge, Button, ScoreRing } from '@/components/ui';
import { computeGrowthScores, overallScore, levelProgress, nextLevelThreshold } from '@/lib/growth';
import type { Task } from '@/types/database';
import { Star, Gift, CheckCircle, Circle, Trophy, Rocket, Zap, Sparkles } from 'lucide-react';

const categoryEmojis: Record<string, string> = {
  learning: '📚', health: '💪', discipline: '🎯', kindness: '💝', creativity: '🎨',
  skills: '🛠️', career: '💼', family: '👨‍👩‍👧', personal: '🌱',
};

export function ChildDashboard() {
  const { activeMember } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeMember) return;
    supabase.from('tasks').select('*').eq('member_id', activeMember.id).order('created_at', { ascending: false })
      .then(({ data }) => { setTasks((data as Task[]) || []); setLoading(false); });
  }, [activeMember]);

  if (!activeMember) return null;
  const m = activeMember;
  const scores = computeGrowthScores(tasks);
  const score = overallScore(scores);
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending');
  const levelPct = levelProgress(m.points);
  const nextThresh = nextLevelThreshold(m.points);

  const completeTask = async (task: Task) => {
    const { error } = await supabase.from('tasks').update({ status: 'completed' }).eq('id', task.id);
    if (error) return;
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: 'completed' } : t)));
    const newPoints = m.points + task.points;
    const newLevel = levelProgress(newPoints);
    void newLevel;
    await supabase.from('members').update({ points: newPoints }).eq('id', m.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-purple-50">
      <TopBar title={`Hi ${m.name}! ${m.avatar_emoji}`} subtitle="Ready for today's adventures?" />

      <div className="px-5 lg:px-8 pb-8 space-y-5">
        {/* Level card */}
        <Card className="p-6 bg-gradient-to-br from-pink-400 via-orange-400 to-amber-400 border-0">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium text-white/80">Your Level</p>
              <p className="text-3xl font-bold mt-1">{m.level_name}</p>
              <p className="text-sm text-white/90 mt-2">{m.points} / {nextThresh} points to level up!</p>
            </div>
            <div className="text-6xl">{m.points >= 500 ? '🏆' : m.points >= 200 ? '🦸' : m.points >= 50 ? '🚀' : '⭐'}</div>
          </div>
          <div className="mt-4">
            <ProgressBar value={levelPct} color="bg-white" className="bg-white/30" />
          </div>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <Trophy className="mx-auto text-amber-500" size={24} />
            <p className="text-2xl font-bold text-gray-900 mt-1">{m.points}</p>
            <p className="text-xs text-gray-500">Points</p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle className="mx-auto text-green-500" size={24} />
            <p className="text-2xl font-bold text-gray-900 mt-1">{completed}</p>
            <p className="text-xs text-gray-500">Done</p>
          </Card>
          <Card className="p-4 text-center">
            <Zap className="mx-auto text-orange-500" size={24} />
            <p className="text-2xl font-bold text-gray-900 mt-1">{pending.length}</p>
            <p className="text-xs text-gray-500">To Do</p>
          </Card>
        </div>

        {/* Growth score mini */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-900 mb-3">Your Growth Score</h3>
          <div className="flex items-center justify-around">
            <ScoreRing value={score} size={90} label="Overall" color="#ec4899" />
            <div className="space-y-2">
              {Object.entries(scores).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{categoryEmojis[k] ?? '⭐'}</span>
                  <span className="text-gray-600 capitalize w-20">{k}</span>
                  <div className="w-20"><ProgressBar value={v} color="bg-pink-400" /></div>
                  <span className="font-semibold text-gray-700 w-8 text-right">{v}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Today's missions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Today's Missions</h2>
            <Badge color="bg-orange-100 text-orange-700">{pending.length} left</Badge>
          </div>
          <div className="space-y-3">
            {loading && <p className="text-gray-400 text-sm">Loading missions...</p>}
            {!loading && pending.length === 0 && (
              <Card className="p-6 text-center">
                <Rocket className="mx-auto text-pink-400" size={32} />
                <p className="text-gray-600 font-medium mt-2">All missions done! You're amazing!</p>
              </Card>
            )}
            {pending.map((task) => (
              <Card key={task.id} className="p-4 flex items-center gap-3">
                <button onClick={() => completeTask(task)} className="w-8 h-8 rounded-full border-2 border-pink-300 hover:bg-pink-100 flex items-center justify-center transition-all shrink-0">
                  <Circle className="text-pink-300" size={16} />
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-500">{categoryEmojis[task.category]} {task.category}</p>
                </div>
                <Badge color="bg-amber-100 text-amber-700"><Star size={12} /> +{task.points}</Badge>
              </Card>
            ))}
          </div>
        </div>

        {/* Completed today */}
        {completed > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Completed! Great job!</h2>
            <div className="space-y-2">
              {tasks.filter((t) => t.status === 'completed').slice(0, 5).map((task) => (
                <Card key={task.id} className="p-3 flex items-center gap-3 bg-green-50 border-green-100">
                  <CheckCircle className="text-green-500 shrink-0" size={20} />
                  <span className="text-sm font-medium text-gray-700 flex-1">{task.title}</span>
                  <Badge color="bg-green-100 text-green-700">+{task.points} pts</Badge>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => navigate('/rewards')} variant="secondary" fullWidth className="bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200">
            <Gift size={18} /> My Rewards
          </Button>
          <Button onClick={() => navigate('/coach')} variant="secondary" fullWidth className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
            <Sparkles size={18} /> AI Buddy
          </Button>
        </div>
      </div>
    </div>
  );
}
