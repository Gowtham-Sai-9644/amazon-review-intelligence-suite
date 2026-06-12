'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Cpu, Loader2, AlertCircle } from 'lucide-react';
import { getAnalytics, AnalyticsResponse } from '../../lib/api';
import PerformanceCharts from '../../components/PerformanceCharts';

/* ═══════════════════════════════════════════════════════════
   Analytics — Premium Model Telemetry Dashboard
   ═══════════════════════════════════════════════════════════ */

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse-glow" />
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin relative" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Loading model analytics…</p>
      </div>
    );
  }

  /* ── Error State ── */
  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="glass p-8 max-w-md w-full text-center border-rose-500/20 bg-gradient-to-b from-rose-500/[0.06] to-transparent">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Analytics Unavailable</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {error || 'Could not retrieve analytics data.'}
          </p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Inferences',
      value: data.total_analyzed.toLocaleString(),
      icon: Activity,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      glow: 'from-indigo-500/[0.08]',
    },
    {
      label: 'Avg Helpfulness',
      value: `${data.average_helpfulness.toFixed(1)}%`,
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      glow: 'from-emerald-500/[0.08]',
    },
    {
      label: 'Active Model',
      value: 'MiniLM + XGBoost',
      subtitle: 'Hybrid Pipeline',
      icon: Cpu,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20',
      glow: 'from-violet-500/[0.08]',
    },
  ];

  return (
    <div className="space-y-10">
      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="section-label mb-3">Analytics</p>
        <h1 className="section-title">Model Analytics</h1>
        <p className="section-desc mt-2">
          Real-time performance telemetry across the ARIS prediction pipeline —
          model accuracy, sentiment distributions, and quality segmentation.
        </p>
      </motion.div>

      {/* ═══ KPI Metric Cards ═══ */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {kpiCards.map((card) => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            className={`glass p-6 bg-gradient-to-b ${card.glow} to-transparent`}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="metric-label">{card.label}</span>
              <div
                className={`w-8 h-8 rounded-lg ${card.iconBg} border flex items-center justify-center`}
              >
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="metric-value font-mono">{card.value}</span>
              {card.subtitle && (
                <span className="text-xs font-semibold text-gray-500">{card.subtitle}</span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ Performance Charts ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <PerformanceCharts
          metrics={data.model_metrics}
          sentimentDist={data.sentiment_distribution}
          qualityDist={data.quality_distribution}
        />
      </motion.div>
    </div>
  );
}
