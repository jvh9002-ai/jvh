import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar, MobileBottomNav } from '@/components/Sidebar';
import { UniversalHeader } from '@/components/UniversalHeader';
import { Spinner } from '@/components/ui';

export function AppLayout() {
  const { user, loading, family, activeMember, members, setActiveMember, authInitialized } = useAuth();
  const navigate = useNavigate();
  const [memberLoading, setMemberLoading] = useState(true);

  useEffect(() => {
    // Do nothing until auth initialization is fully complete.
    // This prevents premature redirects during F5 page reloads.
    if (!authInitialized || loading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    if (!family) {
      navigate('/setup', { replace: true });
      return;
    }
    if (family && !family.is_onboarded) {
      navigate('/setup', { replace: true });
      return;
    }
    if (family && family.is_onboarded && members.length > 0 && !activeMember) {
      setActiveMember(members[0]);
    }
    setMemberLoading(false);
  }, [authInitialized, loading, user, family, members, activeMember, setActiveMember, navigate]);

  if (loading || !authInitialized || memberLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user || !family || !family.is_onboarded || !activeMember) {
    navigate('/auth', { replace: true });
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={activeMember.role} />
      <main className="flex-1 min-w-0">
        <UniversalHeader />
        <div className="pb-20 lg:pb-0">
          <Outlet />
        </div>
      </main>
      <MobileBottomNav role={activeMember.role} />
    </div>
  );
}
