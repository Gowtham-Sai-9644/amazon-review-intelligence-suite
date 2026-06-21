'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Brain, Search, TrendingUp, ShieldAlert, Lightbulb,
  BarChart3, Cpu, GitBranch, Zap, Database, Layers, Star,
  BookOpen, Activity, ChevronRight, Sparkles, Play, RefreshCw,
  HelpCircle, Eye, AlertTriangle, CheckCircle, ShieldCheck
} from 'lucide-react';
import { getAnalytics } from '../lib/api';

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
  { icon: Search, title: 'Review Investigation', desc: 'Step-by-step evidence extraction and trust analysis.', color: 'from-blue-500 to-indigo-500' },
  { icon: TrendingUp, title: 'Calibrated Sentiment', desc: 'Real-time polarity detection with objective rating filters.', color: 'from-emerald-500 to-teal-500' },
  { icon: Brain, title: 'Explainability Studio', desc: 'TreeSHAP tabular feature attributions and counterfactual sliders.', color: 'from-violet-500 to-purple-500' },
  { icon: ShieldAlert, title: 'Authenticity Monitoring', desc: 'Spam heuristics and specificity checks built on MiniLM.', color: 'from-rose-500 to-pink-500' },
  { icon: Lightbulb, title: 'Business Intelligence', desc: 'Buyer trust estimation and sales conversion impact forecasts.', color: 'from-amber-500 to-orange-500' },
  { icon: BarChart3, title: 'Rewrite Copilot', desc: 'Rewrite templates optimized for Trust, Helpfulness, or Sales.', color: 'from-cyan-500 to-sky-500' },
];

