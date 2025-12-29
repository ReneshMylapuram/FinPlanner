import React, { useContext, memo } from 'react';
import Layout from '../components/Layout.tsx';
import { AuthContext } from '../App.tsx';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';

// Separate memoized components to prevent heavy tree rebuilds
const MetricCard = memo(({ label, value, color, detail, progress }: any) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 4 },
      show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
    }}
    className="bg-white/70 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-slate-200/40 group relative overflow-hidden"
  >
    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</div>
    <div className="flex items-center gap-4 mb-4">
      <div className={`text-4xl font-extrabold ${color} tracking-tight`}>{value}</div>
    </div>
    {progress !== undefined ? (
      <div className="space-y-2">
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="bg-indigo-600 h-full rounded-full"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{detail}</span>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{progress}%</span>
        </div>
      </div>
    ) : (
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{detail}</div>
    )}
  </motion.div>
));

const DashboardPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const profileCompletion = user?.profile ? 100 : 0;
  const monthlyInvestable = user?.profile?.monthlyInvestable || 0;
  const numGoals = user?.goals?.length || 0;
  
  const totalTargetCapital = user?.goals?.reduce((sum, goal) => sum + goal.targetAmount, 0) || 0;
  const savingsAmount = user?.profile?.savings || 0;
  const savingsProgress = totalTargetCapital > 0 ? Math.round((savingsAmount / totalTargetCapital) * 100) : 0;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Portfolio Pulse</h1>
        <p className="text-slate-500 mt-2 font-medium">Greetings, {user?.name}. Your wealth engine is synchronized.</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10"
      >
        <MetricCard 
          label="Strategy Health" 
          value={`${profileCompletion}%`} 
          color="text-indigo-600" 
          progress={profileCompletion}
          detail={profileCompletion < 100 ? "Setup required" : "Fully Optimized"}
        />
        <MetricCard 
          label="Capitalized Savings" 
          value={`$${savingsAmount.toLocaleString()}`} 
          color="text-emerald-600" 
          progress={savingsProgress}
          detail="Total Target Depth"
        />
        <MetricCard 
          label="Active Milestones" 
          value={numGoals} 
          color="text-amber-500" 
          detail="Target Destinations"
        />
        <MetricCard 
          label="Total Net Target" 
          value={`$${(totalTargetCapital / 1000000).toFixed(1)}M`} 
          color="text-slate-800" 
          detail="Combined Horizon"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-200/40 shadow-sm">
            <h3 className="text-2xl font-bold mb-8 text-slate-900">Immediate Roadmap</h3>
            <div className="space-y-6">
              {!user?.profile ? (
                <Link to="/profile" className="flex items-center gap-6 p-6 rounded-3xl bg-indigo-50/40 border border-indigo-100/40 hover:bg-indigo-50 transition-all group">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">1</div>
                  <div>
                    <h4 className="font-bold text-indigo-950 text-lg">Define Foundation</h4>
                    <p className="text-indigo-700/70 text-sm font-medium">Configure your salary, savings, and location metrics.</p>
                  </div>
                </Link>
              ) : numGoals === 0 ? (
                <Link to="/goals" className="flex items-center gap-6 p-6 rounded-3xl bg-amber-50/40 border border-amber-100/40 hover:bg-amber-50 transition-all group">
                  <div className="w-14 h-14 bg-amber-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-100 group-hover:scale-105 transition-transform">2</div>
                  <div>
                    <h4 className="font-bold text-amber-950 text-lg">Map Milestones</h4>
                    <p className="text-amber-700/70 text-sm font-medium">List the specific financial targets you are pursuing.</p>
                  </div>
                </Link>
              ) : (
                <Link to="/plan" className="flex items-center gap-6 p-6 rounded-3xl bg-emerald-50/40 border border-emerald-100/40 hover:bg-emerald-50 transition-all group">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-100 group-hover:scale-105 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-lg">Synthesize Plan</h4>
                    <p className="text-emerald-700/70 text-sm font-medium">All data confirmed. Access your AI investment strategy.</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-lg p-10 rounded-[2.5rem] border border-slate-200/40">
            <h3 className="text-xl font-bold mb-6 text-slate-800">Horizon Summary</h3>
            {user?.goals && user.goals.length > 0 ? (
              <div className="space-y-4">
                {user.goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">{goal.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{goal.horizon}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-600">${goal.targetAmount.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target</div>
                    </div>
                  </div>
                ))}
                {user.goals.length > 3 && (
                  <Link to="/goals" className="block text-center text-sm font-bold text-indigo-600 hover:underline pt-2">View all {user.goals.length} goals</Link>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">No data detected in horizon cache.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-8">Financial Wisdom</h3>
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">The Rule of 72</span>
                <p className="text-indigo-100/90 text-sm leading-relaxed">
                  Divide 72 by your expected annual return to find how many years it takes for your money to double. 
                  <span className="block mt-1 text-indigo-300/80 italic text-xs">Example: 72 / 8% = 9 years.</span>
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">The 50/30/20 Framework</span>
                <p className="text-indigo-100/90 text-sm leading-relaxed">
                  Allocate 50% of income to <span className="text-indigo-200">Needs</span>, 30% to <span className="text-indigo-200">Wants</span>, and 20% to <span className="text-indigo-200">Savings</span>.
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">The 4% Rule</span>
                <p className="text-indigo-100/90 text-sm leading-relaxed">
                  A common benchmark: withdrawing 4% of your portfolio annually is generally sustainable through retirement.
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 mt-12 relative z-10">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Growth Note</span>
            <p className="text-sm text-indigo-200/60 mt-2 italic leading-relaxed">
              "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it."
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default memo(DashboardPage);