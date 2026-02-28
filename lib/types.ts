export interface CityData {
  id: string;
  name: string;
  country: string;
  population: number; // millions
  gdp: number; // billion USD
  annualBudget: number; // billion USD
  co2Total: number; // million tonnes/year
  co2PerCapita: number; // tonnes/person/year
  renewableEnergy: number; // percentage 0-100
  publicTransit: number; // percentage of commuters using transit 0-100
  airQuality: number; // AQI 0-500 (lower is better)
  crimeRate: number; // per 100k residents
  infrastructureInvestment: number; // % of budget
  publicTrust: number; // index 0-100
  debtRatio: number; // debt as % of GDP
  greenInvestment: number; // % of budget on green infra
}

export interface PillarScores {
  sustainability: number;
  governance: number;
  fiscalStability: number;
  publicApproval: number;
}

export type PolicyIntensity = 'low' | 'medium' | 'high';

export interface PolicyConfig {
  id: string;
  intensity: PolicyIntensity;
  duration: number; // years 1-5
}

export interface PolicyDefinition {
  id: string;
  name: string;
  category: 'energy' | 'transportation' | 'governance';
  description: string;
  costLevel: 'Low' | 'Medium' | 'High';
  budgetImpactPct: Record<PolicyIntensity, number>; // % of budget consumed
  impacts: Record<PolicyIntensity, Partial<CityData>>;
}

export interface SimulationYear {
  year: number;
  metrics: CityData;
  scores: PillarScores;
  warnings: string[];
}

export interface SimulationResult {
  baseline: SimulationYear;
  projections: SimulationYear[];
  selectedPolicies: PolicyConfig[];
  totalCost: number; // billion USD
}
