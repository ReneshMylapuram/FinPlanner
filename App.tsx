import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { User, UserProfile, Goal, TimeHorizon } from './types.ts';
import LandingPage from './pages/LandingPage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import GoalsPage from './pages/GoalsPage.tsx';
import PlanPage from './pages/PlanPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import { supabase } from './lib/supabase.ts';

// Real Supabase Auth Context
export const AuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
} | null>(null);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string, email: string) => {
    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Fetch Goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      const mappedProfile: UserProfile | undefined = profileData ? {
        age: profileData.age,
        salary: profileData.salary,
        country: profileData.country,
        state: profileData.state,
        savings: profileData.savings,
        monthlyInvestable: profileData.monthly_investable,
        debtPayments: profileData.debt_payments,
        emergencyFund: profileData.emergency_fund
      } : undefined;

      const mappedGoals: Goal[] = goalsData?.map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: g.target_amount,
        horizon: g.horizon as TimeHorizon,
        priority: g.priority
      })) || [];

      setUser({
        id: userId,
        email: email,
        name: email.split('@')[0],
        profile: mappedProfile,
        goals: mappedGoals
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserData(session.user.id, session.user.email!);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial session check
    refreshUser().then(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserData(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, logout, refreshUser }), [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={user ? <DashboardPage /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <ProfilePage /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/goals" 
            element={user ? <GoalsPage /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/plan" 
            element={user ? <PlanPage /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/settings" 
            element={user ? <SettingsPage /> : <Navigate to="/auth" />} 
          />
        </Routes>
      </Router>
      
      {/* Footer Disclaimer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© 2024 FinPlanner. Disclaimer: FinPlanner is an educational tool for planning purposes only. It does not provide certified financial, legal, or tax advice. Always consult with a professional before making financial decisions.</p>
        </div>
      </footer>
    </AuthContext.Provider>
  );
};

export default App;