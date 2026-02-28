'use client';

import { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
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

export default function AIAdvisor({ result, cityName }: Props) {
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

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
    } catch (e) {
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
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ borderBottom: '1px solid var(--border)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            AI Policy Advisor
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={16} style={{ color: 'var(--text-secondary)' }} />
        ) : (
          <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
        )}
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Score deltas summary */}
          {result && finalScores && baseScores && (
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['sustainability', '🌱', 'Sustainability'],
                  ['governance', '🏛', 'Governance'],
                  ['fiscalStability', '💰', 'Fiscal'],
                  ['publicApproval', '🙂', 'Approval'],
                ] as const
              ).map(([key, icon, label]) => {
                const delta = finalScores[key] - baseScores[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
                  >
                    <span>
                      {icon} {label}
                    </span>
                    <span
                      className="font-bold"
                      style={{
                        color:
                          delta > 0
                            ? 'var(--accent-green)'
                            : delta < 0
                            ? 'var(--accent-red)'
                            : 'var(--text-muted)',
                      }}
                    >
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Policies active */}
          {policyNames.length > 0 && (
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active policies: </span>
              {policyNames.join(', ')}
            </div>
          )}

          {/* CTA */}
          {!advisory && !loading && (
            <button
              onClick={requestAdvice}
              disabled={!result || result.selectedPolicies.length === 0}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
              style={{
                background: 'var(--accent-purple)',
                color: '#fff',
              }}
            >
              {result?.selectedPolicies.length === 0
                ? 'Select policies to get advice'
                : 'Get AI Analysis'}
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Loader2 size={16} className="animate-spin" />
              Analysing simulation...
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
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {advisory.summary}
              </div>

              {/* Tradeoffs */}
              <Section title="Tradeoffs" color="var(--accent-yellow)" items={advisory.tradeoffs} />

              {/* Risks */}
              {advisory.risks.length > 0 && (
                <Section title="Risks" color="var(--accent-red)" items={advisory.risks} />
              )}

              {/* Suggestions */}
              {advisory.suggestions.length > 0 && (
                <Section title="Suggestions" color="var(--accent-green)" items={advisory.suggestions} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color }}>
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ color, flexShrink: 0 }}>·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
