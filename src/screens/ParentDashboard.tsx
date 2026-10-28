import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/Sidebar';
import { Card, ScoreRing, ProgressBar, Badge, Button } from '@/components/ui';
import { computeGrowthScores, overallScore } from '@/lib/growth';
import type { Task, Member } from '@/types/database';
import {
  Users, TrendingUp, CheckSquare, Gift, Sparkles, Plus, ChevronRight, Star, Trophy, Target, Award, Briefcase,
} from 'lucide-react';
import { ActivityLog } from '@/components/ActivityLog';

export function ParentDashboard() {
  const { t } = useTranslation();
  const { family, members, activeMember, setActiveMember, user } = useAuth();
  const navigate = useNavigate();
  const [memberTasks, setMemberTasks] = useState<Record<string, Task[]>>({});
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const isWork = family?.mode === 'work';

  useEffect(() => {
    if (!family) return;
    members.forEach(async (m) => {
      const { data } = await supabase.from('tasks').select('*').eq('member_id', m.id).order('created_at', { ascending: false });
      setMemberTasks((prev) => ({ ...prev, [m.id]: (data as Task[]) || [] }));
    });
  }, [family, members]);

  const parentMember = members.find((m) => m.role === 'parent');
  const displayMembers = members.filter((m) => m.id !== parentMember?.id);

  const handleMemberClick = (m: Member) => {
    setSelectedMemberId(m.id);
    setActiveMember(m);
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen">
      <TopBar
        title={`${t('welcomeBack')}, ${user?.user_metadata?.name || 'Parent'}`}
        subtitle={isWork ? t('yourFamilyGrowthOverview') : t('yourFamilyGrowthOverview')}
        right={
          <Button onClick={() => navigate('/tasks')} className="hidden sm:inline-flex">
            <Plus size={16} /> {t('newTask')}
          </Button>
        }
      />

      <div className="px-5 lg:px-8 pb-8 space-y-6">
        {/* ================= HERO ================= */}

<Card className={`overflow-hidden border-0 shadow-xl ${
  isWork
    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700"
    : "bg-gradient-to-r from-teal-500 via-emerald-500 to-green-600"
}`}>
  <div className="p-6 lg:p-8 text-white">

    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

      <div>

        <p className="text-white/80 text-sm font-medium">
         {t('welcomeBack')} 👋
        </p>

        <h1 className="text-3xl lg:text-5xl font-bold mt-2">
          {user?.user_metadata?.name || "Parent"}
        </h1>

        <p className="mt-3 text-white/90 max-w-xl">
          {isWork
            ? "Manage your team, monitor productivity and grow together."
            : "Help your family build better habits every single day."}
        </p>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-white/15 backdrop-blur rounded-2xl p-5 text-center">

          <div className="text-3xl font-bold">
            {members.length}
          </div>

          <div className="text-sm text-white/80">
            {isWork ? "Team" : "Family"}
          </div>

        </div>

        <div className="bg-white/15 backdrop-blur rounded-2xl p-5 text-center">

          <div className="text-3xl font-bold">
            {members.reduce((s,m)=>s+m.points,0)}
          </div>

          <div className="text-sm text-white/80">
            {t('totalPoints')}
          </div>

        </div>

      </div>

    </div>

  </div>
</Card>
       {/* ================= PREMIUM STATS ================= */}

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

  <Card className="p-5 hover:shadow-lg transition-all">
    <div className="flex flex-col gap-3">

      <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
        <Users className="text-teal-600" size={24}/>
      </div>

      <div>
        <p className="text-3xl font-bold text-gray-900">
          {members.length}
        </p>

        <p className="text-sm text-gray-500">
          {isWork ? "Team Members" : "Family Members"}
        </p>
      </div>

    </div>
  </Card>


  <Card className="p-5 hover:shadow-lg transition-all">
    <div className="flex flex-col gap-3">

      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
        <CheckSquare className="text-blue-600" size={24}/>
      </div>

      <div>
        <p className="text-3xl font-bold text-gray-900">
          {Object.values(memberTasks)
            .flat()
            .filter((t)=>t.status==="completed")
            .length}
        </p>

        <p className="text-sm text-gray-500">
          Completed Tasks
        </p>
      </div>

    </div>
  </Card>


  <Card className="p-5 hover:shadow-lg transition-all">
    <div className="flex flex-col gap-3">

      <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
        <Star className="text-yellow-600" size={24}/>
      </div>

      <div>
        <p className="text-3xl font-bold text-gray-900">
          {members.reduce((s,m)=>s+m.points,0)}
        </p>

        <p className="text-sm text-gray-500">
          Total Points
        </p>
      </div>

    </div>
  </Card>


  <Card className="p-5 hover:shadow-lg transition-all">
    <div className="flex flex-col gap-3">

      <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
        <TrendingUp className="text-purple-600" size={24}/>
      </div>

      <div>
        <p className="text-3xl font-bold text-gray-900">
          {members.length > 0
            ? Math.round(
              members.reduce((s,m)=>{
                const tasks = memberTasks[m.id] || [];
                return s + overallScore(computeGrowthScores(tasks));
              },0) / members.length
            )
            : 0
          }%
        </p>

        <p className="text-sm text-gray-500">
          Growth Score
        </p>
      </div>

    </div>
  </Card>

</div>

       {/* ================= AI COACH PREMIUM ================= */}

<Card
  className={`overflow-hidden border-0 shadow-md ${
    isWork
      ? "bg-gradient-to-r from-indigo-50 to-blue-50"
      : "bg-gradient-to-r from-teal-50 to-emerald-50"
  }`}
>
  <div className="p-5 lg:p-6">

    <div className="flex items-start gap-4">

      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          isWork
            ? "bg-indigo-600"
            : "bg-teal-600"
        }`}
      >
        <Sparkles className="text-white" size={28}/>
      </div>


      <div className="flex-1">

        <h3 className="text-lg font-bold text-gray-900">
          {isWork ? "AI Team Coach 🤖" : "AI Family Coach 🤖"}
        </h3>


        <p className="text-sm text-gray-600 mt-1">
          {displayMembers.length === 0
            ? (
              isWork
                ? "Add team members to get productivity insights."
                : "Add family members to start growth tracking."
            )
            : (
              isWork
                ? `${displayMembers.length} team members are being monitored. AI will suggest improvements.`
                : `${displayMembers.length} family members are growing with AI guidance.`
            )
          }
        </p>


        <div className="flex flex-wrap gap-2 mt-4">

          <div className="px-3 py-2 rounded-xl bg-white text-xs font-medium text-gray-700">
            🎯 Goals
          </div>

          <div className="px-3 py-2 rounded-xl bg-white text-xs font-medium text-gray-700">
            📈 Growth
          </div>

          <div className="px-3 py-2 rounded-xl bg-white text-xs font-medium text-gray-700">
            💡 Suggestions
          </div>

        </div>


        <Button
          onClick={() => navigate('/coach')}
          variant="secondary"
          className="mt-4"
        >
          <Sparkles size={15}/>
          Open AI Coach
        </Button>


      </div>

    </div>

  </div>
</Card>
        {/* PREMIUM STATS */}

<Card>
...
</Card>


{/* AI COACH PREMIUM */}

<Card>
...
</Card>


<ActivityLog familyId={family?.id || ''} />
        <ActivityLog familyId={family?.id || ''} />

        {/* Interactive member cards / switcher */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">{isWork ? t('teamMembers') : t('familyMembers')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayMembers.map((m) => {
              const tasks = memberTasks[m.id] || [];
              const scores = computeGrowthScores(tasks);
              const score = overallScore(scores);
              const completed = tasks.filter((t) => t.status === 'completed').length;
              const pending = tasks.filter((t) => t.status === 'pending').length;
              const approval = tasks.filter((t) => t.status === 'pending_approval').length;
              const isSelected = selectedMemberId === m.id;
              return (
                <Card
                  key={m.id}
                  className={`p-5 transition-all ${isSelected ? 'ring-2 ring-teal-500' : ''}`}
                  onClick={() => handleMemberClick(m)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{m.avatar_emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{t(m.role)} · {t('age')} {m.age}</p>
                    </div>
                    <Badge color="bg-amber-50 text-amber-700"><Star size={12} /> {m.points}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <ScoreRing value={score} size={64} />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between text-xs"><span className="text-gray-500">{t('completed')}</span><span className="font-semibold text-gray-700">{completed}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-500">{t('pending')}</span><span className="font-semibold text-gray-700">{pending}</span></div>
                      {approval > 0 && (
                        <div className="flex justify-between text-xs"><span className="text-orange-500">{t('pendingApproval')}</span><span className="font-semibold text-orange-600">{approval}</span></div>
                      )}
                      <div className="flex justify-between text-xs"><span className="text-gray-500">{t('level')}</span><span className="font-semibold text-gray-700">{m.level_name}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{t('viewDetails')}</span>
                    <ChevronRight size={14} />
                  </div>
                </Card>
              );
            })}
          
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: CheckSquare, label: t('manageTasks'), to: '/tasks', color: 'bg-teal-50 text-teal-600' },
            { icon: Gift, label: t('rewards'), to: '/rewards', color: 'bg-pink-50 text-pink-600' },
            { icon: TrendingUp, label: t('growthScore'), to: '/growth', color: 'bg-blue-50 text-blue-600' },
            { icon: Award, label: t('weeklyReport'), to: '/report', color: 'bg-purple-50 text-purple-600' },
          ].map((a) => (
            <Card key={a.label} className="p-4 flex items-center gap-3" onClick={() => navigate(a.to)}>
              <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center`}>
                <a.icon size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-700">{a.label}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
