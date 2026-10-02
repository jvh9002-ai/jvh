import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/Sidebar';
import { Card, Button, Input, Spinner } from '@/components/ui';
import { generateCoachResponse, buildCoachContext } from '@/lib/aiCoach';
import type { Task, AiMessage } from '@/types/database';
import { Sparkles, Send, User, Bot } from 'lucide-react';

export function CoachScreen() {
  const { activeMember, family } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeMember || !family) return;
    Promise.all([
      supabase.from('tasks').select('*').eq('member_id', activeMember.id).order('created_at', { ascending: false }),
      supabase.from('ai_messages').select('*').eq('family_id', family.id).order('created_at', { ascending: true }),
    ]).then(([t, m]) => {
      setTasks((t.data as Task[]) || []);
      setMessages((m.data as AiMessage[]) || []);
      setLoading(false);
    });
  }, [activeMember, family]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!activeMember || !family) return null;

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg = input.trim();
    setInput('');
    setBusy(true);

    const ctx = buildCoachContext(activeMember, tasks);
    const response = generateCoachResponse(userMsg, ctx, activeMember.role);

    const { data: userRow } = await supabase.from('ai_messages').insert({
      family_id: family.id,
      member_id: activeMember.id,
      role: 'user',
      content: userMsg,
    }).select().single();

    const { data: aiRow } = await supabase.from('ai_messages').insert({
      family_id: family.id,
      member_id: activeMember.id,
      role: 'assistant',
      content: response,
    }).select().single();

    if (userRow && aiRow) {
      setMessages([...messages, userRow as AiMessage, aiRow as AiMessage]);
    }
    setBusy(false);
  };

  const suggestions = activeMember.role === 'parent'
    ? ['Give me parenting suggestions', 'How is my child progressing?', 'What should we improve next week?']
    : activeMember.role === 'child'
    ? ['How many points do I have?', 'Tell me something fun!']
    : activeMember.role === 'teen'
    ? ['Help me plan my goals', 'Career advice please']
    : ['Build my career roadmap', 'How are my skills progressing?'];

  return (
    <div className="min-h-screen flex flex-col" style={{ height: '100vh' }}>
      <TopBar title="AI Family Coach" subtitle={`Coaching ${activeMember.name} · ${activeMember.role} mode`} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 lg:px-8 pb-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {loading && <div className="flex justify-center py-8"><Spinner /></div>}

          {!loading && messages.length === 0 && (
            <Card className="p-6 text-center bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-gray-900">Your AI Family Coach</h3>
              <p className="text-sm text-gray-600 mt-1">
                I analyze progress and give personalized guidance for {activeMember.name}.
                Ask me anything about growth, goals, or parenting.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-full bg-white border border-teal-200 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-teal-600' : 'bg-gradient-to-br from-purple-500 to-indigo-500'
              }`}>
                {msg.role === 'user' ? <User className="text-white" size={16} /> : <Bot className="text-white" size={16} />}
              </div>
              <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-100 text-gray-800'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
                <Bot className="text-white" size={16} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                <Spinner />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white px-5 lg:px-8 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={setInput}
            placeholder="Ask your AI coach..."
            className="flex-1"
          />
          <Button onClick={send} disabled={busy || !input.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
