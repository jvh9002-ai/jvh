import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/Sidebar';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import type { Task, TaskCategory } from '@/types/database';
import { CheckCircle, Circle, Trash2, Filter, Layers } from 'lucide-react';
import { BulkTaskModal } from '@/components/BulkTaskModal';

const categories: { value: TaskCategory; label: string; emoji: string }[] = [
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'health', label: 'Health', emoji: '💪' },
  { value: 'discipline', label: 'Discipline', emoji: '🎯' },
  { value: 'kindness', label: 'Kindness', emoji: '💝' },
  { value: 'creativity', label: 'Creativity', emoji: '🎨' },
  { value: 'skills', label: 'Skills', emoji: '🛠️' },
  { value: 'career', label: 'Career', emoji: '💼' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'personal', label: 'Personal', emoji: '🌱' },
];

export function TasksScreen() {
  const { activeMember, members, family } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [memberId, setMemberId] = useState(activeMember?.id ?? '');

  const currentMember = members.find((m) => m.id === memberId) || activeMember;
  const isParent = activeMember?.role === 'parent';

  useEffect(() => {
    if (!currentMember) return;
    setLoading(true);
    supabase.from('tasks').select('*').eq('member_id', currentMember.id).order('created_at', { ascending: false })
      .then(({ data }) => { setTasks((data as Task[]) || []); setLoading(false); });
  }, [currentMember]);

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        completed_by: newStatus === 'completed' ? currentMember?.id : null,
      })
      .eq('id', task.id);

    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: newStatus,
              completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
              completed_by: newStatus === 'completed' ? currentMember?.id : null,
            }
          : t
      )
    );

    if (newStatus === 'completed' && currentMember) {
      const newPoints = currentMember.points + task.points;
      await supabase.from('members').update({ points: newPoints }).eq('id', currentMember.id);

      if (family) {
        await supabase.from('activity_logs').insert({
          family_id: family.id,
          member_id: currentMember.id,
          event_type: 'task_completed',
          title: task.title,
          description: `${currentMember.name} completed this task`,
          points: task.points,
        });
      }
    } else if (currentMember) {
      const newPoints = Math.max(0, currentMember.points - task.points);
      await supabase.from('members').update({ points: newPoints }).eq('id', currentMember.id);
    }
  };

  const deleteTask = async (task: Task) => {
    await supabase.from('tasks').delete().eq('id', task.id);
    setTasks(tasks.filter((t) => t.id !== task.id));
  };

  const filtered = filter === 'all' ? tasks : filter === 'pending' ? tasks.filter((t) => t.status === 'pending') : tasks.filter((t) => t.status === 'completed');

  return (
    <div className="min-h-screen">
      <TopBar
        title="Tasks"
        subtitle={isParent ? 'Create and assign tasks to family members' : 'Your tasks and missions'}
        right={
          isParent ? (
            <Button onClick={() => setShowAdd(true)}>
              <Layers size={16} /> Bulk Scheduler / New Task
            </Button>
          ) : null
        }
      />

      <div className="px-5 lg:px-8 pb-8 space-y-4">
        {/* Member selector (parent only) */}
        {isParent && members.length > 0 && (
          <Card className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Viewing tasks for</label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMemberId(m.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    memberId === m.id ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{m.avatar_emoji}</span> {m.name}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400" size={16} />
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {loading && <div className="flex justify-center py-8"><Spinner /></div>}
          {!loading && filtered.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-400 text-sm">No tasks here yet. Create one to get started!</p>
            </Card>
          )}
          {filtered.map((task) => {
            const cat = categories.find((c) => c.value === task.category);
            return (
              <Card key={task.id} className="p-4 flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    task.status === 'completed' ? 'bg-green-500 text-white' : 'border-2 border-gray-300 hover:border-teal-400'
                  }`}
                >
                  {task.status === 'completed' ? <CheckCircle size={18} /> : <Circle size={16} className="text-gray-300" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400">{cat?.emoji} {task.category}</p>
                </div>
                <Badge color="bg-amber-50 text-amber-700">{task.points} pts</Badge>
                <button onClick={() => deleteTask(task)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bulk Task Modal Component */}
      <BulkTaskModal
        familyId={family?.id || ''}
        adminMemberId={currentMember?.id}
        members={members}
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          // Refresh tasks list after successful creation
          if (currentMember) {
            supabase.from('tasks').select('*').eq('member_id', currentMember.id).order('created_at', { ascending: false })
              .then(({ data }) => setTasks((data as Task[]) || []));
          }
        }}
      />
    </div>
  );
}
