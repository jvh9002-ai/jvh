import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Spinner } from '@/components/ui';

export function AppLayout() {
  const { user, loading, family, activeMember, members, setActiveMember } = useAuth();
  const navigate = useNavigate();
  const [memberLoading, setMemberLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && user && !family) {
      navigate('/setup');
      return;
    }
    if (family && members.length > 0 && !activeMember) {
      setActiveMember(members[0]);
    }
    setMemberLoading(false);
  }, [loading, user, family, members, activeMember, setActiveMember, navigate]);

  if (loading || memberLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user || !family || !activeMember) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={activeMember.role} />
      <main className="flex-1 min-w-0 pb-16 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
