'use client';

import { ReactNode } from 'react';
import { SCORE_FORMULAS, PILLAR_SUBMETRICS } from '@/lib/scoring';
import { CityData } from '@/lib/types';

interface Props {
  label: string;
  score: number;
  icon: ReactNode;
  color: string;
  pillar?: 'sustainability' | 'governance' | 'fiscalStability' | 'publicApproval';
  delta?: number;
  baseMetrics?: CityData;
  finalMetrics?: CityData;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#30363d" strokeWidth="5" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text
        x="36"
        y="36"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="700"
        fill={color}
      >
        {score}
      </text>
    </svg>
  );
}

export default function MetricCard({ label, score, icon, color, pillar, delta, baseMetrics, finalMetrics }: Props) {
  const formula = pillar ? SCORE_FORMULAS[pillar] : undefined;
  const submetrics = pillar ? PILLAR_SUBMETRICS[pillar] : undefined;
  const showLiveDeltas = !!(submetrics && baseMetrics && finalMetrics);

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[var(--text-secondary)] mb-1">{icon}</div>
          <div className="text-[10px] font-bold mt-1 greek-style tracking-[0.15em] mb-0.5" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </div>
          {delta !== undefined && delta !== 0 && (
            <span
              className="text-xs font-semibold mt-0.5 block"
              style={{ color: delta > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
            >
              {delta > 0 ? '+' : ''}{delta} pts
            </span>
          )}
        </div>
        <ScoreRing score={score} color={color} />
      </div>

      {/* Live sub-metric deltas when simulation is running */}
      {showLiveDeltas && (
        <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
          {submetrics!.map(sm => {
            const baseVal = baseMetrics![sm.key] as number | undefined;
            const finalVal = finalMetrics![sm.key] as number | undefined;
            if (baseVal === undefined || finalVal === undefined) return null;

            const d = finalVal - baseVal;
            const roundedD = Math.round(d * 10) / 10;
            const isGood = sm.invert ? d < 0 : d > 0;
            const isBad = sm.invert ? d > 0 : d < 0;
            const deltaColor = isGood
              ? 'var(--accent-green)'
              : isBad
                ? 'var(--accent-red)'
                : 'var(--text-muted)';
            const sign = roundedD > 0 ? '+' : '';

            return (
              <div key={sm.key} className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>{sm.label}</span>
                <span className="font-semibold tabular-nums" style={{ color: deltaColor }}>
                  {roundedD === 0 ? '—' : `${sign}${roundedD} ${sm.unit}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Static formula weights when no simulation */}
      {!showLiveDeltas && formula && (
        <div className="space-y-1">
          {formula.map(f => (
            <div key={f.label} className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>{f.label}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{f.weight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
