import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/Sidebar';
import { Card, Button, Input, Modal, Badge, Spinner } from '@/components/ui';
import type { Reward } from '@/types/database';
import { Plus, Gift, Star, Check, Trash2, Lock } from 'lucide-react';

export function RewardsScreen() {
  const { activeMember, members, family, setActiveMember } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [pointsRequired, setPointsRequired] = useState('50');
  const [memberId, setMemberId] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const isParent = activeMember?.role === 'parent';
  const currentMemberId = isParent ? memberId || activeMember?.id || '' : activeMember?.id || '';
  const currentMember = members.find((m) => m.id === currentMemberId) || activeMember;

  useEffect(() => {
    if (!family) return;
    setLoading(true);
    let query = supabase.from('rewards').select('*').eq('family_id', family.id).order('created_at', { ascending: false });
    if (!isParent && activeMember) {
      query = query.or(`member_id.is.null,member_id.eq.${activeMember.id}`);
    }
    query.then(({ data }) => { setRewards((data as Reward[]) || []); setLoading(false); });
  }, [family, activeMember, isParent]);

  const addReward = async () => {
    if (!family || !title) return;
    setBusy(true);
    const { data, error } = await supabase.from('rewards').insert({
      family_id: family.id,
      member_id: memberId || null,
      title,
      points_required: parseInt(pointsRequired) || 50,
    }).select().single();
    setBusy(false);
    if (!error && data) {
      setRewards([data as Reward, ...rewards]);
      setTitle('');
      setShowAdd(false);
    }
  };

  const redeemReward = async (reward: Reward) => {
    if (!currentMember || currentMember.points < reward.points_required) return;
    await supabase.from('rewards').update({ redeemed: true }).eq('id', reward.id);
    setRewards(rewards.map((r) => (r.id === reward.id ? { ...r, redeemed: true } : r)));
    await supabase.from('members').update({ points: currentMember.points - reward.points_required }).eq('id', currentMember.id);
  };

  const deleteReward = async (reward: Reward) => {
    await supabase.from('rewards').delete().eq('id', reward.id);
    setRewards(rewards.filter((r) => r.id !== reward.id));
  };

  return (
    <div className="min-h-screen">
      <TopBar
        title="Rewards"
        subtitle={isParent ? 'Create rewards for your family' : 'Redeem your hard-earned points'}
        right={isParent ? <Button onClick={() => setShowAdd(true)}><Plus size={16} /> New Reward</Button> : undefined}
      />

      <div className="px-5 lg:px-8 pb-8 space-y-4">
        {!isParent && currentMember && (
          <Card className="p-5 bg-gradient-to-r from-amber-400 to-orange-500 border-0 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-50 text-sm">Your Points</p>
                <p className="text-3xl font-bold mt-1">{currentMember.points}</p>
              </div>
              <Star className="text-white/50" size={40} />
            </div>
          </Card>
        )}

        {isParent && members.length > 0 && (
          <Card className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter rewards by member</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMemberId('')}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${memberId === '' ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' : 'bg-gray-50 text-gray-600'}`}
              >
                All Members
              </button>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && <div className="col-span-full flex justify-center py-8"><Spinner /></div>}
          {!loading && rewards.length === 0 && (
            <Card className="col-span-full p-8 text-center">
              <Gift className="mx-auto text-gray-300" size={32} />
              <p className="text-gray-400 text-sm mt-2">No rewards yet. {isParent ? 'Create one to motivate your family!' : 'Ask your parent to add rewards!'}</p>
            </Card>
          )}
          {rewards.map((reward) => {
            const canAfford = currentMember ? currentMember.points >= reward.points_required : false;
            const member = members.find((m) => m.id === reward.member_id);
            return (
              <Card key={reward.id} className={`p-5 ${reward.redeemed ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <Gift className="text-orange-500" size={24} />
                  </div>
                  {isParent && (
                    <button onClick={() => deleteReward(reward)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-gray-900">{reward.title}</h3>
                {member && <p className="text-xs text-gray-500 mt-0.5">{member.avatar_emoji} {member.name}</p>}
                <div className="flex items-center gap-1 mt-3">
                  <Star className="text-amber-500" size={16} />
                  <span className="font-bold text-gray-900">{reward.points_required}</span>
                  <span className="text-xs text-gray-500">points</span>
                </div>
                {reward.redeemed ? (
                  <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold">
                    <Check size={16} /> Redeemed
                  </div>
                ) : !isParent ? (
                  <Button
                    onClick={() => redeemReward(reward)}
                    fullWidth
                    variant={canAfford ? 'primary' : 'secondary'}
                    disabled={!canAfford}
                    className="mt-4"
                  >
                    {canAfford ? <><Gift size={16} /> Redeem</> : <><Lock size={14} /> Need {reward.points_required - (currentMember?.points ?? 0)} more</>}
                  </Button>
                ) : (
                  <div className="mt-4 text-xs text-gray-400">
                    {canAfford ? 'Ready to redeem' : 'Not enough points yet'}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Reward">
        <div className="space-y-4">
          <Input label="Reward Title" value={title} onChange={setTitle} placeholder="e.g. Movie night" />
          <Input label="Points Required" type="number" value={pointsRequired} onChange={setPointsRequired} placeholder="50" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To (optional)</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-white"
            >
              <option value="">All Family Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.avatar_emoji} {m.name}</option>
              ))}
            </select>
          </div>
          <Button onClick={addReward} fullWidth disabled={busy || !title}>
            {busy ? <Spinner /> : 'Create Reward'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
