import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

  const fetchUserData = useCallback(async (userId: string, email: string) => {
    try {
      console.log("App: Fetching user data for", userId);
      
      // Fetch Profile and Goals in parallel for speed
      const [profileRes, goalsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('goals').select('*').eq('user_id', userId)
      ]);

      if (profileRes.error) console.warn("App: Profile error", profileRes.error);
      if (goalsRes.error) console.warn("App: Goals error", goalsRes.error);

      const profileData = profileRes.data;
      const goalsData = goalsRes.data;

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
      console.error("App: fetchUserData critical failure", error);
      // Fallback: Login with minimal data so app isn't stuck
      setUser({ id: userId, email, name: email.split('@')[0], goals: [] });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        await fetchUserData(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("App: Session refresh failed", error);
      setUser(null);
    }
  }, [fetchUserData]);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: If auth takes too long (e.g. Supabase down), 
    // force stop loading to let the app show SOMETHING.
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("App: Auth initialization timeout reached.");
        setLoading(false);
      }
    }, 4500);

    const init = async () => {
      try {
        await refreshUser();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("App: Auth Change Event -", event);
      if (!mounted) return;
      
      // We set loading true only on events that imply data fetching
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setLoading(true);
        if (session?.user) {
          await fetchUserData(session.user.id, session.user.email!);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, [refreshUser, fetchUserData]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (e) {
      console.error("App: Sign out error", e);
    }
  };

  const contextValue = useMemo(() => ({ user, loading, logout, refreshUser }), [user, loading, refreshUser]);

  // Only show full-screen spinner on initial load or critical transitions
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-8 max-w-xs w-full">
          <div className="relative">
             <div className="w-16 h-16 border-[3px] border-slate-100 rounded-full" />
             <div className="absolute inset-0 w-16 h-16 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-3 text-center">
            <h3 className="text-slate-900 font-bold text-xl tracking-tight">FinPlanner</h3>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Syncing with your financial horizon...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/auth" replace />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/auth" replace />} />
          <Route path="/goals" element={user ? <GoalsPage /> : <Navigate to="/auth" replace />} />
          <Route path="/plan" element={user ? <PlanPage /> : <Navigate to="/auth" replace />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/auth" replace />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">Financial Guardrails</p>
          <p className="max-w-3xl mx-auto text-xs text-slate-400 leading-relaxed font-medium opacity-80">
            © 2024 FinPlanner. All information is for educational purposes. We do not provide licensed financial advice. Investment involves risk. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>
    </AuthContext.Provider>
  );
};

export default App;