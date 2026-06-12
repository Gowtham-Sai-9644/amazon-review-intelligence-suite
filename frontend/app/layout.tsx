import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '../components/Navigation';
import DeploymentStatus from '../components/DeploymentStatus';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ARIS — Amazon Review Intelligence Suite',
  description: 'AI-powered review quality prediction using MiniLM embeddings, XGBoost, and SHAP explainability.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-background min-h-screen flex flex-col font-sans antialiased">
        {/* ─── Layered Ambient Background ─── */}
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#030712] to-[#0F172A]" />
          {/* Animated glows */}
          <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-blue-500/[0.05] blur-[150px] animate-pulse-glow" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[30%] -right-[200px] w-[600px] h-[600px] rounded-full bg-violet-500/[0.04] blur-[120px] animate-pulse-glow" style={{ animationDuration: '12s' }} />
          <div className="absolute top-[60%] -left-[200px] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[100px] animate-pulse-glow" style={{ animationDuration: '10s' }} />
          
          {/* Floating drift particles */}
          <div className="particle-container">
            <div className="particle w-40 h-40 top-[10%] left-[20%]" style={{ animationDelay: '0s', animationDuration: '24s' }} />
            <div className="particle w-56 h-56 top-[50%] right-[10%]" style={{ animationDelay: '-6s', animationDuration: '32s' }} />
            <div className="particle w-32 h-32 top-[85%] left-[5%]" style={{ animationDelay: '-12s', animationDuration: '28s' }} />
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-grid-pattern" />
        </div>

        <Navigation />

        <main className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 relative z-10">
          {children}
        </main>

        <footer className="relative z-10 border-t border-white/[0.03] bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 flex flex-col items-center gap-6">
            <DeploymentStatus />
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-[8px] font-bold">A</div>
                <span className="text-xs text-gray-600">© 2026 ARIS · Portfolio Project</span>
              </div>
              <div className="flex gap-6 text-xs text-gray-600">
                <a href="/about" className="hover:text-gray-400 transition-colors">Docs</a>
                <a href="/evaluation" className="hover:text-gray-400 transition-colors">Metrics</a>
                <a href="/analyzer" className="hover:text-gray-400 transition-colors">Try It</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
