'use client';

import { Zap, Train, Landmark, Plus, X } from 'lucide-react';
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

const CATEGORY_BG: Record<string, string> = {
  energy: 'rgba(245,158,11,0.12)',
  transportation: 'rgba(59,130,246,0.12)',
  governance: 'rgba(139,92,246,0.12)',
};

const INTENSITY_LABELS: Record<PolicyIntensity, string> = {
  low: 'Low',
  medium: 'Med',
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
  const isSelected = !!config;
  const catColor = CATEGORY_COLORS[policy.category];

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: isSelected ? `3px solid ${catColor}` : '1px solid var(--border)',
      }}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <span style={{ color: catColor, marginTop: 2, flexShrink: 0 }}>{CATEGORY_ICONS[policy.category]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {policy.name}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: COST_COLOR[policy.costLevel] }}
                  />
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

            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: 'var(--text-muted)' }}
              title={policy.description}
            >
              {policy.description}
            </p>
          </div>
        </div>
      </div>

      {isSelected && config && (
        <div
          className="px-3 pb-3 pt-2 space-y-2 border-t"
          style={{ borderColor: 'var(--border)' }}
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
              className="w-full h-1"
              style={{ accentColor: catColor }}
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>1yr</span><span>5yr</span>
            </div>
          </div>

          {/* Budget impact */}
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Budget:{' '}
            <span style={{ color: policy.budgetImpactPct[config.intensity] < 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {policy.budgetImpactPct[config.intensity] < 0 ? '+' : '-'}
              {Math.abs(policy.budgetImpactPct[config.intensity])}%/yr
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
      {/* Simulation horizon — slim strip */}
      <div className="pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Projection horizon</span>
          <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--accent-blue)' }}>
            {simulationYears}yr
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
      </div>

      {/* Policy categories */}
      {categories.map(cat => {
        const selectedCount = selectedPolicies.filter(sp =>
          POLICIES.find(p => p.id === sp.id)?.category === cat
        ).length;

        return (
          <div key={cat}>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="block w-0.5 h-4 rounded-full shrink-0"
                style={{ background: CATEGORY_COLORS[cat] }}
              />
              <span style={{ color: CATEGORY_COLORS[cat] }}>
                {CATEGORY_ICONS[cat]}
              </span>
              <span
                className="text-xs font-semibold uppercase tracking-wider flex-1"
                style={{ color: CATEGORY_COLORS[cat] }}
              >
                {categoryLabels[cat]}
              </span>
              {selectedCount > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: CATEGORY_BG[cat],
                    color: CATEGORY_COLORS[cat],
                  }}
                >
                  {selectedCount}
                </span>
              )}
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
        );
      })}
    </div>
  );
}
