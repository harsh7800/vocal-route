'use client';

import React from 'react';

export interface VoiceOverlayProps {
  isListening: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  transcript?: string;
  error?: string | null;
  confidence?: number;
  volume?: number;
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
  title,
  volume = 0,
  type = 'compact'
}: VoiceOverlayProps) {
  if (!isListening && !isProcessing) return null;

  const isGlobal = type === 'global';

  return (
    <div
      className={`vocal-route-overlay ${isGlobal ? 'vocal-overlay-global' : ''}`}
      style={!isGlobal ? {
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '36rem',
        zIndex: 9999,
        paddingLeft: '1rem',
        paddingRight: '1rem',
        display: (isListening || isProcessing) ? 'block' : 'none'
      } : undefined}
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
    </div>
  );
}
