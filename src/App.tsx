import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar, TopBar } from './components/Sidebar';
import { DashboardScreen } from './screens/DashboardScreen';
import { TasksScreen } from './screens/TasksScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { GrowthScreen } from './screens/GrowthScreen';
import { AICoachScreen } from './screens/AICoachScreen';
import { FamilyScreen } from './screens/FamilyScreen';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const { user, loading, authInitialized } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

if (loading || !authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium">Loading Life Pilot AI...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal isOpen={true} onClose={() => {}} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar 
          title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
          subtitle="Family Growth OS" 
        />

        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardScreen />}
          {activeTab === 'tasks' && <TasksScreen />}
          {activeTab === 'rewards' && <RewardsScreen />}
          {activeTab === 'growth' && <GrowthScreen />}
          {activeTab === 'aicoach' && <AICoachScreen />}
          {activeTab === 'family' && <FamilyScreen />}
        </div>
      </main>
    </div>
  );
}
