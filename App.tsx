import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

  const fetchUserData = useCallback(async (userId: string, email: string) => {
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
      // Even if data fetch fails, we should still allow the user to be "logged in" with an empty profile
      setUser(prev => prev || { id: userId, email, name: email.split('@')[0], goals: [] });
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
      console.error("Error refreshing session:", error);
      setUser(null);
    }
  }, [fetchUserData]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await refreshUser();
      } catch (e) {
        console.error("Initialization failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event);
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await fetchUserData(session.user.id, session.user.email!);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Final safety timeout to ensure app doesn't stay white forever
    const timer = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [refreshUser, fetchUserData]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const contextValue = useMemo(() => ({ user, loading, logout, refreshUser }), [user, loading, refreshUser]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg" />
          <div className="space-y-2 text-center">
            <p className="text-slate-600 font-bold tracking-tight text-lg">Synchronizing Portfolio</p>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Establishing secure horizon connection...</p>
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
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={user ? <DashboardPage /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/profile" 
            element={user ? <ProfilePage /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/goals" 
            element={user ? <GoalsPage /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/plan" 
            element={user ? <PlanPage /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/settings" 
            element={user ? <SettingsPage /> : <Navigate to="/auth" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      {/* Footer Disclaimer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Regulatory Notice</p>
          <p className="max-w-3xl mx-auto text-xs text-slate-400 leading-relaxed font-medium">
            © 2024 FinPlanner. All models are deterministic and for educational purposes only. FinPlanner is not a registered investment advisor, broker-dealer, or tax professional. Automated strategies do not guarantee returns and involve risk of capital loss. Always perform independent due diligence or consult a certified professional.
          </p>
        </div>
      </footer>
    </AuthContext.Provider>
  );
};

export default App;