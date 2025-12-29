import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import VisualBackground from '../components/VisualBackground.tsx';

const LandingPage: React.FC = () => {
  return (
    <VisualBackground>
      <div className="min-h-screen">
        <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-20">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-indigo-900 tracking-tight"
          >
            FinPlanner
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-x-6 flex items-center"
          >
            <Link to="/auth" className="text-slate-600 hover:text-indigo-900 font-medium transition-colors">Log In</Link>
            <Link to="/auth" className="bg-indigo-950 text-white px-6 py-3 rounded-full font-semibold hover:bg-black transition-all shadow-xl hover:shadow-indigo-200">
              Get Started
            </Link>
          </motion.div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-16 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Plan your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-indigo-500">financial horizon.</span>
              </h1>
              <p className="mt-8 text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
                FinPlanner creates intelligent, purpose-driven investment plans tailored to your life's milestones. Simple, deterministic, and calm.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row gap-6">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/auth" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all text-center block shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)]">
                    Begin Your Journey
                  </Link>
                </motion.div>
                <div className="flex items-center gap-2 text-slate-400 font-medium italic">
                  No spreadsheets required.
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative z-10 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-white/40 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200" 
                  alt="Dashboard Preview" 
                  className="rounded-3xl shadow-inner w-full h-[500px] object-cover mix-blend-multiply opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
              </div>
              
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] border border-white/50 z-20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">Retirement Ready</div>
                    <div className="text-sm text-slate-500 font-medium">Progress: 88% of target</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <section className="mt-48 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Harmonious Growth', desc: 'Algorithmically balanced for your specific life stages.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
              { title: 'Tax-First Logic', desc: 'Inbuilt estimates for US federal and state liabilities.', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
              { title: 'Quiet Confidence', desc: 'No noise, no hype. Just a plan that works while you sleep.', icon: 'M12 3v1m0 16v1m9-9h-1m-16 0H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white/40 backdrop-blur-lg p-10 rounded-[2rem] border border-white/40 shadow-xl hover:shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </section>
        </main>
      </div>
    </VisualBackground>
  );
};

export default LandingPage;