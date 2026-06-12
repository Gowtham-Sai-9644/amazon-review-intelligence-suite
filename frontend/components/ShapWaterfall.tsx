'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Hash } from 'lucide-react';

interface WordWeight {
  word: string;
  weight: number;
}

interface Explanation {
  tabular_shap: Record<string, number>;
  top_positive_words: WordWeight[];
  top_negative_words: WordWeight[];
  readability_impact: string;
  length_impact: string;
}

interface ShapWaterfallProps {
  explanation: Explanation;
}

const LABELS: Record<string, string> = {
  word_count: 'Word Count',
  char_count: 'Character Count',
  avg_word_length: 'Avg Word Length',
  exclamation_density: 'Punctuation Emphasis',
  readability_score: 'Readability (Flesch)',
  sentiment_score: 'Sentiment Polarity',
};

export default function ShapWaterfall({ explanation }: ShapWaterfallProps) {
  const { tabular_shap, top_positive_words, top_negative_words } = explanation;
  const entries = Object.entries(tabular_shap).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const allVals = [...entries.map(e => e[1]), ...top_positive_words.map(w => w.weight), ...top_negative_words.map(w => w.weight)];
  const maxAbs = Math.max(...allVals.map(Math.abs), 0.001);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {/* Feature Importance */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Feature Importance</h3>
        </div>

        <div className="space-y-3">
          {entries.map(([key, val], i) => {
            const isPos = val >= 0;
            const pct = (Math.abs(val) / maxAbs) * 100;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50 font-medium">{LABELS[key] || key}</span>
                  <span className={`font-mono font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? '+' : ''}{val.toFixed(3)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.03] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                    className={`h-full rounded-full ${isPos ? 'bg-emerald-500/60' : 'bg-rose-500/60'}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Word Attribution */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Hash className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Word-Level Attribution</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Positive */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Helpful Indicators</div>
            {top_positive_words.length === 0 ? (
              <p className="text-xs text-white/20 italic">No strong positive signals</p>
            ) : (
              top_positive_words.map((w, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10">
                  <span className="text-xs text-emerald-300 font-mono">{w.word}</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">+{w.weight.toFixed(3)}</span>
                </div>
              ))
            )}
          </div>

          {/* Negative */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Unhelpful Indicators</div>
            {top_negative_words.length === 0 ? (
              <p className="text-xs text-white/20 italic">No strong negative signals</p>
            ) : (
              top_negative_words.map((w, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-rose-500/[0.05] border border-rose-500/10">
                  <span className="text-xs text-rose-300 font-mono">{w.word}</span>
                  <span className="text-[10px] text-rose-400 font-mono font-semibold">{w.weight.toFixed(3)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
