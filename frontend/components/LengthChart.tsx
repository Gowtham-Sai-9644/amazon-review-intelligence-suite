'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LengthChartProps {
  data: Array<{ range: string; avg_helpfulness: number }>;
}

/* ─── Custom Tooltip ─── */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-2xl px-4 py-3 border border-white/10 shadow-2xl bg-[#090d16]/95 backdrop-blur-xl">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-mono">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <p className="text-xs font-mono font-bold text-white">
          {payload[0].value.toFixed(1)}% helpfulness
        </p>
      </div>
    </div>
  );
}

export default function LengthChart({ data }: LengthChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: -12, bottom: 4 }}
        >
          <defs>
            <linearGradient id="lengthHelpfulnessGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.02)"
            vertical={false}
          />
          <XAxis
            dataKey="range"
            stroke="#475569"
            fontSize={10}
            fontWeight={600}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            dy={8}
            className="font-mono"
          />
          <YAxis
            stroke="#475569"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
            className="font-mono"
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="avg_helpfulness"
            name="Avg Helpfulness"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#lengthHelpfulnessGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

