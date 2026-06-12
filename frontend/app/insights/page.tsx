'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2, AlertCircle, MessageSquare, TrendingUp, TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getBusinessInsights, BusinessInsightsResponse } from '../../lib/api';

/* ═══════════════════════════════════════════════════════════
   Business Insights — Executive Intelligence Dashboard
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

/* ─── Custom Tooltip ─── */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: '#0F172A',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
      }}
    >
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-mono font-bold text-cyan-400">
        {payload[0].value.toFixed(1)}%
      </p>
    </div>
  );
}

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
      <span className="text-[10px] font-mono text-gray-600 w-5 text-right shrink-0">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="text-sm font-mono text-gray-300 w-28 truncate group-hover:text-white transition-colors">
        {word}
      </span>
      <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${barWidth}%`,
            background: color,
          }}
        />
      </div>
      <span className="text-xs font-mono text-gray-400 w-14 text-right tabular-nums">
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
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse-glow" />
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin relative" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Loading business insights…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="glass p-8 max-w-md w-full text-center border-rose-500/20 bg-gradient-to-b from-rose-500/[0.06] to-transparent">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Insights Unavailable</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
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

  return (
    <div className="space-y-10">
      {/* ═══ Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="section-label mb-3">Intelligence</p>
        <h1 className="section-title">Business Insights</h1>
        <p className="section-desc mt-2">
          Actionable intelligence extracted from review content patterns —
          optimal review characteristics, keyword correlations, and length-helpfulness dynamics.
        </p>
      </motion.div>

      {/* ═══ Optimal Word Count Card ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="glass-strong p-8 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-violet-500/[0.04]">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-400 mb-1">
                Optimal Word Count
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white font-mono tracking-tight">
                  {data.optimal_word_count_min}
                </span>
                <span className="text-lg text-gray-500 font-light">—</span>
                <span className="text-4xl font-bold text-white font-mono tracking-tight">
                  {data.optimal_word_count_max}
                </span>
                <span className="text-sm text-gray-500 font-medium ml-1">words</span>
              </div>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                Reviews within this word count range correlate with the highest helpfulness scores.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ Length vs Helpfulness Chart ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="glass p-6 lg:p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-100 tracking-tight">
              Length vs Helpfulness
            </h3>
            <p className="text-xs text-gray-500 mt-1.5">
              Average helpfulness score by review word-count bucket
            </p>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.length_vs_helpfulness}
                margin={{ top: 8, right: 16, left: -8, bottom: 4 }}
                barCategoryGap="18%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="range"
                  stroke="#64748B"
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  dy={8}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar
                  dataKey="avg_helpfulness"
                  name="Avg Helpfulness"
                  fill="#22D3EE"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ═══ Keywords Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Helpful Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-100">Helpful Keywords</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Positive correlation
                </p>
              </div>
            </div>
            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {helpfulSorted.map((kw, i) => (
                <KeywordRow
                  key={kw.word}
                  index={i}
                  word={kw.word}
                  correlation={kw.correlation}
                  color="#10B981"
                  maxAbsCorrelation={maxHelpful}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Unhelpful Keywords */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-100">Unhelpful Keywords</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Negative correlation
                </p>
              </div>
            </div>
            <motion.div
              className="space-y-3"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {unhelpfulSorted.map((kw, i) => (
                <KeywordRow
                  key={kw.word}
                  index={i}
                  word={kw.word}
                  correlation={kw.correlation}
                  color="#F43F5E"
                  maxAbsCorrelation={maxUnhelpful}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
