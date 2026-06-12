'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReview, AnalysisResponse } from '../../lib/api';
import HelpfulnessGauge from '../../components/HelpfulnessGauge';
import dynamic from 'next/dynamic';

const ShapWaterfall = dynamic(() => import('../../components/ShapWaterfall'), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-2xl p-6 min-h-[300px] border-white/5 animate-pulse flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <span className="text-xs text-indigo-400 font-mono">Loading SHAP explainability matrices...</span>
    </div>
  )
});
import { Sparkles, Terminal, Shield, Cpu, Activity, Clock, HelpCircle, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const exampleReviews = [
  {
    label: 'Amazing Laptop Review',
    color: 'emerald',
    text: 'This laptop battery is exceptional. I have been using it for 6 months now and it easily lasts 10 to 12 hours on a single charge. The keyboard feel is tactile and responsive. Highly recommend for developers who need reliable hardware.',
  },
  {
    label: 'Poor Headphones Review',
    color: 'rose',
    text: 'Terrible headphones. The left earbud stopped working after a week of normal use. There is constant static noise in the background, and the bluetooth pairing drops frequently. Do not buy.',
  },
  {
    label: 'Average Smartphone Review',
    color: 'gray',
    text: 'The smartphone is decent for the price. The screen is clear and bright, and it runs basic apps smoothly. However, the camera is very grainy in low light, and the battery needs a daily charge. Average performance.',
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

const PIPELINE_STAGES = [
  'Understanding Language',
  'Extracting Features',
  'Computing Embeddings',
  'Running Hybrid Model',
  'Generating Explanations',
  'Generating Recommendations'
];

export default function AnalyzerPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponseTime, setApiResponseTime] = useState<number | null>(null);

  // Pipeline execution animation state
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineIdx, setPipelineIdx] = useState(-1);

  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const handleAnalyze = async (textToAnalyze?: string) => {
    const targetText = textToAnalyze !== undefined ? textToAnalyze : text;
    if (!targetText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setPipelineActive(true);
    setPipelineIdx(0);
    setApiResponseTime(null);

    let pendingResult: AnalysisResponse | null = null;
    let apiDone = false;
    let pipelineDone = false;
    const start = performance.now();

    // Start API Request
    analyzeReview(targetText)
      .then(res => {
        const end = performance.now();
        setApiResponseTime(Math.round(end - start));
        pendingResult = res;
        apiDone = true;
        if (pipelineDone) {
          setResult(res);
          setLoading(false);
          setPipelineActive(false);
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
        setLoading(false);
        setPipelineActive(false);
      });

    // Start Pipeline Visual Animation Ticks
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < PIPELINE_STAGES.length - 1) {
        currentStep++;
        setPipelineIdx(currentStep);
      } else {
        clearInterval(interval);
        pipelineDone = true;
        if (apiDone && pendingResult) {
          setResult(pendingResult);
          setLoading(false);
          setPipelineActive(false);
        }
      }
    }, 200); // 1.2s total visual thinking pipeline duration
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const triggerPreset = (presetText: string) => {
    setText(presetText);
    handleAnalyze(presetText);
  };

  const getSentimentColor = (label: string) => {
    const l = label.toLowerCase();
    if (l === 'positive') return 'text-emerald-400';
    if (l === 'negative') return 'text-rose-400';
    return 'text-amber-400';
  };

  const getConfidenceIndicator = (conf: number) => {
    if (conf >= 80) return { label: 'High Confidence', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', icon: '🟢' };
    if (conf >= 65) return { label: 'Medium Confidence', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10', icon: '🟡' };
    return { label: 'Low Confidence', color: 'text-rose-400 border-rose-500/20 bg-rose-500/10', icon: '🔴' };
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
        <span className="section-label">AI Review Verification</span>
        <h1 className="section-title mt-2">Analyzer Workspace</h1>
        <p className="section-desc mt-3 max-w-2xl font-light">
          Verify review helpfulness scores, analyze linguistic signals, and explore transparent explainability logs in the ARIS AI environment.
        </p>
      </motion.div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT — Conversational Editor */}
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-4">
          {/* Preset Example Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Try Example:</span>
            {exampleReviews.map((ex) => (
              <button
                key={ex.label}
                onClick={() => triggerPreset(ex.text)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full border border-white/5 hover:border-blue-500/30 text-slate-400 hover:text-blue-400 bg-white/[0.01] hover:bg-blue-500/[0.03] text-xs font-semibold tracking-wide transition-all duration-300 disabled:opacity-40"
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div className="glass rounded-3xl p-6 space-y-6 border-white/10 shadow-2xl relative overflow-hidden">
            {/* Count header */}
            <div className="flex items-center justify-between text-xs tracking-wide">
              <span className="text-white/40 uppercase font-semibold">Conversational Input Console</span>
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
              onKeyDown={handleKeyDown}
              placeholder="Submit review text here... (Enter to submit, Shift + Enter for new lines)"
              className="w-full min-h-[200px] bg-transparent border border-white/[0.05] rounded-2xl p-4 text-sm text-white/90 placeholder-white/20 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20 transition-all duration-300 font-sans leading-relaxed"
            />

            {/* Analyze button */}
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !text.trim()}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed py-3.5 text-xs font-bold uppercase tracking-widest"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2 font-mono">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  AI is Thinking…
                </span>
              ) : (
                'Submit For Verification'
              )}
            </button>
          </div>
        </motion.div>

        {/* RIGHT — AI Thinking Loader or Results */}
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

            {/* AI Thinking Pipeline Loader */}
            {loading && pipelineActive && !error && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-3xl p-6 space-y-5 min-h-[350px] border-white/10 shadow-2xl flex flex-col justify-center text-left"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-500 animate-pulse" />
                  <span className="text-xs text-white/50 uppercase tracking-widest font-mono font-bold">AI Diagnostics Pipeline</span>
                </div>

                <div className="space-y-2.5 pt-2">
                  {PIPELINE_STAGES.map((stage, idx) => {
                    const isChecked = pipelineIdx > idx;
                    const isActive = pipelineIdx === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border text-[11px] font-mono transition-all duration-300 flex items-center justify-between ${
                          isChecked 
                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                            : isActive 
                              ? 'bg-blue-500/5 text-blue-400 border-blue-500/35 animate-pulse' 
                              : 'bg-white/[0.01] text-slate-600 border-white/[0.04]'
                        }`}
                      >
                        <span>{stage}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isActive ? (
                          <span className="w-2.5 h-2.5 rounded-full border border-blue-400 border-t-transparent animate-spin" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-white/5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Teaching Empty State */}
            {!loading && !error && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[400px] border-white/10 shadow-2xl space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/[0.08] flex items-center justify-center border border-blue-500/20 animate-pulse-glow">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-base font-bold text-white">Awaiting Diagnostics</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Submit a product review on the left, or select a preset example to trigger real-time AI classification.
                  </p>
                </div>

                <div className="w-full border-t border-white/[0.04] pt-5 space-y-4 text-left max-w-sm">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-mono">Writing Tip</span>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      Helpful reviews detail specific parameters like duration of usage (e.g. "lasts 9 hours") rather than general statements (e.g. "nice product").
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-mono">Suggested Action</span>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      Click the <span className="text-blue-400 font-bold font-mono">Amazing Laptop Review</span> preset above to run the full diagnostic simulator.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Reveal */}
            {!loading && !error && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Gauge Panel */}
                <HelpfulnessGauge
                  score={result.helpfulness_score}
                  confidence={result.confidence}
                  quality={result.quality_rating}
                />

                {/* Trust Layer: Transparency Signals Card */}
                <div className="glass rounded-3xl p-5 border-white/10 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-[10px] text-blue-400 uppercase tracking-widest font-mono font-bold">Why the model predicted this</span>
                    <span className="text-[9px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Transparency Log
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <span className="text-slate-500 block uppercase text-[9px] tracking-widest">Top Positives</span>
                      {result.explanation.top_positive_words && result.explanation.top_positive_words.length > 0 ? (
                        result.explanation.top_positive_words.slice(0, 3).map((w, i) => (
                          <span key={i} className="text-emerald-400/90 block">• "{w.word}" (+{w.weight.toFixed(2)})</span>
                        ))
                      ) : (
                        <span className="text-slate-400 block">• None flagged</span>
                      )}
                      {result.explanation.length_impact.toLowerCase().includes('optimal') && (
                        <span className="text-emerald-400/90 block">• Optimal length</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-slate-500 block uppercase text-[9px] tracking-widest">Top Negatives</span>
                      {result.explanation.top_negative_words && result.explanation.top_negative_words.length > 0 ? (
                        result.explanation.top_negative_words.slice(0, 3).map((w, i) => (
                          <span key={i} className="text-rose-400 block">• "{w.word}" ({w.weight.toFixed(2)})</span>
                        ))
                      ) : (
                        <span className="text-slate-400 block">• None flagged</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trust Layer: Actionable Score Boosters */}
                <div className="glass rounded-3xl p-5 border-white/10 bg-gradient-to-br from-violet-500/[0.02] to-transparent space-y-3">
                  <p className="text-[10px] text-violet-400 uppercase tracking-widest font-mono font-bold">What would increase this score?</p>
                  <div className="space-y-2">
                    {result.helpfulness_score < 75 && (
                      <div className="p-3 rounded-xl bg-violet-500/[0.05] border border-violet-500/15 text-[11px] text-slate-300 leading-relaxed font-mono">
                        ⚡ <span className="font-bold text-white">Length Boost:</span> Add 40+ words describing details of long-term battery or build durability usage to increase predicted helpfulness by ~15%.
                      </div>
                    )}
                    {result.explanation.readability_impact.toLowerCase().includes('poor') && (
                      <div className="p-3 rounded-xl bg-violet-500/[0.05] border border-violet-500/15 text-[11px] text-slate-300 leading-relaxed font-mono">
                        ⚡ <span className="font-bold text-white">Clarity Boost:</span> Shorten long sentences and simplify descriptive phrases to raise the readability metric to optimal status.
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-blue-500/[0.03] border border-blue-500/15 text-[11px] text-slate-300 leading-relaxed font-mono">
                      💡 <span className="font-bold text-white">Signal Boost:</span> Mention explicit metrics like duration (e.g. "lasts 9 hours") rather than general statements (e.g. "battery works").
                    </div>
                  </div>
                </div>

                {/* Developer Metrics */}
                <div className="glass rounded-3xl p-5 border-white/10 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" /> Developer Console
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Inference OK
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
                      <div className="text-[9px] text-white/30 uppercase">Sentiment</div>
                      <div className="text-white/80 font-bold flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        {result.sentiment.label} ({result.sentiment.score}%)
                      </div>
                    </div>
                  </div>
                </div>
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
