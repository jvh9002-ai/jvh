import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/Sidebar';
import { Card, Button, ScoreRing, ProgressBar, Badge, Spinner } from '@/components/ui';
import { computeGrowthScores, overallScore } from '@/lib/growth';
import { generateWeeklyReport, buildCoachContext } from '@/lib/aiCoach';
import type { Task, GrowthReport, GrowthScores } from '@/types/database';
import { FileText, Sparkles, TrendingUp, AlertCircle, Target, Calendar } from 'lucide-react';

export function ReportScreen() {
  const { activeMember, family } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [report, setReport] = useState<GrowthReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeMember) return;
    Promise.all([
      supabase.from('tasks').select('*').eq('member_id', activeMember.id).order('created_at', { ascending: false }),
      supabase.from('growth_reports').select('*').eq('member_id', activeMember.id).order('created_at', { ascending: false }).limit(1),
    ]).then(([t, r]) => {
      setTasks((t.data as Task[]) || []);
      setReport((r.data as GrowthReport[])?.[0] ?? null);
      setLoading(false);
    });
  }, [activeMember]);

  if (!activeMember || !family) return null;

  const generateReport = async () => {
    setGenerating(true);
    const ctx = buildCoachContext(activeMember, tasks);
    const { summary, recommendations } = generateWeeklyReport(ctx, activeMember.role);
    const scores = computeGrowthScores(tasks);
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    const { data, error } = await supabase.from('growth_reports').insert({
      member_id: activeMember.id,
      week_start: monday.toISOString().split('T')[0],
      scores,
      summary,
      recommendations,
    }).select().single();

    if (!error && data) {
      setReport(data as GrowthReport);
    }
    setGenerating(false);
  };

  const scores = report?.scores || computeGrowthScores(tasks);
  const score = overallScore(scores);
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const total = tasks.length;

  const weakAreas = Object.entries(scores).filter(([, v]) => v < 50).map(([k]) => k);
  const strongAreas = Object.entries(scores).filter(([, v]) => v >= 70).map(([k]) => k);

  return (
    <div className="min-h-screen">
      <TopBar
        title="Weekly Report"
        subtitle={`${activeMember.name}'s growth analysis`}
        right={
          <Button onClick={generateReport} disabled={generating}>
            {generating ? <Spinner /> : <><Sparkles size={16} /> Generate</>}
          </Button>
        }
      />

      <div className="px-5 lg:px-8 pb-8 space-y-6">
        {loading && <div className="flex justify-center py-8"><Spinner /></div>}

        {!loading && (
          <>
            {/* Summary card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <FileText className="text-teal-600" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">AI Weekly Summary</h3>
                  {report && <p className="text-xs text-gray-500">Week of {report.week_start}</p>}
                </div>
              </div>
              {report ? (
                <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
              ) : (
                <p className="text-sm text-gray-400">
                  No report generated yet. Click "Generate" to create an AI-powered weekly analysis
                  based on {activeMember.name}'s task completion and growth scores.
                </p>
              )}
            </Card>

            {/* Score overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Growth Scores</h3>
                <div className="flex flex-col items-center gap-4">
                  <ScoreRing value={score} size={100} label="Overall" />
                  <div className="w-full space-y-2">
                    {(Object.keys(scores) as (keyof GrowthScores)[]).map((key) => (
                      <div key={key} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600 capitalize w-24">{key}</span>
                        <div className="flex-1"><ProgressBar value={scores[key]} color="bg-teal-500" /></div>
                        <span className="font-semibold text-gray-900 w-10 text-right">{scores[key]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Stats */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">This Week at a Glance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50">
                    <span className="text-sm text-teal-700">Tasks Completed</span>
                    <span className="text-xl font-bold text-teal-900">{completed}/{total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
                    <span className="text-sm text-amber-700">Points Earned</span>
                    <span className="text-xl font-bold text-amber-900">{activeMember.points}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                    <span className="text-sm text-blue-700">Completion Rate</span>
                    <span className="text-xl font-bold text-blue-900">{total === 0 ? 0 : Math.round((completed / total) * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50">
                    <span className="text-sm text-purple-700">Current Level</span>
                    <Badge color="bg-purple-100 text-purple-700">{activeMember.level_name}</Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="text-green-500" size={20} />
                  <h3 className="font-bold text-gray-900">Strong Areas</h3>
                </div>
                {strongAreas.length > 0 ? (
                  <div className="space-y-2">
                    {strongAreas.map((a) => (
                      <div key={a} className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                        <span className="text-sm font-medium text-green-700 capitalize">{a}</span>
                        <span className="font-bold text-green-900">{scores[a as keyof GrowthScores]}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Keep completing tasks to build strong areas!</p>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="text-orange-500" size={20} />
                  <h3 className="font-bold text-gray-900">Areas to Improve</h3>
                </div>
                {weakAreas.length > 0 ? (
                  <div className="space-y-2">
                    {weakAreas.map((a) => (
                      <div key={a} className="flex items-center justify-between p-2 rounded-lg bg-orange-50">
                        <span className="text-sm font-medium text-orange-700 capitalize">{a}</span>
                        <span className="font-bold text-orange-900">{scores[a as keyof GrowthScores]}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">All areas are above 50%. Great work!</p>
                )}
              </Card>
            </div>

            {/* Recommendations */}
            {report?.recommendations && (
              <Card className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="text-teal-600" size={20} />
                  <h3 className="font-bold text-teal-900">AI Recommendations for Next Week</h3>
                </div>
                <p className="text-sm text-teal-800 leading-relaxed whitespace-pre-wrap">{report.recommendations}</p>
              </Card>
            )}

            {/* History */}
            <ReportHistory memberId={activeMember.id} />
          </>
        )}
      </div>
    </div>
  );
}

function ReportHistory({ memberId }: { memberId: string }) {
  const [reports, setReports] = useState<GrowthReport[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    supabase.from('growth_reports').select('*').eq('member_id', memberId).order('created_at', { ascending: false })
      .then(({ data }) => setReports((data as GrowthReport[]) || []));
  }, [memberId]);

  if (reports.length <= 1) return null;

  return (
    <Card className="p-5">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 w-full">
        <Calendar className="text-gray-400" size={18} />
        <h3 className="font-bold text-gray-900">Report History</h3>
        <Badge color="bg-gray-100 text-gray-600">{reports.length}</Badge>
      </button>
      {expanded && (
        <div className="mt-4 space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-500">Week of {r.week_start}</p>
              <p className="text-sm text-gray-700 mt-1">{r.summary}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
