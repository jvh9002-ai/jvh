import { useAuth } from '@/context/AuthContext';
import { ParentDashboard } from '@/screens/ParentDashboard';
import { ChildDashboard } from '@/screens/ChildDashboard';
import { TeenDashboard } from '@/screens/TeenDashboard';
import { CollegeDashboard } from '@/screens/CollegeDashboard';

export function DashboardRouter() {
  const { activeMember } = useAuth();
  if (!activeMember) return null;

  switch (activeMember.role) {
    case 'parent':
      return <ParentDashboard />;
    case 'child':
      return <ChildDashboard />;
    case 'teen':
      return <TeenDashboard />;
    case 'college':
      return <CollegeDashboard />;
    default:
      return <ParentDashboard />;
  }
}
