'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReview, AnalysisResponse } from '../../lib/api';
import HelpfulnessGauge from '../../components/HelpfulnessGauge';
import ShapWaterfall from '../../components/ShapWaterfall';

const exampleReviews = [
  {
    label: 'Helpful Review',
    color: 'emerald',
    text: 'This battery is exceptional. I have been using it for 6 months and it easily lasts 10 to 12 hours on a single charge. The keyboard feel is tactile and responsive. Highly recommend for developers who need reliable hardware.',
  },
  {
    label: 'Critical Review',
    color: 'rose',
    text: 'Do not buy this phone case. The plastic cracked along the volume buttons after only 2 days of normal use. Customer service was unhelpful. Returning immediately for a refund.',
  },
  {
    label: 'Generic Review',
    color: 'gray',
    text: 'Nice product. Works good.',
  },
];

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

const pipelineSteps = [
  { num: 1, title: 'Tokenization', desc: 'Text is split into subword tokens' },
  { num: 2, title: 'Feature Extraction', desc: 'TF-IDF and readability metrics computed' },
  { num: 3, title: 'Model Inference', desc: 'XGBoost predicts helpfulness score' },
  { num: 4, title: 'SHAP Explanation', desc: 'TreeSHAP computes feature attributions' },
];

export default function AnalyzerPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeReview(text);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (label: string) => {
    const l = label.toLowerCase();
    if (l === 'positive') return 'text-emerald-400';
    if (l === 'negative') return 'text-rose-400';
    return 'text-amber-400';
  };

  const getSentimentBadge = (label: string) => {
    const l = label.toLowerCase();
    if (l === 'positive') return 'badge-emerald';
    if (l === 'negative') return 'badge-rose';
    return 'badge-amber';
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
        <span className="section-label">Review Analysis</span>
        <h1 className="section-title mt-2">Analyzer</h1>
        <p className="section-desc mt-3 max-w-2xl">
          Paste any product review to get an instant AI-powered helpfulness analysis with
          explainable feature attributions powered by SHAP.
        </p>
      </motion.div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT — Input */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <div className="glass rounded-2xl p-6 space-y-5">
            {/* Character + Word count header */}
            <div className="flex items-center justify-between text-xs tracking-wide">
              <span className="text-white/40 uppercase font-medium">Review Input</span>
              <div className="flex items-center gap-4 text-white/30 font-mono">
                <span>{charCount} chars</span>
                <span className="w-px h-3 bg-white/10" />
                <span>{wordCount} words</span>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a product review here to analyze its helpfulness..."
              className="w-full min-h-[200px] bg-transparent border border-white/[0.06] rounded-xl p-4 text-sm text-white/90 placeholder-white/20 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all duration-300"
            />

            {/* Example buttons */}
            <div className="flex flex-wrap gap-3">
              {exampleReviews.map((ex) => {
                const borderMap: Record<string, string> = {
                  emerald: 'border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400/80',
                  rose: 'border-rose-500/30 hover:border-rose-500/60 text-rose-400/80',
                  gray: 'border-white/10 hover:border-white/20 text-white/50',
                };
                return (
                  <button
                    key={ex.label}
                    onClick={() => setText(ex.text)}
                    className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all duration-300 ${borderMap[ex.color]} bg-white/[0.02] hover:bg-white/[0.05]`}
                  >
                    {ex.label}
                  </button>
                );
              })}
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Analyzing…
                </span>
              ) : (
                'Analyze Review'
              )}
            </button>
          </div>
        </motion.div>

        {/* RIGHT — Results */}
        <motion.div variants={itemVariants} className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {/* Error state */}
            {error && (
              <motion.div
                key="error"
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
                    <p className="text-sm font-medium text-rose-400">Analysis Error</p>
                    <p className="text-xs text-white/40 mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading state */}
            {loading && !error && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-2xl p-10 flex flex-col items-center justify-center gap-4"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-sm text-white/50 font-medium">Running inference pipeline…</p>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Placeholder state */}
            {!loading && !error && !result && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-2xl p-6 space-y-5"
              >
                <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Inference Pipeline</p>
                <div className="space-y-4">
                  {pipelineSteps.map((step) => (
                    <div key={step.num} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-400">{step.num}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{step.title}</p>
                        <p className="text-xs text-white/30 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results state */}
            {!loading && !error && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Gauge */}
                <HelpfulnessGauge
                  score={result.helpfulness_score}
                  confidence={result.confidence}
                  quality={result.quality_rating}
                />

                {/* Sentiment */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Sentiment</span>
                    <span className={`${getSentimentBadge(result.sentiment.label)}`}>
                      {result.sentiment.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-end gap-2">
                    <span className={`text-2xl font-bold font-mono ${getSentimentColor(result.sentiment.label)}`}>
                      {(result.sentiment.score * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-white/30 mb-1">confidence</span>
                  </div>
                </div>

                {/* Readability + Length Impact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-xl p-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Readability</p>
                    <p className="text-sm font-semibold text-white/80 mt-1">{result.explanation.readability_impact}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Length</p>
                    <p className="text-sm font-semibold text-white/80 mt-1">{result.explanation.length_impact}</p>
                  </div>
                </div>

                {/* Natural Explanation */}
                {result.natural_explanation && (
                  <div className="glass rounded-2xl p-5 border border-indigo-500/10 relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-transparent">
                    <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">AI Diagnostic Explanation</p>
                    <p className="text-sm text-white/80 mt-2.5 leading-relaxed font-medium">
                      "{result.natural_explanation}"
                    </p>
                  </div>
                )}

                {/* AI Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-violet-500/10 bg-gradient-to-br from-violet-500/5 to-transparent">
                    <p className="text-xs text-violet-400 uppercase tracking-wider font-semibold">How to Improve this Review</p>
                    <ul className="mt-3.5 space-y-2.5">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                          <span className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-violet-400 font-bold">
                            💡
                          </span>
                          <span className="leading-normal">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Full-width SHAP Waterfall */}
      <AnimatePresence>
        {result && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <ShapWaterfall explanation={result.explanation} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
