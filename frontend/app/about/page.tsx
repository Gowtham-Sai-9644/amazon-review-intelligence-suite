import React from 'react';
import {
  Sparkles, Brain, Code2, Layers, Database, Cpu, Monitor,
  BookOpen, Lightbulb,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   About — Portfolio Reference Guide (Server Component)
   No 'use client', no framer-motion, no useState/useEffect
   ═══════════════════════════════════════════════════════════ */

/* ─── CSS Animations (defined in globals.css) ─── */

const fadeInClass = 'animate-[fade-in_0.6s_ease-out_both]';
const fadeInDelay1 = 'animate-[fade-in_0.6s_ease-out_0.1s_both]';
const fadeInDelay2 = 'animate-[fade-in_0.6s_ease-out_0.2s_both]';
const fadeInDelay3 = 'animate-[fade-in_0.6s_ease-out_0.3s_both]';
const fadeInDelay4 = 'animate-[fade-in_0.6s_ease-out_0.4s_both]';
const fadeInDelay5 = 'animate-[fade-in_0.6s_ease-out_0.5s_both]';

export default function AboutPage() {
  const resumeBullets = [
    {
      category: 'NLP Engineering',
      icon: Brain,
      color: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      bullets: [
        'Built hybrid MiniLM+XGBoost pipeline processing 30K reviews with 390-dim feature vectors',
        'Engineered text preprocessing with tokenization, stopword removal, and sentiment analysis',
        'Achieved 85%+ accuracy on helpfulness prediction via combined embedding + tabular features',
      ],
    },
    {
      category: 'Explainable AI',
      icon: Lightbulb,
      color: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      bullets: [
        'Implemented TreeSHAP for polynomial-time feature attribution across tabular and embedding features',
        'Designed word-level importance visualization for interpretable NLP explanations',
        'Built real-time explanation pipeline with sub-200ms response for individual predictions',
      ],
    },
    {
      category: 'Full Stack ML',
      icon: Code2,
      color: 'text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20',
      bullets: [
        'Deployed FastAPI backend with Next.js 14 frontend, real-time inference, and interactive dashboards',
        'Built 6 specialized analytics views with Recharts, Framer Motion, and glassmorphic design system',
        'Designed REST API architecture with structured error analysis, business insights, and model evaluation endpoints',
      ],
    },
  ];

  const sopHooks = [
    {
      title: 'For Data Science Roles',
      icon: BookOpen,
      narrative:
        'This project demonstrates end-to-end ML pipeline development — from raw data processing through feature engineering to production deployment. The hybrid architecture (transformer embeddings + gradient-boosted trees) shows my ability to combine deep learning representations with classical ML for optimal performance on structured prediction tasks.',
    },
    {
      title: 'For Full Stack / ML Engineer Roles',
      icon: Monitor,
      narrative:
        'ARIS showcases my ability to bridge the gap between research and production. The system features a FastAPI inference server, a Next.js 14 dashboard with real-time visualizations, and comprehensive model evaluation tooling — all designed with production-grade error handling, type safety, and a premium user experience.',
    },
  ];

  const architectureLayers = [
    {
      title: 'Data Layer',
      icon: Database,
      color: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      items: [
        '30K Amazon reviews',
        'Text preprocessing',
        'Feature engineering',
        'Sentiment analysis',
        'Readability metrics',
      ],
    },
    {
      title: 'Model Layer',
      icon: Cpu,
      color: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      items: [
        'MiniLM embeddings (384-d)',
        'XGBoost classifier',
        'SHAP explainability',
        '6-dim tabular features',
        'Hybrid fusion pipeline',
      ],
    },
    {
      title: 'Application Layer',
      icon: Layers,
      color: 'text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20',
      items: [
        'FastAPI backend',
        'Next.js 14 frontend',
        'Real-time inference',
        'Interactive dashboards',
        'Error diagnostics',
      ],
    },
  ];

  return (
    <div className="space-y-12">
      {/* ═══ Header ═══ */}
      <div className={fadeInClass}>
        <p className="section-label mb-3">Documentation</p>
        <h1 className="section-title">Portfolio Reference Guide</h1>
        <p className="section-desc mt-2">
          Technical deep-dive into ARIS architecture, implementation decisions,
          and SOP-ready narratives for interviews and applications.
        </p>
      </div>

      {/* ═══ Why ARIS Stands Out ═══ */}
      <div className={fadeInDelay1}>
        <div
          className="glass-strong p-8 bg-gradient-to-br from-indigo-500/[0.1] via-violet-500/[0.05] to-transparent"
          style={{
            boxShadow: '0 0 80px rgba(99,102,241,0.08), 0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Why ARIS Stands Out</h2>
              <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
                <p>
                  <strong className="text-gray-200">Hybrid Architecture:</strong>{' '}
                  Combines transformer embeddings (MiniLM) with gradient-boosted trees (XGBoost)
                  to leverage both deep semantic understanding and structured feature engineering.
                </p>
                <p>
                  <strong className="text-gray-200">Explainability-First:</strong>{' '}
                  TreeSHAP provides polynomial-time feature attribution, making every prediction
                  interpretable — a critical requirement for production ML systems.
                </p>
                <p>
                  <strong className="text-gray-200">Production-Grade:</strong>{' '}
                  Full-stack deployment with real-time inference, comprehensive error analysis,
                  and an ultra-premium dashboard built to portfolio standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Resume Bullets ═══ */}
      <div className={fadeInDelay2}>
        <p className="section-label mb-2">Resume Highlights</p>
        <h2 className="text-xl font-bold text-white mb-6">Key Technical Achievements</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {resumeBullets.map((section) => (
            <div key={section.category} className="glass p-6">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-8 h-8 rounded-lg ${section.iconBg} border flex items-center justify-center`}
                >
                  <section.icon className={`w-4 h-4 ${section.color}`} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  {section.category}
                </span>
              </div>
              <ul className="space-y-3">
                {section.bullets.map((bullet, j) => (
                  <li
                    key={j}
                    className="text-sm text-gray-400 leading-relaxed pl-3 border-l-2 border-white/[0.06] font-mono"
                    style={{ fontSize: '12px', lineHeight: '1.7' }}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ SOP Hooks ═══ */}
      <div className={fadeInDelay3}>
        <p className="section-label mb-2">Interview Narratives</p>
        <h2 className="text-xl font-bold text-white mb-6">SOP Hooks</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sopHooks.map((hook) => (
            <div key={hook.title} className="glass p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <hook.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-gray-100">{hook.title}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{hook.narrative}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Architecture Diagram ═══ */}
      <div className={fadeInDelay4}>
        <p className="section-label mb-2">System Design</p>
        <h2 className="text-xl font-bold text-white mb-6">Architecture Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {architectureLayers.map((layer, layerIdx) => (
            <div key={layer.title} className="glass p-6 relative">
              {/* Connection Arrow (between columns) */}
              {layerIdx < 2 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="text-gray-600 text-lg">→</div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-8 h-8 rounded-lg ${layer.iconBg} border flex items-center justify-center`}
                >
                  <layer.icon className={`w-4 h-4 ${layer.color}`} />
                </div>
                <h3 className="text-sm font-bold text-gray-100">{layer.title}</h3>
              </div>

              <ul className="space-y-2.5">
                {layer.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/[0.15] shrink-0" />
                    <span className="text-sm text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Tech Stack Summary ═══ */}
      <div className={fadeInDelay5}>
        <div className="glass p-6 lg:p-8">
          <p className="section-label mb-3">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Python', 'FastAPI', 'XGBoost', 'SHAP', 'MiniLM',
              'scikit-learn', 'Next.js 14', 'React 18', 'TypeScript',
              'Tailwind CSS', 'Recharts', 'Framer Motion', 'Lucide',
            ].map((tech) => (
              <span key={tech} className="badge-indigo">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
