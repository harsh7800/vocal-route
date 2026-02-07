'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface VoiceOrbProps {
      volume: number;
      frequencies?: number[];
      isListening: boolean;
      themeColor?: 'cyan' | 'blue' | 'purple' | 'magenta' | 'violet';
}

export function VoiceOrb({ volume, frequencies = [], isListening, themeColor = 'cyan' }: VoiceOrbProps) {
      const scale = 1 + volume * 0.6;
      const blur = 40 + volume * 30;

      const bars = useMemo(() => frequencies.slice(0, 24), [frequencies]);

      // Determine colors based on theme
      const getGlowColor = (type: 'cyan' | 'blue' | 'violet' | 'magenta') => {
            // In a real app we would map this to dynamic Tailwind/CSS vars or props.
            // For now, we reuse the CSS variables found in typicalshadcn themes or define fallbacks.
            // We will rely on the inline styles passed previously but adapt them slightly.
            return `var(--glow-${type}, ${type === 'cyan' ? '#06b6d4' : type === 'blue' ? '#3b82f6' : type === 'violet' ? '#8b5cf6' : '#d946ef'})`;
      };

      return (
            <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
                  {/* Outer glow rings */}
                  {[1.6, 1.35, 1.15].map((s, i) => (
                        <motion.div
                              key={i}
                              className="absolute rounded-full"
                              animate={{
                                    scale: isListening ? s + volume * 0.3 : s,
                                    opacity: isListening ? 0.12 + volume * 0.15 : 0.05,
                              }}
                              transition={{ type: "spring", stiffness: 120, damping: 20 }}
                              style={{
                                    width: 180,
                                    height: 180,
                                    background: `radial-gradient(circle, ${getGlowColor('cyan')} 0%, transparent 70%)`,
                                    opacity: 0.3 - i * 0.08
                              }}
                        />
                  ))}

                  {/* Main orb */}
                  <motion.div
                        className="absolute rounded-full"
                        animate={{ scale }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        style={{
                              width: 140,
                              height: 140,
                              background: `
            radial-gradient(circle at 35% 35%, ${getGlowColor('cyan')} 0%, transparent 60%),
            radial-gradient(circle at 65% 65%, ${getGlowColor('violet')} 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, ${getGlowColor('blue')} 0%, ${getGlowColor('magenta')} 100%)
          `,
                              filter: `blur(${isListening ? 1 : 3}px)`,
                              boxShadow: `
            0 0 ${blur}px ${getGlowColor('cyan')},
            0 0 ${blur * 2}px ${getGlowColor('blue')},
            inset 0 0 30px ${getGlowColor('violet')}
          `,
                        }}
                  />

                  {/* Spinning gradient ring */}
                  <motion.div
                        className="absolute rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                        style={{
                              width: 140,
                              height: 140,
                              background: `conic-gradient(
            from 0deg,
            ${getGlowColor('cyan')},
            ${getGlowColor('violet')},
            ${getGlowColor('magenta')},
            ${getGlowColor('cyan')}
          )`,
                              borderRadius: "100%",
                              padding: "2px",
                              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                              WebkitMaskComposite: "xor",
                              maskComposite: "exclude",
                              opacity: isListening ? 0.8 : 0.2,
                        }}
                  />

                  {/* Frequency bars in circular layout */}
                  {isListening && bars.length > 0 && (
                        <div className="absolute" style={{ width: 220, height: 220 }}>
                              {bars.map((val, i) => {
                                    const angle = (i / bars.length) * 360;
                                    const height = 8 + val * 40;
                                    return (
                                          <motion.div
                                                key={i}
                                                className="absolute left-1/2 bottom-1/2"
                                                animate={{ height, opacity: 0.3 + val * 0.7 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                style={{
                                                      width: 3,
                                                      borderRadius: 2,
                                                      transformOrigin: "bottom center",
                                                      transform: `rotate(${angle}deg) translateX(-50%)`,
                                                      marginLeft: -1.5,
                                                      marginBottom: 90,
                                                      background: `linear-gradient(to top, ${getGlowColor('cyan')}, ${getGlowColor('violet')})`,
                                                }}
                                          />
                                    );
                              })}
                        </div>
                  )}
            </div>
      );
}
