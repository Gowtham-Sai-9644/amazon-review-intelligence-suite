'use client';

import { motion } from 'framer-motion';

interface HelpfulnessGaugeProps {
  score: number;
  confidence: number;
  quality: string;
}

export default function HelpfulnessGauge({ score, confidence, quality }: HelpfulnessGaugeProps) {
  const percentage = Math.round(score * 100);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score * circumference;

  const qualityLower = quality.toLowerCase();

  const colorMap: Record<string, { stroke: string; text: string; badge: string; glow: string }> = {
    high: {
      stroke: '#34D399',
      text: 'text-emerald-400',
      badge: 'badge-emerald',
      glow: 'rgba(52, 211, 153, 0.15)',
    },
    medium: {
      stroke: '#FBBF24',
      text: 'text-amber-400',
      badge: 'badge-amber',
      glow: 'rgba(251, 191, 36, 0.15)',
    },
    low: {
      stroke: '#FB7185',
      text: 'text-rose-400',
      badge: 'badge-rose',
      glow: 'rgba(251, 113, 133, 0.15)',
    },
  };

  const colors = colorMap[qualityLower] ?? colorMap.medium;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass rounded-2xl p-6"
    >
      {/* Header */}
      <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4">
        Helpfulness Score
      </p>

      {/* SVG Gauge */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
            {/* Background track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="6"
            />
            {/* Progress arc */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              style={{
                filter: `drop-shadow(0 0 6px ${colors.glow})`,
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <motion.span
              className="text-3xl font-bold font-mono text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {percentage}
              <span className="text-base text-white/40">%</span>
            </motion.span>
          </div>
        </div>
      </div>

      {/* Quality badge */}
      <div className="flex justify-center mt-4">
        <span className={colors.badge}>{quality} Quality</span>
      </div>

      {/* Confidence bar */}
      <div className="mt-5 pt-4 border-t border-white/[0.04]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/30 uppercase tracking-wider font-medium">
            Confidence
          </span>
          <span className="text-xs font-mono text-white/60">
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
