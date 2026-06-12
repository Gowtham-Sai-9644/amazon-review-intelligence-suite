'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, BarChart2, Brain, AlertTriangle, HelpCircle, ShieldAlert, Sparkles, Home, Play, ArrowRight } from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  description: string;
  category: 'Pages' | 'Quick Actions';
  href?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setActiveIndex(0);
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const items: PaletteItem[] = [
    {
      id: 'home',
      title: 'Go to Home',
      description: 'ARIS landing page & interactive simulator',
      category: 'Pages',
      href: '/',
      icon: Home,
    },
    {
      id: 'analyzer',
      title: 'Review Quality Analyzer',
      description: 'ChatGPT-style conversational input & review scoring',
      category: 'Pages',
      href: '/analyzer',
      icon: Brain,
    },
    {
      id: 'explain',
      title: 'SHAP Explainable AI (XAI)',
      description: 'Waterfall feature attribution & token-level explanations',
      category: 'Pages',
      href: '/explain',
      icon: Sparkles,
    },
    {
      id: 'analytics',
      title: 'Model Telemetry Analytics',
      description: 'Executive accuracy aggregates & data distributions',
      category: 'Pages',
      href: '/analytics',
      icon: BarChart2,
    },
    {
      id: 'insights',
      title: 'PM Quality Insights',
      description: 'Linguistic densities, key parameters & suggestions',
      category: 'Pages',
      href: '/insights',
      icon: FileText,
    },
    {
      id: 'errors',
      title: 'Error & Weakness Analysis',
      description: 'Confusion matrix & model failure case inspection',
      category: 'Pages',
      href: '/errors',
      icon: ShieldAlert,
    },
    {
      id: 'evaluation',
      title: 'Validation Metrics',
      description: 'Comprehensive cross-validation splits and scores',
      category: 'Pages',
      href: '/evaluation',
      icon: AlertTriangle,
    },
    {
      id: 'about',
      title: 'About & System Architecture',
      description: 'Underlying tech stack, models & documentation',
      category: 'Pages',
      href: '/about',
      icon: HelpCircle,
    },
    {
      id: 'try-laptop',
      title: 'Try Example: High-Quality Laptop Review',
      description: 'Run analysis using a pristine laptop performance review',
      category: 'Quick Actions',
      action: () => {
        router.push('/analyzer?preset=laptop');
        setOpen(false);
      },
      icon: Play,
    },
    {
      id: 'try-headphones',
      title: 'Try Example: Poor Headphones Review',
      description: 'Run analysis using an overly critical/empty review text',
      category: 'Quick Actions',
      action: () => {
        router.push('/analyzer?preset=headphones');
        setOpen(false);
      },
      icon: Play,
    },
    {
      id: 'try-phone',
      title: 'Try Example: Average Smartphone Review',
      description: 'Run analysis using a balanced average-length critique',
      category: 'Quick Actions',
      action: () => {
        router.push('/analyzer?preset=smartphone');
        setOpen(false);
      },
      icon: Play,
    },
  ];

  // Filter items based on search
  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        selectItem(filtered[activeIndex]);
      }
    }
  };

  const selectItem = (item: PaletteItem) => {
    if (item.href) {
      router.push(item.href);
      setOpen(false);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <>
      {/* Search Keyboard Indicator floating helper for the page (global) */}
      <div 
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-white/5 bg-[#090d16]/80 backdrop-blur-md hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <Search className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[10px] font-semibold text-gray-400 tracking-tight">Search Console</span>
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.08] border border-white/10 text-[9px] font-mono text-gray-300">
          ⌘K
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020617]/70 backdrop-blur-md"
            />

            {/* Palette Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              ref={paletteRef}
              className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d1527]/90 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Input Bar */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages or quick actions..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 outline-none focus:ring-0 text-[14px] text-white placeholder-gray-500 font-light"
                />
                <button 
                  onClick={() => setOpen(false)}
                  className="px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-[10px] text-gray-400 hover:text-white"
                >
                  ESC
                </button>
              </div>

              {/* Scrollable List */}
              <div className="max-h-[350px] overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center">
                    <Search className="w-8 h-8 text-gray-600 mx-auto mb-2.5" />
                    <p className="text-xs text-gray-400">No results found for "{search}"</p>
                  </div>
                ) : (
                  <div>
                    {/* Render Category headers */}
                    {['Pages', 'Quick Actions'].map((category) => {
                      const categoryItems = filtered.filter((i) => i.category === category);
                      if (categoryItems.length === 0) return null;

                      return (
                        <div key={category}>
                          <div className="px-5 py-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                            {category}
                          </div>
                          <div className="space-y-0.5 px-2">
                            {categoryItems.map((item) => {
                              // Find index in main filtered array
                              const itemIndex = filtered.findIndex((i) => i.id === item.id);
                              const active = itemIndex === activeIndex;

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => selectItem(item)}
                                  onMouseEnter={() => setActiveIndex(itemIndex)}
                                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                                    active
                                      ? 'bg-blue-500/[0.08] border border-blue-500/10 text-white'
                                      : 'bg-transparent border border-transparent text-gray-300 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                      active ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.03] text-gray-400'
                                    }`}>
                                      <item.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-[13px] font-semibold tracking-tight">{item.title}</p>
                                      <p className="text-[11px] text-gray-500 font-light mt-0.5">{item.description}</p>
                                    </div>
                                  </div>
                                  {active && (
                                    <ArrowRight className="w-4 h-4 text-blue-400" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Panel */}
              <div className="px-5 py-3 border-t border-white/[0.04] bg-[#090d16]/60 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="px-1 rounded bg-white/[0.06]">↑↓</span> Navigate</span>
                  <span className="flex items-center gap-1"><span className="px-1 rounded bg-white/[0.06]">Enter</span> Select</span>
                </div>
                <span>ARIS Navigation Hub</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
