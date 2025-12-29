import React, { useContext, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import VisualBackground from './VisualBackground.tsx';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Profile', path: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 0 00-7-7z' },
    { label: 'Goals', path: '/goals', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Plan', path: '/plan', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <VisualBackground>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden bg-indigo-700 text-white p-4 flex justify-between items-center sticky top-0 z-50">
          <Link to="/" className="text-xl font-bold tracking-tight">FinPlanner</Link>
          <button onClick={() => auth?.logout()} className="text-xs bg-indigo-600/50 px-3 py-1.5 rounded-full border border-white/10">Logout</button>
        </div>

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900/[0.02] border-r border-slate-900/5 min-h-screen sticky top-0 z-40">
          <div className="p-8">
            <Link to="/" className="text-2xl font-bold text-indigo-900 tracking-tight">FinPlanner</Link>
          </div>
          <nav className="flex-1 mt-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center px-8 py-5 transition-all group ${
                    isActive ? 'text-indigo-900 font-semibold' : 'text-slate-400 hover:text-indigo-700'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                      className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full"
                    />
                  )}
                  <svg className={`w-5 h-5 mr-3 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-8 border-t border-slate-900/5">
            <button 
              onClick={() => { auth?.logout(); navigate('/'); }}
              className="flex items-center text-slate-400 hover:text-red-500 transition-colors group text-sm font-medium"
            >
              <svg className="w-5 h-5 mr-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area - Fixed overflow to allow document scroll */}
        <main className="flex-1 p-6 md:p-12 lg:p-16">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ willChange: 'transform, opacity' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Nav Mobile */}
        <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white border border-slate-200/60 rounded-3xl shadow-2xl flex justify-around p-3 z-50">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                location.pathname === item.path ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </VisualBackground>
  );
};

export default memo(Layout);