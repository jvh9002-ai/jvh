import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { TopBar } from '@/components/Sidebar';
import { Card, Button, Badge } from '@/components/ui';
import { User, Settings, LogOut, Plus, Users, Mail, Calendar, Award, ChevronRight } from 'lucide-react';

export function ProfileScreen() {
  const { user, family, members, activeMember, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user || !activeMember) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isParent = activeMember.role === 'parent';
  const roleColors: Record<string, string> = {
    parent: 'bg-teal-50 text-teal-700',
    child: 'bg-pink-50 text-pink-700',
    teen: 'bg-indigo-50 text-indigo-700',
    college: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Profile" subtitle="Account and family settings" />

      <div className="px-5 lg:px-8 pb-8 space-y-6 max-w-2xl">
        {/* User profile */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
              {(user.user_metadata?.name || user.email)?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user.user_metadata?.name || 'Family Parent'}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <Badge color={roleColors[activeMember.role]} className="mt-1 capitalize">{activeMember.role} account</Badge>
            </div>
          </div>
        </Card>

        {/* Active member info */}
        {activeMember && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-3">Currently Viewing</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{activeMember.avatar_emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{activeMember.name}</p>
                <p className="text-sm text-gray-500 capitalize">{activeMember.role} · Age {activeMember.age}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{activeMember.points}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {members.filter((m) => m.id !== activeMember.id).map((m) => (
                <button
                  key={m.id}
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  <span>{m.avatar_emoji}</span> {m.name}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Family info */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-teal-600" size={20} />
            <h3 className="font-bold text-gray-900">Family</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{family?.name}</p>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className="text-2xl">{m.avatar_emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{m.role} · {m.age} years</p>
                </div>
                <Badge color={roleColors[m.role]} className="capitalize">{m.role}</Badge>
                <Badge color="bg-amber-50 text-amber-700">{m.points} pts</Badge>
              </div>
            ))}
          </div>
          {isParent && (
            <Button onClick={() => navigate('/setup')} variant="secondary" fullWidth className="mt-4">
              <Plus size={16} /> Add Family Member
            </Button>
          )}
        </Card>

        {/* Account details */}
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">Account Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-gray-400" size={16} />
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900 font-medium ml-auto">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="text-gray-400" size={16} />
              <span className="text-gray-500">Joined</span>
              <span className="text-gray-900 font-medium ml-auto">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Award className="text-gray-400" size={16} />
              <span className="text-gray-500">Plan</span>
              <Badge color="bg-teal-50 text-teal-700" className="ml-auto">Free Plan</Badge>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => navigate('/setup')}>
            <div className="flex items-center gap-3">
              <Settings className="text-gray-400" size={20} />
              <span className="text-sm font-medium text-gray-700">Family Settings</span>
            </div>
            <ChevronRight className="text-gray-300" size={18} />
          </Card>
          <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-50" onClick={handleSignOut}>
            <div className="flex items-center gap-3">
              <LogOut className="text-red-400" size={20} />
              <span className="text-sm font-medium text-red-600">Sign Out</span>
            </div>
          </Card>
        </div>

        <p className="text-center text-xs text-gray-400 pt-4">
          Life Pilot AI · Family Growth Operating System
        </p>
      </div>
    </div>
  );
}
