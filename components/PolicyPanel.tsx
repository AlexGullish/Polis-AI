'use client';

import { useState } from 'react';
import {
  Zap, Train, Landmark, Home, Heart, BookOpen, Wifi, Briefcase, Wheat, Factory,
  Plus, X,
} from 'lucide-react';
import { POLICIES, POLICY_CATEGORIES, CATEGORY_LABELS } from '@/lib/policies';
import { PolicyCategory, PolicyConfig, PolicyDefinition } from '@/lib/types';

interface Props {
  selectedPolicies: PolicyConfig[];
  onChange: (policies: PolicyConfig[]) => void;
  annualBudgetB: number; // city annual budget in USD billions
  simulationYears: number;
  onYearsChange: (years: number) => void;
}

const CATEGORY_ICONS: Record<PolicyCategory, React.ReactNode> = {
  energy: <Zap size={13} />,
  transportation: <Train size={13} />,
  governance: <Landmark size={13} />,
  housing: <Home size={13} />,
  healthcare: <Heart size={13} />,
  education: <BookOpen size={13} />,
  digital: <Wifi size={13} />,
  business: <Briefcase size={13} />,
  agriculture: <Wheat size={13} />,
  industry: <Factory size={13} />,
};

const CATEGORY_COLORS: Record<PolicyCategory, string> = {
  energy: 'var(--accent-yellow)',
  transportation: '#06b6d4', // Cyan instead of Blue
  governance: 'var(--accent-purple)',
  housing: '#f97316',
  healthcare: '#ec4899',
  education: '#06b6d4',
  digital: '#8b5cf6',
  business: '#14b8a6',
  agriculture: '#84cc16',
  industry: '#94a3b8',
};

const CATEGORY_BG: Record<PolicyCategory, string> = {
  energy: 'rgba(245,158,11,0.12)',
  transportation: 'rgba(6,182,212,0.12)',
  governance: 'rgba(139,92,246,0.12)',
  housing: 'rgba(249,115,22,0.12)',
  healthcare: 'rgba(236,72,153,0.12)',
  education: 'rgba(6,182,212,0.12)',
  digital: 'rgba(139,92,246,0.12)',
  business: 'rgba(20,184,166,0.12)',
  agriculture: 'rgba(132,204,22,0.12)',
  industry: 'rgba(148,163,184,0.12)',
};

