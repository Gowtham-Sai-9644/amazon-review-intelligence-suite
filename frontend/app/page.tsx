'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Brain, Search, TrendingUp, ShieldAlert, Lightbulb,
  BarChart3, Cpu, GitBranch, Zap, Database, Layers, Star,
  BookOpen, Activity, ChevronRight, Sparkles, Github, Globe
} from 'lucide-react';
import { getAnalytics } from '../lib/api';

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

// Custom animated counter component
function AnimatedCounter({ value, duration = 1200, isPercent = false }: { value: number; duration?: number; isPercent?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMiliseconds = duration;
    const incrementTime = 20; // 50 fps
    const totalSteps = totalMiliseconds / incrementTime;
    const increment = (end - start) / totalSteps;

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(current);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  if (isPercent) {
    return <span className="font-mono">{displayValue.toFixed(1)}%</span>;
  }
  return <span className="font-mono">{Math.round(displayValue).toLocaleString()}</span>;
}

const FEATURES = [
  { icon: Search, title: 'Helpfulness Prediction', desc: 'Binary classification with MiniLM embeddings fused into XGBoost.', color: 'from-blue-500 to-indigo-500' },
  { icon: TrendingUp, title: 'Sentiment Analysis', desc: 'Real-time polarity detection with calibrated confidence scoring.', color: 'from-emerald-500 to-teal-500' },
  { icon: Brain, title: 'Explainable AI', desc: 'TreeSHAP computes exact feature attributions in polynomial time.', color: 'from-violet-500 to-purple-500' },
  { icon: ShieldAlert, title: 'Error Diagnostics', desc: 'Confusion matrix analysis with systematic failure case studies.', color: 'from-rose-500 to-pink-500' },
  { icon: Lightbulb, title: 'Business Insights', desc: 'Keyword correlations and optimal review patterns from 30K reviews.', color: 'from-amber-500 to-orange-500' },
  { icon: BarChart3, title: 'Model Progression', desc: 'Baseline ➔ ensemble ➔ transformer hybrid comparison pipeline.', color: 'from-cyan-500 to-sky-500' },
];

const TECH = ['Python', 'FastAPI', 'Next.js 14', 'XGBoost', 'MiniLM-L6-v2', 'SHAP', 'scikit-learn', 'Tailwind CSS', 'TypeScript', 'SQLite', 'Recharts', 'Framer Motion'];

import { CheckCircle2, Play, RefreshCw, AlertCircle } from 'lucide-react';

export default function LandingPage() {
  const [metrics, setMetrics] = useState({
    reviewsProcessed: 30000,
    accuracy: 89.6,
    f1: 88.7,
    rocAuc: 94.1,
    loading: true,
  });

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'MiniLM + XGBoost (Hybrid)', badge: 'Winning Model', acc: 89.6, f1: 88.7, auc: 94.1, best: true },
    { rank: 2, name: 'XGBoost (Tabular + TF-IDF)', badge: 'Tabular', acc: 83.1, f1: 81.9, auc: 87.4, best: false },
    { rank: 3, name: 'Random Forest', badge: 'Ensemble', acc: 79.4, f1: 77.1, auc: 83.2, best: false },
    { rank: 4, name: 'Logistic Regression (Baseline)', badge: 'Baseline', acc: 71.2, f1: 68.5, auc: 74.5, best: false },
  ]);

  // Simulator state variables
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0); // 0: idle, 1: typing, 2: thinking, 3: completed
  const [simText, setSimText] = useState('');
  const [simPipelineIdx, setSimPipelineIdx] = useState(-1);

  const PIPELINE_STAGES = [
    'Understanding Language',
    'Extracting Features',
    'Computing Embeddings',
    'Running Hybrid Model',
    'Generating Explanations',
    'Generating Recommendations'
  ];

  const triggerSimulation = () => {
    if (simulating) return;
    setSimulating(true);
    setSimStep(1);
    setSimText('');
    setSimPipelineIdx(-1);

    const textToType = "This laptop has exceptional battery life. I have been using it for 6 months and it easily lasts 10 to 12 hours on a single charge. Tactile keyboard is responsive.";
    let idx = 0;

    const typingTimer = setInterval(() => {
      if (idx < textToType.length) {
        setSimText(textToType.substring(0, idx + 1));
        idx++;
      } else {
        clearInterval(typingTimer);
        setSimStep(2);
        setSimPipelineIdx(0);
      }
    }, 15);
  };

  useEffect(() => {
    if (simStep === 2) {
      const timer = setInterval(() => {
        setSimPipelineIdx(prev => {
          if (prev < PIPELINE_STAGES.length - 1) {
            return prev + 1;
          } else {
            clearInterval(timer);
            setTimeout(() => {
              setSimStep(3);
              setSimulating(false);
            }, 300);
            return prev;
          }
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [simStep]);

  useEffect(() => {
    getAnalytics()
      .then((data) => {
        const hybrid = data.model_metrics.find((m) => m.model.includes('Hybrid') || m.model.includes('MiniLM'));
        const tabXgb = data.model_metrics.find((m) => m.model.includes('Tabular') || (m.model.includes('XGBoost') && !m.model.includes('Hybrid')));
        const rf = data.model_metrics.find((m) => m.model.includes('Random Forest'));
        const lr = data.model_metrics.find((m) => m.model.includes('Logistic'));

        setMetrics({
          reviewsProcessed: data.total_analyzed || 30120,
          accuracy: hybrid ? hybrid.accuracy : 89.6,
          f1: hybrid ? hybrid.f1 : 88.7,
          rocAuc: hybrid ? hybrid.roc_auc : 94.1,
          loading: false,
        });

        // Update leaderboard scores dynamically
        setLeaderboard([
          { rank: 1, name: 'MiniLM + XGBoost (Hybrid)', badge: 'Winning Model', acc: hybrid ? hybrid.accuracy : 89.6, f1: hybrid ? hybrid.f1 : 88.7, auc: hybrid ? hybrid.roc_auc : 94.1, best: true },
          { rank: 2, name: 'XGBoost (Tabular + TF-IDF)', badge: 'Tabular', acc: tabXgb ? tabXgb.accuracy : 83.1, f1: tabXgb ? tabXgb.f1 : 81.9, auc: tabXgb ? tabXgb.roc_auc : 87.4, best: false },
          { rank: 3, name: 'Random Forest', badge: 'Ensemble', acc: rf ? rf.accuracy : 79.4, f1: rf ? rf.f1 : 77.1, auc: rf ? rf.roc_auc : 83.2, best: false },
          { rank: 4, name: 'Logistic Regression (Baseline)', badge: 'Baseline', acc: lr ? lr.accuracy : 71.2, f1: lr ? lr.f1 : 68.5, auc: lr ? lr.roc_auc : 74.5, best: false },
        ]);
      })
      .catch((err) => {
        console.error('Error fetching dynamic landing page metrics:', err);
        setMetrics((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  return (
    <div className="space-y-32 pb-20">

      {/* ═══════════════════════════════════════════
          HERO SECTION (CINEMATIC)
          ═══════════════════════════════════════════ */}
      <section className="relative pt-12 sm:pt-20 text-center">
        {/* Glow backdrops */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-500/[0.04] rounded-full blur-[130px] pointer-events-none" />

        <motion.div initial="hidden" animate="show" variants={stagger} className="relative space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div variants={fade} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.05] border border-blue-500/15 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Trusted AI Review Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fade} transition={{ duration: 0.7 }} className="text-5xl sm:text-7xl lg:text-[80px] font-black tracking-tight leading-[0.95]">
            <span className="text-white">The Future of</span>
            <br />
            <span className="text-gradient">Review Intelligence</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fade} transition={{ duration: 0.6 }} className="text-slate-400 max-w-xl mx-auto leading-relaxed font-light text-base sm:text-lg">
            An end-to-end, production-grade review quality prediction platform blending 
            MiniLM sentence embeddings, engineered linguistics, XGBoost classification, and TreeSHAP explainability.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fade} transition={{ duration: 0.5 }} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/analyzer" className="btn-primary">
              Launch Analyzer Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/evaluation" className="btn-ghost">
              Model Leaderboard
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Credibility Badges Strip */}
          <motion.div 
            variants={fade} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-6 max-w-4xl mx-auto border-t border-white/[0.04] mt-8"
          >
            {[
              { text: 'Hybrid NLP + XGBoost', color: 'bg-blue-500/[0.03] text-blue-400/90 border-blue-500/10' },
              { text: 'Explainable AI', color: 'bg-violet-500/[0.03] text-violet-400/90 border-violet-500/10' },
              { text: 'TreeSHAP Powered', color: 'bg-cyan-500/[0.03] text-cyan-400/90 border-cyan-500/10' },
              { text: 'FastAPI + Next.js', color: 'bg-emerald-500/[0.03] text-emerald-400/90 border-emerald-500/10' },
              { text: 'Production Deployed', color: 'bg-amber-500/[0.03] text-amber-400/90 border-amber-500/10' }
            ].map((badge, idx) => (
              <span key={idx} className={`px-3.5 py-1 rounded-full border text-[9px] font-bold font-mono tracking-wider ${badge.color}`}>
                {badge.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ─── Interactive Demo Simulator Panel ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-5xl mx-auto relative px-4 sm:px-0"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/[0.03] via-violet-500/[0.02] to-cyan-500/[0.03] rounded-3xl blur-3xl" />

          <div className="relative glass overflow-hidden border border-white/[0.06] shadow-2xl">
            {/* Header / Tab Chrome */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04] bg-white/[0.01]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
              </div>
              <span className="text-[9px] text-slate-500 font-mono tracking-widest">aris-simulated-sandbox://demo</span>
              <button 
                onClick={triggerSimulation}
                disabled={simulating}
                className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold transition-colors disabled:opacity-40"
              >
                {simStep === 3 ? <RefreshCw className="w-3 h-3 animate-pulse" /> : <Play className="w-3 h-3" />}
                {simStep === 0 ? 'Run Demo' : simStep === 3 ? 'Restart Demo' : 'Running...'}
              </button>
            </div>

            {/* Mockup Body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left min-h-[350px]">
              {/* Left Column (Typing Simulation & Pipeline) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Real-Time Input Simulation</div>
                  <div className="glass p-5 min-h-[120px] bg-slate-900/30 border border-white/[0.04] rounded-2xl relative font-sans text-sm text-slate-300">
                    {simStep === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 rounded-2xl text-center p-4">
                        <button 
                          onClick={triggerSimulation}
                          className="btn-primary flex items-center gap-2 py-2 px-4 shadow-none"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Try Simulator Demo
                        </button>
                        <p className="text-[10px] text-slate-500 mt-2 font-mono">1.5 second interactive processing walkthrough</p>
                      </div>
                    )}
                    {simStep >= 1 && (
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {simText}
                        {simStep === 1 && <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-0.5" />}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pipeline loader (AI Thinking Moment) */}
                {simStep >= 2 && (
                  <div className="space-y-2">
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Pipeline Execution Stages</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PIPELINE_STAGES.map((stage, idx) => {
                        const isChecked = simPipelineIdx >= idx || simStep === 3;
                        const isActive = simPipelineIdx === idx && simStep === 2;
                        return (
                          <div 
                            key={idx} 
                            className={`p-2.5 rounded-xl border text-[10px] font-mono transition-all duration-300 flex items-center justify-between ${
                              isChecked 
                                ? 'bg-emerald-500/5 text-emerald-400/90 border-emerald-500/20' 
                                : isActive 
                                  ? 'bg-blue-500/5 text-blue-400 border-blue-500/25 animate-pulse' 
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
                  </div>
                )}
              </div>

              {/* Right Column (Results Reveal) */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {simStep < 3 ? (
                    <motion.div 
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="glass bg-white/[0.01] border-dashed border-white/5 rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[260px] space-y-3"
                    >
                      <Brain className={`w-8 h-8 ${simStep === 2 ? 'text-blue-400 animate-pulse' : 'text-slate-700'}`} />
                      <p className="text-xs text-slate-500 font-mono">
                        {simStep === 0 ? 'Awaiting demo execution...' : simStep === 1 ? 'Capturing review input...' : 'AI is processing diagnostics...'}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', damping: 20 }}
                      className="glass p-5 space-y-4 bg-gradient-to-br from-blue-500/[0.02] to-transparent border border-white/[0.08]"
                    >
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Inference Results</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                          High Helpfulness
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-black text-white font-mono tracking-tight">94.8%</span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/15">
                            🟢 High Confidence
                          </span>
                        </div>
                        <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '94.8%' }} />
                        </div>
                      </div>

                      {/* Dynamic transparency mock signals */}
                      <div className="pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-3 text-[10px] font-mono">
                        <div className="space-y-1">
                          <span className="text-slate-500 block">Positives:</span>
                          <span className="text-emerald-400/90 block">• Tactile keyboard</span>
                          <span className="text-emerald-400/90 block">• Detailed usage</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 block">Negatives:</span>
                          <span className="text-slate-400 block">• None flagged</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-2 border-t border-white/[0.04]">
                        <span>Inference: 14.5ms</span>
                        <span>Model: v1.0.0-hybrid-xgb</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS (DYNAMIC COUNTERS)
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: metrics.reviewsProcessed, label: 'Reviews Processed', isPercent: false, icon: Database, color: 'text-blue-400' },
            { value: metrics.accuracy, label: 'Winning Accuracy', isPercent: true, icon: Star, color: 'text-violet-400' },
            { value: metrics.f1, label: 'Hybrid F1-Score', isPercent: true, icon: Activity, color: 'text-cyan-400' },
            { value: metrics.rocAuc, label: 'ROC-AUC Metric', isPercent: true, icon: Layers, color: 'text-emerald-400' },
          ].map((m, i) => (
            <motion.div key={i} variants={fade} transition={{ duration: 0.5 }} className="glass p-6 text-center space-y-3 group hover:bg-white/[0.05] transition-all duration-500 border-white/10 shadow-2xl rounded-3xl">
              <m.icon className={`w-5 h-5 mx-auto group-hover:scale-115 transition-all duration-300 ${m.color}`} />
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                {metrics.loading ? '...' : <AnimatedCounter value={m.value} isPercent={m.isPercent} />}
              </div>
              <div className="metric-label">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          WHY THIS MATTERS
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="space-y-12">
        <motion.div variants={fade} className="text-center space-y-4">
          <span className="section-label">Business Value</span>
          <h2 className="section-title">Why Review Intelligence Matters</h2>
          <p className="section-desc mx-auto">Review helpfulness filters play a key role in e-commerce conversion, ranking optimization, and customer satisfaction.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={fade} className="glass p-8 space-y-4 border-white/10 rounded-3xl">
            <div className="text-xs uppercase font-mono tracking-widest text-blue-400 font-bold">1. Conversion Uplift</div>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Highlighting informative reviews directly increases purchase confidence. Automatically filtering out spam or generic reviews ("works good") reduces cognitive overload and drives user conversion.
            </p>
          </motion.div>

          <motion.div variants={fade} className="glass p-8 space-y-4 border-white/10 rounded-3xl">
            <div className="text-xs uppercase font-mono tracking-widest text-violet-400 font-bold">2. Seller Insights</div>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              By isolating high-helpfulness reviews, brands can perform focused feature audits to discover why customers love or return their products, improving manufacturing standards and inventory decisions.
            </p>
          </motion.div>

          <motion.div variants={fade} className="glass p-8 space-y-4 border-white/10 rounded-3xl">
            <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">3. ML Progression</div>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Traditional approaches rely on hardcoded thresholds. ARIS leverages embeddings combined with feature engineering to evaluate quality based on semantic depth, readability, and sentiment signals.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          INTERACTIVE ARCHITECTURE FLOW
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="space-y-12">
        <motion.div variants={fade} className="text-center space-y-4">
          <span className="section-label">Data Pipeline</span>
          <h2 className="section-title">Interactive Request Pipeline</h2>
          <p className="section-desc mx-auto">Trace how client reviews trigger server preprocessing, embedding extraction, and TreeSHAP calculations in real time.</p>
        </motion.div>

        <motion.div variants={fade} className="glass-strong p-8 sm:p-12 border-white/10 rounded-3xl relative overflow-hidden bg-gradient-to-br from-blue-500/[0.01] to-transparent">
          {/* Animated visual flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center text-center relative z-10">
            {/* Step 1 */}
            <div className="glass p-5 border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-mono font-bold mx-auto mb-3 border border-blue-500/20">01</div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-white">1. User Client</h3>
              <p className="text-[10px] text-gray-500 mt-2 font-light">Submits review text to client dashboards</p>
            </div>

            {/* Connector */}
            <div className="hidden md:block flex-1 text-center font-bold text-blue-500 text-lg animate-pulse">➔</div>

            {/* Step 2 */}
            <div className="glass p-5 border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-mono font-bold mx-auto mb-3 border border-violet-500/20">02</div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-white">2. FastAPI Router</h3>
              <p className="text-[10px] text-gray-500 mt-2 font-light">Validates payload schemas and logs to DB</p>
            </div>

            {/* Connector */}
            <div className="hidden md:block flex-1 text-center font-bold text-violet-500 text-lg animate-pulse">➔</div>

            {/* Step 3 */}
            <div className="glass p-5 border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-mono font-bold mx-auto mb-3 border border-cyan-500/20">03</div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-white">3. ML Predictor</h3>
              <p className="text-[10px] text-gray-500 mt-2 font-light">Extracts sentence embeddings & runs XGBoost</p>
            </div>
          </div>

          <div className="flex justify-center my-6"><div className="w-px h-8 bg-gradient-to-b from-cyan-500/30 to-violet-500/30" /></div>

          {/* Sub-pipeline block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-emerald-500/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <GitBranch className="w-4 h-4 text-emerald-400" /> Feature Engineering Path
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['word_count', 'char_count', 'avg_word_len', 'sentiment', 'readability', 'exclamation'].map(f => (
                  <div key={f} className="px-2 py-1.5 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/10 text-[9px] text-emerald-300/80 font-mono text-center">{f}</div>
                ))}
              </div>
              <div className="text-[10px] text-gray-500 text-center font-mono">6 tabular features extracted</div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.01] border border-violet-500/10 space-y-4">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-violet-400" /> Embeddings Extractor
              </div>
              <div className="flex gap-1">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 h-8 rounded bg-violet-500/[0.06] border border-violet-500/[0.08]" />
                ))}
              </div>
              <div className="text-[10px] text-gray-500 text-center font-mono">Sentence Transformer: all-MiniLM-L6-v2</div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          FEATURES GRID
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="space-y-12">
        <motion.div variants={fade} className="text-center space-y-4">
          <span className="section-label">Capabilities</span>
          <h2 className="section-title">Six Integrated Modules</h2>
          <p className="section-desc mx-auto">A unified evaluation and analysis platform designed for machine learning scientists and engineering reviewers.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={fade} transition={{ duration: 0.4 }} className="glass-hover p-6 space-y-4 group border-white/10 rounded-3xl">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[15px] font-bold text-white">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          MODEL LEADERBOARD
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="space-y-12">
        <motion.div variants={fade} className="text-center space-y-4">
          <span className="section-label">Performance</span>
          <h2 className="section-title">Model Benchmarks</h2>
          <p className="section-desc mx-auto">Progressive ML models evaluated on 30,000 real product reviews. The hybrid architecture scores the highest across all metrics.</p>
        </motion.div>

        <motion.div variants={fade} className="glass-strong overflow-hidden border-white/10 rounded-3xl">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.06] text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-white/[0.01]">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Model</div>
            <div className="col-span-2 text-right">Accuracy</div>
            <div className="col-span-2 text-right">F1-Score</div>
            <div className="col-span-2 text-right">ROC-AUC</div>
          </div>
          {/* Rows */}
          {leaderboard.map((m, i) => (
            <div key={i} className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.04] items-center transition-colors hover:bg-white/[0.02] ${m.best ? 'bg-blue-500/[0.03]' : ''}`}>
              <div className="col-span-1">
                <span className={`text-sm font-extrabold ${m.best ? 'text-blue-400' : 'text-gray-600'}`}>{m.rank}</span>
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <span className="text-sm font-semibold text-white">{m.name}</span>
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${m.best ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' : 'bg-white/[0.02] text-gray-500 border-white/[0.04]'}`}>
                  {m.badge}
                </span>
                {m.best && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-gray-300">
                {metrics.loading ? '...' : `${m.acc.toFixed(1)}%`}
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-gray-300">
                {metrics.loading ? '...' : `${m.f1.toFixed(1)}%`}
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-gray-300">
                {metrics.loading ? '...' : `${m.auc.toFixed(1)}%`}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          TECH STACK
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="space-y-10">
        <motion.div variants={fade} className="text-center space-y-4">
          <span className="section-label">Stack</span>
          <h2 className="section-title">Built With</h2>
        </motion.div>

        <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
          {TECH.map(t => (
            <span key={t} className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[13px] text-gray-400 font-medium hover:bg-white/[0.06] hover:text-white hover:border-white/[0.1] transition-all duration-300 cursor-default">
              {t}
            </span>
          ))}
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <motion.div variants={fade} className="glass-strong p-10 sm:p-16 text-center space-y-6 relative overflow-hidden border-white/10 rounded-3xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[220px] bg-blue-500/[0.08] rounded-full blur-[100px]" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white relative">Ready to Explore?</h2>
          <p className="text-gray-400 max-w-lg mx-auto relative font-light text-sm">Analyze reviews, explore model diagnostics, and understand every prediction with SHAP.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative">
            <Link href="/analyzer" className="btn-primary">
              Try the Analyzer <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="btn-ghost">
              <BookOpen className="w-4 h-4" /> Portfolio Guide
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
