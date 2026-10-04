import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import '@/lib/i18n';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { AuthScreen } from '@/screens/AuthScreen';
import { FamilySetupScreen } from '@/screens/FamilySetupScreen';
import { AppLayout } from '@/components/AppLayout';
import { DashboardRouter } from '@/screens/DashboardRouter';
import { TasksScreen } from '@/screens/TasksScreen';
import { RewardsScreen } from '@/screens/RewardsScreen';
import { GrowthScoreScreen } from '@/screens/GrowthScoreScreen';
import { CoachScreen } from '@/screens/CoachScreen';
import { ReportScreen } from '@/screens/ReportScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { Spinner } from '@/components/ui';

function ProtectedRoutes() {
  const { user, loading, family } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!family || !family.is_onboarded) return <Navigate to="/setup" replace />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/tasks" element={<TasksScreen />} />
        <Route path="/rewards" element={<RewardsScreen />} />
        <Route path="/growth" element={<GrowthScoreScreen />} />
        <Route path="/coach" element={<CoachScreen />} />
        <Route path="/report" element={<ReportScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const { loading, user, family } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Authenticated user with an onboarded family → go to the app
  if (user && family && family.is_onboarded) {
    return (
      <Routes>
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    );
  }

  // Authenticated user without a family or not yet onboarded → setup screen
  if (user) {
    return (
      <Routes>
        <Route path="/setup" element={<FamilySetupScreen />} />
        <Route path="/*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  // Unauthenticated → welcome / auth
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
