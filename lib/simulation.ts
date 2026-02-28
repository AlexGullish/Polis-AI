import { CityData, PolicyConfig, SimulationResult, SimulationYear } from './types';
import { calcAllScores } from './scoring';
import { getPolicyById } from './policies';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Apply a single policy's impact to city metrics (in-place on a copy).
 * Impacts scale linearly over duration years; we apply them per-year.
 */
function applyPolicies(base: CityData, policies: PolicyConfig[]): CityData {
  const city = { ...base };

  for (const config of policies) {
    const def = getPolicyById(config.id);
    if (!def) continue;
    const impact = def.impacts[config.intensity];

    for (const [key, delta] of Object.entries(impact)) {
      const k = key as keyof CityData;
      if (typeof city[k] === 'number' && typeof delta === 'number') {
        (city[k] as number) = (city[k] as number) + delta;
      }
    }
  }

  // Clamp metrics to realistic bounds
  city.co2PerCapita = clamp(city.co2PerCapita, 0.1, 30);
  city.co2Total = clamp(city.co2Total, 0.1, 400);
  city.renewableEnergy = clamp(city.renewableEnergy, 0, 100);
  city.publicTransit = clamp(city.publicTransit, 0, 100);
  city.airQuality = clamp(city.airQuality, 5, 300);
  city.crimeRate = clamp(city.crimeRate, 2, 500);
  city.infrastructureInvestment = clamp(city.infrastructureInvestment, 0, 50);
  city.publicTrust = clamp(city.publicTrust, 0, 100);
  city.debtRatio = clamp(city.debtRatio, 0, 250);
  city.greenInvestment = clamp(city.greenInvestment, 0, 40);

  return city;
}

function buildYear(year: number, metrics: CityData): SimulationYear {
  const scores = calcAllScores(metrics);
  const warnings: string[] = [];

  if (metrics.debtRatio > 100) warnings.push('Debt Crisis Risk: Debt exceeds GDP');
  else if (metrics.debtRatio > 75) warnings.push('Elevated Debt: Approaching unsustainable levels');

  if (metrics.publicTrust < 25) warnings.push('Public Unrest Risk: Trust index critically low');

  if (metrics.airQuality > 150) warnings.push('Health Emergency: Air quality hazardous');

  if (scores.fiscalStability < 20) warnings.push('Fiscal Collapse Risk: Severe budget stress');

  return { year, metrics, scores, warnings };
}

function calcTotalCost(baseCity: CityData, policies: PolicyConfig[]): number {
  let pct = 0;
  for (const config of policies) {
    const def = getPolicyById(config.id);
    if (!def) continue;
    pct += Math.abs(def.budgetImpactPct[config.intensity]);
  }
  return Number(((pct / 100) * baseCity.annualBudget).toFixed(2));
}

/**
 * Run a multi-year simulation.
 * Each year, policies are applied on top of the previous year's metrics.
 * After a policy's duration expires, its annual incremental effect stops
 * (but the changes already made persist in the metrics).
 */
export function runSimulation(
  baseCity: CityData,
  policies: PolicyConfig[],
  years: number = 10
): SimulationResult {
  const baseline = buildYear(0, baseCity);
  const projections: SimulationYear[] = [];

  let current = { ...baseCity };

  for (let y = 1; y <= years; y++) {
    // Only apply policies that are still within their duration
    const activeThisYear = policies.filter(p => p.duration >= y);

    // Per-year delta is 1/duration of total impact
    const scaledPolicies: PolicyConfig[] = activeThisYear.map(p => p); // same configs but impact applied once per year

    // Build per-year impact (1/duration fraction per year)
    const yearMetrics = { ...current };

    for (const config of activeThisYear) {
      const def = getPolicyById(config.id);
      if (!def) continue;
      const totalImpact = def.impacts[config.intensity];
      const fraction = 1 / config.duration;

      for (const [key, delta] of Object.entries(totalImpact)) {
        const k = key as keyof CityData;
        if (typeof yearMetrics[k] === 'number' && typeof delta === 'number') {
          (yearMetrics[k] as number) = (yearMetrics[k] as number) + delta * fraction;
        }
      }
    }

    // Clamp
    yearMetrics.co2PerCapita = clamp(yearMetrics.co2PerCapita, 0.1, 30);
    yearMetrics.co2Total = clamp(yearMetrics.co2Total, 0.1, 400);
    yearMetrics.renewableEnergy = clamp(yearMetrics.renewableEnergy, 0, 100);
    yearMetrics.publicTransit = clamp(yearMetrics.publicTransit, 0, 100);
    yearMetrics.airQuality = clamp(yearMetrics.airQuality, 5, 300);
    yearMetrics.crimeRate = clamp(yearMetrics.crimeRate, 2, 500);
    yearMetrics.infrastructureInvestment = clamp(yearMetrics.infrastructureInvestment, 0, 50);
    yearMetrics.publicTrust = clamp(yearMetrics.publicTrust, 0, 100);
    yearMetrics.debtRatio = clamp(yearMetrics.debtRatio, 0, 250);
    yearMetrics.greenInvestment = clamp(yearMetrics.greenInvestment, 0, 40);

    current = yearMetrics;
    projections.push(buildYear(y, { ...current }));
  }

  return {
    baseline,
    projections,
    selectedPolicies: policies,
    totalCost: calcTotalCost(baseCity, policies),
  };
}
