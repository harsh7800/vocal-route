'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { VoiceOrb } from './VoiceOrb';
import { X as CloseIcon, RefreshCcw as RetryIcon } from 'lucide-react';

export interface VoiceOverlayProps {
  isListening: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  transcript?: string;
  error?: string | null;
  confidence?: number;
  volume?: number;
  frequencies?: number[];
  onClose?: () => void;
  onRetry?: () => void;
  // Customization options
  themeColor?: 'cyan' | 'blue' | 'purple';
  title?: string;
  type?: 'compact' | 'global';
}

export function VoiceOverlay({
  isListening,
  isProcessing,
  transcript,
  error,
  onClose,
  onRetry,
  title,
  volume = 0,
  frequencies = [],
  type = 'compact',
  themeColor = 'cyan'
}: VoiceOverlayProps) {
  const isGlobal = type === 'global';
  const show = isListening || isProcessing || !!error;

  // Use AnimatePresence for mount/unmount animations.
  // We wrap the whole component in AnimatePresence at the usage site or handle "show" internally.
  // Since the parent conditionally renders this component based on isListening/isProcessing, 
  // we might miss exit animations unless the parent keeps it mounted. 
  // Ideally, the parent should keep it mounted and pass `open` state.
  // However, given the current structure:
  if (!show) return null;

  if (isGlobal) {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="vocal-overlay-global fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            }}
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                display: 'flex',
                height: '2.5rem',
                width: '2.5rem',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
              whileTap={{ scale: 0.95 }}
            >
              <CloseIcon size={20} />
            </motion.button>

            {/* Status text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                marginBottom: '3rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)'
              }}
            >
              {error ? "Error" : isProcessing ? "Processing..." : title || "Listening..."}
            </motion.p>

            {/* Orb */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
            >
              <VoiceOrb
                volume={volume}
                frequencies={frequencies}
                isListening={!isProcessing && !error}
                themeColor={themeColor as any}
              />
            </motion.div>

            {/* Transcript / Error Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                marginTop: '3rem',
                padding: '0 2rem',
                maxWidth: '40rem',
                width: '100%',
                textAlign: 'center'
              }}
            >
              {error ? (
                <p style={{ fontSize: '1.125rem', color: '#f87171' }}>{error}</p>
              ) : transcript ? (
                <p style={{ fontSize: '1.5rem', fontWeight: 500, color: '#ffffff' }}>"{transcript}"</p>
              ) : (
                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>
                  Say "Go to settings" or "Create a new post"
                </p>
              )}
            </motion.div>

            {/* Volume indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex items-center gap-1"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  animate={{
                    height: 4 + (frequencies[i] || 0) * 28,
                    backgroundColor:
                      (frequencies[i] || 0) > 0.5
                        ? "hsl(var(--glow-cyan))"
                        : "hsl(var(--muted-foreground) / 0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ width: 3, borderRadius: 2 }}
                />
              ))}
            </motion.div>



            {/* Global Retry Button */}
            {error && onRetry && (
              <motion.button
                onClick={onRetry}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  marginTop: '2rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                <RetryIcon size={16} />
                Try Again
              </motion.button>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Compact Version (Existing)
  return (
    <div
      className="vocal-route-overlay"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '36rem',
        zIndex: 9999,
        paddingLeft: '1rem',
        paddingRight: '1rem',
        display: show ? 'block' : 'none'
      }}
    >
      <div
        className="vocal-overlay-enter vocal-route-overlay-container"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid #ffffff',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', display: 'flex', height: '0.75rem', width: '0.75rem' }}>
              <span
                className="vocal-animate-ping"
                style={{
                  position: 'absolute',
                  display: 'inline-flex',
                  height: '100%',
                  width: '100%',
                  borderRadius: '9999px',
                  opacity: 0.75,
                  backgroundColor: error ? '#ef4444' : '#ffffff'
                }}
              />
              <span
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  borderRadius: '9999px',
                  height: '0.75rem',
                  width: '0.75rem',
                  backgroundColor: error ? '#ef4444' : '#ffffff'
                }}
              />
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 'bold', color: '#1a1a1a' }} className="vocal-text-dark-white">
              {error ? 'Error' : isProcessing ? 'Processing...' : title || 'Listening...'}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#a3a3a3',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Close"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
          </button>
        </div>

        {/* Waveform */}
        {!error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', height: '2.5rem', padding: '0 0.5rem', justifyContent: 'center' }}>
            {[...Array(15)].map((_, i) => {
              // Creating a natural looking waveform by combining general volume with per-bar variation
              // Use a sine mask to make middle bars taller than edges
              const mask = Math.sin((i / 14) * Math.PI);
              const individualFactor = 0.5 + (Math.sin(i * 0.8) * 0.2) + (Math.random() * 0.1);
              const height = isProcessing
                ? `${30 + Math.sin(Date.now() / 200 + i) * 10}%`
                : `${Math.max(10, Math.min(100, (volume * mask * individualFactor * 150)))}%`;

              return (
                <div
                  key={i.toString()}
                  className={isProcessing ? 'vocal-animate-pulse' : ''}
                  style={{
                    width: '0.25rem',
                    borderRadius: '9999px',
                    backgroundColor: isProcessing ? '#06b6d4' : '#ffffff',
                    height,
                    transition: isProcessing ? 'none' : 'height 0.05s ease-out',
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Transcript Area */}
        <div style={{ backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '0.5rem', padding: '0.75rem' }} className="vocal-transcript-bg">
          {error ? (
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#ef4444' }}>{error}</p>
          ) : transcript ? (
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a' }} className="vocal-text-dark-white">"{transcript}"</p>
          ) : (
            <>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#737373', fontWeight: 500 }}>Try saying:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="vocal-route-pill">"Go to Invoices"</span>
                    <span className="vocal-route-pill">"Update my profile"</span>
                    <span className="vocal-route-pill">"Show analytics"</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compact Retry Button */}
      {error && onRetry && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={onRetry}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem'
            }}
          >
            <RetryIcon size={14} />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
