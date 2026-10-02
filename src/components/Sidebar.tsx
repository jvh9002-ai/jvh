import { NavLink, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Gift, Sparkles, BarChart3, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  role: 'parent' | 'child' | 'teen' | 'college';
}

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/rewards', icon: Gift, label: 'Rewards' },
  { to: '/growth', icon: BarChart3, label: 'Growth Score' },
  { to: '/coach', icon: Sparkles, label: 'AI Coach' },
  { to: '/report', icon: BarChart3, label: 'Weekly Report' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const roleStyles: Record<string, { active: string; hover: string; bar: string }> = {
  parent: { active: 'bg-teal-50 text-teal-700', hover: 'hover:bg-gray-50', bar: 'bg-teal-600' },
  child: { active: 'bg-pink-100 text-pink-600', hover: 'hover:bg-pink-50', bar: 'bg-pink-500' },
  teen: { active: 'bg-indigo-500/15 text-indigo-300', hover: 'hover:bg-white/5', bar: 'bg-indigo-500' },
  college: { active: 'bg-blue-50 text-blue-700', hover: 'hover:bg-gray-50', bar: 'bg-blue-600' },
};

export function Sidebar({ role }: SidebarProps) {
  const { signOut, activeMember } = useAuth();
  const navigate = useNavigate();
  const s = roleStyles[role];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col w-60 ${role === 'teen' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} border-r h-screen sticky top-0`}>
        <div className="px-5 py-5 flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl ${s.bar} flex items-center justify-center text-white`}>
            <Sparkles size={18} />
          </div>
          <div>
            <p className={`text-sm font-bold ${role === 'teen' ? 'text-white' : 'text-gray-900'}`}>Life Pilot AI</p>
            <p className={`text-xs ${role === 'teen' ? 'text-slate-400' : 'text-gray-400'} capitalize`}>{role} Mode</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? s.active : `${s.hover} ${role === 'teen' ? 'text-slate-300' : 'text-gray-600'}`
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          {activeMember && (
            <div className="px-3 py-2 mb-2">
              <p className={`text-xs ${role === 'teen' ? 'text-slate-400' : 'text-gray-400'}`}>Viewing as</p>
              <p className={`text-sm font-semibold ${role === 'teen' ? 'text-white' : 'text-gray-900'}`}>
                {activeMember.avatar_emoji} {activeMember.name}
              </p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium w-full transition-all ${s.hover} ${role === 'teen' ? 'text-slate-300' : 'text-gray-600'}`}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${role === 'teen' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} border-t flex items-center justify-around px-2 py-1.5 safe-area`}>
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-all ${
                isActive ? s.active : role === 'teen' ? 'text-slate-400' : 'text-gray-400'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export function TopBar({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  const { activeMember } = useAuth();
  return (
    <div className="flex items-center justify-between px-5 py-4 lg:px-8 lg:py-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {right}
        {activeMember && (
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5">
            <span className="text-lg">{activeMember.avatar_emoji}</span>
            <span className="text-sm font-semibold text-gray-700">{activeMember.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
