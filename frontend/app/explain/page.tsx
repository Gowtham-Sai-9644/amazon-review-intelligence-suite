'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReview, AnalysisResponse } from '../../lib/api';
import ShapWaterfall from '../../components/ShapWaterfall';
import { Sparkles, HelpCircle, GitBranch, Play, AlertCircle, Info, ChevronRight } from 'lucide-react';

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
    name: 'Local Accuracy (Additivity)',
    desc: 'Feature contributions sum exactly to the difference between prediction and base value.',
  },
  {
    name: 'Consistency',
    desc: 'If a feature contributes more in one model, its attribution never decreases.',
  },
  {
    name: 'Symmetry / Null Player',
    desc: 'Features that have no effect on the prediction receive zero attribution.',
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
      className="space-y-10 animate-fade-in"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center lg:text-left">
        <span className="section-label">Explainable AI</span>
        <h1 className="section-title mt-2">SHAP Explainability</h1>
        <p className="section-desc mt-3 max-w-2xl font-light">
          SHAP (SHapley Additive exPlanations) values from cooperative game theory provide mathematically rigorous, locally faithful feature attributions.
        </p>
      </motion.div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT — Input */}
        <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col">
          <div className="glass rounded-3xl p-6 space-y-5 flex-1 flex flex-col justify-between border-white/10 shadow-2xl">
            <div className="space-y-4 flex-1 flex flex-col">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold font-mono">
                Input Review Workspace
              </span>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter or load a review to calculate TreeSHAP values..."
                className="flex-1 w-full min-h-[180px] bg-transparent border border-white/[0.06] rounded-2xl p-4 text-sm text-white/90 placeholder-white/20 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all duration-300"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setText(EXAMPLE_REVIEW)}
                className="btn-ghost flex-1 text-xs"
              >
                Load Example
              </button>
              <button
                onClick={handleExplain}
                disabled={loading || !text.trim()}
                className="btn-primary flex-[2] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Calculating TreeSHAP…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" /> Explain Review
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Theory */}
        <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col">
          <div className="glass-strong rounded-3xl p-6 space-y-5 flex-1 border-white/10 shadow-2xl bg-gradient-to-br from-violet-500/[0.02] to-transparent">
            <span className="text-xs uppercase tracking-widest text-violet-400 font-semibold font-mono">
              Shapley Value Formulation
            </span>

            {/* Formula */}
            <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.06] flex items-center justify-center">
              <p className="text-[11px] sm:text-xs font-mono text-violet-300 leading-relaxed text-center">
                {`\u03C6\u1D62(v) = \u2211 [ |S|!(|N|-|S|-1)! / |N|! ] \u00D7 [ v(S \u222A \u007Bi\u007D) - v(S) ]`}
              </p>
            </div>

            <p className="text-xs text-white/50 leading-relaxed font-light">
              We employ <span className="text-white/80 font-medium font-mono">TreeSHAP</span> to compute exact feature attributions for our XGBoost classifier in polynomial time, guaranteeing model consistency.
            </p>

            {/* Properties */}
            <div className="space-y-3 pt-2 border-t border-white/[0.04]">
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                Mathematical Guarantees
              </span>
              {properties.map((prop) => (
                <div key={prop.name} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white/80">{prop.name}</h4>
                    <p className="text-[10px] text-white/30 mt-0.5 font-light leading-relaxed">{prop.desc}</p>
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass rounded-3xl p-6 border border-rose-500/20 shadow-2xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-400">Explanation Error</p>
              <p className="text-xs text-white/40 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass rounded-3xl p-10 flex flex-col items-center justify-center gap-4 border-white/10 shadow-2xl min-h-[300px]"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-sm text-white/50 font-semibold font-mono">Computing SHAP values…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Empty State */}
      {!loading && !error && !result && (
        <motion.div
          key="empty"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[320px] border-white/10 shadow-2xl space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-violet-500/[0.08] flex items-center justify-center border border-violet-500/20 animate-pulse-glow">
            <GitBranch className="w-6 h-6 text-violet-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">No Review Explainability Active</h3>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-light mx-auto">
              Please enter review text and execute the explanation. The system will compute exact tabular Shapley values and visualize positive/negative attributions.
            </p>
          </div>
        </motion.div>
      )}

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
            {/* Score Banner */}
            <div className="glass rounded-3xl p-6 border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold font-mono">
                  Inference Prediction
                </span>
                <span className="text-3xl font-extrabold font-mono text-white">
                  {result.helpfulness_score.toFixed(1)}% Helpful
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #06B6D4)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.helpfulness_score}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/30 font-mono">
                <span>0% Probability</span>
                <span>100% Probability</span>
              </div>
            </div>

            {/* AI Natural Explanation Summary Card */}
            {result.natural_explanation && (
              <div className="glass rounded-3xl p-6 border-white/10 bg-gradient-to-br from-blue-500/[0.02] to-transparent space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase font-mono">
                  <Info className="w-4 h-4 text-blue-400" />
                  Visual AI Diagnostic Summary
                </div>
                <p className="text-sm text-white/80 leading-relaxed font-light italic">
                  "{result.natural_explanation}"
                </p>
              </div>
            )}

            {/* SHAP Waterfall Chart */}
            <ShapWaterfall explanation={result.explanation} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
