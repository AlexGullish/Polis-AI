'use client';

import { CityData, PillarScores, SimulationResult } from '@/lib/types';
import MetricCard from './MetricCard';
import {
  Building2, Users, DollarSign, Wind, Car, Zap, ShieldCheck, TreePine,
  Leaf, Landmark, Smile, RefreshCw, Heart, BookOpen, Home, Wifi,
} from 'lucide-react';

interface Props {
  city: CityData;
  scores: PillarScores;
  result: SimulationResult | null;
  onRefreshCityData: () => void;
  isRefreshing: boolean;
  lastRefreshed?: number | null;
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

function formatTimeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function Dashboard({ city, scores, result, onRefreshCityData, isRefreshing, lastRefreshed }: Props) {
  const finalYear = result?.projections[result.projections.length - 1];
  const finalScores = finalYear?.scores;
  const finalMetrics = finalYear?.metrics;

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 size={20} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <h2 className="text-xl font-bold greek-style tracking-wider" style={{ color: 'var(--text-primary)' }}>
                {city.name}
              </h2>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {city.country}
                {lastRefreshed && (
                  <span className="ml-2" style={{ color: 'var(--text-muted)' }}>
                    · data {formatTimeAgo(lastRefreshed)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onRefreshCityData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <RefreshCw
              size={12}
              className={isRefreshing ? 'animate-spin' : ''}
              style={{ color: isRefreshing ? 'var(--text-secondary)' : undefined }}
            />
            {isRefreshing ? 'Refreshing…' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Pillar Scores */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Sustainability"
          score={displayScores.sustainability}
          icon={<Leaf size={20} />}
          color="var(--accent-green)"
          pillar="sustainability"
          delta={delta('sustainability')}
          baseMetrics={city}
          finalMetrics={finalMetrics}
        />
        <MetricCard
          label="Governance"
          score={displayScores.governance}
          icon={<Landmark size={20} />}
          color="var(--accent-purple)"
          pillar="governance"
          delta={delta('governance')}
          baseMetrics={city}
          finalMetrics={finalMetrics}
        />
        <MetricCard
          label="Fiscal Stability"
          score={displayScores.fiscalStability}
          icon={<DollarSign size={20} />}
          color="var(--accent-yellow)"
          pillar="fiscalStability"
          delta={delta('fiscalStability')}
          baseMetrics={city}
          finalMetrics={finalMetrics}
        />
        <MetricCard
          label="Public Approval"
          score={displayScores.publicApproval}
          icon={<Smile size={20} />}
          color="var(--accent-blue)"
          pillar="publicApproval"
          delta={delta('publicApproval')}
          baseMetrics={city}
          finalMetrics={finalMetrics}
        />
      </div>

      {/* Raw stats */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 greek-style opacity-70" style={{ color: 'var(--text-secondary)' }}>
          City Stats — Baseline
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatItem icon={<Users size={14} />} label="Population"
            value={(city.population * 1e6).toLocaleString(undefined, { maximumFractionDigits: 0 })} />
          <StatItem icon={<DollarSign size={14} />} label="GDP" value={`$${city.gdp}B`} />
          <StatItem icon={<DollarSign size={14} />} label="Annual Budget" value={`$${city.annualBudget}B`} />
          <StatItem icon={<Wind size={14} />} label="CO₂/capita" value={city.co2PerCapita.toFixed(1)} unit="t/yr" />
          <StatItem icon={<Zap size={14} />} label="Renewable Energy" value={String(city.renewableEnergy)} unit="%" />
          <StatItem icon={<Car size={14} />} label="Public Transit" value={String(city.publicTransit)} unit="%" />
          <StatItem
            icon={<Wind size={14} />}
            label="Air Quality"
            value={String(city.airQuality)}
            unit={`AQI (${city.airQuality < 50 ? 'Good' : city.airQuality < 100 ? 'Moderate' : 'Unhealthy'})`}
          />
          <StatItem icon={<ShieldCheck size={14} />} label="Crime Rate" value={String(city.crimeRate)} unit="per 100k" />
          <StatItem icon={<Building2 size={14} />} label="Infra. Investment" value={String(city.infrastructureInvestment)} unit="% of budget" />
          <StatItem icon={<TreePine size={14} />} label="Public Trust" value={String(city.publicTrust)} unit="/ 100" />
          <StatItem icon={<DollarSign size={14} />} label="Debt Ratio" value={String(city.debtRatio)} unit="% of GDP" />
          <StatItem icon={<TreePine size={14} />} label="Green Investment" value={String(city.greenInvestment)} unit="% of budget" />
          {city.healthcareAccess !== undefined && (
            <StatItem icon={<Heart size={14} />} label="Healthcare Access" value={String(Math.round(city.healthcareAccess))} unit="/ 100" />
          )}
          {city.educationIndex !== undefined && (
            <StatItem icon={<BookOpen size={14} />} label="Education Index" value={String(Math.round(city.educationIndex))} unit="/ 100" />
          )}
          {city.housingAffordability !== undefined && (
            <StatItem icon={<Home size={14} />} label="Housing Affordability" value={String(Math.round(city.housingAffordability))} unit="/ 100" />
          )}
          {city.digitalConnectivity !== undefined && (
            <StatItem icon={<Wifi size={14} />} label="Digital Connectivity" value={String(Math.round(city.digitalConnectivity))} unit="/ 100" />
          )}
        </div>
      </div>

      {result && (
        <div
          className="rounded-xl px-4 py-3 text-xs"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Policy spend: </span>
          <span className="font-semibold" style={{ color: 'var(--accent-yellow)' }}>
            ${result.totalCostPerYear.toLocaleString()}M/yr
          </span>
          <span style={{ color: 'var(--text-muted)' }}> · </span>
          <span style={{ color: 'var(--text-muted)' }}>Projecting </span>
          <span className="font-semibold" style={{ color: 'var(--accent-blue)' }}>
            {result.projections.length} years
          </span>
          {result.label === 'ai' && (
            <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(139,92,246,0.2)', color: 'var(--accent-purple)' }}>
              AI scenario
            </span>
          )}
        </div>
      )}
    </div>
  );
}
