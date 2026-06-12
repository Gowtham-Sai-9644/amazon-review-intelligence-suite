'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

/* ═══════════════════════════════════════════════════════════
   PerformanceCharts — Premium Recharts Visualizations
   ═══════════════════════════════════════════════════════════ */

interface ModelMetric {
  model: string;
  accuracy: number;
  f1: number;
  precision: number;
  recall: number;
  roc_auc: number;
}

interface PerformanceChartsProps {
  metrics: ModelMetric[];
  sentimentDist?: Record<string, number>;
  qualityDist?: Record<string, number>;
}

/* ─── Color Palettes ─── */

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#22C55E',
  Neutral:  '#EAB308',
  Negative: '#EF4444',
};

const QUALITY_COLORS: Record<string, string> = {
  High:   '#8B5CF6',
  Medium: '#6366F1',
  Low:    '#475569',
};

/* ─── Custom Bar Tooltip ─── */

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-4 space-y-2 min-w-[200px]"
      style={{
        background: '#0F172A',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset',
      }}
    >
      <p className="text-xs font-semibold text-gray-300 border-b border-white/[0.06] pb-2 mb-1">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-400">{entry.name}</span>
          </div>
          <span className="text-xs font-mono font-bold text-white">
            {entry.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Custom Pie Tooltip ─── */

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: '#0F172A',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: item.payload.fill }}
        />
        <span className="text-xs text-gray-300 font-medium">{item.name}</span>
        <span className="text-xs font-mono font-bold text-white ml-2">
          {item.value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* ─── Donut Legend ─── */

function DonutLegend({
  data,
  colorMap,
}: {
  data: Array<{ name: string; value: number }>;
  colorMap: Record<string, string>;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col gap-3 mt-6 w-full">
      {data.map((entry, i) => (
        <div key={i} className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colorMap[entry.name] || '#94A3B8' }}
            />
            <span className="text-xs font-medium text-gray-400">{entry.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-gray-300">
              {entry.value.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              ({total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */

export default function PerformanceCharts({
  metrics,
  sentimentDist,
  qualityDist,
}: PerformanceChartsProps) {
  const [chartType, setChartType] = useState<'bar' | 'area'>('area');
  const sentimentData = sentimentDist
    ? Object.entries(sentimentDist).map(([name, value]) => ({ name, value }))
    : [];
  const qualityData = qualityDist
    ? Object.entries(qualityDist).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-8">
      {/* ═══ Model Comparison Chart ═══ */}
      <div className="glass p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-100 tracking-tight">
              Model Progression Comparison
            </h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Baseline Logistic Regression → XGBoost → Transformer Fusion benchmarks
            </p>
          </div>
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/[0.03] border border-white/[0.05] self-start sm:self-center">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                chartType === 'area'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Trend Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                chartType === 'bar'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bar View
            </button>
          </div>
        </div>

        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={metrics}
                margin={{ top: 16, right: 16, left: -8, bottom: 4 }}
                barCategoryGap="20%"
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="model"
                  stroke="#64748B"
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  dy={8}
                  interval={0}
                  tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => (
                    <text
                      x={x}
                      y={y + 12}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize={10}
                      fontWeight={500}
                    >
                      {payload.value.length > 14
                        ? payload.value.slice(0, 12) + '…'
                        : payload.value}
                    </text>
                  )}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '20px',
                    fontWeight: 500,
                  }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="accuracy"
                  name="Accuracy (%)"
                  fill="#6366F1"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="f1"
                  name="F1-Score (%)"
                  fill="#8B5CF6"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="roc_auc"
                  name="ROC-AUC (%)"
                  fill="#22D3EE"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={metrics}
                margin={{ top: 16, right: 16, left: -8, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="f1Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="rocAucGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="model"
                  stroke="#64748B"
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  dy={8}
                  interval={0}
                  tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => (
                    <text
                      x={x}
                      y={y + 12}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize={10}
                      fontWeight={500}
                    >
                      {payload.value.length > 14
                        ? payload.value.slice(0, 12) + '…'
                        : payload.value}
                    </text>
                  )}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '20px',
                    fontWeight: 500,
                  }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy (%)"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#accuracyGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="f1"
                  name="F1-Score (%)"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#f1Grad)"
                />
                <Area
                  type="monotone"
                  dataKey="roc_auc"
                  name="ROC-AUC (%)"
                  stroke="#22D3EE"
                  strokeWidth={2}
                  fill="url(#rocAucGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══ Distribution Donuts ═══ */}
      {(sentimentData.length > 0 || qualityData.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sentiment Distribution */}
          {sentimentData.length > 0 && (
            <div className="glass p-6 lg:p-8 flex flex-col">
              <div className="mb-3">
                <h4 className="text-base font-bold text-gray-100 tracking-tight">
                  Sentiment Distribution
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Polarity breakdown across analyzed reviews
                </p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell
                          key={`s-${index}`}
                          fill={SENTIMENT_COLORS[entry.name] || '#94A3B8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <DonutLegend data={sentimentData} colorMap={SENTIMENT_COLORS} />
            </div>
          )}

          {/* Quality Distribution */}
          {qualityData.length > 0 && (
            <div className="glass p-6 lg:p-8 flex flex-col">
              <div className="mb-3">
                <h4 className="text-base font-bold text-gray-100 tracking-tight">
                  Quality Classification
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Bucketed quality tiers from review analysis
                </p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {qualityData.map((entry, index) => (
                        <Cell
                          key={`q-${index}`}
                          fill={QUALITY_COLORS[entry.name] || '#94A3B8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <DonutLegend data={qualityData} colorMap={QUALITY_COLORS} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
