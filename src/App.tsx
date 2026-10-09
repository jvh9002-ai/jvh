import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AuthScreen } from './screens/AuthScreen';
import { FamilySetupScreen } from './screens/FamilySetupScreen';
import { DashboardRouter } from './screens/DashboardRouter';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/auth" element={<AuthScreen />} />

        <Route path="/setup" element={<FamilySetupScreen />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardRouter />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
