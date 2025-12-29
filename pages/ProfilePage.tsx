
import React, { useContext, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../App';
import { UserProfile } from '../types';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const ProfilePage: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const [formData, setFormData] = useState<UserProfile>({
    age: 30,
    salary: 80000,
    country: 'USA',
    state: 'GA',
    savings: 10000,
    monthlyInvestable: 1000,
    debtPayments: 500,
    emergencyFund: 5000
  });

  useEffect(() => {
    if (user?.profile) {
      setFormData(user.profile);
    }
  }, [user?.profile]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMsg('');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          age: formData.age,
          salary: formData.salary,
          country: formData.country,
          state: formData.state,
          savings: formData.savings,
          monthly_investable: formData.monthlyInvestable,
          debt_payments: formData.debtPayments,
          emergency_fund: formData.emergencyFund,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      await auth?.refreshUser();
      setMsg('Configuration secured.');
    } catch (err: any) {
      console.error("Save Error:", err);
      setMsg('Error saving profile');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Configuration</h1>
        <p className="text-slate-500 mt-1 font-medium">Your baseline data determines your strategy's resilience.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-4xl bg-white/60 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60"
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Age</label>
            <input 
              name="age" type="number" value={formData.age} onChange={handleChange} required
              className="w-full p-4 bg-white/40 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Annual Gross Income ($)</label>
            <input 
              name="salary" type="number" value={formData.salary} onChange={handleChange} required
              className="w-full p-4 bg-white/40 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tax Jurisdiction</label>
            <select 
              name="country" value={formData.country} onChange={handleChange}
              className="w-full p-4 bg-white/40 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium appearance-none"
            >
              <option value="USA">United States</option>
              <option value="CAN">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AUS">Australia</option>
              <option value="OTH">Other</option>
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">State / Province</label>
            <input 
              name="state" type="text" value={formData.state} onChange={handleChange} placeholder="GA, NY, CA, etc."
              className="w-full p-4 bg-white/40 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          
          <div className="col-span-full py-2">
            <div className="h-px bg-slate-100 w-full" />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Liquid Savings ($)</label>
            <input 
              name="savings" type="number" value={formData.savings} onChange={handleChange} required
              className="w-full p-4 bg-white/40 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Monthly Surplus to Invest ($)</label>
            <input 
              name="monthlyInvestable" type="number" value={formData.monthlyInvestable} onChange={handleChange} required
              className="w-full p-4 bg-white/40 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Debt Obligations ($ / mo)</label>
            <input 
              name="debtPayments" type="number" value={formData.debtPayments} onChange={handleChange}
              className="w-full p-4 bg-white/40 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Emergency Reserve ($)</label>
            <input 
              name="emergencyFund" type="number" value={formData.emergencyFund} onChange={handleChange}
              className="w-full p-4 bg-white/40 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="col-span-full pt-6 flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-50 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Processing...' : 'Apply Configuration'}
            </motion.button>
            {msg && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${msg.includes('Error') ? 'text-rose-500' : 'text-emerald-600'} font-bold text-sm`}
              >
                {msg}
              </motion.span>
            )}
          </div>
        </form>
      </motion.div>
    </Layout>
  );
};

export default ProfilePage;
