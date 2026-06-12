import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '../components/Navigation';

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
          {/* Top indigo glow */}
          <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-indigo-500/[0.07] blur-[150px]" />
          {/* Right violet glow */}
          <div className="absolute top-[30%] -right-[200px] w-[500px] h-[500px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
          {/* Left cyan glow */}
          <div className="absolute top-[60%] -left-[200px] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
          {/* Grid */}
          <div className="absolute inset-0 bg-grid-pattern" />
        </div>

        <Navigation />

        <main className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 relative z-10">
          {children}
        </main>

        <footer className="relative z-10 border-t border-white/[0.03]">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[8px] font-bold">A</div>
              <span className="text-xs text-gray-600">© 2026 ARIS · Portfolio Project</span>
            </div>
            <div className="flex gap-6 text-xs text-gray-600">
              <a href="/about" className="hover:text-gray-400 transition-colors">Docs</a>
              <a href="/evaluation" className="hover:text-gray-400 transition-colors">Metrics</a>
              <a href="/analyzer" className="hover:text-gray-400 transition-colors">Try It</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
