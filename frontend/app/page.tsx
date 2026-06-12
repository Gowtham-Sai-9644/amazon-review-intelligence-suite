'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Brain, Search, TrendingUp, ShieldAlert, Lightbulb,
  BarChart3, Cpu, GitBranch, Zap, Database, Layers, Star,
  BookOpen, Activity, ChevronRight, Sparkles
} from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const MODELS = [
  { rank: 1, name: 'MiniLM + XGBoost', badge: 'Hybrid', acc: 67.8, f1: 67.0, auc: 74.3, best: true },
  { rank: 2, name: 'Random Forest', badge: 'Ensemble', acc: 67.8, f1: 66.9, auc: 74.8, best: false },
  { rank: 3, name: 'Logistic Regression', badge: 'Baseline', acc: 68.3, f1: 66.9, auc: 74.1, best: false },
  { rank: 4, name: 'XGBoost (TF-IDF)', badge: 'Tabular', acc: 66.2, f1: 62.2, auc: 72.9, best: false },
];

const FEATURES = [
  { icon: Search, title: 'Helpfulness Prediction', desc: 'Binary classification with MiniLM embeddings fused into XGBoost.', color: 'from-indigo-500 to-blue-500' },
  { icon: TrendingUp, title: 'Sentiment Analysis', desc: 'Real-time polarity detection with calibrated confidence scoring.', color: 'from-emerald-500 to-teal-500' },
  { icon: Brain, title: 'Explainable AI', desc: 'TreeSHAP computes exact feature attributions in polynomial time.', color: 'from-violet-500 to-purple-500' },
  { icon: ShieldAlert, title: 'Error Diagnostics', desc: 'Confusion matrix analysis with systematic failure case studies.', color: 'from-rose-500 to-pink-500' },
  { icon: Lightbulb, title: 'Business Insights', desc: 'Keyword correlations and optimal review patterns from 30K reviews.', color: 'from-amber-500 to-orange-500' },
  { icon: BarChart3, title: 'Model Progression', desc: 'Baseline → ensemble → transformer hybrid comparison pipeline.', color: 'from-cyan-500 to-sky-500' },
];

const TECH = ['Python', 'FastAPI', 'Next.js 14', 'XGBoost', 'MiniLM-L6-v2', 'SHAP', 'scikit-learn', 'Tailwind CSS', 'TypeScript', 'SQLite', 'Recharts', 'Framer Motion'];

