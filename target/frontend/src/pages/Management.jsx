import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { getProfile } from '../api/api';
import BudgetManager from '../components/BudgetManager';
import GoalManager from '../components/GoalManager';
import CategoryManager from '../components/CategoryManager';
import AIInsights from '../components/AIInsights';
import ReportGenerator from '../components/ReportGenerator';

const Management = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      setUser(user);
      
      try {
        const profileRes = await getProfile();
        setUserProfile(profileRes);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/");
      } else if (session) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const tabs = [
    { id: 'categories', name: 'Categories', icon: '🏷️' },
    { id: 'budgets', name: 'Budgets', icon: '💰' },
    { id: 'goals', name: 'Goals', icon: '🎯' },
    { id: 'ai-insights', name: 'AI Insights', icon: '🤖' },
    { id: 'reports', name: 'Reports', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">📊 Financial Management</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {userProfile?.profile?.full_name || userProfile?.profile?.username || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 mb-6"
          >
            ← Back to Dashboard
          </button>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'budgets' && <BudgetManager />}
          {activeTab === 'goals' && <GoalManager />}
          {activeTab === 'ai-insights' && <AIInsights />}
          {activeTab === 'reports' && <ReportGenerator />}
        </div>
      </div>
    </div>
  );
};

export default Management;