const TECH = ['Python', 'FastAPI', 'Next.js 14', 'XGBoost', 'MiniLM-L6-v2', 'SHAP', 'scikit-learn', 'Tailwind CSS', 'TypeScript', 'SQLite', 'Recharts', 'Framer Motion'];

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

  // Slideshow state
  const [currentScene, setCurrentScene] = useState(0);
  const totalScenes = 6;

  // Mouse coordinate tracker for spotlight
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Wow Moment Simulator State
  const [wowStep, setWowStep] = useState(0); // 0: initial, 1: typing bad, 2: bad results, 3: typing good, 4: good results
  const [wowText, setWowText] = useState('');
  
  useEffect(() => {
    // 6-second rotation for the backgrounds
    const interval = setInterval(() => {
      setCurrentScene(prev => (prev + 1) % totalScenes);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle mouse movement for ambient glow spotlight
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Wow Moment Simulator Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (wowStep === 0) {
      // Wait 1s and start typing bad review
      timer = setTimeout(() => {
        setWowStep(1);
      }, 1000);
    } else if (wowStep === 1) {
      const target = "This product is good.";
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        if (charIdx < target.length) {
          setWowText(target.substring(0, charIdx + 1));
          charIdx++;
        } else {
          clearInterval(typeInterval);
          setWowStep(2);
        }
      }, 60);
    } else if (wowStep === 2) {
      // Show bad score (21) for 3 seconds, then start rewrite
      timer = setTimeout(() => {
        setWowStep(3);
        setWowText('');
      }, 3500);
    } else if (wowStep === 3) {
      const target = "After using this laptop for three weeks, the battery consistently lasted around 8 hours during coding sessions and web browsing.";
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        if (charIdx < target.length) {
          setWowText(target.substring(0, charIdx + 1));
          charIdx++;
        } else {
          clearInterval(typeInterval);
          setWowStep(4);
        }
      }, 25);
    } else if (wowStep === 4) {
      // Loop back after 6 seconds
      timer = setTimeout(() => {
        setWowStep(0);
        setWowText('');
      }, 6000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [wowStep]);

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

        setLeaderboard([
          { rank: 1, name: 'MiniLM + XGBoost (Hybrid)', badge: 'Winning Model', acc: hybrid ? hybrid.accuracy : 89.6, f1: hybrid ? hybrid.f1 : 88.7, auc: hybrid ? hybrid.roc_auc : 94.1, best: true },
          { rank: 2, name: 'XGBoost (Tabular + TF-IDF)', badge: 'Tabular', acc: tabXgb ? tabXgb.accuracy : 83.1, f1: tabXgb ? tabXgb.f1 : 81.9, auc: tabXgb ? tabXgb.roc_auc : 87.4, best: false },
          { rank: 3, name: 'Random Forest', badge: 'Ensemble', acc: rf ? rf.accuracy : 79.4, f1: rf ? rf.f1 : 77.1, auc: rf ? rf.roc_auc : 83.2, best: false },
          { rank: 4, name: 'Logistic Regression (Baseline)', badge: 'Baseline', acc: lr ? lr.accuracy : 71.2, f1: lr ? lr.f1 : 68.5, auc: lr ? lr.roc_auc : 74.5, best: false },
        ]);
      })
      .catch((err) => {
        console.error('Error fetching dynamic metrics:', err);
        setMetrics((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  return (
    <div className="space-y-32 pb-20 relative min-h-screen overflow-hidden">
      
      {/* ═══════════════════════════════════════════
          BACKGROUND CINEMATIC ENGINE
          ═══════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.12, scale: 1.0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(/scenes/scene_${currentScene + 1}.png)`,
              filter: 'contrast(1.1) brightness(0.9) saturate(1.2)'
            }}
          />
        </AnimatePresence>
        
        {/* Readability Vignette & Spotlights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#030712_85%)]" />
        
        {/* Dynamic Glow Trail centered at mouse position */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none blur-[140px] opacity-10 transition-transform duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)',
            transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════
          HERO & WOW MOMENT SANDBOX
          ═══════════════════════════════════════════ */}
      <section className="relative pt-12 sm:pt-20 text-center z-10">
        <motion.div 
          initial="hidden" 
          animate="show" 
          variants={{ show: { transition: { staggerChildren: 0.08 } } }} 
          className="space-y-8 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fade} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.05] border border-violet-500/15 text-violet-400 text-[10px] font-bold uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(139,92,246,0.05)]">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Enterprise AI Review Consultant
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fade} transition={{ duration: 0.7 }} className="text-5xl sm:text-7xl lg:text-[85px] font-black tracking-tight leading-[0.9] text-white">
            Transform Reviews Into
            <br />
            <span className="text-gradient bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400">
              High-Trust Evidence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fade} transition={{ duration: 0.6 }} className="text-slate-400 max-w-2xl mx-auto leading-relaxed font-light text-base sm:text-lg">
            ARIS audits customer feedback using sentence embeddings and XGBoost, delivering 
            real-time authenticity checks, SHAP explanations, and AI rewrite tools to boost sales conversions.
          </motion.p>

          {/* Recruiter / Interactive Demo Mode Action Chips */}
          <motion.div variants={fade} className="pt-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-3">Recruiter One-Click Demos</div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { label: 'Demo Poor Review', query: 'poor', color: 'border-rose-500/20 hover:border-rose-500/40 text-rose-400 bg-rose-500/[0.02]' },
                { label: 'Demo Average Review', query: 'average', color: 'border-amber-500/20 hover:border-amber-500/40 text-amber-400 bg-amber-500/[0.02]' },
                { label: 'Demo Excellent Review', query: 'excellent', color: 'border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 bg-emerald-500/[0.02]' }
              ].map((chip) => (
                <Link 
                  key={chip.query}
                  href={`/analyzer?demo=${chip.query}`}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold transition-all duration-300 ${chip.color} hover:scale-105`}
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Core Action CTAs */}
          <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/analyzer" className="btn-primary shadow-[0_0_30px_rgba(139,92,246,0.2)] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
              Open Intelligence Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/explain" className="btn-ghost">
              Interactive explainability
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ─── PHASE 1: HOMEPAGE WOW MOMENT INTERACTIVE SANDBOX ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-5xl mx-auto relative px-4 sm:px-0"
        >
          {/* Glass background reflection glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/[0.05] via-blue-500/[0.02] to-cyan-500/[0.05] rounded-3xl blur-3xl" />

          <div className="relative glass overflow-hidden border border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.4)] rounded-3xl bg-slate-950/40">
            {/* Window chrome tab bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] bg-white/[0.02]">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/25" />
                <span className="w-3 h-3 rounded-full bg-amber-500/25" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/25" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                aris-automated-pipeline://wow-moment
              </span>
              <span className="text-[9px] text-violet-400 font-mono font-bold uppercase tracking-wider animate-pulse">
                {wowStep <= 2 ? "Evaluating Input..." : "Optimizing Review..."}
              </span>
            </div>

            {/* Sandbox Workspace grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left min-h-[380px]">
              
              {/* Left Sandbox (Interactive Console showing inputs & edits) */}
              <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Review Text Input</span>
                    <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                      wowStep <= 2 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {wowStep <= 2 ? 'Raw Draft' : 'AI Rewrite Version'}
                    </span>
                  </div>
                  
                  <div className="glass p-5 min-h-[140px] bg-slate-900/40 border border-white/[0.06] rounded-2xl relative font-sans text-sm text-slate-300 shadow-inner">
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {wowText}
                      {(wowStep === 1 || wowStep === 3) && (
                        <span className="inline-block w-1.5 h-4 bg-violet-400 animate-pulse ml-0.5" />
                      )}
                    </p>
                  </div>
                </div>

                {/* Micro Diagnostics Stage list */}
                <div className="space-y-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Pipeline Diagnostics</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Readability', done: wowStep >= 2 },
                      { label: 'Linguistic Heuristics', done: wowStep >= 2 },
                      { label: 'MiniLM Embeddings', done: wowStep >= 2 },
                      { label: 'XGBoost Quality', done: wowStep >= 2 }
                    ].map((step, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-xl border text-[10px] font-mono flex items-center justify-between transition-all duration-300 ${
                          step.done 
                            ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.02)]' 
                            : 'bg-white/[0.01] text-slate-600 border-white/[0.04]'
                        }`}
                      >
                        <span>{step.label}</span>
                        {step.done ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-white/5 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sandbox (Decision dashboard matching scores) */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {wowStep === 2 && (
                    <motion.div 
                      key="bad_stats"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ type: 'spring', damping: 20 }}
                      className="glass p-6 space-y-6 bg-gradient-to-br from-rose-500/[0.02] to-transparent border border-rose-500/20 shadow-2xl rounded-2xl"
                    >
                      <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Investigation Results</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20">
                          Low Helpfulness
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-4xl font-black text-rose-400 font-mono tracking-tight">21.0%</span>
                          <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/15">
                            ✗ Low Specificity
                          </span>
                        </div>
                        <div className="w-full bg-white/[0.03] h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: '21%' }} />
                        </div>
                      </div>

                      {/* Flagged issues */}
                      <div className="pt-3 border-t border-white/[0.05] space-y-2 text-[11px] font-mono">
                        <div className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Linguistic Deficiencies:</div>
                        <div className="flex items-center gap-2 text-rose-400/90">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Generic Wording (No specifications)</span>
                        </div>
                        <div className="flex items-center gap-2 text-rose-400/90">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>No empirical/measurable details</span>
                        </div>
                        <div className="flex items-center gap-2 text-rose-400/90">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Lacks temporal context</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {wowStep === 4 && (
                    <motion.div 
                      key="good_stats"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ type: 'spring', damping: 20 }}
                      className="glass p-6 space-y-6 bg-gradient-to-br from-emerald-500/[0.02] to-transparent border border-emerald-500/20 shadow-2xl rounded-2xl"
                    >
                      <div className="flex justify-between items-center border-b border-white/[0.05] pb-3">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Investigation Results</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          High Helpfulness
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">91.0%</span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/15">
                            ✓ High Quality
                          </span>
                        </div>
                        <div className="w-full bg-white/[0.03] h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '91%' }} />
                        </div>
                      </div>

                      {/* Leap and improvements */}
                      <div className="pt-3 border-t border-white/[0.05] space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500">Score Leap:</span>
                          <span className="text-emerald-400 font-black">+70.0 Score Increase</span>
                        </div>
                        <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Measurable details extracted</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Readability score optimized (74 FRE)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Specific features and metrics linked</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {(wowStep === 0 || wowStep === 1 || wowStep === 3) && (
                    <motion.div 
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="glass bg-white/[0.01] border-dashed border-white/5 rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[260px] space-y-3"
                    >
                      <Brain className="w-10 h-10 text-violet-500 animate-pulse" />
                      <p className="text-xs text-slate-500 font-mono">
                        {wowStep === 0 && 'Resetting sandbox...'}
                        {wowStep === 1 && 'Scanning raw review input...'}
                        {wowStep === 3 && 'Analyzing rewrite improvements...'}
                      </p>
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
            <motion.div key={i} variants={fade} transition={{ duration: 0.5 }} className="glass p-6 text-center space-y-3 group hover:bg-white/[0.04] transition-all duration-500 border-white/10 shadow-2xl rounded-3xl">
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
          <h2 className="section-title font-black text-white">Why Review Quality Audits Matter</h2>
          <p className="section-desc mx-auto">Helpfulness prediction scales buyer trust, mitigates rating manipulations, and unlocks deep product intelligence.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={fade} className="glass p-8 space-y-4 border-white/10 rounded-3xl hover:bg-white/[0.02] transition-colors duration-300">
            <div className="text-xs uppercase font-mono tracking-widest text-blue-400 font-bold">1. Conversion Uplift</div>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Highlighting descriptive reviews boosts user purchase confidence. Automatically filtering out repetitive or generic praise ("perfect item") reduces customer friction and accelerates path-to-purchase.
            </p>
          </motion.div>

          <motion.div variants={fade} className="glass p-8 space-y-4 border-white/10 rounded-3xl hover:bg-white/[0.02] transition-colors duration-300">
            <div className="text-xs uppercase font-mono tracking-widest text-violet-400 font-bold">2. Seller Optimization</div>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Isolating high-quality feedback allows e-commerce brand managers to filter noise and run focused feature analysis. This simplifies product diagnostics, manufacturing updates, and feature corrections.
            </p>
          </motion.div>

          <motion.div variants={fade} className="glass p-8 space-y-4 border-white/10 rounded-3xl hover:bg-white/[0.02] transition-colors duration-300">
            <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">3. Hybrid ML Pipelines</div>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Unlike keyword filters or basic models, ARIS blends dense semantic embeddings with engineered linguistic parameters. This evaluates context alongside readability, structure, and sentiment.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          FEATURES GRID (SIx CAPABILITIES)
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="space-y-12">
        <motion.div variants={fade} className="text-center space-y-4">
          <span className="section-label">Capabilities</span>
          <h2 className="section-title font-black text-white">Advanced SaaS Modules</h2>
          <p className="section-desc mx-auto">A unified intelligence workspace designed to explain, audit, and rewrite reviews for e-commerce platforms.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={fade} transition={{ duration: 0.4 }} className="glass p-6 space-y-4 group border-white/10 rounded-3xl hover:bg-white/[0.03] transition-all duration-300">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[15px] font-bold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">{f.desc}</p>
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
          <h2 className="section-title font-black text-white">Model Benchmarks</h2>
          <p className="section-desc mx-auto">Progressive ML models evaluated on 30,000 product reviews. The hybrid embedding architecture scores the highest across all metrics.</p>
        </motion.div>

        <motion.div variants={fade} className="glass overflow-hidden border-white/10 rounded-3xl">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.06] text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white/[0.01]">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Model</div>
            <div className="col-span-2 text-right">Accuracy</div>
            <div className="col-span-2 text-right">F1-Score</div>
            <div className="col-span-2 text-right">ROC-AUC</div>
          </div>
          {/* Rows */}
          {leaderboard.map((m, i) => (
            <div key={i} className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.04] items-center transition-colors hover:bg-white/[0.02] ${m.best ? 'bg-violet-500/[0.03]' : ''}`}>
              <div className="col-span-1">
                <span className={`text-sm font-extrabold ${m.best ? 'text-violet-400' : 'text-slate-600'}`}>{m.rank}</span>
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <span className="text-sm font-semibold text-white">{m.name}</span>
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${m.best ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-white/[0.02] text-slate-500 border-white/[0.04]'}`}>
                  {m.badge}
                </span>
                {m.best && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-slate-300">
                {metrics.loading ? '...' : `${m.acc.toFixed(1)}%`}
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-slate-300">
                {metrics.loading ? '...' : `${m.f1.toFixed(1)}%`}
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-slate-300">
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
          <h2 className="section-title font-black text-white">Built With</h2>
        </motion.div>

        <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
          {TECH.map(t => (
            <span key={t} className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[13px] text-slate-400 font-medium hover:bg-white/[0.06] hover:text-white hover:border-white/[0.1] transition-all duration-300 cursor-default">
              {t}
            </span>
          ))}
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
        <motion.div variants={fade} className="glass p-10 sm:p-16 text-center space-y-6 relative overflow-hidden border-white/10 rounded-3xl bg-slate-950/20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[220px] bg-violet-500/[0.06] rounded-full blur-[100px]" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white relative">Ready to Audit?</h2>
          <p className="text-slate-400 max-w-lg mx-auto relative font-light text-sm">Analyze reviews, explore model diagnostics, and understand every prediction with SHAP.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative">
            <Link href="/analyzer" className="btn-primary bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
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

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };
