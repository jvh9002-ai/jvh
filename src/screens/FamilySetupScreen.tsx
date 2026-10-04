import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button, Input, Spinner } from '@/components/ui';
import { LanguageSelector } from '@/components/UniversalHeader';
import { Users, ArrowRight, Plus, Check, Briefcase } from 'lucide-react';
import type { Role, FamilyMode } from '@/types/database';

const familyRoles: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: 'child', label: 'Child', emoji: '🧒', desc: 'Ages 5-12' },
  { value: 'teen', label: 'Teenager', emoji: '📱', desc: 'Ages 13-17' },
  { value: 'college', label: 'College Student', emoji: '🎓', desc: 'Ages 18-24' },
  { value: 'parent', label: 'Parent / Guardian', emoji: '👨‍👩‍👧', desc: "That's you!" },
];

const workRoles: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: 'staff', label: 'Staff / Worker', emoji: '👷', desc: 'Team member' },
  { value: 'teen', label: 'Young Worker', emoji: '📱', desc: 'Ages 16-20' },
  { value: 'college', label: 'Intern / Trainee', emoji: '🎓', desc: 'Early career' },
  { value: 'parent', label: 'Owner / Manager', emoji: '👨‍💼', desc: "That's you!" },
];

const emojis = ['⭐', '🦁', '🦊', '🐼', '🐯', '🦄', '🐲', '🦅', '🐙', '🦉', '🐝', '🐬'];

export function FamilySetupScreen() {
  const { t } = useTranslation();
  const { user, family, refreshFamily, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<FamilyMode>('family');
  const [step, setStep] = useState<'family' | 'members'>('family');
  const [entityName, setEntityName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<Role>('child');
  const [memberAge, setMemberAge] = useState('8');
  const [memberEmoji, setMemberEmoji] = useState('⭐');
  const [addedMembers, setAddedMembers] = useState<{ name: string; role: Role }[]>([]);

  // If the user already has an onboarded family, skip straight to dashboard
  useEffect(() => {
    if (family && family.is_onboarded) {
      navigate('/dashboard', { replace: true });
    } else if (family && !family.is_onboarded && step === 'family') {
      setStep('members');
      if (family.mode === 'work') setMode('work');
    }
  }, [family, step, navigate]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const roleConfig = mode === 'family' ? familyRoles : workRoles;
  const isWork = mode === 'work';

  const createFamily = async () => {
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('families')
      .insert({ name: entityName || (isWork ? `${user.email}'s Business` : `${user.email}'s Family`), owner_id: user.id, mode })
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
    setMemberRole(isWork ? 'staff' : 'child');
    setMemberAge('8');
    setMemberEmoji('⭐');
    await refreshFamily();
  };

  const finish = async () => {
    await completeOnboarding();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-lg">
        {step === 'family' ? (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Mode selector */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setMode('family')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === 'family' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`}
              >
                <Users size={16} /> {t('familyMode')}
              </button>
              <button
                onClick={() => setMode('work')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === 'work' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'}`}
              >
                <Briefcase size={16} /> {t('workMode')}
              </button>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-5">
              {isWork ? <Briefcase className="text-teal-600" size={28} /> : <Users className="text-teal-600" size={28} />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{isWork ? t('createYourBusiness') : t('createYourFamily')}</h1>
            <p className="text-gray-500 mt-2 text-sm">
              {isWork ? t('giveBusinessName') : t('giveFamilyName')}
            </p>
            <div className="mt-6 space-y-4">
              <Input
                label={isWork ? t('businessName') : t('familyName')}
                value={entityName}
                onChange={setEntityName}
                placeholder={isWork ? 'Acme Inc.' : 'The Smith Family'}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={createFamily} fullWidth disabled={busy || !entityName}>
                {busy ? <Spinner /> : (<>{isWork ? t('createYourBusiness') : t('createYourFamily')} <ArrowRight size={16} /></>)}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-gray-900">{isWork ? t('addTeamMembers') : t('addFamilyMembers')}</h1>
            <p className="text-gray-500 mt-2 text-sm">
              {isWork ? t('addMembersLater') : t('addChildrenTeens')}
            </p>

            {addedMembers.length > 0 && (
              <div className="mt-5 space-y-2">
                {addedMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5">
                    <Check className="text-teal-600" size={16} />
                    <span className="text-sm font-medium text-teal-800">{m.name} — {t(m.role)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
              <Input label={t('memberName')} value={memberName} onChange={setMemberName} placeholder={isWork ? 'e.g. John' : 'e.g. Emma'} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('role')}</label>
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
                        <p>{t(r.value) !== r.value ? t(r.value) : r.label}</p>
                        <p className="text-xs text-gray-400">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Input label={t('age')} type="number" value={memberAge} onChange={setMemberAge} placeholder="8" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('pickAvatar')}</label>
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
                {busy ? <Spinner /> : (<><Plus size={16} /> {t('addMember')}</>)}
              </Button>

              <Button onClick={finish} fullWidth disabled={addedMembers.length === 0}>
                {addedMembers.length === 0
                  ? t('addAtLeastOne')
                  : t('doneGoToDashboard', { count: addedMembers.length })}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
