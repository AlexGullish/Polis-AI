'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SimulationResult } from '@/lib/types';

interface Props {
  result: SimulationResult;
}

const SERIES = [
  { key: 'sustainability', label: 'Sustainability', color: '#3fb950' },
  { key: 'governance', label: 'Governance', color: '#a371f7' },
  { key: 'fiscalStability', label: 'Fiscal Stability', color: '#e3b341' },
  { key: 'publicApproval', label: 'Public Approval', color: '#388bfd' },
];

const METRIC_SERIES = [
  { key: 'co2PerCapita', label: 'CO₂/capita (t)', color: '#f85149' },
  { key: 'renewableEnergy', label: 'Renewable %', color: '#3fb950' },
  { key: 'publicTransit', label: 'Transit %', color: '#388bfd' },
  { key: 'publicTrust', label: 'Public Trust', color: '#a371f7' },
  { key: 'debtRatio', label: 'Debt Ratio %', color: '#e3b341' },
];

type Tab = 'scores' | 'metrics';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs space-y-1"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
        {label === 0 ? 'Baseline' : `Year ${label}`}
      </div>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SimulationGraph({ result }: Props) {
  const [tab, setTab] = useState<Tab>('scores');
  const [activeSeries, setActiveSeries] = useState<Set<string>>(
    new Set(SERIES.map(s => s.key))
  );

  const allYears = [result.baseline, ...result.projections];

  const scoreData = allYears.map(y => ({
    year: y.year,
    sustainability: y.scores.sustainability,
    governance: y.scores.governance,
    fiscalStability: y.scores.fiscalStability,
    publicApproval: y.scores.publicApproval,
  }));

  const metricData = allYears.map(y => ({
    year: y.year,
    co2PerCapita: Number(y.metrics.co2PerCapita.toFixed(2)),
    renewableEnergy: Number(y.metrics.renewableEnergy.toFixed(1)),
    publicTransit: Number(y.metrics.publicTransit.toFixed(1)),
    publicTrust: Number(y.metrics.publicTrust.toFixed(1)),
    debtRatio: Number(y.metrics.debtRatio.toFixed(1)),
  }));

  const data = tab === 'scores' ? scoreData : metricData;
  const series = tab === 'scores' ? SERIES : METRIC_SERIES;

  function toggleSeries(key: string) {
    setActiveSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Warnings from any projection year
  const allWarnings = result.projections.flatMap(y =>
    y.warnings.map(w => ({ year: y.year, warning: w }))
  );
  const uniqueWarnings = [...new Map(allWarnings.map(w => [w.warning, w])).values()];

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Multi-Year Projections
        </div>
        <div className="flex gap-1">
          {(['scores', 'metrics'] as Tab[]).map(t => (
            <button
              key={t}
              className="text-xs px-3 py-1.5 rounded-md transition-colors capitalize"
              style={{
                background: tab === t ? 'var(--accent-blue)' : 'var(--bg-base)',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
              onClick={() => {
                setTab(t);
                setActiveSeries(new Set((t === 'scores' ? SERIES : METRIC_SERIES).map(s => s.key)));
              }}
            >
              {t === 'scores' ? 'Pillar Scores' : 'Raw Metrics'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend toggles */}
      <div className="flex flex-wrap gap-2">
        {series.map(s => (
          <button
            key={s.key}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all"
            style={{
              background: activeSeries.has(s.key) ? 'var(--bg-base)' : 'transparent',
              border: `1px solid ${activeSeries.has(s.key) ? s.color : 'var(--border)'}`,
              color: activeSeries.has(s.key) ? s.color : 'var(--text-muted)',
              opacity: activeSeries.has(s.key) ? 1 : 0.5,
            }}
            onClick={() => toggleSeries(s.key)}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: s.color }}
            />
            {s.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#8b949e' }}
            tickFormatter={v => (v === 0 ? 'Base' : `Y${v}`)}
          />
          <YAxis tick={{ fontSize: 11, fill: '#8b949e' }} />
          <Tooltip content={<CustomTooltip />} />
          {series.map(s =>
            activeSeries.has(s.key) ? (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name={s.label}
              />
            ) : null
          )}
          <ReferenceLine x={0} stroke="#30363d" strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>

      {/* Warnings */}
      {uniqueWarnings.length > 0 && (
        <div className="space-y-1.5">
          {uniqueWarnings.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
              style={{
                background: '#2d1b1b',
                border: '1px solid var(--accent-red)',
                color: '#f85149',
              }}
            >
              <span>⚠</span>
              <span>{w.warning}</span>
              <span className="ml-auto" style={{ color: 'var(--text-muted)' }}>
                Year {w.year}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
