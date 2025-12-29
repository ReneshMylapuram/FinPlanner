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
      console.log("Fetching user data for:", userId);
      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) console.error("Profile fetch error:", profileError);

      // Fetch Goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (goalsError) console.error("Goals fetch error:", goalsError);

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
      console.error("Critical error in fetchUserData:", error);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        await fetchUserData(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await refreshUser();
      } catch (e) {
        console.error("Initialization failed during refreshUser:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change detected:", event);
      if (!mounted) return;
      
      setLoading(true);
      try {
        if (session?.user) {
          await fetchUserData(session.user.id, session.user.email!);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Error handling auth change:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    // Safety timeout: If still loading after 6 seconds, force stop the spinner
    // This prevents the "blank screen" if the DB connection is slow or blocked
    const timer = setTimeout(() => {
      if (loading && mounted) {
        console.warn("Loading timeout reached. Forcing UI mount to prevent blank screen.");
        setLoading(false);
      }
    }, 6000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const value = useMemo(() => ({ user, loading, logout, refreshUser }), [user, loading]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium text-sm animate-pulse tracking-wide">Connecting to horizon...</p>
        </div>
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
          <Route path="*" element={<Navigate to="/" />} />
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