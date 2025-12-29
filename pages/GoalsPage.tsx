
import React, { useContext, useState } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../App';
import { Goal, TimeHorizon } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const GoalsPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [horizon, setHorizon] = useState<TimeHorizon>(TimeHorizon.MEDIUM);
  const [priority, setPriority] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  const openModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setHorizon(goal.horizon);
      setPriority(goal.priority);
    } else {
      setEditingGoal(null);
      setGoalName('');
      setTargetAmount('');
      setHorizon(TimeHorizon.MEDIUM);
      setPriority(3);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const goalData = {
      user_id: user.id,
      name: goalName,
      target_amount: parseFloat(targetAmount),
      horizon,
      priority
    };

    try {
      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('goals')
          .insert([goalData]);
        if (error) throw error;
      }
      
      await auth?.refreshUser();
      closeModal();
    } catch (err) {
      console.error("Error saving goal:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await auth?.refreshUser();
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Financial Milestones</h1>
          <p className="text-slate-500 mt-2 font-medium">Define exactly what you're building towards.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add New Goal
        </motion.button>
      </div>

      {(!user?.goals || user.goals.length === 0) ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/40 backdrop-blur-xl border-2 border-dashed border-slate-200/50 rounded-[2.5rem] p-20 text-center"
        >
          <div className="w-20 h-20 bg-white/60 text-indigo-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-700">No active horizons</h3>
          <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium">Start by adding your first milestone.</p>
          <button 
            onClick={() => openModal()}
            className="mt-8 text-indigo-600 font-bold hover:underline decoration-2 underline-offset-4"
          >
            Create your first milestone →
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence initial={false}>
            {user.goals.map(goal => (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -4 }}
                className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] border border-white/60 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-100 transition-colors" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <h3 className="text-2xl font-bold text-slate-900">{goal.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(goal)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onClick={() => handleDelete(goal.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>

                <div className="mb-8 relative z-10">
                  <div className="text-4xl font-extrabold text-slate-900">${goal.targetAmount.toLocaleString()}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Target Capital</div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 relative z-10">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${
                    goal.horizon === TimeHorizon.LONG ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                    goal.horizon === TimeHorizon.MEDIUM ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {goal.horizon.split(' ')[0]} Horizon
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(p => (
                        <div key={p} className={`w-1.5 h-3 rounded-full ${p <= goal.priority ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white/90 backdrop-blur-3xl rounded-[2.5rem] w-full max-w-lg p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-white/50"
            >
              <h2 className="text-3xl font-bold mb-8 text-slate-900 tracking-tight">{editingGoal ? 'Edit Milestone' : 'New Milestone'}</h2>
              <form onSubmit={handleSaveGoal} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Milestone Name</label>
                  <input 
                    required value={goalName} onChange={e => setGoalName(e.target.value)}
                    className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    placeholder="e.g. Early Retirement"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Capital ($)</label>
                  <input 
                    type="number" required value={targetAmount} onChange={e => setTargetAmount(e.target.value)}
                    className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    placeholder="250000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Temporal Horizon</label>
                  <select 
                    value={horizon} onChange={e => setHorizon(e.target.value as TimeHorizon)}
                    className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium appearance-none"
                  >
                    <option value={TimeHorizon.SHORT}>{TimeHorizon.SHORT}</option>
                    <option value={TimeHorizon.MEDIUM}>{TimeHorizon.MEDIUM}</option>
                    <option value={TimeHorizon.LONG}>{TimeHorizon.LONG}</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Urgency Level</label>
                    <span className="text-xs font-bold text-indigo-600">{priority} / 5</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" value={priority} onChange={e => setPriority(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={closeModal} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Dismiss</button>
                  <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all">
                    {submitting ? 'Saving...' : editingGoal ? 'Update' : 'Commit Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default GoalsPage;
