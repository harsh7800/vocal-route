'use client';

import React from 'react';
import { useVocalRoute } from '../provider';

export interface VocalRouteButtonProps {
  /**
   * Custom position for the button.
   * @default { bottom: '2rem', right: '2rem' }
   */
  position?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  /**
   * Custom className for the button.
   */
  className?: string;
  /**
   * Custom children to render inside the button.
   */
  children?: React.ReactNode;
  /**
   * Whether to hide the button when voice is active.
   * @default true
   */
  hideOnActive?: boolean;
}

export function VocalRouteButton({
  position = { bottom: '2rem', right: '2rem' },
  className,
  children,
  hideOnActive = true,
}: VocalRouteButtonProps) {
  const { startListening, isListening, isProcessing } = useVocalRoute();

  if (hideOnActive && (isListening || isProcessing)) return null;

  const defaultStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 40,
    ...position,
  };

  const buttonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '4rem',
    height: '4rem',
    borderRadius: '9999px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    backgroundColor: '#1a1a1a', // Default dark theme
    color: 'white',
  };

  return (
    <div style={defaultStyles} className="vocal-route-button-container">
      <button
        type="button"
        onClick={startListening}
        style={buttonStyles}
        className={`vocal-route-trigger ${className || ''}`}
        aria-label="Start Voice Navigation"
      >
        {children || (
          <span className="material-symbols-outlined" style={{ fontSize: '1.875rem' }}>
            mic
          </span>
        )}
      </button>
    </div>
  );
}
