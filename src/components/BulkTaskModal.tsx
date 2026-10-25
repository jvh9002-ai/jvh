import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TASK_TEMPLATES, TaskTemplate } from '../data/taskTemplates';
import { Calendar, CheckSquare, Sparkles, X, Layers } from 'lucide-react';

interface Member {
  id: string;
  name: string;
}

interface BulkTaskModalProps {
  familyId: string;
  adminMemberId?: string; // Current logged-in Admin ki ID
  members: Member[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ModeType = 'single' | 'weekly' | 'monthly' | 'custom';

export const BulkTaskModal: React.FC<BulkTaskModalProps> = ({
  familyId,
  adminMemberId,
  members,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('ALL');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('personal');
  const [points, setPoints] = useState<number>(10);
  
  const [mode, setMode] = useState<ModeType>('weekly');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [includeSaturday, setIncludeSaturday] = useState<boolean>(true);
  const [includeSunday, setIncludeSunday] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: TaskTemplate) => {
    setTitle(template.title);
    setCategory(template.category || 'personal');
    setPoints(template.points);
  };

  const handleCreateBulkTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const targetMemberIds =
        selectedMemberId === 'ALL'
          ? members.map((m) => m.id)
          : [selectedMemberId];

      const tasksToInsert: any[] = [];
      let start = new Date(startDate);
      let totalDays = 1;

      if (mode === 'single') {
        totalDays = 1;
        start = new Date();
      } else if (mode === 'weekly') {
        totalDays = 7;
        start = new Date();
      } else if (mode === 'monthly') {
        totalDays = 30;
        start = new Date();
      } else if (mode === 'custom') {
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }

      for (let i = 0; i < (mode === 'custom' ? 100 : totalDays); i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);

        if (mode === 'custom' && currentDate > new Date(endDate)) {
          break;
        }

        const dayOfWeek = currentDate.getDay();

        if (dayOfWeek === 6 && !includeSaturday) continue;
        if (dayOfWeek === 0 && !includeSunday) continue;

        const dateString = currentDate.toISOString().split('T')[0];

        for (const memberId of targetMemberIds) {
          // Database Schema Mismatch Fixed Here:
          tasksToInsert.push({
            member_id: memberId,
            title,
            category: category || 'personal',
            points,
            status: 'pending',
            due_date: dateString,
            assigned_by: adminMemberId || null,
          });
        }
      }

      if (tasksToInsert.length > 0) {
        const { error } = await supabase.from('tasks').insert(tasksToInsert);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating bulk tasks:', err);
      alert('Failed to generate bulk tasks. Database insertion error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" /> Bulk Task Scheduler
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Library */}
        <div className="mt-4">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-500" /> Readymade Task Library
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TASK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className="p-2.5 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 border border-gray-200 rounded-xl text-left transition"
              >
                <div className="text-lg">{tpl.icon}</div>
                <div className="text-xs font-bold text-gray-800 mt-1 truncate">
                  {tpl.title}
                </div>
                <div className="text-[10px] text-indigo-600 font-semibold">
                  +{tpl.points} pts
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreateBulkTasks} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Brush Teeth / Homework / Sales Call"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reward Points
              </label>
              <input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Assign To Member
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="ALL">All Members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 Scheduling Options */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-indigo-600" /> Schedule Duration Option
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'single', label: '1. Single Day' },
                { id: 'weekly', label: '2. Weekly (7 Days)' },
                { id: 'monthly', label: '3. Monthly (30 Days)' },
                { id: 'custom', label: '4. Custom Dates' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id as ModeType)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition text-center ${
                    mode === opt.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'custom' && (
            <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-indigo-200 rounded-lg text-xs bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-indigo-200 rounded-lg text-xs bg-white outline-none"
                />
              </div>
            </div>
          )}

          {mode !== 'single' && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
              <label className="text-xs font-bold text-amber-900 block mb-1.5">
                Weekend Inclusion Options
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-xs font-medium text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSaturday}
                    onChange={(e) => setIncludeSaturday(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  Include Saturdays
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSunday}
                    onChange={(e) => setIncludeSunday(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  Include Sundays
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              {loading ? 'Generating Tasks...' : 'Generate Tasks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
