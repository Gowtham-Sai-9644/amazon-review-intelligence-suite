'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReview, AnalysisResponse } from '../../lib/api';
import HelpfulnessGauge from '../../components/HelpfulnessGauge';
import ShapWaterfall from '../../components/ShapWaterfall';
import { Sparkles, Terminal, Shield, Cpu, Activity, Clock, HelpCircle, FileText } from 'lucide-react';

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
  const [apiResponseTime, setApiResponseTime] = useState<number | null>(null);

  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setApiResponseTime(null);
    const start = performance.now();
    try {
      const res = await analyzeReview(text);
      const end = performance.now();
      setApiResponseTime(Math.round(end - start));
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

  const getConfidenceIndicator = (conf: number) => {
    if (conf >= 80) return { label: 'High Confidence', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', icon: '🟢' };
    if (conf >= 65) return { label: 'Medium Confidence', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10', icon: '🟡' };
    return { label: 'Low Confidence', color: 'text-rose-400 border-rose-500/20 bg-rose-500/10', icon: '🔴' };
  };

  // Group recommendations by impact
  const highImpactRecs = result?.recommendations?.filter(r => r.impact === 'High') || [];
  const mediumImpactRecs = result?.recommendations?.filter(r => r.impact === 'Medium') || [];
  const lowImpactRecs = result?.recommendations?.filter(r => r.impact === 'Low') || [];

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
        <h1 className="section-title mt-2">Analyzer Workspace</h1>
        <p className="section-desc mt-3 max-w-2xl">
          Evaluate customer review helpfulness. Our hybrid pipeline predicts quality metrics and calculates exact feature contributions.
        </p>
      </motion.div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT — Input */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <div className="glass rounded-3xl p-6 space-y-6 border-white/10 shadow-2xl">
            {/* Count header */}
            <div className="flex items-center justify-between text-xs tracking-wide">
              <span className="text-white/40 uppercase font-semibold">Review Input</span>
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
              placeholder="Paste a product review here (e.g. 'I used this keyboard for 3 months...')"
              className="w-full min-h-[220px] bg-transparent border border-white/[0.06] rounded-2xl p-4 text-sm text-white/90 placeholder-white/20 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all duration-300"
            />

            {/* Example buttons */}
            <div className="space-y-2">
              <div className="text-[10px] text-white/30 uppercase font-semibold">Preset review examples</div>
              <div className="flex flex-wrap gap-2.5">
                {exampleReviews.map((ex) => {
                  const borderMap: Record<string, string> = {
                    emerald: 'border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400/80 hover:bg-emerald-500/5',
                    rose: 'border-rose-500/20 hover:border-rose-500/50 text-rose-400/80 hover:bg-rose-500/5',
                    gray: 'border-white/10 hover:border-white/20 text-white/50 hover:bg-white/5',
                  };
                  return (
                    <button
                      key={ex.label}
                      onClick={() => setText(ex.text)}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-300 ${borderMap[ex.color]} bg-white/[0.01]`}
                    >
                      {ex.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed py-3.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2 font-mono">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Processing inference…
                </span>
              ) : (
                'Run Inference Diagnostics'
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass rounded-3xl p-6 border border-rose-500/20 space-y-4 shadow-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-rose-400">Analysis Failed</p>
                    <p className="text-xs text-white/40 mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading state */}
            {loading && !error && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-3xl p-10 flex flex-col items-center justify-center gap-6 min-h-[400px] border-white/10 shadow-2xl"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <div className="space-y-1.5 text-center">
                  <p className="text-sm text-white/80 font-semibold font-mono">Running Pipeline...</p>
                  <p className="text-xs text-white/30 font-light max-w-[200px]">Extracting text features and running TreeSHAP attributions.</p>
                </div>
              </motion.div>
            )}

            {/* Premium Empty State */}
            {!loading && !error && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[400px] border-white/10 shadow-2xl space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/[0.08] flex items-center justify-center border border-blue-500/20 animate-pulse-glow">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Inference Awaiting Input</h3>
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed font-light">
                    Submit a customer review on the left. The engine will evaluate help-scores, extract sentiment polarities, and compile attribution explanations.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Results state */}
            {!loading && !error && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Gauge card */}
                <HelpfulnessGauge
                  score={result.helpfulness_score}
                  confidence={result.confidence}
                  quality={result.quality_rating}
                />

                {/* Developer panel (Performance Metrics) */}
                <div className="glass rounded-3xl p-5 border-white/10 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" /> Developer Console
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Pipeline Success
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <div className="text-[9px] text-white/30 uppercase">Inference Time</div>
                      <div className="text-white/80 font-bold flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-blue-400" />
                        {result.inference_time_ms} ms
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-white/30 uppercase">API Roundtrip</div>
                      <div className="text-white/80 font-bold flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-violet-400" />
                        {apiResponseTime} ms
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-white/30 uppercase">Model Core</div>
                      <div className="text-white/80 font-bold flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-cyan-400" />
                        {result.model_version}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-white/30 uppercase">Engine Health</div>
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Optimal
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sentiment + Confidence Badge */}
                <div className="glass rounded-3xl p-5 border-white/10 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Reliability Status</span>
                    {(() => {
                      const indicator = getConfidenceIndicator(result.confidence);
                      return (
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${indicator.color}`}>
                          {indicator.icon} {indicator.label} ({result.confidence.toFixed(0)}%)
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-white/30 uppercase">Sentiment Rating</div>
                      <div className="text-base font-bold text-white flex items-center gap-1.5">
                        <span className={`${getSentimentColor(result.sentiment.label)} font-semibold`}>
                          {result.sentiment.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-white/30">Calibrated polarity score</span>
                      <div className="text-sm font-bold text-white/70 font-mono">
                        {(result.sentiment.score).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                </div>

                {/* Readability + Length Impact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-2xl p-4 border-white/10">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Readability</p>
                    <p className="text-xs font-bold text-white/80 mt-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      {result.explanation.readability_impact}
                    </p>
                  </div>
                  <div className="glass rounded-2xl p-4 border-white/10">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Length Rating</p>
                    <p className="text-xs font-bold text-white/80 mt-1.5 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
                      {result.explanation.length_impact}
                    </p>
                  </div>
                </div>

                {/* Natural Explanation summary */}
                {result.natural_explanation && (
                  <div className="glass rounded-3xl p-5 border-white/10 bg-gradient-to-br from-blue-500/[0.03] to-transparent relative overflow-hidden">
                    <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold">AI Diagnostic Explanation</p>
                    <p className="text-xs text-white/80 mt-2.5 leading-relaxed font-medium">
                      "{result.natural_explanation}"
                    </p>
                  </div>
                )}

                {/* Prioritized recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="glass rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-violet-500/[0.02] to-transparent">
                    <p className="text-xs text-violet-400 uppercase tracking-wider font-semibold">Actionable Recommendations</p>
                    
                    <div className="mt-3.5 space-y-4">
                      {/* High Impact */}
                      {highImpactRecs.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[9px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded w-max">
                            ⚡ High Impact
                          </div>
                          <ul className="space-y-1.5">
                            {highImpactRecs.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                                <span className="text-rose-400 mt-0.5 font-bold">▪</span>
                                <span className="leading-relaxed">{rec.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Medium Impact */}
                      {mediumImpactRecs.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded w-max">
                            ⚡ Medium Impact
                          </div>
                          <ul className="space-y-1.5">
                            {mediumImpactRecs.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                                <span className="text-amber-400 mt-0.5 font-bold">▪</span>
                                <span className="leading-relaxed">{rec.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Low Impact */}
                      {lowImpactRecs.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded w-max">
                            ⚡ Low Impact
                          </div>
                          <ul className="space-y-1.5">
                            {lowImpactRecs.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs text-white/70">
                                <span className="text-blue-400 mt-0.5 font-bold">▪</span>
                                <span className="leading-relaxed">{rec.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
