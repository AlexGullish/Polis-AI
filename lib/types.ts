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
  // Optional fields added by live refresh
  healthcareAccess?: number; // 0-100, higher is better
  educationIndex?: number; // 0-100, higher is better
  housingAffordability?: number; // 0-100, higher is better
  digitalConnectivity?: number; // 0-100, higher is better
}

export interface PillarScores {
  sustainability: number;
  governance: number;
  fiscalStability: number;
  publicApproval: number;
}

// --- Policy types ---

export type PolicyCategory =
  | 'energy'
  | 'transportation'
  | 'governance'
  | 'housing'
  | 'healthcare'
  | 'education'
  | 'digital'
  | 'business'
  | 'agriculture'
  | 'industry';

export interface PolicyBudgetRange {
  minPerYear: number; // USD millions — floor for any effect
  refPerYear: number; // USD millions — reference budget giving baseImpact exactly
  maxPerYear: number; // USD millions — ceiling; spending above this is wasted
}

export interface PolicyDefinition {
  id: string;
  name: string;
  category: PolicyCategory;
  description: string;
  budgetRange: PolicyBudgetRange;
  // baseImpact is the delta applied per simulated year when budgetPerYear == refPerYear
  baseImpact: Partial<CityData>;
}

export interface PolicyConfig {
  id: string;
  startYear: number; // 1-based; first year policy is active
  endYear: number; // inclusive; last year policy is active
  budgetPerYear: number; // USD millions per year
}

// --- AI Scenario types ---

export interface AIScenarioRequest {
  cityId: string;
  cityName: string;
  currentData: CityData;
  goal: string;
  simulationYears: number;
}

// --- Simulation types ---

export interface SimulationYear {
  year: number;
  metrics: CityData;
  scores: PillarScores;
  warnings: string[];
}

export interface SimulationResult {
  label: 'user' | 'ai';
  baseline: SimulationYear;
  projections: SimulationYear[];
  selectedPolicies: PolicyConfig[];
  totalCostPerYear: number; // USD millions/yr (sum of active policy budgets)
}
