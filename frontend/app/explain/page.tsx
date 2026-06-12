'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReview, AnalysisResponse } from '../../lib/api';
import ShapWaterfall from '../../components/ShapWaterfall';

const EXAMPLE_REVIEW =
  'This battery is exceptional. I have been using it for 6 months and it easily lasts 10 to 12 hours on a single charge. The keyboard feel is tactile and responsive. Highly recommend for developers who need reliable hardware.';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const properties = [
  {
    name: 'Additivity',
    desc: 'Feature contributions sum exactly to the difference between prediction and base value.',
  },
  {
    name: 'Consistency',
    desc: 'If a feature contributes more in one model, its attribution never decreases.',
  },
  {
    name: 'Null Player',
    desc: 'Features that never change the prediction receive zero attribution.',
  },
];

export default function ExplainPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeReview(text);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Explanation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center lg:text-left">
        <span className="section-label">Explainable AI</span>
        <h1 className="section-title mt-2">SHAP Explainability</h1>
        <p className="section-desc mt-3 max-w-2xl">
          Understand exactly why the model made its prediction. Shapley values from cooperative game
          theory provide mathematically rigorous, locally faithful feature attributions.
        </p>
      </motion.div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Input */}
        <motion.div variants={itemVariants}>
          <div className="glass rounded-2xl p-6 space-y-5 h-full flex flex-col">
            <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
              Input Review
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter a review to generate SHAP explanations..."
              className="flex-1 w-full min-h-[160px] bg-transparent border border-white/[0.06] rounded-xl p-4 text-sm text-white/90 placeholder-white/20 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all duration-300"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setText(EXAMPLE_REVIEW)}
                className="btn-ghost flex-1"
              >
                Load Example
              </button>
              <button
                onClick={handleExplain}
                disabled={loading || !text.trim()}
                className="btn-primary flex-[2] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Computing…
                  </span>
                ) : (
                  'Explain Prediction'
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Theory */}
        <motion.div variants={itemVariants}>
          <div className="glass-strong rounded-2xl p-6 space-y-5 h-full border border-violet-500/10">
            <p className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
              Shapley Value Theory
            </p>

            {/* Formula */}
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
              <p className="text-sm font-mono text-violet-300 leading-relaxed text-center">
                {`\u03C6\u1D62(v) = \u2211 [ |S|!(|N|-|S|-1)! / |N|! ] \u00D7 [ v(S \u222A \u007Bi\u007D) - v(S) ]`}
              </p>
            </div>

            <p className="text-sm text-white/50 leading-relaxed">
              We use <span className="text-white/80 font-medium">TreeSHAP</span>, a polynomial-time
              algorithm with <span className="font-mono text-violet-400 text-xs">O(TLD²)</span>{' '}
              complexity, to compute exact Shapley values for tree-ensemble models.
            </p>

            {/* Properties */}
            <div className="space-y-3">
              <p className="text-xs text-white/30 uppercase tracking-wider font-medium">
                Key Properties
              </p>
              {properties.map((prop) => (
                <div key={prop.name} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white/80">{prop.name}</p>
                    <p className="text-xs text-white/30 mt-0.5">{prop.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-6 border border-rose-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-rose-400">Explanation Error</p>
                <p className="text-xs text-white/40 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-10 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-sm text-white/50 font-medium">Computing SHAP explanations…</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Score banner */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
                  Helpfulness Score
                </span>
                <span className="text-2xl font-bold font-mono text-white">
                  {(result.helpfulness_score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #06B6D4)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.helpfulness_score * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-white/30">0%</span>
                <span className="text-xs text-white/30">100%</span>
              </div>
            </div>

            {/* SHAP Waterfall */}
            <ShapWaterfall explanation={result.explanation} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
