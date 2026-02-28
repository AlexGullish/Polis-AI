'use client';

import { ReactNode } from 'react';
import { SCORE_FORMULAS } from '@/lib/scoring';

interface Props {
  label: string;
  score: number;
  icon: ReactNode;
  color: string;
  pillar?: 'sustainability' | 'governance' | 'fiscalStability' | 'publicApproval';
  delta?: number; // change from baseline
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

export default function MetricCard({ label, score, icon, color, pillar, delta }: Props) {
  const formula = pillar ? SCORE_FORMULAS[pillar] : undefined;

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[var(--text-secondary)] mb-1">{icon}</div>
          <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ScoreRing score={score} color={color} />
          {delta !== undefined && delta !== 0 && (
            <span
              className="text-xs font-semibold"
              style={{ color: delta > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
            >
              {delta > 0 ? '+' : ''}{delta} pts
            </span>
          )}
        </div>
      </div>

      {formula && (
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
