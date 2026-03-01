'use client';

import { useState, useMemo } from 'react';
import { MapPin, Play, RotateCcw, Activity, Sparkles, Landmark } from 'lucide-react';
import { CityData, PolicyConfig } from '@/lib/types';
import { calcAllScores } from '@/lib/scoring';
import { runSimulation } from '@/lib/simulation';
import { POLICIES } from '@/lib/policies';
import { CITIES } from '@/lib/cities';
import CitySearch from '@/components/CitySearch';
import Dashboard from '@/components/Dashboard';
import PolicyPanel from '@/components/PolicyPanel';
import SimulationGraph from '@/components/SimulationGraph';
import AIAdvisor from '@/components/AIAdvisor';
import ThemeToggle from '@/components/ThemeToggle';

const DEFAULT_CITY = CITIES.find(c => c.id === 'amsterdam')!;

export default function Home() {
  // City state
  const [selectedCity, setSelectedCity] = useState<CityData>(DEFAULT_CITY);
  const [isRefreshingCity, setIsRefreshingCity] = useState(false);
  const [cityLastRefreshed, setCityLastRefreshed] = useState<number | null>(null);

  // Policy + simulation state
  const [userPolicies, setUserPolicies] = useState<PolicyConfig[]>([]);
  const [simulationYears, setSimulationYears] = useState(5);
  const [simulated, setSimulated] = useState(false);

  // AI scenario state
  const [aiPolicies, setAiPolicies] = useState<PolicyConfig[] | null>(null);

  const baseScores = useMemo(() => calcAllScores(selectedCity), [selectedCity]);

  const userResult = useMemo(() => {
    if (!simulated || userPolicies.length === 0) return null;
    return runSimulation(selectedCity, userPolicies, POLICIES, simulationYears, 'user');
  }, [simulated, selectedCity, userPolicies, simulationYears]);

  const aiResult = useMemo(() => {
    if (!aiPolicies || aiPolicies.length === 0) return null;
    return runSimulation(selectedCity, aiPolicies, POLICIES, simulationYears, 'ai');
  }, [selectedCity, aiPolicies, simulationYears]);

  function handleCityChange(city: CityData) {
    setSelectedCity(city);
    setUserPolicies([]);
    setAiPolicies(null);
    setSimulated(false);
    setCityLastRefreshed(null);
  }

  function handleSimulate() {
    if (userPolicies.length === 0) return;
    setSimulated(true);
  }

  function handleReset() {
    setUserPolicies([]);
    setAiPolicies(null);
    setSimulated(false);
  }

  async function handleRefreshCityData() {
    setIsRefreshingCity(true);
    try {
      const res = await fetch('/api/city-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: selectedCity.id,
          cityName: selectedCity.name,
          country: selectedCity.country,
          currentData: selectedCity,
        }),
      });
      const { data, lastRefreshed } = await res.json();
      setSelectedCity(prev => ({ ...prev, ...data }));
      setCityLastRefreshed(lastRefreshed);
    } catch (e) {
      console.error('City refresh failed:', e);
    } finally {
      setIsRefreshingCity(false);
    }
  }

  function handleAdoptAIScenario(policies: PolicyConfig[]) {
    setUserPolicies(policies);
    setAiPolicies(null);
    setSimulated(true);
  }

  function handlePoliciesChange(p: PolicyConfig[]) {
    setUserPolicies(p);
    if (p.length === 0) setSimulated(false);
  }

  const showGraph = userResult || aiResult;

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
            className="w-10 h-10 flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Landmark size={26} />
          </div>
          <div>
            <div className="text-base greek-style font-bold tracking-widest leading-none mb-0.5" style={{ color: 'var(--text-primary)' }}>
              Polis AI
            </div>
            <div className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--text-secondary)' }}>
              Urban Policy Simulator
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CitySearch selectedCity={selectedCity} onSelect={handleCityChange} />

          <ThemeToggle />

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
            disabled={userPolicies.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all disabled:opacity-40"
            style={{
              background: userPolicies.length > 0 ? 'var(--accent-green)' : 'var(--bg-card)',
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
          className="w-80 shrink-0 flex flex-col p-4"
          style={{
            background: 'var(--bg-panel)',
            borderRight: '1px solid var(--border)',
          }}
        >
          <PolicyPanel
            selectedPolicies={userPolicies}
            onChange={handlePoliciesChange}
            annualBudgetB={selectedCity.annualBudget}
            simulationYears={simulationYears}
            onYearsChange={setSimulationYears}
          />
        </aside>

        {/* Center: Dashboard + Graph */}
        <main className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto min-w-0">
          <Dashboard
            city={selectedCity}
            scores={baseScores}
            result={userResult}
            onRefreshCityData={handleRefreshCityData}
            isRefreshing={isRefreshingCity}
            lastRefreshed={cityLastRefreshed}
          />
          {showGraph && (
            <SimulationGraph
              userResult={userResult ?? aiResult!}
              aiResult={userResult ? aiResult : null}
            />
          )}
          {!showGraph && (
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
                , or use the AI Goal Planner on the right.
              </div>
            </div>
          )}
        </main>

        {/* Right: AI Advisor */}
        <aside
          className="w-80 shrink-0 p-4 overflow-y-auto"
          style={{
            background: 'var(--bg-panel)',
            borderLeft: '1px solid var(--border)',
          }}
        >
          <div className="text-xs font-bold greek-style tracking-widest mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles size={12} />
            AI Advisor
          </div>
          <AIAdvisor
            userResult={userResult}
            aiResult={aiResult}
            cityName={selectedCity.name}
            cityId={selectedCity.id}
            simulationYears={simulationYears}
            currentData={selectedCity}
            onAdoptAIScenario={handleAdoptAIScenario}
          />
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
          <MapPin size={10} className="inline mr-1" />
          <span style={{ color: 'var(--text-secondary)' }}>{selectedCity.name}, {selectedCity.country}</span>
          {' · '}
          Policies:{' '}
          <span style={{ color: userPolicies.length > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
            {userPolicies.length}
          </span>
          {aiPolicies && (
            <>
              {' · '}
              <span style={{ color: 'var(--accent-purple)' }}>AI scenario active</span>
            </>
          )}
        </span>
        <span>Polis AI · MEGA Hackathon 2026</span>
      </footer>
    </div>
  );
}
