
import React, { memo } from 'react';
import { motion } from 'framer-motion';

const VisualBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-slate-50">
      {/* Primary Atmospheric Gradient - Fully Static */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #bae6fd 0%, #ecfeff 35%, #fff7ed 100%)',
          transform: 'translateZ(0)' // Force GPU layer
        }}
      />

      {/* Optimized Hills - Using GPU-based drift animations instead of scroll parallax */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Hill 1 - Slow Horizontal Drift */}
        <motion.div 
          animate={{ 
            x: [0, 20, 0],
            y: [0, 10, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute bottom-[-10%] left-[-15%] w-[130%] h-[45%] bg-sky-400/10 blur-3xl rounded-[100%] opacity-40"
          style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
        />
        
        {/* Hill 2 - Opposite Drift */}
        <motion.div 
          animate={{ 
            x: [0, -25, 0],
            y: [0, 15, 0]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute bottom-[-5%] right-[-10%] w-[120%] h-[40%] bg-cyan-400/10 blur-2xl rounded-[100%] opacity-30"
          style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
        />
        
        {/* Hill 3 - Subtle Breathing */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bottom-[-15%] left-[10%] w-[100%] h-[35%] bg-rose-200/20 blur-xl rounded-[100%]"
          style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default memo(VisualBackground);
