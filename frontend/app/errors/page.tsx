'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, AlertTriangle, ShieldAlert, Search, Filter } from 'lucide-react';
import { getErrorAnalysis, ErrorAnalysisResponse } from '../../lib/api';

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

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fp' | 'fn'>('all');

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
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse-glow" />
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin relative" />
        </div>
        <p className="text-sm text-gray-500 font-semibold font-mono">Loading diagnostics…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="glass p-8 max-w-md w-full text-center border-rose-500/20 bg-gradient-to-b from-rose-500/[0.06] to-transparent rounded-3xl shadow-2xl">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Diagnostics Offline</h3>
          <p className="text-xs text-gray-400 leading-relaxed font-light">
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

  // Derived metrics
  const precision = cm.true_positive + cm.false_positive > 0 
    ? (cm.true_positive / (cm.true_positive + cm.false_positive)) * 100 
    : 0;
  const recall = cm.true_positive + cm.false_negative > 0 
    ? (cm.true_positive / (cm.true_positive + cm.false_negative)) * 100 
    : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const confusionCells = [
    {
      label: 'True Negative (TN)',
      value: cm.true_negative,
      bg: 'bg-emerald-500/[0.04]',
      border: 'border-emerald-500/25',
      text: 'text-emerald-400',
      sub: 'Correct Rejections',
    },
    {
      label: 'False Positive (FP)',
      value: cm.false_positive,
      bg: 'bg-rose-500/[0.04]',
      border: 'border-rose-500/25',
      text: 'text-rose-400',
      sub: 'Type I Error',
    },
    {
      label: 'False Negative (FN)',
      value: cm.false_negative,
      bg: 'bg-amber-500/[0.04]',
      border: 'border-amber-500/25',
      text: 'text-amber-400',
      sub: 'Type II Error',
    },
    {
      label: 'True Positive (TP)',
      value: cm.true_positive,
      bg: 'bg-emerald-500/[0.04]',
      border: 'border-emerald-500/25',
      text: 'text-emerald-400',
      sub: 'Correct Detections',
    },
  ];

  // Client-side search and filter logic
  const filteredFailures = data.failures.filter(failure => {
    const matchesSearch = failure.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          failure.reason.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const typeLower = failure.error_type.toLowerCase();
    const isFP = typeLower.includes('positive') || typeLower === 'fp';
    const isFN = typeLower.includes('negative') || typeLower === 'fn';
    
    const matchesFilter = activeFilter === 'all' || 
                          (activeFilter === 'fp' && isFP) || 
                          (activeFilter === 'fn' && isFN);
                          
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="section-label">Diagnostics Console</span>
        <h1 className="section-title mt-2">Error Diagnostics</h1>
        <p className="section-desc mt-3">
          ML diagnostics dashboard detailing model failure modes — confusion matrix coordinates, precision-recall boundaries, and failure case studies.
        </p>
      </motion.div>

      {/* ═══ Two-Column Grid: Matrix + Weaknesses ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* ─── Confusion Matrix ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <div className="glass p-6 lg:p-8 border-white/10 rounded-3xl shadow-2xl h-full flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide">Confusion Coordinates</h3>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Evaluation details</p>
              </div>
            </div>

            {/* 2×2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              {confusionCells.map((cell) => (
                <div
                  key={cell.label}
                  className={`${cell.bg} ${cell.border} border rounded-2xl p-5 text-center transition-all duration-300 hover:bg-white/[0.04]`}
                >
                  <span className={`text-4xl font-extrabold font-mono ${cell.text}`}>
                    {cell.value.toLocaleString()}
                  </span>
                  <p className="text-xs font-semibold text-gray-300 mt-2">{cell.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-light">{cell.sub}</p>
                </div>
              ))}
            </div>

            {/* Diagnostic stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.04]">
              <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl text-center">
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {precision.toFixed(1)}%
                </span>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">Precision</p>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl text-center">
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {recall.toFixed(1)}%
                </span>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">Recall</p>
              </div>
              <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl text-center">
                <span className="text-lg font-bold font-mono text-violet-400">
                  {f1Score.toFixed(1)}%
                </span>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">F1-Score</p>
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
          className="lg:col-span-5"
        >
          <div className="glass p-6 lg:p-8 border-white/10 rounded-3xl shadow-2xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide">Model Weaknesses</h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Systemic gaps</p>
                </div>
              </div>

              <div className="space-y-3.5">
                {data.model_weaknesses.map((weakness, i) => (
                  <div
                    key={i}
                    className="glass p-4 border-white/10 rounded-2xl flex items-start gap-3 bg-white/[0.01]"
                  >
                    <span className="text-xs font-mono text-blue-400 font-bold shrink-0 w-4 text-right">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 mt-6 border-t border-white/[0.04] text-[10px] text-gray-500 leading-normal font-light">
              * Based on local evaluation testing splits containing 1,520 validation review specimens.
            </div>
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
          className="space-y-6"
        >
          {/* Header + Search/Filter controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-8 border-t border-white/[0.04]">
            <div className="space-y-1">
              <span className="section-label">Case Studies</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Systematic Failure Logs</h2>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search failure reasons..."
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeFilter === 'all' ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('fp')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeFilter === 'fp' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  FP Only
                </button>
                <button
                  onClick={() => setActiveFilter('fn')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeFilter === 'fn' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  FN Only
                </button>
              </div>
            </div>
          </div>

          {/* Failure Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredFailures.length > 0 ? (
                filteredFailures.map((failure, i) => {
                  const typeLower = failure.error_type.toLowerCase();
                  const isFP = typeLower.includes('positive') || typeLower === 'fp';
                  
                  return (
                    <motion.div
                      key={failure.text}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      className="glass p-6 border-white/10 rounded-3xl shadow-2xl flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Badges */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={isFP ? 'badge-rose' : 'badge-amber'}
                          >
                            {isFP ? 'False Positive (Type I)' : 'False Negative (Type II)'}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono">
                            Specimen #{String(i + 1).padStart(3, '0')}
                          </span>
                        </div>

                        {/* Review text snippet */}
                        <p className="text-xs text-gray-400 italic font-mono leading-relaxed pl-3 border-l-2 border-white/[0.06] mb-4 bg-white/[0.005] py-2 rounded-r-xl">
                          &ldquo;{failure.text}&rdquo;
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* Predictions metrics boundary */}
                        <div className="flex items-center gap-4 text-xs font-mono py-2 border-t border-b border-white/[0.04]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-white/30 uppercase">Predicted</span>
                            <span className="font-semibold text-rose-400">{failure.predicted_label}</span>
                          </div>
                          <div className="text-white/20">/</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-white/30 uppercase">Actual</span>
                            <span className="font-semibold text-emerald-400">{failure.actual_label}</span>
                          </div>
                        </div>

                        {/* Diagnostic detail explanation */}
                        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3.5">
                          <span className="text-[9px] uppercase tracking-wider text-blue-400 font-semibold font-mono">
                            Diagnostic Error Cause
                          </span>
                          <p className="text-[11px] text-gray-400 leading-relaxed mt-1 font-light">
                            {failure.reason}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  key="no-results"
                  className="col-span-full glass rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[200px]"
                >
                  <AlertTriangle className="w-8 h-8 text-white/20 mb-3" />
                  <p className="text-sm font-semibold text-white/70">No misclassification records match search filters</p>
                  <p className="text-xs text-white/30 mt-1 font-light">Try adjusting your search criteria or filter mode.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