export default function LandingPage() {
  return (
    <div className="space-y-32 pb-20">

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative pt-16 sm:pt-24 text-center">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/[0.08] rounded-full blur-[150px] pointer-events-none" />

        <motion.div initial="hidden" animate="show" variants={stagger} className="relative space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div variants={fade} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/[0.08] border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Amazon ML Summer School 2026
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fade} transition={{ duration: 0.7 }} className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95]">
            <span className="text-white">Amazon Review</span>
            <br />
            <span className="text-gradient">Intelligence Suite</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fade} transition={{ duration: 0.6 }} className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            AI-powered review analysis using Transformer embeddings,
            explainable machine learning, and production-grade architecture.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fade} transition={{ duration: 0.5 }} className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/analyzer" className="btn-primary">
              Launch Analyzer
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/evaluation" className="btn-ghost">
              View Metrics
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ─── Floating Dashboard Preview ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-5xl mx-auto relative"
        >
          {/* Glow behind card */}
          <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/[0.06] via-violet-500/[0.04] to-cyan-500/[0.06] rounded-3xl blur-3xl" />

          <div className="relative glass-strong overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <span className="text-[10px] text-gray-600 font-mono ml-4">aris://inference-console</span>
            </div>

            {/* Console body */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Input simulation */}
                <div className="md:col-span-7 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                  <div className="text-[10px] text-gray-600 font-mono tracking-wider uppercase">Input Review</div>
                  <div className="space-y-2.5">
                    <div className="h-3 w-full rounded bg-white/[0.03]" />
                    <div className="h-3 w-[85%] rounded bg-white/[0.03]" />
                    <div className="h-3 w-[70%] rounded bg-white/[0.03]" />
                  </div>
                  <div className="flex gap-2 pt-3">
                    <span className="badge-indigo">Embedding</span>
                    <span className="badge-violet">SHAP</span>
                    <span className="badge-cyan">XGBoost</span>
                  </div>
                </div>

                {/* Output simulation */}
                <div className="md:col-span-5 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-5">
                  <div className="text-[10px] text-gray-600 font-mono tracking-wider uppercase">Prediction Output</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white font-mono tracking-tight">92.5</span>
                    <span className="text-sm text-gray-600 font-mono">% helpful</span>
                  </div>
                  <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '92.5%' }}
                      transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <span className="badge-emerald">High Quality</span>
                    <span className="badge-indigo">Positive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { v: '30,000+', l: 'Reviews Analyzed', icon: Database },
            { v: '67.0%', l: 'Hybrid F1-Score', icon: Activity },
            { v: '<50ms', l: 'Inference Latency', icon: Zap },
            { v: '390', l: 'Feature Dimensions', icon: Layers },
          ].map((m, i) => (
            <motion.div key={i} variants={fade} transition={{ duration: 0.5 }} className="glass p-6 text-center space-y-3 group hover:bg-white/[0.05] transition-all duration-500">
              <m.icon className="w-5 h-5 text-gray-600 mx-auto group-hover:text-indigo-400 transition-colors duration-300" />
              <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">{m.v}</div>
              <div className="metric-label">{m.l}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          FEATURES
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="space-y-12">
        <motion.div variants={fade} className="text-center space-y-4">
          <span className="section-label">Capabilities</span>
          <h2 className="section-title">Six Integrated Modules</h2>
          <p className="section-desc mx-auto">Every module works together as a unified intelligence platform — from prediction to explanation to business impact.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={fade} transition={{ duration: 0.4 }} className="glass-hover p-6 space-y-4 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[15px] font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          ML PIPELINE ARCHITECTURE
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="space-y-12">
        <motion.div variants={fade} className="text-center space-y-4">
          <span className="section-label">Architecture</span>
          <h2 className="section-title">Hybrid ML Pipeline</h2>
          <p className="section-desc mx-auto">Dual-path architecture fusing semantic embeddings with engineered structural features.</p>
        </motion.div>

        <motion.div variants={fade} className="glass-strong p-6 sm:p-10 space-y-8">
          {/* Input */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500/[0.08] border border-indigo-500/15 text-indigo-300 text-sm font-semibold">
              <Cpu className="w-4 h-4" /> Raw Review Text
            </span>
          </div>

          <div className="flex justify-center"><div className="w-px h-10 bg-gradient-to-b from-indigo-500/30 to-transparent" /></div>

          {/* Dual path */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <GitBranch className="w-4 h-4" /> Feature Engineering
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['word_count', 'char_count', 'avg_word_len', 'sentiment', 'readability', 'excl_density'].map(f => (
                  <div key={f} className="px-2 py-1.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10 text-[10px] text-emerald-300/80 font-mono text-center">{f}</div>
                ))}
              </div>
              <div className="text-[10px] text-gray-600 text-center font-mono">6 tabular features</div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-violet-500/10 space-y-4">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider">
                <Cpu className="w-4 h-4" /> MiniLM-L6-v2
              </div>
              <div className="flex gap-0.5">
                {Array(16).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 h-8 rounded bg-violet-500/[0.08] border border-violet-500/[0.06]" />
                ))}
              </div>
              <div className="text-[10px] text-gray-600 text-center font-mono">384-dim dense vector</div>
            </div>
          </div>

          {/* Fusion */}
          <div className="flex justify-center">
            <div className="flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <div className="w-16 h-px bg-gradient-to-r from-emerald-500/30 to-white/10" />
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Fusion → 390 features</span>
              <div className="w-16 h-px bg-gradient-to-l from-violet-500/30 to-white/10" />
            </div>
          </div>

          {/* Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/10 text-center space-y-1">
              <div className="text-indigo-300 font-semibold text-sm">XGBoost Classifier</div>
              <div className="text-[10px] text-gray-500">Gradient-boosted decision trees</div>
            </div>
            <div className="p-5 rounded-2xl bg-cyan-500/[0.04] border border-cyan-500/10 text-center space-y-1">
              <div className="text-cyan-300 font-semibold text-sm">TreeSHAP Engine</div>
              <div className="text-[10px] text-gray-500">Polynomial-time explanations</div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          MODEL LEADERBOARD
          ═══════════════════════════════════════════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="space-y-12">
        <motion.div variants={fade} className="text-center space-y-4">
          <span className="section-label">Performance</span>
          <h2 className="section-title">Model Leaderboard</h2>
          <p className="section-desc mx-auto">Four progressively complex models benchmarked on 30,000 real Amazon reviews.</p>
        </motion.div>

        <motion.div variants={fade} className="glass-strong overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/[0.04] text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Model</div>
            <div className="col-span-2 text-right">Accuracy</div>
            <div className="col-span-2 text-right">F1-Score</div>
            <div className="col-span-2 text-right">ROC-AUC</div>
          </div>
          {/* Rows */}
          {MODELS.map((m, i) => (
            <div key={i} className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.03] items-center transition-colors hover:bg-white/[0.02] ${m.best ? 'bg-indigo-500/[0.03]' : ''}`}>
              <div className="col-span-1">
                <span className={`text-sm font-bold ${m.best ? 'text-indigo-400' : 'text-gray-600'}`}>{m.rank}</span>
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <span className="text-sm font-medium text-white">{m.name}</span>
                <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${m.best ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'bg-white/[0.03] text-gray-500 border border-white/[0.04]'}`}>
                  {m.badge}
                </span>
                {m.best && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-gray-300">{m.acc}%</div>
              <div className="col-span-2 text-right font-mono text-sm text-gray-300">{m.f1}%</div>
              <div className="col-span-2 text-right font-mono text-sm text-gray-300">{m.auc}%</div>
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
        <motion.div variants={fade} className="glass-strong p-10 sm:p-16 text-center space-y-6 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-500/[0.08] rounded-full blur-[100px]" />

          <h2 className="text-3xl sm:text-4xl font-bold text-white relative">Ready to Explore?</h2>
          <p className="text-gray-400 max-w-lg mx-auto relative">Analyze reviews, explore model diagnostics, and understand every prediction with SHAP.</p>
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
