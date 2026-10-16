import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AuthScreen } from './screens/AuthScreen';
import { FamilySetupScreen } from './screens/FamilySetupScreen';
import { DashboardRouter } from './screens/DashboardRouter';
import { TasksScreen } from './screens/TasksScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { GrowthScoreScreen } from './screens/GrowthScoreScreen';
import { CoachScreen } from './screens/CoachScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

 <Route path="/auth" element={<AuthScreen />} />

<Route path="/setup" element={<FamilySetupScreen />} />

<Route path="/family/add" element={<FamilySetupScreen />} />

<Route element={<AppLayout />}>
  <Route path="/" element={<DashboardRouter />} />
  <Route path="/dashboard" element={<DashboardRouter />} />
  <Route path="/tasks" element={<TasksScreen />} />
  <Route path="/rewards" element={<RewardsScreen />} />
  <Route path="/growth" element={<GrowthScoreScreen />} />
  <Route path="/aicoach" element={<CoachScreen />} />
  <Route path="/family" element={<ProfileScreen />} />
</Route>

<Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
