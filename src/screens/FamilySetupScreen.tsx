import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button, Input, Spinner } from '@/components/ui';
import { Users, ArrowRight, Plus, Check } from 'lucide-react';
import type { Role } from '@/types/database';

const roleConfig: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: 'child', label: 'Child', emoji: '🧒', desc: 'Ages 5-12' },
  { value: 'teen', label: 'Teenager', emoji: '📱', desc: 'Ages 13-17' },
  { value: 'college', label: 'College Student', emoji: '🎓', desc: 'Ages 18-24' },
  { value: 'parent', label: 'Parent', emoji: '👨‍👩‍👧', desc: 'That\'s you!' },
];

const emojis = ['⭐', '🦁', '🦊', '🐼', '🐯', '🦄', '🐲', '🦅', '🐙', '🦉', '🐝', '🐬'];

export function FamilySetupScreen() {
  const { user, family, refreshFamily } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'family' | 'members'>('family');
  const [familyName, setFamilyName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // member form
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<Role>('child');
  const [memberAge, setMemberAge] = useState('8');
  const [memberEmoji, setMemberEmoji] = useState('⭐');
  const [addedMembers, setAddedMembers] = useState<{ name: string; role: Role }[]>([]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const createFamily = async () => {
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('families')
      .insert({ name: familyName || `${user.email}'s Family`, owner_id: user.id })
      .select()
      .single();
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    await refreshFamily();
    setStep('members');
  };

  const addMember = async () => {
    if (!family || !memberName) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from('members').insert({
      family_id: family.id,
      name: memberName,
      role: memberRole,
      age: parseInt(memberAge) || 0,
      avatar_emoji: memberEmoji,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setAddedMembers([...addedMembers, { name: memberName, role: memberRole }]);
    setMemberName('');
    setMemberRole('child');
    setMemberAge('8');
    setMemberEmoji('⭐');
    await refreshFamily();
  };

  const finish = () => {
    navigate('/dashboard');
  };

  if (family && step === 'family') {
    setStep('members');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === 'family' ? (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-5">
              <Users className="text-teal-600" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your family</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Give your family a name. You'll add members next.
            </p>
            <div className="mt-6 space-y-4">
              <Input label="Family Name" value={familyName} onChange={setFamilyName} placeholder="The Smith Family" />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={createFamily} fullWidth disabled={busy || !familyName}>
                {busy ? <Spinner /> : (<>Create Family <ArrowRight size={16} /></>)}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900">Add family members</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Add children, teens, or college students. You can add more later.
            </p>

            {addedMembers.length > 0 && (
              <div className="mt-5 space-y-2">
                {addedMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5">
                    <Check className="text-teal-600" size={16} />
                    <span className="text-sm font-medium text-teal-800">{m.name} — {m.role}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
              <Input label="Member Name" value={memberName} onChange={setMemberName} placeholder="e.g. Emma" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {roleConfig.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setMemberRole(r.value)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        memberRole === r.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{r.emoji}</span>
                      <div className="text-left">
                        <p>{r.label}</p>
                        <p className="text-xs text-gray-400">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Input label="Age" type="number" value={memberAge} onChange={setMemberAge} placeholder="8" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pick an avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {emojis.map((e) => (
                    <button
                      key={e}
                      onClick={() => setMemberEmoji(e)}
                      className={`text-2xl rounded-xl py-2 transition-all ${
                        memberEmoji === e ? 'bg-teal-100 ring-2 ring-teal-500' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button onClick={addMember} fullWidth variant="secondary" disabled={busy || !memberName}>
                {busy ? <Spinner /> : (<><Plus size={16} /> Add Member</>)}
              </Button>

              <Button onClick={finish} fullWidth disabled={addedMembers.length === 0}>
                {addedMembers.length === 0
                  ? 'Add at least one member to continue'
                  : `Done — Go to Dashboard (${addedMembers.length} added)`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
