'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReview } from '../../lib/api';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ShapWaterfall = dynamic(() => import('../../components/ShapWaterfall'), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-2xl p-6 min-h-[250px] border-white/5 animate-pulse flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      <span className="text-xs text-violet-400 font-mono">Loading SHAP explainability matrices...</span>
    </div>
  )
});

import { 
  Sparkles, Terminal, Shield, Cpu, Activity, Clock, HelpCircle, 
  FileText, CheckCircle2, AlertCircle, RefreshCw, Copy, Check,
  BookOpen, Eye, Zap, AlertTriangle, ArrowRight, BarChart3, TrendingUp, Info
} from 'lucide-react';

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

const PIPELINE_STAGES = [
  'Readability',
  'Sentiment',
  'Specificity',
  'Evidence Detection',
  'Trust Signals',
  'Expertise Signals',
  'Semantic Analysis',
  'Helpfulness Forecast',
  'Intelligence Scoring'
];

export default function AnalyzerPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponseTime, setApiResponseTime] = useState<number | null>(null);
  
  // Rewrite Copilot tab selection
  const [copilotTab, setCopilotTab] = useState<'trust' | 'help' | 'conv'>('help');
  const [copied, setCopied] = useState(false);

  // Pipeline execution animation state
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineIdx, setPipelineIdx] = useState(-1);

  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  // Recruiter One-Click Demo Query Handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const demo = params.get('demo');
      if (demo) {
        let presetText = '';
        if (demo === 'poor') {
          presetText = "Nice product, works good.";
        } else if (demo === 'average') {
          presetText = "It is okay, but not great. The sound is clear, but there is no bass. Good for podcasts, bad for music.";
        } else if (demo === 'excellent') {
          presetText = "This laptop battery is exceptional. I have been using it for 6 months and it easily lasts 10 to 12 hours on a single charge. The keyboard feel is tactile and responsive. Highly recommend for developers.";
        }
        if (presetText) {
          setText(presetText);
          handleAnalyze(presetText);
        }
      }
    }
  }, []);

  const handleAnalyze = async (textToAnalyze?: string) => {
    const targetText = textToAnalyze !== undefined ? textToAnalyze : text;
    if (!targetText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setPipelineActive(true);
    setPipelineIdx(0);
    setApiResponseTime(null);

    let pendingResult: any = null;
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
        console.error("API error:", err);
        setError('Analysis failed. Please run uvicorn server or try again.');
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
    }, 150); // Fast paced V4 timeline loading
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

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10">
      
      {/* Workspace Header */}
      <div className="text-center lg:text-left">
        <span className="section-label">AI Review Investigation Console</span>
        <h1 className="section-title mt-2 font-black text-white leading-none">Review Intelligence Workspace</h1>
        <p className="section-desc mt-3 max-w-2xl font-light">
          Audit review authenticity, extract factual evidence, simulate score upgrades, and rewrite text dynamically using our hybrid ML reasoning layers.
        </p>
      </div>

      {/* Grid Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Console & Rewrite Copilot */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Preset Example Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Try Preset:</span>
            {exampleReviews.map((ex) => (
              <button
                key={ex.label}
                onClick={() => triggerPreset(ex.text)}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl border border-white/5 hover:border-violet-500/30 text-slate-400 hover:text-violet-400 bg-white/[0.01] hover:bg-violet-500/[0.02] text-xs font-semibold tracking-wide transition-all duration-300 disabled:opacity-40"
              >
                {ex.label}
              </button>
            ))}
          </div>

          {/* Text Editor Box */}
          <div className="glass rounded-3xl p-6 space-y-6 border-white/8 bg-slate-950/20 shadow-2xl relative">
            <div className="flex items-center justify-between text-xs tracking-wide">
              <span className="text-white/40 uppercase font-semibold">Conversational Input Editor</span>
              <div className="flex items-center gap-4 text-white/30 font-mono">
                <span>{charCount} chars</span>
                <span className="w-px h-3 bg-white/10" />
                <span>{wordCount} words</span>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Submit review text here... (Enter to investigate, Shift + Enter for new lines)"
              className="w-full min-h-[220px] bg-transparent border border-white/[0.04] rounded-2xl p-4 text-sm text-white/95 placeholder-white/20 resize-y focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/20 transition-all duration-300 font-sans leading-relaxed shadow-inner"
            />

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !text.trim()}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed py-4 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2 font-mono">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Running AI Diagnostics...
                </span>
              ) : (
                'Run Investigation Pipeline'
              )}
            </button>
          </div>

          {/* V4 REWRITE COPILOT (Interactive Selector) */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-6 border-white/8 bg-slate-950/20 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-violet-400" />
                    <span className="text-[10px] text-violet-400 uppercase tracking-widest font-mono font-bold">Review Rewrite Copilot</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">Optimized draft variants</span>
                </div>

                {/* Tab selector */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'trust', label: 'Trust-Optimized', delta: result.copilot.version_a_trust.improvement_delta },
                    { key: 'help', label: 'Help-Optimized', delta: result.copilot.version_b_helpfulness.improvement_delta },
                    { key: 'conv', label: 'Sales-Optimized', delta: result.copilot.version_c_conversion.improvement_delta }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setCopilotTab(tab.key as any)}
                      className={`p-2 rounded-xl text-center border font-mono text-[10px] font-bold transition-all duration-300 ${
                        copilotTab === tab.key 
                          ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' 
                          : 'bg-white/[0.01] text-slate-400 border-white/[0.04] hover:border-white/10'
                      }`}
                    >
                      <div>{tab.label}</div>
                      <div className="text-[9px] text-emerald-400 mt-0.5">+{tab.delta} Score</div>
                    </button>
                  ))}
                </div>

                {/* Copilot content display */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] relative group">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans pr-10 whitespace-pre-wrap">
                    {copilotTab === 'trust' ? result.copilot.version_a_trust.text :
                     copilotTab === 'help' ? result.copilot.version_b_helpfulness.text :
                     result.copilot.version_c_conversion.text}
                  </p>
                  <button
                    onClick={() => handleCopy(
                      copilotTab === 'trust' ? result.copilot.version_a_trust.text :
                      copilotTab === 'help' ? result.copilot.version_b_helpfulness.text :
                      result.copilot.version_c_conversion.text
                    )}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.04] border border-white/5 hover:border-violet-500/20 text-slate-400 hover:text-violet-400 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Results, Scores, and Reasonings */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            
            {/* Loading diagnostic stages */}
            {loading && pipelineActive && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-3xl p-6 space-y-5 min-h-[380px] border-white/8 shadow-2xl flex flex-col justify-center text-left"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-violet-400 animate-pulse" />
                  <span className="text-xs text-white/50 uppercase tracking-widest font-mono font-bold">Investigation timeline</span>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
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
                              ? 'bg-violet-500/5 text-violet-400 border-violet-500/35 animate-pulse' 
                              : 'bg-white/[0.01] text-slate-600 border-white/[0.04]'
                        }`}
                      >
                        <span>{stage}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isActive ? (
                          <span className="w-2.5 h-2.5 rounded-full border border-violet-400 border-t-transparent animate-spin" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-white/5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Empty landing guide */}
            {!loading && !error && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[400px] border-white/8 shadow-2xl space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-violet-500/[0.08] flex items-center justify-center border border-violet-500/20 animate-pulse">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-base font-bold text-white">Awaiting Diagnostics</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Submit a product review, or use the Recruiter Demo chips on the Homepage to run automated pipeline simulations.
                  </p>
                </div>
                <div className="w-full border-t border-white/[0.04] pt-5 space-y-4 text-left max-w-sm">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-mono">ARIS V4 Reasoning Layer</span>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      The V4 pipeline generates detailed structural scores, parses temporal usage indicators, estimates business conversion impacts, and yields optimized rewrites.
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
                className="space-y-6"
              >
                
                {/* Core prediction card */}
                <div className="glass rounded-3xl p-6 border-white/8 shadow-2xl space-y-5">
                  <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">ML Classifier Output</span>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      result.quality_rating === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {result.quality_rating} Quality
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-4xl font-black text-white font-mono tracking-tight">{result.helpfulness_score}%</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        🟢 {result.confidence}% Confidence
                      </span>
                    </div>
                    <div className="w-full bg-white/[0.03] h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" 
                        style={{ width: `${result.helpfulness_score}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Granular Quality Scores grid */}
                <div className="glass rounded-3xl p-6 border-white/8 shadow-2xl space-y-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold border-b border-white/[0.04] pb-2">Linguistic Scorecard</div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    {[
                      { label: 'Specificity', val: result.detailed_scores.specificity_score },
                      { label: 'Authenticity', val: result.detailed_scores.authenticity_score },
                      { label: 'Factual Evidence', val: result.detailed_scores.evidence_score },
                      { label: 'Domain Expertise', val: result.detailed_scores.expertise_score },
                      { label: 'Overall Quality', val: result.detailed_scores.quality_score },
                      { label: 'Overall Intelligence', val: result.detailed_scores.overall_intelligence_score }
                    ].map((score) => (
                      <div key={score.label} className="space-y-1.5 p-2 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                        <span className="text-slate-500 text-[10px] block">{score.label}</span>
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{score.val}%</span>
                          <span className="text-violet-400/70">★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Explorer Checklist */}
                <div className="glass rounded-3xl p-6 border-white/8 shadow-2xl space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold border-b border-white/[0.04] pb-2">Evidence Explorer</div>
                  <div className="space-y-2">
                    {result.evidence.map((ev: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-mono leading-relaxed">
                        {ev.present ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className={ev.present ? 'text-white' : 'text-slate-500'}>{ev.label}:</span>
                          <span className="text-slate-400 block text-[10px] mt-0.5">{ev.details}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Counterfactual improvements */}
                <div className="glass rounded-3xl p-6 border-white/8 shadow-2xl space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold border-b border-white/[0.04] pb-2">Counterfactual Explorer</div>
                  <div className="space-y-2">
                    {result.counterfactuals.map((cf: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.03] text-xs font-mono flex items-center justify-between">
                        <span className="text-slate-400 leading-normal">{cf.scenario}</span>
                        <span className="text-emerald-400 font-bold shrink-0 ml-3">+{cf.score_change}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Intelligence PM report card */}
                <div className="glass rounded-3xl p-6 border-white/8 shadow-2xl space-y-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold border-b border-white/[0.04] pb-2">Product Intelligence Report</div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <span className="text-slate-500 block uppercase text-[8px] tracking-widest">Buyer Trust Impact</span>
                      <span className={`font-bold block ${
                        result.business_intelligence.buyer_trust === 'High' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {result.business_intelligence.buyer_trust}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-slate-500 block uppercase text-[8px] tracking-widest">Sales Conversion</span>
                      <span className="font-bold text-violet-400 block">
                        {result.business_intelligence.conversion_impact}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-slate-500 block uppercase text-[8px] tracking-widest">Placement Prediction</span>
                      <span className="font-bold text-white block">
                        {result.business_intelligence.visibility_prediction}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-slate-500 block uppercase text-[8px] tracking-widest">Platform Action</span>
                      <span className="font-bold text-emerald-400 block">
                        {result.business_intelligence.recommendation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reasoning Why High / Low list */}
                <div className="glass rounded-3xl p-6 border-white/8 shadow-2xl space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold border-b border-white/[0.04] pb-2">Reasoning breakdown</div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-emerald-400 text-[10px] font-bold block uppercase tracking-wider">Positive Attributions</span>
                      {result.reasoning.why_high.map((pt: string, i: number) => (
                        <p key={i} className="text-slate-400">• {pt}</p>
                      ))}
                    </div>
                    <div className="space-y-1 pt-2">
                      <span className="text-rose-400 text-[10px] font-bold block uppercase tracking-wider">Negative Attributions</span>
                      {result.reasoning.why_low.map((pt: string, i: number) => (
                        <p key={i} className="text-slate-400">• {pt}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Developer run diagnostics */}
                <div className="glass rounded-3xl p-6 border-white/8 shadow-2xl space-y-3 text-xs font-mono">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold border-b border-white/[0.04] pb-2">Dev Console</div>
                  <div className="grid grid-cols-2 gap-3 text-slate-400">
                    <div>Inference Exec: <span className="text-white font-bold">{result.inference_time_ms} ms</span></div>
                    <div>API Roundtrip: <span className="text-white font-bold">{apiResponseTime} ms</span></div>
                    <div>Pipeline Core: <span className="text-white font-bold">{result.model_version}</span></div>
                    <div>Calibrated Sent: <span className="text-white font-bold">{result.sentiment.label}</span></div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </div>

      {/* SHAP Waterfall Studio (full-width below) */}
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

    </div>
  );
}