function formatBudget(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${Math.round(m)}M`;
}

function PolicyCard({
  policy,
  config,
  annualBudgetB,
  simulationYears,
  onAdd,
  onRemove,
  onUpdate,
}: {
  policy: PolicyDefinition;
  config?: PolicyConfig;
  annualBudgetB: number;
  simulationYears: number;
  onAdd: () => void;
  onRemove: () => void;
  onUpdate: (c: Partial<PolicyConfig>) => void;
}) {
  const isSelected = !!config;
  const catColor = CATEGORY_COLORS[policy.category];
  const { minPerYear, refPerYear, maxPerYear } = policy.budgetRange;

  // % of annual budget represented by current budget setting
  const budgetPct = config
    ? ((config.budgetPerYear / 1000) / annualBudgetB) * 100
    : 0;

  function handleBudgetChange(val: number) {
    onUpdate({ budgetPerYear: val });
  }

  function handleStartYear(val: number) {
    if (!config) return;
    const newStart = Math.min(val, config.endYear - 1);
    onUpdate({ startYear: newStart });
  }

  function handleEndYear(val: number) {
    if (!config) return;
    const newEnd = Math.max(val, config.startYear + 1);
    onUpdate({ endYear: newEnd });
  }

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
          <span style={{ color: catColor, marginTop: 2, flexShrink: 0 }}>
            {CATEGORY_ICONS[policy.category]}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {policy.name}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
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
        <div className="px-3 pb-3 pt-2 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
          {/* Budget */}
          <div>
            <div className="text-xs mb-1 flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
              <span>Annual Budget</span>
              <span className="font-semibold tabular-nums" style={{ color: catColor }}>
                {formatBudget(config.budgetPerYear)}
                <span className="ml-1 font-normal" style={{ color: 'var(--text-muted)' }}>
                  (~{budgetPct.toFixed(1)}% of budget)
                </span>
              </span>
            </div>
            <input
              type="range"
              min={minPerYear}
              max={maxPerYear}
              step={Math.max(5, Math.round((maxPerYear - minPerYear) / 100))}
              value={config.budgetPerYear}
              onChange={e => handleBudgetChange(Number(e.target.value))}
              className="w-full h-1"
              style={{ accentColor: catColor }}
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{formatBudget(minPerYear)}</span>
              <span className="opacity-60">ref {formatBudget(refPerYear)}</span>
              <span>{formatBudget(maxPerYear)}</span>
            </div>
          </div>

          {/* Year range */}
          <div>
            <div className="text-xs mb-1 flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
              <span>Active Years</span>
              <span className="font-semibold tabular-nums" style={{ color: catColor }}>
                Y{config.startYear} → Y{config.endYear}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Start</div>
                <input
                  type="range"
                  min={1}
                  max={simulationYears - 1}
                  value={config.startYear}
                  onChange={e => handleStartYear(Number(e.target.value))}
                  className="w-full h-1"
                  style={{ accentColor: catColor }}
                />
                <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Y1</span><span>Y{simulationYears - 1}</span>
                </div>
              </div>
              <div>
                <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>End</div>
                <input
                  type="range"
                  min={config.startYear + 1}
                  max={simulationYears}
                  value={config.endYear}
                  onChange={e => handleEndYear(Number(e.target.value))}
                  className="w-full h-1"
                  style={{ accentColor: catColor }}
                />
                <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Y{config.startYear + 1}</span><span>Y{simulationYears}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function PolicyPanel({
  selectedPolicies,
  onChange,
  annualBudgetB,
  simulationYears,
  onYearsChange,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<PolicyCategory>('energy');

  function addPolicy(id: string) {
    const def = POLICIES.find(p => p.id === id);
    if (!def) return;
    onChange([
      ...selectedPolicies,
      {
        id,
        startYear: 1,
        endYear: simulationYears,
        budgetPerYear: def.budgetRange.refPerYear,
      },
    ]);
  }

  function removePolicy(id: string) {
    onChange(selectedPolicies.filter(p => p.id !== id));
  }

  function updatePolicy(id: string, patch: Partial<PolicyConfig>) {
    onChange(selectedPolicies.map(p => (p.id === id ? { ...p, ...patch } : p)));
  }

  const totalSelectedCount = selectedPolicies.length;

  return (
    <div className="flex flex-col h-full">

      {/* Simulation horizon */}
      <div className="px-1 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Projection horizon</span>
          <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {simulationYears} yr
          </span>
        </div>
        <input
          type="range"
          min={2}
          max={15}
          value={simulationYears}
          onChange={e => onYearsChange(Number(e.target.value))}
          className="w-full h-1"
          style={{ accentColor: 'var(--text-secondary)' }}
        />
        <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          <span>2yr</span><span>15yr</span>
        </div>
      </div>

      {/* Category tab bar */}
      <div
        className="flex gap-1 py-2 overflow-x-auto shrink-0"
        style={{ borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}
      >
        {POLICY_CATEGORIES.map(cat => {
          const count = selectedPolicies.filter(sp =>
            POLICIES.find(p => p.id === sp.id)?.category === cat
          ).length;
          const isActive = activeCategory === cat;
          const color = CATEGORY_COLORS[cat];

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex items-center gap-1 px-2 py-1.5 rounded text-xs whitespace-nowrap shrink-0 transition-all"
              style={{
                background: isActive ? CATEGORY_BG[cat] : 'transparent',
                color: isActive ? color : 'var(--text-muted)',
                border: `1px solid ${isActive ? color : 'transparent'}`,
              }}
            >
              <span style={{ color: isActive ? color : 'var(--text-muted)' }}>
                {CATEGORY_ICONS[cat]}
              </span>
              <span className="font-medium">{CATEGORY_LABELS[cat]}</span>
              {count > 0 && (
                <span
                  className="ml-0.5 text-xs px-1 rounded-full font-semibold"
                  style={{ background: CATEGORY_BG[cat], color }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Policy list for active category */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2">
        {POLICIES.filter(p => p.category === activeCategory).map(policy => {
          const config = selectedPolicies.find(sp => sp.id === policy.id);
          return (
            <PolicyCard
              key={policy.id}
              policy={policy}
              config={config}
              annualBudgetB={annualBudgetB}
              simulationYears={simulationYears}
              onAdd={() => addPolicy(policy.id)}
              onRemove={() => removePolicy(policy.id)}
              onUpdate={patch => updatePolicy(policy.id, patch)}
            />
          );
        })}
      </div>

      {/* Footer: total count */}
      {totalSelectedCount > 0 && (
        <div
          className="px-2 py-2 text-xs flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <span>{totalSelectedCount} polic{totalSelectedCount === 1 ? 'y' : 'ies'} selected</span>
          <span style={{ color: 'var(--accent-yellow)' }}>
            ${selectedPolicies.reduce((s, p) => s + p.budgetPerYear, 0).toLocaleString()}M/yr total
          </span>
        </div>
      )}
    </div>
  );
}
