'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReview, AnalysisResponse } from '../../lib/api';
import dynamic from 'next/dynamic';
import { 
  Sparkles, HelpCircle, GitBranch, Play, AlertCircle, Info, 
  ChevronRight, Sliders, RefreshCw, Layers, CheckCircle2, XCircle
} from 'lucide-react';

const ShapWaterfall = dynamic(() => import('../../components/ShapWaterfall'), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-2xl p-6 min-h-[300px] border-white/5 animate-pulse flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <span className="text-xs text-indigo-400 font-mono">Loading SHAP explainability matrices...</span>
    </div>
  )
});

const PRESETS = {
  laptop: 'This battery is exceptional. I have been using it for 6 months and it easily lasts 10 to 12 hours on a single charge. The keyboard feel is tactile and responsive. Highly recommend for developers who need reliable hardware.',
  headphones: 'terrible quality, cheap plastic. stopped working after two days. waste of money.',
  smartphone: 'The smartphone is decent for its price. Screen is nice and bright, but the battery life is average. Takes okay photos in daylight, but very noisy at night. Standard packaging.'
};

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

  // Counterfactual sliders state
  const [sliderWordCount, setSliderWordCount] = useState(60);
  const [sliderReadability, setSliderReadability] = useState(60);
  const [sliderSentiment, setSliderSentiment] = useState(0.0);
  const [sliderExclamation, setSliderExclamation] = useState(0);

  // Actual values extracted from review for delta calculations
  const [actualWordCount, setActualWordCount] = useState(60);
  const [actualReadability, setActualReadability] = useState(60);
  const [actualSentiment, setActualSentiment] = useState(0.0);
  const [actualExclamation, setActualExclamation] = useState(0);

  // Selected token for popup info
  const [selectedToken, setSelectedToken] = useState<{ word: string; weight: number } | null>(null);

  const handleExplain = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedToken(null);
    try {
      const res = await analyzeReview(text);
      setResult(res);

      // Extract actual baseline parameters from result
      const wc = text.split(/\s+/).filter(Boolean).length;
      setActualWordCount(wc);
      setSliderWordCount(wc);

      const readScore = res.explanation.readability_impact.includes('low') ? 35 : 75;
      setActualReadability(readScore);
      setSliderReadability(readScore);

      const sentVal = res.sentiment.label === 'Positive' ? 0.6 : res.sentiment.label === 'Negative' ? -0.5 : 0.0;
      setActualSentiment(sentVal);
      setSliderSentiment(sentVal);

      const exclCount = (text.match(/!/g) || []).length;
      setActualExclamation(exclCount);
      setSliderExclamation(exclCount);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Explanation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic counterfactual calculation
  const getSimulatedScore = () => {
    if (!result) return 0;
    const deltaWC = sliderWordCount - actualWordCount;
    const deltaRead = sliderReadability - actualReadability;
    const deltaSent = sliderSentiment - actualSentiment;
    const deltaExcl = sliderExclamation - actualExclamation;

    // Approximated linear SHAP feature attributions impact
    const scoreDiff = (deltaWC * 0.16) + (deltaRead * 0.11) + (deltaSent * 14.5) - (deltaExcl * 6.2);
    return Math.min(99.0, Math.max(1.0, result.helpfulness_score + scoreDiff));
  };

  const simulatedScore = getSimulatedScore();
  const simulatedDelta = result ? simulatedScore - result.helpfulness_score : 0;

  // Text highlighting parser
  const renderAttributionHeatmap = () => {
    if (!result) return null;
    const words = text.split(/(\s+)/);
    const posMap = new Map(result.explanation.top_positive_words.map(w => [w.word.toLowerCase(), w.weight]));
    const negMap = new Map(result.explanation.top_negative_words.map(w => [w.word.toLowerCase(), w.weight]));

    return (
      <div className="p-5 rounded-2xl border border-white/5 bg-[#090d16]/60 leading-relaxed text-sm text-slate-300 font-light select-none">
        {words.map((chunk, idx) => {
          const isWhitespace = /^\s+$/.test(chunk);
          if (isWhitespace) return <span key={idx}>{chunk}</span>;

          // Clean word for mapping comparison
          const cleanWord = chunk.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").toLowerCase();
          const posWeight = posMap.get(cleanWord);
          const negWeight = negMap.get(cleanWord);

          if (posWeight !== undefined) {
            return (
              <span
                key={idx}
                onClick={() => setSelectedToken({ word: chunk, weight: posWeight })}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium px-1 rounded cursor-pointer transition-colors duration-150 relative group"
              >
                {chunk}
              </span>
            );
          }

          if (negWeight !== undefined) {
            return (
              <span
                key={idx}
                onClick={() => setSelectedToken({ word: chunk, weight: negWeight })}
                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-medium px-1 rounded cursor-pointer transition-colors duration-150 relative group"
              >
                {chunk}
              </span>
            );
          }

          return <span key={idx} className="hover:text-white transition-colors duration-150">{chunk}</span>;
        })}
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10 animate-fade-in pb-16"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center lg:text-left">
        <span className="section-label">XAI Diagnostic Studio</span>
        <h1 className="section-title mt-2">Interactive Explainability Studio</h1>
        <p className="section-desc mt-3 max-w-2xl font-light">
          Calculate word-level SHAP attributions, check guarantees, and play with simulated counterfactual parameters in real time.
        </p>
      </motion.div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT — Input & Preset Cures */}
        <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col">
          <div className="glass rounded-3xl p-6 space-y-5 flex-1 flex flex-col justify-between border-white/10 shadow-2xl">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold font-mono">
                  Input Review Workspace
                </span>
                {/* Presets Row */}
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setText(PRESETS.laptop)}
                    className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-[10px] text-slate-300 font-mono transition-all"
                  >
                    Laptop
                  </button>
                  <button 
                    onClick={() => setText(PRESETS.headphones)}
                    className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-[10px] text-slate-300 font-mono transition-all"
                  >
                    Headphones
                  </button>
                  <button 
                    onClick={() => setText(PRESETS.smartphone)}
                    className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-[10px] text-slate-300 font-mono transition-all"
                  >
                    Phone
                  </button>
                </div>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter or select a preset review above to calculate TreeSHAP values..."
                className="flex-1 w-full min-h-[180px] bg-transparent border border-white/[0.06] rounded-2xl p-4 text-sm text-white/90 placeholder-white/20 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all duration-300 font-light"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => {
                  setText('');
                  setResult(null);
                  setSelectedToken(null);
                }}
                className="btn-ghost flex-1 text-xs"
              >
                Reset Clear
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
              Please enter review text or select a preset, then execute the explanation. The system will compute exact tabular Shapley values and visualize positive/negative attributions.
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
            className="space-y-8"
          >
            {/* Score Banner & Highlight Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Token Highlight Map (LEFT) */}
              <div className="lg:col-span-7 glass rounded-3xl p-6 border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold font-mono">
                    Token-Level Attribution Heatmap
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Click words to view weight</span>
                </div>

                {renderAttributionHeatmap()}

                {/* Token click tooltip */}
                <div className="min-h-[40px] flex items-center">
                  {selectedToken ? (
                    <div className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                      selectedToken.weight >= 0 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <Info className="w-3.5 h-3.5" />
                      <span>
                        Word <strong className="font-mono">"{selectedToken.word}"</strong> SHAP weight: 
                        <strong className="font-mono ml-1">{selectedToken.weight >= 0 ? '+' : ''}{selectedToken.weight.toFixed(4)}</strong>
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Select a highlighted word above to inspect local game-theory contribution.</span>
                  )}
                </div>
              </div>

              {/* Inference score card (RIGHT) */}
              <div className="lg:col-span-5 glass rounded-3xl p-6 border-white/10 bg-gradient-to-br from-blue-500/[0.02] to-transparent flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold font-mono">
                    Prediction Baseline
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Confidence: {result.confidence}%</span>
                </div>
                <div className="space-y-2">
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {result.helpfulness_score.toFixed(1)}%
                  </span>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    XGBoost probability of review helpfulness. Calculated in {result.inference_time_ms} ms.
                  </p>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400"
                    style={{ width: `${result.helpfulness_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* TreeSHAP Counterfactual Simulator Playground */}
            <div className="glass p-6 border-white/10 rounded-3xl bg-gradient-to-b from-indigo-500/[0.01] to-transparent space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase font-mono">
                    <Sliders className="w-4 h-4" />
                    TreeSHAP Counterfactual Simulator Playground
                  </div>
                  <p className="text-[11px] text-slate-400 font-light mt-1">
                    Drag the sliders to simulate score changes as you modify core linguistic features of the review.
                  </p>
                </div>
                {/* Reset button */}
                <button
                  onClick={() => {
                    setSliderWordCount(actualWordCount);
                    setSliderReadability(actualReadability);
                    setSliderSentiment(actualSentiment);
                    setSliderExclamation(actualExclamation);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs text-slate-300 font-mono flex items-center gap-1.5 transition-all self-start sm:self-center"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Sliders
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4 border-t border-white/[0.04]">
                
                {/* Sliders Console */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Slider: Word Count */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Review Word Count</span>
                      <span className="text-white font-bold">{sliderWordCount} words</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="300" 
                      value={sliderWordCount}
                      onChange={(e) => setSliderWordCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Slider: Readability */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Readability Score (Flesch Index)</span>
                      <span className="text-white font-bold">{sliderReadability} / 100</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={sliderReadability}
                      onChange={(e) => setSliderReadability(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Slider: Sentiment */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Sentiment Polarity (Objectivity vs Bias)</span>
                      <span className="text-white font-bold">
                        {sliderSentiment > 0.15 ? 'Positive Bias' : sliderSentiment < -0.15 ? 'Negative Bias' : 'Balanced / Objective'} ({sliderSentiment.toFixed(2)})
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="-1.0" 
                      max="1.0" 
                      step="0.05"
                      value={sliderSentiment}
                      onChange={(e) => setSliderSentiment(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Slider: Exclamation count */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Exclamation Marks Emphasis</span>
                      <span className="text-white font-bold">{sliderExclamation} count</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      value={sliderExclamation}
                      onChange={(e) => setSliderExclamation(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Score Comparison Visual Card */}
                <div className="lg:col-span-5 rounded-2xl border border-white/5 bg-[#090d16]/30 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Simulation Prediction</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold font-mono text-indigo-400 tracking-tight">
                        {simulatedScore.toFixed(1)}%
                      </span>
                      <span className={`text-xs font-mono font-bold ${
                        simulatedDelta > 0 ? 'text-emerald-400' : simulatedDelta < 0 ? 'text-rose-400' : 'text-slate-500'
                      }`}>
                        {simulatedDelta > 0 ? '+' : ''}{simulatedDelta.toFixed(1)}% delta
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                      This represents the simulated helpfulness probability. Notice how adding descriptive detail (increasing word count) increases score, while excessive exclamation marks reduce trust and score.
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-white/[0.04] pt-3 flex flex-col justify-end flex-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Baseline Score:</span>
                      <span className="text-white">{result.helpfulness_score.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Simulated Shift:</span>
                      <span className="text-indigo-300 font-bold">{simulatedScore.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* AI Natural Explanation Summary Card */}
            {result.natural_explanation && (
              <div className="glass rounded-3xl p-6 border-white/10 bg-gradient-to-br from-blue-500/[0.02] to-transparent space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase font-mono">
                  <Info className="w-4 h-4 text-blue-400" />
                  Visual AI Diagnostic Summary
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-light italic">
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
