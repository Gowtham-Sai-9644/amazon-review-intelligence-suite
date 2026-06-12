'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, MessageSquare, TrendingUp, TrendingDown, Sparkles, HelpCircle, Layers, CheckCircle } from 'lucide-react';
import { getBusinessInsights, BusinessInsightsResponse } from '../../lib/api';
import dynamic from 'next/dynamic';

// Lazy load LengthChart to speed up FCP and avoid layout shifts
const LengthChart = dynamic(() => import('../../components/LengthChart'), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-3xl p-10 min-h-[350px] border-white/5 animate-pulse flex flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
      <span className="text-xs text-slate-500 font-mono">Loading length metrics chart...</span>
    </div>
  )
});

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/* ─── Keyword Row ─── */
function KeywordRow({
  index,
  word,
  correlation,
  color,
  maxAbsCorrelation,
}: {
  index: number;
  word: string;
  correlation: number;
  color: string;
  maxAbsCorrelation: number;
}) {
  const barWidth = maxAbsCorrelation > 0
    ? (Math.abs(correlation) / maxAbsCorrelation) * 100
    : 0;

  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 group">
      <span className="text-[10px] font-mono text-slate-600 w-5 text-right shrink-0">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="text-xs font-mono text-slate-300 w-28 truncate group-hover:text-white transition-colors">
        {word}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.01]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${barWidth}%`,
            background: color,
          }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-400 w-14 text-right tabular-nums">
        {correlation > 0 ? '+' : ''}{correlation.toFixed(3)}
      </span>
    </motion.div>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<BusinessInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBusinessInsights()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load insights'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/15 blur-xl animate-pulse-glow" />
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin relative" />
        </div>
        <p className="text-xs text-slate-500 font-semibold font-mono">Compiling review insights…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="glass p-8 max-w-md w-full text-center border-rose-500/20 bg-gradient-to-b from-rose-500/[0.06] to-transparent rounded-3xl shadow-2xl">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">Insights Offline</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-light">
            {error || 'Could not retrieve business insights.'}
          </p>
        </div>
      </div>
    );
  }

  const helpfulSorted = [...data.top_helpful_keywords].sort(
    (a, b) => Math.abs(b.correlation) - Math.abs(a.correlation),
  );
  const unhelpfulSorted = [...data.top_unhelpful_keywords].sort(
    (a, b) => Math.abs(b.correlation) - Math.abs(a.correlation),
  );
  const maxHelpful = helpfulSorted.length > 0
    ? Math.abs(helpfulSorted[0].correlation) : 1;
  const maxUnhelpful = unhelpfulSorted.length > 0
    ? Math.abs(unhelpfulSorted[0].correlation) : 1;

  const topHelpfulWord = helpfulSorted[0]?.word || 'months';
  const topHelpfulCorr = helpfulSorted[0]?.correlation || 0.35;
  const topUnhelpfulWord = unhelpfulSorted[0]?.word || 'bad';
  const topUnhelpfulCorr = unhelpfulSorted[0]?.correlation || -0.18;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <span className="section-label">Product Manager Console</span>
        <h1 className="section-title mt-2">Quality Intelligence</h1>
        <p className="section-desc mt-3">
          Actionable business intelligence extracted from review dynamics — mapping optimal lengths and keyword impact matrices.
        </p>
      </motion.div>

      {/* PM Executive Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="glass rounded-3xl p-6 border-white/10 bg-gradient-to-br from-blue-500/[0.02] to-transparent space-y-3"
      >
        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase font-mono tracking-wider">
          <Sparkles className="w-4 h-4 text-blue-400" />
          PM Executive Summary
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-light">
          Review curation should prioritize comments in the <span className="font-semibold text-white font-mono">{data.optimal_word_count_min}➔{data.optimal_word_count_max} words</span> range. Linguistic analysis shows that reviews containing <span className="text-emerald-400 font-mono font-semibold">"{topHelpfulWord}"</span> have the strongest positive correlation with review helpfulness ({topHelpfulCorr.toFixed(2)}), whereas generic negative descriptors like <span className="text-rose-400 font-mono font-semibold">"{topUnhelpfulWord}"</span> are heavily correlated with unhelpful classifications ({topUnhelpfulCorr.toFixed(2)}).
        </p>
      </motion.div>

      {/* Optimal Word Count Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="glass-strong p-8 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-violet-500/[0.02] border-white/10 rounded-3xl shadow-2xl">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                Linguistic Density Target
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                  {data.optimal_word_count_min}
                </span>
                <span className="text-lg text-slate-600 font-light">—</span>
                <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                  {data.optimal_word_count_max}
                </span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1 font-mono">words</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed font-light">
                Customer reviews within this word length range achieve the highest average helpfulness scores. Reviews that are too brief lack informational context, while reviews that are too wordy cause reader fatigue.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Length vs Helpfulness Chart Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="glass p-6 lg:p-8 border-white/10 rounded-3xl shadow-2xl">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-100 tracking-tight">
              Length-to-Helpfulness Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Average helpfulness score calculated per word count segment
            </p>
          </div>
          <LengthChart data={data.length_vs_helpfulness} />
        </div>
      </motion.div>

      {/* Keywords Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Helpful Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="glass p-6 lg:p-8 border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">High Helpfulness Indicators</h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
                  Positive correlation factors
                </p>
              </div>
            </div>
            <motion.div
              className="space-y-4"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {helpfulSorted.slice(0, 8).map((kw, i) => (
                <KeywordRow
                  key={kw.word}
                  index={i}
                  word={kw.word}
                  correlation={kw.correlation}
                  color="linear-gradient(90deg, #10B981, #34D399)"
                  maxAbsCorrelation={maxHelpful}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Unhelpful Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
        >
          <div className="glass p-6 lg:p-8 border-white/10 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Unhelpful Indicators</h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
                  Negative correlation factors
                </p>
              </div>
            </div>
            <motion.div
              className="space-y-4"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {unhelpfulSorted.slice(0, 8).map((kw, i) => (
                <KeywordRow
                  key={kw.word}
                  index={i}
                  word={kw.word}
                  correlation={kw.correlation}
                  color="linear-gradient(90deg, #EF4444, #F87171)"
                  maxAbsCorrelation={maxUnhelpful}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Quality Drivers & PM Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass p-8 border-white/10 rounded-3xl shadow-2xl space-y-6"
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500/80">
            Actionable Optimization Guide
          </span>
          <h3 className="text-base font-bold text-slate-200 tracking-tight mt-1.5">
            PM Curation Strategy
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.04]">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Optimize Curation Algorithmic Cues
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Prioritize reviews that reference specific design features, durability details, or structural pros and cons over generic sentiment ("great laptop"). These descriptive elements align with high-relevance decision metrics.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Length Normalization Cues
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Prompt customers during review submission to input detail if their response is under 40 words. Providing guidance (e.g. "How did this hold up over time?") triggers higher helpfulness scores.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
