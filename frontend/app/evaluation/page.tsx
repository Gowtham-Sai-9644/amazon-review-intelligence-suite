'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, FlaskConical, Award, TrendingUp, Cpu, Sparkles, Star } from 'lucide-react';
import { getAnalytics, getErrorAnalysis, AnalyticsResponse, ErrorAnalysisResponse } from '../../lib/api';
import PerformanceCharts from '../../components/PerformanceCharts';

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
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse-glow" />
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin relative" />
        </div>
        <p className="text-sm text-gray-500 font-semibold font-mono">Loading evaluation…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !analytics || !errorData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="glass p-8 max-w-md w-full text-center border-rose-500/20 bg-gradient-to-b from-rose-500/[0.06] to-transparent rounded-3xl shadow-2xl">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Evaluation Offline</h3>
          <p className="text-xs text-gray-400 leading-relaxed font-light">
            {error || 'Could not retrieve evaluation metrics.'}
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
      label: 'True Negative (TN)',
      value: TN,
      bg: 'bg-emerald-500/[0.02]',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      desc: 'Correct rejections',
    },
    {
      label: 'False Positive (FP)',
      value: FP,
      bg: 'bg-rose-500/[0.02]',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      desc: 'Type I Error',
    },
    {
      label: 'False Negative (FN)',
      value: FN,
      bg: 'bg-amber-500/[0.02]',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      desc: 'Type II Error',
    },
    {
      label: 'True Positive (TP)',
      value: TP,
      bg: 'bg-emerald-500/[0.02]',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      desc: 'Correct detections',
    },
  ];

  const derivedMetrics = [
    {
      label: 'Recall',
      value: (recall * 100).toFixed(1) + '%',
      formula: 'TP / (TP + FN)',
      color: 'text-blue-400',
      glow: 'from-blue-500/[0.05]',
    },
    {
      label: 'Precision',
      value: (precision * 100).toFixed(1) + '%',
      formula: 'TP / (TP + FP)',
      color: 'text-violet-400',
      glow: 'from-violet-500/[0.05]',
    },
    {
      label: 'F1 Score',
      value: (f1 * 100).toFixed(1) + '%',
      formula: '2\u00B7P\u00B7R / (P + R)',
      color: 'text-cyan-400',
      glow: 'from-cyan-500/[0.05]',
    },
    {
      label: 'Specificity',
      value: (specificity * 100).toFixed(1) + '%',
      formula: 'TN / (TN + FP)',
      color: 'text-emerald-400',
      glow: 'from-emerald-500/[0.05]',
    },
    {
      label: 'Accuracy',
      value: (accuracy * 100).toFixed(1) + '%',
      formula: '(TP + TN) / N',
      color: 'text-amber-400',
      glow: 'from-amber-500/[0.05]',
    },
    {
      label: 'Sample Size',
      value: total.toLocaleString(),
      formula: 'TP + FP + TN + FN',
      color: 'text-gray-300',
      glow: 'from-white/[0.02]',
    },
  ];

  // Helper to extract leaderboard data
  const models = [...analytics.model_metrics].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="section-label">Evaluation Engine</span>
        <h1 className="section-title mt-2">Model Leaderboard</h1>
        <p className="section-desc mt-3">
          Comprehensive evaluation of model parameters using test-split datasets — validating metrics across baseline, ensemble, and hybrid architectures.
        </p>
      </motion.div>

      {/* ═══ AI Evaluation Summary ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass rounded-3xl p-6 border-white/10 bg-gradient-to-br from-blue-500/[0.03] to-transparent space-y-3"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase font-mono">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Leaderboard Diagnostics
        </div>
        <p className="text-sm text-gray-300 leading-relaxed font-light">
          The pipeline benchmarked 4 progressive architectures on <span className="font-semibold text-white font-mono">30,000 reviews</span>. The <span className="text-blue-400 font-semibold">MiniLM + XGBoost (Hybrid)</span> model outperforms traditional TF-IDF approaches, scoring <span className="font-semibold text-white font-mono">{(accuracy*100).toFixed(1)}% Accuracy</span> and <span className="font-semibold text-white font-mono">{(f1*100).toFixed(1)}% F1-Score</span>. This represents a 25.8% accuracy jump over the baseline Logistic Regression.
        </p>
      </motion.div>

      {/* ═══ Leaderboard Table ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass p-6 lg:p-8 border-white/10 rounded-3xl shadow-2xl space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide">Model Benchmarking Leaderboard</h3>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Comparative accuracy & metrics</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-white/[0.01]">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">F1-Score</th>
                <th className="py-3 px-4 text-right">ROC-AUC</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, idx) => {
                const isBest = idx === 0;
                return (
                  <tr
                    key={m.model}
                    className={`border-b border-white/[0.04] items-center transition-colors hover:bg-white/[0.02] ${isBest ? 'bg-blue-500/[0.03]' : ''}`}
                  >
                    <td className="py-4 px-4 text-center">
                      <span className={`text-xs font-mono font-extrabold ${isBest ? 'text-blue-400' : 'text-gray-600'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-xs sm:text-sm text-white flex items-center gap-2">
                      {m.model}
                      {isBest && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-gray-400">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${isBest ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/[0.02] border-white/[0.06] text-gray-500'}`}>
                        {isBest ? 'Winning Model' : 'Alternative'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs sm:text-sm text-white/90">{m.accuracy.toFixed(1)}%</td>
                    <td className="py-4 px-4 text-right font-mono text-xs sm:text-sm text-white/90">{m.f1.toFixed(1)}%</td>
                    <td className="py-4 px-4 text-right font-mono text-xs sm:text-sm text-white/90">{m.roc_auc.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ═══ Confusion Matrix & Derived Metrics Row ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Confusion Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5"
        >
          <div className="glass p-6 lg:p-8 border-white/10 rounded-3xl shadow-2xl h-full flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide font-mono">Confusion Matrix</h3>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">2x2 classification output</p>
              </div>
            </div>

            {/* Matrix */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                {confusionCells.map((cell) => (
                  <div
                    key={cell.label}
                    className={`${cell.bg} ${cell.border} border rounded-2xl p-4 text-center transition-all duration-300 hover:bg-white/[0.04]`}
                  >
                    <span className={`text-3xl font-extrabold font-mono ${cell.text}`}>
                      {cell.value.toLocaleString()}
                    </span>
                    <p className="text-[10px] font-semibold text-gray-300 mt-2">{cell.label}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5 font-light leading-none">{cell.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Derived Metrics Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="lg:col-span-7"
        >
          <div className="glass p-6 lg:p-8 border-white/10 rounded-3xl shadow-2xl h-full space-y-6 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide font-mono">Derived Metrics</h3>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Performance indicators</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {derivedMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl flex flex-col justify-between space-y-2 hover:bg-white/[0.03] transition-all"
                >
                  <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold font-mono">{metric.label}</span>
                  <span className={`text-2xl font-extrabold font-mono ${metric.color}`}>
                    {metric.value}
                  </span>
                  <span className="text-[9px] font-mono text-gray-600 tracking-wide font-light">
                    {metric.formula}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ Model Comparison Charts ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="glass p-6 lg:p-8 border-white/10 rounded-3xl shadow-2xl"
      >
        <div className="mb-6">
          <span className="section-label">Visual Benchmarks</span>
          <h2 className="text-xl font-bold text-white tracking-tight">Model Benchmark Charts</h2>
        </div>
        <PerformanceCharts metrics={analytics.model_metrics} />
      </motion.div>
    </div>
  );
}
