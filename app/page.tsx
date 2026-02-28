'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapPin, Play, RotateCcw, Map, Activity, Sparkles } from 'lucide-react';
import { CityData, PolicyConfig } from '@/lib/types';
import { calcAllScores } from '@/lib/scoring';
import { runSimulation } from '@/lib/simulation';
import { CITIES } from '@/lib/cities';
import CitySearch from '@/components/CitySearch';
import Dashboard from '@/components/Dashboard';
import PolicyPanel from '@/components/PolicyPanel';
import SimulationGraph from '@/components/SimulationGraph';
import AIAdvisor from '@/components/AIAdvisor';

const DEFAULT_CITY = CITIES.find(c => c.id === 'amsterdam')!;

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<CityData>(DEFAULT_CITY);
  const [policies, setPolicies] = useState<PolicyConfig[]>([]);
  const [simulationYears, setSimulationYears] = useState(5);
  const [simulated, setSimulated] = useState(false);

  const baseScores = useMemo(() => calcAllScores(selectedCity), [selectedCity]);

  const simulationResult = useMemo(() => {
    if (!simulated || policies.length === 0) return null;
    return runSimulation(selectedCity, policies, simulationYears);
  }, [simulated, selectedCity, policies, simulationYears]);

  // Auto-simulate on policy/year change after first run
  useEffect(() => {
    if (simulated && policies.length > 0) {
      // result recalculates via useMemo
    }
  }, [policies, simulated]);

  function handleCityChange(city: CityData) {
    setSelectedCity(city);
    setPolicies([]);
    setSimulated(false);
  }

  function handleSimulate() {
    if (policies.length === 0) return;
    setSimulated(true);
  }

  function handleReset() {
    setPolicies([]);
    setSimulated(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'var(--accent-blue)', color: '#fff' }}
          >
            <Map size={18} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Polis AI
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Urban Policy Simulator
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CitySearch selectedCity={selectedCity} onSelect={handleCityChange} />

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-opacity hover:opacity-80"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <RotateCcw size={13} />
            Reset
          </button>

          <button
            onClick={handleSimulate}
            disabled={policies.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all disabled:opacity-40"
            style={{
              background: policies.length > 0 ? 'var(--accent-green)' : 'var(--bg-card)',
              color: '#fff',
              border: '1px solid transparent',
            }}
          >
            <Play size={13} />
            Simulate
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Policy panel */}
        <aside
          className="w-72 shrink-0 flex flex-col p-4 overflow-y-auto"
          style={{
            background: 'var(--bg-panel)',
            borderRight: '1px solid var(--border)',
          }}
        >

          <PolicyPanel
            selectedPolicies={policies}
            onChange={p => {
              setPolicies(p);
              if (p.length === 0) setSimulated(false);
              else if (simulated) setSimulated(true);
            }}
            simulationYears={simulationYears}
            onYearsChange={setSimulationYears}
          />
        </aside>

        {/* Center: Dashboard + Graph */}
        <main className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto min-w-0">
          <Dashboard city={selectedCity} scores={baseScores} result={simulationResult} />
          {simulationResult && <SimulationGraph result={simulationResult} />}
          {!simulationResult && (
            <div
              className="rounded-xl flex flex-col items-center justify-center py-16 text-center"
              style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)' }}
            >
              <div className="mb-3" style={{ color: 'var(--text-muted)' }}>
                <Activity size={32} />
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                No simulation running
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Select policies on the left, then click{' '}
                <span style={{ color: 'var(--accent-green)' }}>Simulate</span>
              </div>
            </div>
          )}
        </main>

        {/* Right: AI Advisor */}
        <aside
          className="w-72 shrink-0 p-4 overflow-y-auto"
          style={{
            background: 'var(--bg-panel)',
            borderLeft: '1px solid var(--border)',
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles size={12} />
            AI Advisor
          </div>
          <AIAdvisor result={simulationResult} cityName={selectedCity.name} />
        </aside>
      </div>

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <footer
        className="flex items-center justify-between px-6 py-1.5 shrink-0 text-xs"
        style={{
          background: 'var(--bg-panel)',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          City: <span style={{ color: 'var(--text-secondary)' }}>{selectedCity.name}, {selectedCity.country}</span>
          {' · '}
          Policies active:{' '}
          <span style={{ color: policies.length > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
            {policies.length}
          </span>
        </span>
        <span>
          Polis AI · MEGA Hackathon 2026
        </span>
      </footer>
    </div>
  );
}
