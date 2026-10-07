import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar, TopBar } from './components/Sidebar';

export default function App() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!auth?.user) {
    // Return your Auth/Login component here if not logged in
    return null; 
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar with state handler */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar 
          title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
          subtitle="Manage your family growth and activities" 
        />

        <div className="p-6">
          {/* Active Tab View Switching */}
          {activeTab === 'dashboard' && (
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-2">📊 Dashboard</h2>
              <p className="text-gray-600">Welcome to your family growth dashboard!</p>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-2">✅ Tasks</h2>
              <p className="text-gray-600">Assign and track child daily tasks here.</p>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-2">🎁 Rewards</h2>
              <p className="text-gray-600">Manage reward store and redemptions.</p>
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-2">📈 Growth Score</h2>
              <p className="text-gray-600">Track progress metrics and achievements.</p>
            </div>
          )}

          {activeTab === 'aicoach' && (
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-2">🤖 AI Coach</h2>
              <p className="text-gray-600">Personalized AI recommendations for children.</p>
            </div>
          )}

          {activeTab === 'family' && (
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">👨‍👩‍👧‍👦 Family & Children Management</h2>
              
              {/* Add Child Form */}
              <div className="max-w-md p-4 bg-rose-50 border border-rose-100 rounded-xl mb-6">
                <h3 className="font-bold text-rose-800 mb-2">➕ Add New Child Profile</h3>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Child Name" 
                    className="w-full p-2 text-sm border rounded-lg bg-white"
                  />
                  <input 
                    type="number" 
                    placeholder="Age / Grade" 
                    className="w-full p-2 text-sm border rounded-lg bg-white"
                  />
                  <button className="w-full py-2 bg-rose-600 text-white font-medium text-xs rounded-lg hover:bg-rose-700">
                    Create Child Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
