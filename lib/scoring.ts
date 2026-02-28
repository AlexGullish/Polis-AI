import { CityData, PillarScores } from './types';

// Normalize a value between 0-100, where higher rawValue = higher score
function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

// Normalize inversely: lower rawValue = higher score
function normalizeInverse(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((max - value) / (max - min)) * 100));
}

export function calcSustainabilityScore(city: CityData): number {
  // CO₂ per capita: 0-20 t/person, lower is better
  const co2Score = normalizeInverse(city.co2PerCapita, 0, 20) * 0.30;
  // Renewable energy %: 0-100%, higher is better
  const renewScore = normalize(city.renewableEnergy, 0, 100) * 0.25;
  // Public transit %: 0-100%, higher is better
  const transitScore = normalize(city.publicTransit, 0, 100) * 0.15;
  // Air quality AQI: 0-200, lower is better
  const airScore = normalizeInverse(city.airQuality, 0, 200) * 0.15;
  // Green infra investment %: 0-25%, higher is better
  const greenScore = normalize(city.greenInvestment, 0, 25) * 0.15;

  return Math.round(co2Score + renewScore + transitScore + airScore + greenScore);
}

export function calcGovernanceScore(city: CityData): number {
  // Crime rate per 100k: 0-300, lower is better
  const crimeScore = normalizeInverse(city.crimeRate, 0, 300) * 0.30;
  // Public trust: 0-100, higher is better
  const trustScore = normalize(city.publicTrust, 0, 100) * 0.25;
  // Infrastructure investment %: 0-30%, higher is better
  const infraScore = normalize(city.infrastructureInvestment, 0, 30) * 0.20;
  // Budget stability (inverse debt ratio): 0-150%, lower is better
  const debtScore = normalizeInverse(city.debtRatio, 0, 150) * 0.15;
  // Transparency proxy (green invest as surrogate): 0-25%
  const transparencyScore = normalize(city.greenInvestment, 0, 25) * 0.10;

  return Math.round(crimeScore + trustScore + infraScore + debtScore + transparencyScore);
}

export function calcFiscalStability(city: CityData): number {
  // Debt ratio: lower is better
  const debtScore = normalizeInverse(city.debtRatio, 0, 150) * 0.40;
  // Infrastructure investment: signals long-term fiscal health
  const infraScore = normalize(city.infrastructureInvestment, 0, 30) * 0.30;
  // Budget relative to GDP (annualBudget / gdp * 100): 5-40%
  const budgetRatio = (city.annualBudget / city.gdp) * 100;
  const budgetScore = normalize(budgetRatio, 5, 40) * 0.30;

  return Math.round(debtScore + infraScore + budgetScore);
}

export function calcPublicApproval(city: CityData): number {
  // Public trust is the primary driver
  const trustScore = normalize(city.publicTrust, 0, 100) * 0.40;
  // Crime rate inversely affects approval
  const crimeScore = normalizeInverse(city.crimeRate, 0, 300) * 0.25;
  // Air quality inversely (lower AQI = happier residents)
  const airScore = normalizeInverse(city.airQuality, 0, 200) * 0.20;
  // Transit availability
  const transitScore = normalize(city.publicTransit, 0, 100) * 0.15;

  return Math.round(trustScore + crimeScore + airScore + transitScore);
}

export function calcAllScores(city: CityData): PillarScores {
  return {
    sustainability: calcSustainabilityScore(city),
    governance: calcGovernanceScore(city),
    fiscalStability: calcFiscalStability(city),
    publicApproval: calcPublicApproval(city),
  };
}

export const SCORE_FORMULAS = {
  sustainability: [
    { label: 'CO₂ per capita (inverted)', weight: '30%' },
    { label: 'Renewable energy %', weight: '25%' },
    { label: 'Public transit usage %', weight: '15%' },
    { label: 'Air quality index (inverted)', weight: '15%' },
    { label: 'Green infrastructure investment %', weight: '15%' },
  ],
  governance: [
    { label: 'Crime rate (inverted)', weight: '30%' },
    { label: 'Public trust index', weight: '25%' },
    { label: 'Infrastructure investment %', weight: '20%' },
    { label: 'Debt ratio (inverted)', weight: '15%' },
    { label: 'Transparency proxy', weight: '10%' },
  ],
  fiscalStability: [
    { label: 'Debt ratio (inverted)', weight: '40%' },
    { label: 'Infrastructure investment %', weight: '30%' },
    { label: 'Budget-to-GDP ratio', weight: '30%' },
  ],
  publicApproval: [
    { label: 'Public trust index', weight: '40%' },
    { label: 'Crime rate (inverted)', weight: '25%' },
    { label: 'Air quality (inverted)', weight: '20%' },
    { label: 'Transit availability', weight: '15%' },
  ],
};
