'use client';

import { CityData, PillarScores } from '@/lib/types';
import { SimulationResult } from '@/lib/types';
import MetricCard from './MetricCard';
import { Building2, Users, DollarSign, Wind, Car, Zap, ShieldCheck, TreePine } from 'lucide-react';

interface Props {
  city: CityData;
  scores: PillarScores;
  result: SimulationResult | null;
}

function StatItem({ icon, label, value, unit }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <span style={{ color: 'var(--text-secondary)' }}>{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {value}
          {unit && <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>{unit}</span>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ city, scores, result }: Props) {
  const finalScores = result?.projections[result.projections.length - 1]?.scores;

  function delta(key: keyof PillarScores): number | undefined {
    if (!finalScores) return undefined;
    return finalScores[key] - scores[key];
  }

  const displayScores = finalScores ?? scores;

  return (
    <div className="flex flex-col gap-4">
      {/* City header */}
      <div
        className="rounded-xl px-5 py-4"
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Building2 size={20} style={{ color: 'var(--accent-blue)' }} />
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {city.name}
            </h2>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {city.country}
            </div>
          </div>
        </div>
      </div>

      {/* Pillar Scores */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Sustainability"
          score={displayScores.sustainability}
          icon="🌱"
          color="var(--accent-green)"
          pillar="sustainability"
          delta={delta('sustainability')}
        />
        <MetricCard
          label="Governance"
          score={displayScores.governance}
          icon="🏛"
          color="var(--accent-purple)"
          pillar="governance"
          delta={delta('governance')}
        />
        <MetricCard
          label="Fiscal Stability"
          score={displayScores.fiscalStability}
          icon="💰"
          color="var(--accent-yellow)"
          pillar="fiscalStability"
          delta={delta('fiscalStability')}
        />
        <MetricCard
          label="Public Approval"
          score={displayScores.publicApproval}
          icon="🙂"
          color="var(--accent-blue)"
          pillar="publicApproval"
          delta={delta('publicApproval')}
        />
      </div>

      {/* Raw stats */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          City Stats — Baseline
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatItem
            icon={<Users size={14} />}
            label="Population"
            value={(city.population * 1e6).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          />
          <StatItem
            icon={<DollarSign size={14} />}
            label="GDP"
            value={`$${city.gdp}B`}
          />
          <StatItem
            icon={<DollarSign size={14} />}
            label="Annual Budget"
            value={`$${city.annualBudget}B`}
          />
          <StatItem
            icon={<Wind size={14} />}
            label="CO₂/capita"
            value={city.co2PerCapita.toFixed(1)}
            unit="t/yr"
          />
          <StatItem
            icon={<Zap size={14} />}
            label="Renewable Energy"
            value={`${city.renewableEnergy}%`}
          />
          <StatItem
            icon={<Car size={14} />}
            label="Public Transit"
            value={`${city.publicTransit}%`}
          />
          <StatItem
            icon={<Wind size={14} />}
            label="Air Quality (AQI)"
            value={String(city.airQuality)}
            unit={city.airQuality < 50 ? 'Good' : city.airQuality < 100 ? 'Moderate' : 'Unhealthy'}
          />
          <StatItem
            icon={<ShieldCheck size={14} />}
            label="Crime Rate"
            value={String(city.crimeRate)}
            unit="per 100k"
          />
          <StatItem
            icon={<Building2 size={14} />}
            label="Infra. Investment"
            value={`${city.infrastructureInvestment}%`}
            unit="of budget"
          />
          <StatItem
            icon={<TreePine size={14} />}
            label="Public Trust"
            value={`${city.publicTrust}/100`}
          />
          <StatItem
            icon={<DollarSign size={14} />}
            label="Debt Ratio"
            value={`${city.debtRatio}%`}
            unit="of GDP"
          />
          <StatItem
            icon={<TreePine size={14} />}
            label="Green Investment"
            value={`${city.greenInvestment}%`}
            unit="of budget"
          />
        </div>
      </div>

      {result && (
        <div
          className="rounded-xl px-4 py-3 text-xs"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Total policy cost: </span>
          <span className="font-semibold" style={{ color: 'var(--accent-yellow)' }}>
            ${result.totalCost.toFixed(1)}B/yr
          </span>
          <span style={{ color: 'var(--text-muted)' }}> ·  </span>
          <span style={{ color: 'var(--text-muted)' }}>Projecting </span>
          <span className="font-semibold" style={{ color: 'var(--accent-blue)' }}>
            {result.projections.length} years
          </span>
        </div>
      )}
    </div>
  );
}
