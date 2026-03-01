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
  ReferenceLine,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { SimulationResult } from '@/lib/types';

interface Props {
  userResult: SimulationResult;
  aiResult?: SimulationResult | null;
}

const SCORE_SERIES = [
  { key: 'sustainability', label: 'Sustainability', color: '#10b981' },
  { key: 'governance', label: 'Governance', color: '#8b5cf6' },
  { key: 'fiscalStability', label: 'Fiscal Stability', color: '#f59e0b' },
  { key: 'publicApproval', label: 'Public Approval', color: '#3b82f6' },
];

const METRIC_SERIES = [
  { key: 'co2PerCapita', label: 'CO₂/capita (t)', color: '#ef4444' },
  { key: 'renewableEnergy', label: 'Renewable %', color: '#10b981' },
  { key: 'publicTransit', label: 'Transit %', color: '#3b82f6' },
  { key: 'publicTrust', label: 'Public Trust', color: '#8b5cf6' },
  { key: 'debtRatio', label: 'Debt Ratio %', color: '#f59e0b' },
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

export default function SimulationGraph({ userResult, aiResult }: Props) {
  const [tab, setTab] = useState<Tab>('scores');
  const [activeSeries, setActiveSeries] = useState<Set<string>>(
    new Set(SCORE_SERIES.map(s => s.key))
  );

  const hasAI = !!aiResult;
  const userYears = [userResult.baseline, ...userResult.projections];
  const aiYears = aiResult ? [aiResult.baseline, ...aiResult.projections] : [];

  // Build merged data: same year axis, user_ and ai_ prefixed keys
  const maxYears = Math.max(userYears.length, aiYears.length);
  const scoreData = Array.from({ length: maxYears }, (_, i) => {
    const u = userYears[i];
    const a = aiYears[i];
    return {
      year: u?.year ?? a?.year ?? i,
      user_sustainability: u?.scores.sustainability,
      user_governance: u?.scores.governance,
      user_fiscalStability: u?.scores.fiscalStability,
      user_publicApproval: u?.scores.publicApproval,
      ai_sustainability: a?.scores.sustainability,
      ai_governance: a?.scores.governance,
      ai_fiscalStability: a?.scores.fiscalStability,
      ai_publicApproval: a?.scores.publicApproval,
    };
  });

  const metricData = Array.from({ length: maxYears }, (_, i) => {
    const u = userYears[i];
    const a = aiYears[i];
    return {
      year: u?.year ?? a?.year ?? i,
      user_co2PerCapita: u ? Number(u.metrics.co2PerCapita.toFixed(2)) : undefined,
      user_renewableEnergy: u ? Number(u.metrics.renewableEnergy.toFixed(1)) : undefined,
      user_publicTransit: u ? Number(u.metrics.publicTransit.toFixed(1)) : undefined,
      user_publicTrust: u ? Number(u.metrics.publicTrust.toFixed(1)) : undefined,
      user_debtRatio: u ? Number(u.metrics.debtRatio.toFixed(1)) : undefined,
      ai_co2PerCapita: a ? Number(a.metrics.co2PerCapita.toFixed(2)) : undefined,
      ai_renewableEnergy: a ? Number(a.metrics.renewableEnergy.toFixed(1)) : undefined,
      ai_publicTransit: a ? Number(a.metrics.publicTransit.toFixed(1)) : undefined,
      ai_publicTrust: a ? Number(a.metrics.publicTrust.toFixed(1)) : undefined,
      ai_debtRatio: a ? Number(a.metrics.debtRatio.toFixed(1)) : undefined,
    };
  });

  const currentSeries = tab === 'scores' ? SCORE_SERIES : METRIC_SERIES;
  const data = tab === 'scores' ? scoreData : metricData;

  function toggleSeries(key: string) {
    setActiveSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function switchTab(t: Tab) {
    setTab(t);
    setActiveSeries(new Set((t === 'scores' ? SCORE_SERIES : METRIC_SERIES).map(s => s.key)));
  }

  type WarningEntry = { year: number; warning: string; source: 'user' | 'ai' };
  const allWarnings: WarningEntry[] = [
    ...userResult.projections.flatMap(y =>
      y.warnings.map(w => ({ year: y.year, warning: w, source: 'user' as const }))
    ),
    ...(aiResult?.projections ?? []).flatMap(y =>
      y.warnings.map(w => ({ year: y.year, warning: w, source: 'ai' as const }))
    ),
  ];
  const uniqueWarnings = [...new Map(allWarnings.map(w => [`${w.source}-${w.warning}`, w])).values()];

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-bold greek-style tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>
            Systemic Projections
          </div>
          {hasAI && (
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <span className="inline-block w-5 h-0.5 rounded" style={{ background: '#8b5cf6' }} />
                User
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-5" style={{
                  borderTop: '2px dashed #8b5cf6',
                  opacity: 0.7,
                }} />
                AI Scenario
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {(['scores', 'metrics'] as Tab[]).map(t => (
            <button
              key={t}
              className="text-xs px-3 py-1.5 rounded-md transition-colors capitalize"
              style={{
                background: tab === t ? 'var(--bg-card-hover)' : 'var(--bg-base)',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
              onClick={() => switchTab(t)}
            >
              {t === 'scores' ? 'Pillar Scores' : 'Raw Metrics'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend toggles */}
      <div className="flex flex-wrap gap-2">
        {currentSeries.map(s => (
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
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: 'var(--chart-tick)' }}
            tickFormatter={v => (v === 0 ? 'Base' : `Y${v}`)}
          />
          <YAxis tick={{ fontSize: 11, fill: 'var(--chart-tick)' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="var(--chart-ref-line)" strokeDasharray="4 2" />

          {/* User scenario lines (solid) */}
          {currentSeries.map(s =>
            activeSeries.has(s.key) ? (
              <Line
                key={`user_${s.key}`}
                type="monotone"
                dataKey={`user_${s.key}`}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                name={s.label}
                connectNulls
              />
            ) : null
          )}

          {/* AI scenario lines (dashed, 70% opacity) */}
          {hasAI && currentSeries.map(s =>
            activeSeries.has(s.key) ? (
              <Line
                key={`ai_${s.key}`}
                type="monotone"
                dataKey={`ai_${s.key}`}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray="6 3"
                strokeOpacity={0.65}
                dot={false}
                activeDot={{ r: 3 }}
                name={`${s.label} (AI)`}
                connectNulls
              />
            ) : null
          )}
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
                background: 'var(--warning-bg)',
                border: '1px solid var(--accent-red)',
                color: 'var(--accent-red)',
              }}
            >
              <AlertTriangle size={14} />
              <span>{w.warning}</span>
              <span className="ml-auto flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                {w.source === 'ai' && (
                  <span className="px-1 rounded text-xs" style={{ background: 'rgba(139,92,246,0.2)', color: 'var(--accent-purple)' }}>
                    AI
                  </span>
                )}
                Year {w.year}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
