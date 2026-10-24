import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, CheckCircle, Award } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  points: number;
  created_at: string;
  member_id: string;
}

export const ActivityLog: React.FC<{ familyId: string }> = ({ familyId }) => {
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (familyId) {
      fetchLogs();
    }
  }, [familyId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(50); // Admin pichle 50 records Date + Time ke saath dekh sakta hai

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Indian Timezone (IST) me Date aur Time format karne ke liye helper
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

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6 text-gray-500 text-sm">
        Activity logs load ho rahe hain...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" /> Recent Activity History
        </h3>
        <span className="text-xs text-gray-400 font-medium">Date & Time Wise</span>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-400 text-sm py-2">Abhi tak koi activity record nahi hui hai.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between p-3.5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-gray-100">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{log.title}</h4>
                  {log.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{log.description}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                      📅 {formatDate(log.created_at)}
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
