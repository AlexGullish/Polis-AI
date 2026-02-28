'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Leaf, Landmark, DollarSign, Smile } from 'lucide-react';
import { SimulationResult } from '@/lib/types';
import { POLICIES } from '@/lib/policies';

interface Props {
  result: SimulationResult | null;
  cityName: string;
}

interface Advisory {
  summary: string;
  tradeoffs: string[];
  risks: string[];
  suggestions: string[];
}

const PILLAR_META = [
  { key: 'sustainability' as const, icon: <Leaf size={12} />, label: 'Sustainability', color: 'var(--accent-green)' },
  { key: 'governance' as const, icon: <Landmark size={12} />, label: 'Governance', color: 'var(--accent-purple)' },
  { key: 'fiscalStability' as const, icon: <DollarSign size={12} />, label: 'Fiscal', color: 'var(--accent-yellow)' },
  { key: 'publicApproval' as const, icon: <Smile size={12} />, label: 'Approval', color: 'var(--accent-blue)' },
] as const;

export default function AIAdvisor({ result, cityName }: Props) {
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestAdvice() {
    if (!result) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, cityName }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAdvisory(data);
    } catch {
      setError('Failed to get AI advice. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const policyNames = result?.selectedPolicies
    .map(sp => POLICIES.find(p => p.id === sp.id)?.name)
    .filter(Boolean) ?? [];

  const finalScores = result?.projections[result.projections.length - 1]?.scores;
  const baseScores = result?.baseline.scores;

  return (
    <div className="space-y-4">
      {/* Empty state */}
      {!result && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              AI Advisor ready
            </div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Select policies and run a simulation, then get AI analysis of the projected outcomes.
            </div>
          </div>
        </div>
      )}

      {/* Score delta bars */}
      {result && finalScores && baseScores && (
        <div className="space-y-2.5">
          {PILLAR_META.map(({ key, icon, label, color }) => {
            const delta = Math.round(finalScores[key] - baseScores[key]);
            const barWidth = Math.min(Math.abs(delta) / 20, 1) * 100;
            const deltaColor = delta > 0
              ? 'var(--accent-green)'
              : delta < 0
                ? 'var(--accent-red)'
                : 'var(--text-muted)';
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color }}>{icon}</span>
                    {label}
                  </span>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: deltaColor }}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                </div>
                <div
                  className="h-0.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%`, background: deltaColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active policy chips */}
      {policyNames.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {policyNames.map((name, i) => (
            <span
              key={i}
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      {result && !advisory && !loading && (
        <button
          onClick={requestAdvice}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--accent-purple)', color: '#fff' }}
        >
          <Sparkles size={14} />
          Analyse with AI
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={14} className="animate-spin" />
          Analysing...
        </div>
      )}

      {error && (
        <div
          className="text-xs px-3 py-2 rounded-lg"
          style={{ background: '#2d1b1b', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}
        >
          {error}
        </div>
      )}

      {advisory && (
        <div className="space-y-4">
          {/* Summary */}
          <div
            className="text-xs leading-relaxed"
            style={{
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border)',
              paddingTop: '0.75rem',
            }}
          >
            {advisory.summary}
          </div>

          <Section title="Tradeoffs" color="var(--accent-yellow)" items={advisory.tradeoffs} />

          {advisory.risks.length > 0 && (
            <Section title="Risks" color="var(--accent-red)" items={advisory.risks} />
          )}

          {advisory.suggestions.length > 0 && (
            <Section title="Suggestions" color="var(--accent-green)" items={advisory.suggestions} />
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div
      className="pl-3 py-0.5"
      style={{ borderLeft: `2px solid ${color}` }}
    >
      <div className="text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color }}>
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
