'use client';

import { useState } from 'react';
import { Zap, Train, Landmark, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { POLICIES } from '@/lib/policies';
import { PolicyConfig, PolicyIntensity, PolicyDefinition } from '@/lib/types';

interface Props {
  selectedPolicies: PolicyConfig[];
  onChange: (policies: PolicyConfig[]) => void;
  simulationYears: number;
  onYearsChange: (years: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  energy: <Zap size={14} />,
  transportation: <Train size={14} />,
  governance: <Landmark size={14} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  energy: 'var(--accent-yellow)',
  transportation: 'var(--accent-blue)',
  governance: 'var(--accent-purple)',
};

const INTENSITY_LABELS: Record<PolicyIntensity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const COST_COLOR: Record<string, string> = {
  Low: 'var(--accent-green)',
  Medium: 'var(--accent-yellow)',
  High: 'var(--accent-red)',
};

function PolicyCard({ policy, config, onAdd, onRemove, onUpdate }: {
  policy: PolicyDefinition;
  config?: PolicyConfig;
  onAdd: () => void;
  onRemove: () => void;
  onUpdate: (c: Partial<PolicyConfig>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSelected = !!config;
  const catColor = CATEGORY_COLORS[policy.category];

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: isSelected ? `3px solid ${catColor}` : '1px solid var(--border)',
        opacity: 1,
      }}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <span style={{ color: catColor, marginTop: 2 }}>{CATEGORY_ICONS[policy.category]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {policy.name}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--bg-base)',
                    color: COST_COLOR[policy.costLevel],
                    border: `1px solid ${COST_COLOR[policy.costLevel]}`,
                  }}
                >
                  {policy.costLevel}
                </span>
                {isSelected ? (
                  <button
                    onClick={onRemove}
                    className="p-1 rounded hover:opacity-80"
                    style={{ background: 'var(--accent-red)', color: '#fff' }}
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <button
                    onClick={onAdd}
                    className="p-1 rounded hover:opacity-80"
                    style={{ background: catColor, color: '#fff' }}
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
            </div>

            <button
              className="text-xs mt-1 flex items-center gap-1 hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? 'Hide details' : 'Show details'}
            </button>
          </div>
        </div>

        {expanded && (
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {policy.description}
          </p>
        )}
      </div>

      {isSelected && config && (
        <div
          className="px-3 pb-3 pt-2 space-y-2 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {/* Intensity */}
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              Intensity
            </div>
            <div className="flex gap-1">
              {(['low', 'medium', 'high'] as PolicyIntensity[]).map(i => (
                <button
                  key={i}
                  className="flex-1 text-xs py-1 rounded transition-all"
                  style={{
                    background: config.intensity === i ? catColor : 'var(--bg-base)',
                    color: config.intensity === i ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${config.intensity === i ? catColor : 'var(--border)'}`,
                  }}
                  onClick={() => onUpdate({ intensity: i })}
                >
                  {INTENSITY_LABELS[i]}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="text-xs mb-1 flex justify-between" style={{ color: 'var(--text-secondary)' }}>
              <span>Duration</span>
              <span style={{ color: catColor }}>{config.duration} yr{config.duration > 1 ? 's' : ''}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={config.duration}
              onChange={e => onUpdate({ duration: Number(e.target.value) })}
              className="w-full accent-blue-500 h-1"
              style={{ accentColor: catColor }}
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>1yr</span><span>5yr</span>
            </div>
          </div>

          {/* Budget impact */}
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Budget impact:{' '}
            <span style={{ color: policy.budgetImpactPct[config.intensity] < 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {policy.budgetImpactPct[config.intensity] < 0 ? '+' : '-'}
              {Math.abs(policy.budgetImpactPct[config.intensity])}% per year
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PolicyPanel({ selectedPolicies, onChange, simulationYears, onYearsChange }: Props) {
  const categories = ['energy', 'transportation', 'governance'] as const;
  const categoryLabels = { energy: 'Energy', transportation: 'Transportation', governance: 'Governance' };

  function addPolicy(id: string) {
    onChange([...selectedPolicies, { id, intensity: 'medium', duration: 3 }]);
  }

  function removePolicy(id: string) {
    onChange(selectedPolicies.filter(p => p.id !== id));
  }

  function updatePolicy(id: string, patch: Partial<PolicyConfig>) {
    onChange(selectedPolicies.map(p => (p.id === id ? { ...p, ...patch } : p)));
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Simulation horizon */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Simulation Horizon
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Years to project</span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent-blue)' }}>
            {simulationYears} years
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={simulationYears}
          onChange={e => onYearsChange(Number(e.target.value))}
          className="w-full h-1"
          style={{ accentColor: 'var(--accent-blue)' }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          <span>1yr</span><span>10yr</span>
        </div>
      </div>

      {/* Policy categories */}
      {categories.map(cat => (
        <div key={cat}>
          <div
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 px-1"
            style={{ color: CATEGORY_COLORS[cat] }}
          >
            {CATEGORY_ICONS[cat]}
            {categoryLabels[cat]}
          </div>
          <div className="space-y-2">
            {POLICIES.filter(p => p.category === cat).map(policy => {
              const config = selectedPolicies.find(sp => sp.id === policy.id);
              return (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  config={config}
                  onAdd={() => addPolicy(policy.id)}
                  onRemove={() => removePolicy(policy.id)}
                  onUpdate={patch => updatePolicy(policy.id, patch)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
