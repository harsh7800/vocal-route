"use client";

import React, { useState } from 'react';
import { useVocalRoute } from '../provider';
import { motion, AnimatePresence } from 'framer-motion';

export interface VocalRouteButtonProps {
  position?: { top?: string; bottom?: string; left?: string; right?: string };
  className?: string;
  hideOnActive?: boolean;
}

export function VocalRouteButton({
  position = { bottom: '2rem', right: '2rem' },
  className,
  hideOnActive = true,
}: VocalRouteButtonProps) {
  const { startListening, isListening, isProcessing, agentState, setIsAgentMinimized, setIsAgentOpen, isAgentOpen, resetAgent } = useVocalRoute();
  const [isOpen, setIsOpen] = useState(false);

  // If the agent is active or we are listening, we might want to hide the entry button
  // depending on user preference.
  if (hideOnActive && (isListening || isProcessing || isAgentOpen || agentState.state !== 'IDLE')) return null;

  const handleOpenAgent = () => {
    setIsAgentOpen(true);
    setIsAgentMinimized(false);
    setIsOpen(false);
  };

  const handleVoice = () => {
    startListening({ mode: 'global' });
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'fixed', zIndex: 10000, ...position }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: '1rem',
              width: '240px',
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f1f5f9',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f8fafc', backgroundColor: '#f8fafc' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Assistant Mode</span>
            </div>

            <button
              onClick={handleVoice}
              style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
              className="hover:bg-slate-50 transition-colors group"
            >
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ margin: 'auto' }}>mic</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>Global Voice</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Omni-search & Navigation</span>
              </div>
            </button>

            <button
              onClick={handleOpenAgent}
              style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
              className="hover:bg-slate-50 transition-colors group"
            >
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ margin: 'auto' }}>smart_toy</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>Agent Pro</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Step-by-step automation</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '9999px',
          backgroundColor: isOpen ? '#1e293b' : '#0f172a',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="material-symbols-outlined"
              style={{ fontSize: '1.75rem' }}
            >
              close
            </motion.span>
          ) : (
            <motion.div
              key="orb"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ position: 'relative' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>auto_awesome</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse border-2 border-slate-900"></span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
