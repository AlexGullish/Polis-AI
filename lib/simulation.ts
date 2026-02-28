// NOTE: budgetPerYear in PolicyConfig is in USD millions.
// annualBudget in CityData is in USD billions.
// Convert: budgetPerYear / 1000 gives USD billions for comparison.

import { CityData, PolicyConfig, PolicyDefinition, SimulationResult, SimulationYear } from './types';
import { calcAllScores } from './scoring';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampMetrics(city: CityData): CityData {
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
  if (city.healthcareAccess !== undefined) city.healthcareAccess = clamp(city.healthcareAccess, 0, 100);
  if (city.educationIndex !== undefined) city.educationIndex = clamp(city.educationIndex, 0, 100);
  if (city.housingAffordability !== undefined) city.housingAffordability = clamp(city.housingAffordability, 0, 100);
  if (city.digitalConnectivity !== undefined) city.digitalConnectivity = clamp(city.digitalConnectivity, 0, 100);
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

/**
 * Run a multi-year simulation with budget-based, start/end year policy logic.
 *
 * @param baseCity   — baseline city snapshot
 * @param policies   — user-configured policy set
 * @param policyDefs — full policy definitions (from POLICIES constant)
 * @param years      — number of years to simulate (default 10)
 * @param label      — 'user' or 'ai' (for dual-scenario graph)
 */
export function runSimulation(
  baseCity: CityData,
  policies: PolicyConfig[],
  policyDefs: PolicyDefinition[],
  years: number = 10,
  label: 'user' | 'ai' = 'user'
): SimulationResult {
  const baseline = buildYear(0, baseCity);
  const projections: SimulationYear[] = [];

  let current = { ...baseCity };

  for (let y = 1; y <= years; y++) {
    const yearMetrics = { ...current };

    // Sum of active policy budgets this year (in USD millions)
    let totalActiveBudgetM = 0;

    for (const config of policies) {
      // Only apply if this year falls within the policy's active window
      if (config.startYear > y || config.endYear < y) continue;

      const def = policyDefs.find(d => d.id === config.id);
      if (!def) continue;

      totalActiveBudgetM += config.budgetPerYear;

      // Budget ratio: how much budget vs reference budget (clamped to min/max range)
      const minRatio = def.budgetRange.minPerYear / def.budgetRange.refPerYear;
      const maxRatio = def.budgetRange.maxPerYear / def.budgetRange.refPerYear;
      const budgetRatio = clamp(
        config.budgetPerYear / def.budgetRange.refPerYear,
        minRatio,
        maxRatio
      );

      // Apply scaled impact per year
      for (const [key, baseDelta] of Object.entries(def.baseImpact)) {
        const k = key as keyof CityData;
        if (typeof yearMetrics[k] === 'number' && typeof baseDelta === 'number') {
          (yearMetrics[k] as number) += baseDelta * budgetRatio;
        }
      }
    }

    // Budget overspend penalty: if total active spend > 15% of city annual budget, small debtRatio bump
    // annualBudget is in USD billions; totalActiveBudgetM is USD millions → / 1000 to match
    const budgetSpentFraction = (totalActiveBudgetM / 1000) / baseCity.annualBudget;
    if (budgetSpentFraction > 0.15) {
      yearMetrics.debtRatio += (budgetSpentFraction - 0.15) * 100 * 0.1;
    }

    current = clampMetrics(yearMetrics);
    projections.push(buildYear(y, { ...current }));
  }

  // Total cost per year = sum of all policy budgets active at year 1 (as a snapshot)
  const totalCostPerYear = policies
    .filter(p => p.startYear <= 1 && p.endYear >= 1)
    .reduce((sum, p) => sum + p.budgetPerYear, 0);

  return {
    label,
    baseline,
    projections,
    selectedPolicies: policies,
    totalCostPerYear,
  };
}
