import React, { useContext, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../App';
import { generateAIPlan, getFinancialAdvice } from '../services/gemini';
import { PlanResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const PlanPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [aiNote, setAiNote] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (user?.profile) {
        setLoading(true);
        setError(false);
        try {
          const aiPlan = await generateAIPlan(user.profile, user.goals);
          if (aiPlan) {
            setPlan(aiPlan);
            const note = await getFinancialAdvice(user.profile, user.goals, aiPlan);
            setAiNote(note || "");
          } else {
            setError(true);
          }
        } catch (err) {
          setError(true);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user?.profile, user?.goals]);

  const exportCSV = () => {
    if (!plan) return;
    const headers = ['Asset Class', 'Percentage', 'Amount', 'Suggestions'];
    const rows = plan.allocations.map(a => [
      a.assetClass, 
      `${a.percentage}%`, 
      `$${a.amount.toFixed(2)}`, 
      a.suggestedInstruments.join('; ')
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => `"${e.join('","')}"`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinPlanner_AI_Plan_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user?.profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-white/40 backdrop-blur-xl text-indigo-400 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Strategy Unavailable</h2>
          <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium leading-relaxed">Please complete your financial profile to activate AI analysis.</p>
          <motion.a 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="#/profile" 
            className="mt-8 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100"
          >
            Configure Profile
          </motion.a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
            AI Portfolio Strategy
            {loading && <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Synthesized via FinPlanner Intelligence reasoning.</p>
        </div>
        {!loading && plan && (
          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={exportCSV}
            className="flex items-center gap-2 text-indigo-600 font-bold border border-indigo-200/50 bg-white/40 backdrop-blur-md px-6 py-3 rounded-2xl hover:bg-white transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Strategy
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/40 backdrop-blur-xl h-32 rounded-[2rem] animate-pulse" />
            ))}
            <div className="col-span-full bg-white/40 backdrop-blur-xl h-96 rounded-[2.5rem] animate-pulse" />
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-12 text-center bg-rose-50 border border-rose-100 rounded-[2.5rem]"
          >
            <h3 className="text-rose-900 font-bold text-xl">Intelligence Engine Offline</h3>
            <p className="text-rose-600 mt-2">We couldn't generate your plan. Please check your API key or try again later.</p>
            <button onClick={() => window.location.reload()} className="mt-6 font-bold text-indigo-600">Retry Analysis</button>
          </motion.div>
        ) : plan && (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tolerance Profile</div>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-extrabold text-slate-900">{plan.riskScore}</span>
                  <span className="text-xs bg-indigo-100/50 text-indigo-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border border-indigo-200/50">
                    {plan.riskScore > 70 ? 'Aggressive' : plan.riskScore > 40 ? 'Moderate' : 'Conservative'}
                  </span>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Analyzed Capital</div>
                <div className="text-5xl font-extrabold text-slate-900">
                  ${plan.totalInvestable.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Tax Estimate</div>
                <div className="text-5xl font-extrabold text-rose-500">
                  ${plan.taxEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Warnings */}
            {plan.warnings.length > 0 && (
              <div className="bg-amber-50/50 backdrop-blur-lg border border-amber-200/50 rounded-[2rem] p-8">
                <h4 className="text-amber-900 font-bold mb-4 flex items-center gap-3">
                  Strategic Observations
                </h4>
                <ul className="space-y-3">
                  {plan.warnings.map((w, i) => (
                    <li key={i} className="text-amber-800/80 text-sm font-medium flex items-start gap-3">
                      <span className="mt-1.5 w-2 h-2 bg-amber-400 rounded-full shrink-0"></span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Allocation Breakdown */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-xl overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-900">Recommended Distribution</h3>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">AI Computed</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-10 py-5">Asset Class</th>
                      <th className="px-10 py-5">Weight</th>
                      <th className="px-10 py-5">Capital Allocation</th>
                      <th className="px-10 py-5">AI Vehicle Picks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plan.allocations.map((a, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-10 py-6 font-bold text-slate-800 text-lg">{a.assetClass}</td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <span className="text-slate-900 font-bold text-lg w-12">{a.percentage}%</span>
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${a.percentage}%` }}
                                transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                                className="bg-indigo-600 h-full rounded-full"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-slate-900 font-bold text-lg">
                          ${a.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-wrap gap-2">
                            {a.suggestedInstruments.map((s, idx) => (
                              <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-lg font-bold uppercase tracking-wider">{s}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Coaching Section */}
            <div className="bg-indigo-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                  <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Intelligence Note</h3>
              </div>
              <div className="text-indigo-100/90 leading-relaxed italic text-lg font-medium">
                {aiNote ? (
                  <div className="space-y-4">
                    {aiNote.split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="animate-pulse bg-white/10 h-4 w-full rounded-full"></div>
                    <div className="animate-pulse bg-white/10 h-4 w-4/5 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default PlanPage;