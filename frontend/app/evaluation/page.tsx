'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, FlaskConical } from 'lucide-react';
import { getAnalytics, getErrorAnalysis, AnalyticsResponse, ErrorAnalysisResponse } from '../../lib/api';
import PerformanceCharts from '../../components/PerformanceCharts';

/* ═══════════════════════════════════════════════════════════
   Model Evaluation — Comprehensive Metrics Dashboard
   ═══════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

export default function EvaluationPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [errorData, setErrorData] = useState<ErrorAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAnalytics(), getErrorAnalysis()])
      .then(([a, e]) => {
        setAnalytics(a);
        setErrorData(e);
      })
      .catch((err) => setError(err.message || 'Failed to load evaluation data'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse-glow" />
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin relative" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Loading model evaluation…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !analytics || !errorData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="glass p-8 max-w-md w-full text-center border-rose-500/20 bg-gradient-to-b from-rose-500/[0.06] to-transparent">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Evaluation Unavailable</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {error || 'Could not retrieve evaluation data.'}
          </p>
        </div>
      </div>
    );
  }

  const cm = errorData.confusion_matrix;
  const TP = cm.true_positive;
  const FP = cm.false_positive;
  const TN = cm.true_negative;
  const FN = cm.false_negative;
  const total = TP + FP + TN + FN;

  const recall = TP + FN > 0 ? TP / (TP + FN) : 0;
  const precision = TP + FP > 0 ? TP / (TP + FP) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const specificity = TN + FP > 0 ? TN / (TN + FP) : 0;
  const accuracy = total > 0 ? (TP + TN) / total : 0;

  const confusionCells = [
    {
      label: 'True Negative',
      value: TN,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
    },
    {
      label: 'False Positive',
      value: FP,
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
    },
    {
      label: 'False Negative',
      value: FN,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
    {
      label: 'True Positive',
      value: TP,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
    },
  ];

  const derivedMetrics = [
    {
      label: 'Recall',
      value: (recall * 100).toFixed(1) + '%',
      formula: 'TP / (TP + FN)',
      color: 'text-indigo-400',
      glow: 'from-indigo-500/[0.06]',
    },
    {
      label: 'Precision',
      value: (precision * 100).toFixed(1) + '%',
      formula: 'TP / (TP + FP)',
      color: 'text-violet-400',
      glow: 'from-violet-500/[0.06]',
    },
    {
      label: 'F1 Score',
      value: (f1 * 100).toFixed(1) + '%',
      formula: '2·P·R / (P + R)',
      color: 'text-cyan-400',
      glow: 'from-cyan-500/[0.06]',
    },
    {
      label: 'Specificity',
      value: (specificity * 100).toFixed(1) + '%',
      formula: 'TN / (TN + FP)',
      color: 'text-emerald-400',
      glow: 'from-emerald-500/[0.06]',
    },
    {
      label: 'Accuracy',
      value: (accuracy * 100).toFixed(1) + '%',
      formula: '(TP + TN) / N',
      color: 'text-amber-400',
      glow: 'from-amber-500/[0.06]',
    },
    {
      label: 'Sample Size',
      value: total.toLocaleString(),
      formula: 'TP + FP + TN + FN',
      color: 'text-gray-300',
      glow: 'from-white/[0.03]',
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
        <p className="section-label mb-3">Evaluation</p>
        <h1 className="section-title">Model Evaluation</h1>
        <p className="section-desc mt-2">
          Comprehensive model evaluation with confusion matrix, derived classification metrics,
          and cross-model performance benchmarking.
        </p>
      </motion.div>

      {/* ═══ Confusion Matrix ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="glass p-6 lg:p-8 max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-gray-100">Confusion Matrix</h3>
          </div>

          {/* Axis Labels */}
          <div className="mb-2 ml-[72px]">
            <div className="flex justify-around">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Predicted Negative
              </span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Predicted Positive
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-around py-2 shrink-0 w-[60px]">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right leading-tight">
                Actual<br />Negative
              </span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right leading-tight">
                Actual<br />Positive
              </span>
            </div>

            {/* 2×2 Grid */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {confusionCells.map((cell) => (
                <div
                  key={cell.label}
                  className={`${cell.bg} ${cell.border} border rounded-xl p-5 text-center`}
                >
                  <span className={`text-3xl font-bold font-mono ${cell.text}`}>
                    {cell.value.toLocaleString()}
                  </span>
                  <p className="text-[11px] font-semibold text-gray-300 mt-2">{cell.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ Derived Metrics Grid ═══ */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
      >
        <div className="mb-6">
          <p className="section-label mb-2">Derived Metrics</p>
          <h2 className="text-xl font-bold text-white">Classification Performance</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {derivedMetrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={fadeUp}
              className={`glass p-6 bg-gradient-to-b ${metric.glow} to-transparent`}
            >
              <p className="metric-label mb-3">{metric.label}</p>
              <span className={`text-3xl font-bold font-mono ${metric.color}`}>
                {metric.value}
              </span>
              <p className="text-[10px] font-mono text-gray-600 mt-3 tracking-wide">
                {metric.formula}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ Model Comparison Charts ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-6">
          <p className="section-label mb-2">Benchmarks</p>
          <h2 className="text-xl font-bold text-white">Model Comparison</h2>
        </div>
        <PerformanceCharts metrics={analytics.model_metrics} />
      </motion.div>
    </div>
  );
}
