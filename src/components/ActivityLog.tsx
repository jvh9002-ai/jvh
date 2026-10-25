import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, CheckCircle, Award, Filter, User } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  points: number;
  created_at: string;
  member_id: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
}

export const ActivityLog: React.FC<{ familyId: string }> = ({ familyId }) => {
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Load family members for filter dropdown
  useEffect(() => {
    if (familyId) {
      fetchMembers();
      fetchLogs();
    }
  }, [familyId]);

  // Re-fetch logs when filter selection changes
  useEffect(() => {
    if (familyId) {
      fetchLogs();
    }
  }, [selectedMemberId, familyId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, role')
        .eq('family_id', familyId);

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(100); // Badha kar 100 records kar diye hain

      // Specific member select karne par filtering logic
      if (selectedMemberId !== 'ALL') {
        query = query.eq('member_id', selectedMemberId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Member ID se Name find karne ke liye helper
  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> Task Completion History
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Date & Time Wise Records</p>
        </div>

        {/* Member Filter Dropdown */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-gray-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Members (Sabhi ka)</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-4 text-center">Data load ho raha hai...</div>
      ) : logs.length === 0 ? (
        <p className="text-gray-400 text-sm py-4 text-center">
          {selectedMemberId === 'ALL'
            ? 'Abhi tak koi task record nahi hua hai.'
            : `${getMemberName(selectedMemberId)} ke liye koi task log nahi mila.`}
        </p>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between p-3.5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{log.title}</h4>
                  {log.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{log.description}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                      📅 {formatDate(log.created_at)}
                    </span>
                    <span className="text-[11px] text-gray-600 font-medium bg-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <User className="w-3 h-3" /> {getMemberName(log.member_id)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0">
                <Award className="w-3.5 h-3.5" /> +{log.points} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
