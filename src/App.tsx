import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AuthScreen } from './screens/AuthScreen';
import { FamilySetupScreen } from './screens/FamilySetupScreen';
import { DashboardRouter } from './screens/DashboardRouter';
import { TasksScreen } from './screens/TasksScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { GrowthScreen } from './screens/GrowthScreen';
import { AICoachScreen } from './screens/AICoachScreen';
import { FamilyScreen } from './screens/FamilyScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/auth" element={<AuthScreen />} />

        <Route path="/setup" element={<FamilySetupScreen />} />

        <Route element={<AppLayout />}>
  <Route path="/" element={<DashboardRouter />} />
  <Route path="/dashboard" element={<DashboardRouter />} />

  <Route path="/tasks" element={<TasksScreen />} />
  <Route path="/rewards" element={<RewardsScreen />} />
  <Route path="/growth" element={<GrowthScreen />} />
  <Route path="/aicoach" element={<AICoachScreen />} />
  <Route path="/family" element={<FamilyScreen />} />
</Route>
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
