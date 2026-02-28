'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Leaf, Landmark, DollarSign, Smile, Target, CheckCheck } from 'lucide-react';
import { CityData, PolicyConfig, SimulationResult } from '@/lib/types';
import { POLICIES } from '@/lib/policies';

interface Props {
  userResult: SimulationResult | null;
  aiResult: SimulationResult | null;
  cityName: string;
  cityId: string;
  simulationYears: number;
  currentData: CityData;
  onAdoptAIScenario: (policies: PolicyConfig[]) => void;
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

function Section({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div className="pl-3 py-0.5" style={{ borderLeft: `2px solid ${color}` }}>
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


export default function AIAdvisor({
  userResult,
  aiResult,
  cityName,
  cityId,
  simulationYears,
  currentData,
  onAdoptAIScenario,
}: Props) {
  // Analysis state
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Goal / AI scenario state
  const [goal, setGoal] = useState('');
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');
  const [aiPolicies, setAiPolicies] = useState<PolicyConfig[] | null>(null);
  const [scenarioError, setScenarioError] = useState<string | null>(null);

  async function requestAdvice() {
    if (!userResult) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: userResult, cityName }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAdvisory(data);
    } catch {
      setAnalysisError('Failed to get AI advice. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function generateScenario() {
    if (!goal.trim()) return;
    setAiStreaming(true);
    setAiReasoning('');
    setAiPolicies(null);
    setScenarioError(null);

    try {
      const res = await fetch('/api/ai-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityId, cityName, currentData, goal, simulationYears }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      if (!data.policies || data.policies.length === 0) {
        setScenarioError('AI returned no valid policies. Try a more specific goal.');
        return;
      }

      setAiReasoning(data.reasoning ?? '');
      setAiPolicies(data.policies);
    } catch (e) {
      setScenarioError(`Failed to generate scenario: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setAiStreaming(false);
    }
  }

  const policyNames = userResult?.selectedPolicies
    .map(sp => POLICIES.find(p => p.id === sp.id)?.name)
    .filter(Boolean) ?? [];

  const userFinalScores = userResult?.projections[userResult.projections.length - 1]?.scores;
  const userBaseScores = userResult?.baseline.scores;

  const aiPolicyNames = aiPolicies?.map(sp => POLICIES.find(p => p.id === sp.id)?.name).filter(Boolean) ?? [];

  return (
    <div className="space-y-5">
      {/* ── GOAL SECTION ────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Target size={14} style={{ color: 'var(--accent-purple)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-purple)' }}>
            AI Goal Planner
          </span>
        </div>

        <textarea
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder={`e.g. "Reduce CO₂ by 30% in ${simulationYears} years while keeping debt under 60%"`}
          rows={3}
          className="w-full text-xs rounded-lg px-3 py-2 resize-none outline-none"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        />

        <button
          onClick={generateScenario}
          disabled={!goal.trim() || aiStreaming}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent-purple)', color: '#fff' }}
        >
          {aiStreaming ? (
            <><Loader2 size={12} className="animate-spin" /> Generating scenario…</>
          ) : (
            <><Sparkles size={12} /> Generate AI Scenario</>
          )}
        </button>

        {scenarioError && (
          <div
            className="text-xs px-3 py-2 rounded-lg"
            style={{ background: 'var(--warning-bg)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}
          >
            {scenarioError}
          </div>
        )}

        {/* Reasoning box */}
        {aiReasoning && !aiStreaming && (
          <div
            className="text-xs leading-relaxed rounded-lg px-3 py-2 max-h-40 overflow-y-auto"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            {aiReasoning}
          </div>
        )}

        {/* AI scenario result */}
        {aiPolicies && aiPolicies.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              AI recommends {aiPolicies.length} polic{aiPolicies.length === 1 ? 'y' : 'ies'}:
            </div>
            <div className="flex flex-wrap gap-1">
              {aiPolicyNames.map((name, i) => (
                <span
                  key={i}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: 'rgba(139,92,246,0.15)',
                    color: 'var(--accent-purple)',
                    border: '1px solid rgba(139,92,246,0.3)',
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
            {aiResult && (
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Shown as dashed lines in the graph above.
              </div>
            )}
            <button
              onClick={() => onAdoptAIScenario(aiPolicies)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{
                background: 'rgba(139,92,246,0.15)',
                color: 'var(--accent-purple)',
                border: '1px solid rgba(139,92,246,0.4)',
              }}
            >
              <CheckCheck size={12} />
              Adopt AI Scenario
            </button>
          </div>
        )}
      </div>

      {/* ── ANALYSIS SECTION ────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Empty state */}
        {!userResult && (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
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

        {/* Score delta bars — user scenario */}
        {userResult && userFinalScores && userBaseScores && (
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Your Scenario Impact
            </div>
            {PILLAR_META.map(({ key, icon, label, color }) => {
              const delta = Math.round(userFinalScores[key] - userBaseScores[key]);
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
                  <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
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

        {/* Analyse button */}
        {userResult && !advisory && !analysisLoading && (
          <button
            onClick={requestAdvice}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--accent-purple)', color: '#fff' }}
          >
            <Sparkles size={14} />
            Analyse with AI
          </button>
        )}

        {analysisLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={14} className="animate-spin" />
            Analysing…
          </div>
        )}

        {analysisError && (
          <div
            className="text-xs px-3 py-2 rounded-lg"
            style={{ background: 'var(--warning-bg)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}
          >
            {analysisError}
          </div>
        )}

        {advisory && (
          <div className="space-y-4">
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
    </div>
  );
}
