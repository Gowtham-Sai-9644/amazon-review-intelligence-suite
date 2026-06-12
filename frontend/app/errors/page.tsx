'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getErrorAnalysis, ErrorAnalysisResponse } from '../../lib/api';

/* ═══════════════════════════════════════════════════════════
   Error Analysis — ML Diagnostics Dashboard
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
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export default function ErrorsPage() {
  const [data, setData] = useState<ErrorAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getErrorAnalysis()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load error analysis'))
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
        <p className="text-sm text-gray-500 font-medium">Loading error diagnostics…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="glass p-8 max-w-md w-full text-center border-rose-500/20 bg-gradient-to-b from-rose-500/[0.06] to-transparent">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Diagnostics Unavailable</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {error || 'Could not retrieve error analysis data.'}
          </p>
        </div>
      </div>
    );
  }

  const cm = data.confusion_matrix;
  const total = cm.true_positive + cm.true_negative + cm.false_positive + cm.false_negative;
  const accuracy = total > 0 ? ((cm.true_positive + cm.true_negative) / total) * 100 : 0;
  const errorRate = 100 - accuracy;

  const confusionCells = [
    {
      label: 'True Negative',
      value: cm.true_negative,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      sub: 'Correct rejection',
    },
    {
      label: 'False Positive',
      value: cm.false_positive,
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      sub: 'Type I error',
    },
    {
      label: 'False Negative',
      value: cm.false_negative,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      sub: 'Type II error',
    },
    {
      label: 'True Positive',
      value: cm.true_positive,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      sub: 'Correct detection',
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
        <p className="section-label mb-3">Diagnostics</p>
        <h1 className="section-title">Error Analysis</h1>
        <p className="section-desc mt-2">
          Deep-dive into model failure modes — confusion matrix diagnostics,
          structural weaknesses, and misclassification case studies.
        </p>
      </motion.div>

      {/* ═══ Two-Column Grid: Matrix + Weaknesses ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Confusion Matrix ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-gray-100">Confusion Matrix</h3>
            </div>

            {/* 2×2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {confusionCells.map((cell) => (
                <div
                  key={cell.label}
                  className={`${cell.bg} ${cell.border} border rounded-xl p-5 text-center`}
                >
                  <span className={`text-3xl font-bold font-mono ${cell.text}`}>
                    {cell.value.toLocaleString()}
                  </span>
                  <p className="text-[11px] font-semibold text-gray-300 mt-2">{cell.label}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{cell.sub}</p>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {accuracy.toFixed(1)}%
                </span>
                <p className="metric-label mt-1">Accuracy</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                <span className="text-xl font-bold font-mono text-rose-400">
                  {errorRate.toFixed(1)}%
                </span>
                <p className="metric-label mt-1">Error Rate</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Model Weaknesses ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass p-6 lg:p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-gray-100">Model Weaknesses</h3>
            </div>

            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {data.model_weaknesses.map((weakness, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="glass p-4 flex items-start gap-3"
                >
                  <span className="text-xs font-mono text-indigo-400 font-bold mt-0.5 shrink-0 w-5 text-right">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed">{weakness}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ═══ Misclassification Case Studies ═══ */}
      {data.failures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6">
            <p className="section-label mb-2">Case Studies</p>
            <h2 className="text-xl font-bold text-white">Misclassification Examples</h2>
          </div>

          <motion.div
            className="space-y-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {data.failures.map((failure, i) => (
              <motion.div key={i} variants={fadeUp} className="glass p-6">
                {/* Error Type Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={
                      failure.error_type === 'False Positive' || failure.error_type === 'FP'
                        ? 'badge-rose'
                        : 'badge-amber'
                    }
                  >
                    {failure.error_type}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">
                    Case #{String(i + 1).padStart(3, '0')}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-sm text-gray-400 italic font-mono leading-relaxed mb-4 pl-3 border-l-2 border-white/[0.06]">
                  &ldquo;{failure.text.length > 200
                    ? failure.text.slice(0, 200) + '…'
                    : failure.text}&rdquo;
                </p>

                {/* Predicted vs Actual */}
                <div className="flex items-center gap-6 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Predicted
                    </span>
                    <span className="text-sm font-semibold text-rose-400">
                      {failure.predicted_label}
                    </span>
                  </div>
                  <div className="text-gray-600">→</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      Actual
                    </span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {failure.actual_label}
                    </span>
                  </div>
                </div>

                {/* Diagnostic Explanation */}
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                    Diagnosis
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">{failure.reason}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
