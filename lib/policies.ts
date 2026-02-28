import { PolicyDefinition } from './types';

export const POLICIES: PolicyDefinition[] = [
  // ── Energy Policies ──────────────────────────────────────────────────────
  {
    id: 'renewable-expansion',
    name: 'Renewable Investment Expansion',
    category: 'energy',
    description:
      'Fund large-scale solar and wind projects to replace fossil-fuel generation.',
    costLevel: 'High',
    budgetImpactPct: { low: 2, medium: 4, high: 7 },
    impacts: {
      low: { renewableEnergy: 5, co2PerCapita: -0.3, co2Total: -2, debtRatio: 2 },
      medium: { renewableEnergy: 12, co2PerCapita: -0.7, co2Total: -5, debtRatio: 5 },
      high: { renewableEnergy: 22, co2PerCapita: -1.4, co2Total: -10, debtRatio: 10 },
    },
  },
  {
    id: 'carbon-tax',
    name: 'Carbon Tax Implementation',
    category: 'energy',
    description:
      'Price carbon emissions to incentivise industry and households to cut pollution.',
    costLevel: 'Low',
    budgetImpactPct: { low: -1, medium: -2, high: -3 }, // negative = revenue
    impacts: {
      low: {
        co2PerCapita: -0.2,
        co2Total: -1.5,
        renewableEnergy: 2,
        publicTrust: -3,
        debtRatio: -1,
      },
      medium: {
        co2PerCapita: -0.5,
        co2Total: -4,
        renewableEnergy: 5,
        publicTrust: -6,
        debtRatio: -2,
      },
      high: {
        co2PerCapita: -1.0,
        co2Total: -8,
        renewableEnergy: 10,
        publicTrust: -12,
        debtRatio: -4,
      },
    },
  },
  {
    id: 'building-retrofit',
    name: 'Building Efficiency Retrofit',
    category: 'energy',
    description:
      'Subsidise insulation, smart HVAC, and solar panels on commercial and residential buildings.',
    costLevel: 'Medium',
    budgetImpactPct: { low: 1, medium: 2.5, high: 4 },
    impacts: {
      low: { co2PerCapita: -0.15, co2Total: -1, airQuality: -4, debtRatio: 1 },
      medium: { co2PerCapita: -0.35, co2Total: -2.5, airQuality: -8, debtRatio: 3 },
      high: { co2PerCapita: -0.7, co2Total: -5, airQuality: -14, debtRatio: 5 },
    },
  },

  // ── Transportation Policies ───────────────────────────────────────────────
  {
    id: 'expand-transit',
    name: 'Expand Public Transit',
    category: 'transportation',
    description:
      'Build new metro/bus rapid transit lines and increase service frequency.',
    costLevel: 'High',
    budgetImpactPct: { low: 2, medium: 4, high: 8 },
    impacts: {
      low: {
        publicTransit: 5,
        co2PerCapita: -0.2,
        airQuality: -5,
        publicTrust: 3,
        debtRatio: 3,
      },
      medium: {
        publicTransit: 12,
        co2PerCapita: -0.5,
        airQuality: -10,
        publicTrust: 6,
        debtRatio: 6,
      },
      high: {
        publicTransit: 22,
        co2PerCapita: -1.0,
        airQuality: -18,
        publicTrust: 10,
        debtRatio: 12,
      },
    },
  },
  {
    id: 'congestion-pricing',
    name: 'Congestion Pricing',
    category: 'transportation',
    description:
      'Charge fees for driving in high-traffic zones to fund transit and reduce emissions.',
    costLevel: 'Low',
    budgetImpactPct: { low: -1, medium: -2, high: -3 },
    impacts: {
      low: {
        publicTransit: 3,
        co2PerCapita: -0.1,
        airQuality: -3,
        publicTrust: -4,
        debtRatio: -1,
      },
      medium: {
        publicTransit: 7,
        co2PerCapita: -0.3,
        airQuality: -8,
        publicTrust: -8,
        debtRatio: -2,
      },
      high: {
        publicTransit: 14,
        co2PerCapita: -0.6,
        airQuality: -14,
        publicTrust: -14,
        debtRatio: -4,
      },
    },
  },
  {
    id: 'ev-subsidy',
    name: 'EV Subsidy Program',
    category: 'transportation',
    description:
      'Subsidise electric vehicle purchases and build out charging infrastructure.',
    costLevel: 'Medium',
    budgetImpactPct: { low: 1, medium: 2, high: 3.5 },
    impacts: {
      low: { co2PerCapita: -0.1, airQuality: -4, publicTrust: 2, debtRatio: 1 },
      medium: { co2PerCapita: -0.25, airQuality: -9, publicTrust: 4, debtRatio: 2.5 },
      high: { co2PerCapita: -0.5, airQuality: -16, publicTrust: 7, debtRatio: 4 },
    },
  },

  // ── Governance Policies ───────────────────────────────────────────────────
  {
    id: 'anti-corruption',
    name: 'Transparency & Anti-Corruption',
    category: 'governance',
    description:
      'Invest in independent oversight bodies, open-data portals, and judicial reform.',
    costLevel: 'Medium',
    budgetImpactPct: { low: 1, medium: 2, high: 3 },
    impacts: {
      low: { publicTrust: 5, crimeRate: -8, infrastructureInvestment: 1, debtRatio: 0.5 },
      medium: { publicTrust: 11, crimeRate: -18, infrastructureInvestment: 2, debtRatio: 1 },
      high: { publicTrust: 18, crimeRate: -30, infrastructureInvestment: 3, debtRatio: 2 },
    },
  },
  {
    id: 'infra-modernisation',
    name: 'Infrastructure Modernisation',
    category: 'governance',
    description:
      'Upgrade roads, water systems, digital networks, and public facilities.',
    costLevel: 'High',
    budgetImpactPct: { low: 2, medium: 5, high: 9 },
    impacts: {
      low: {
        infrastructureInvestment: 3,
        publicTrust: 4,
        crimeRate: -5,
        debtRatio: 3,
      },
      medium: {
        infrastructureInvestment: 7,
        publicTrust: 8,
        crimeRate: -10,
        debtRatio: 7,
      },
      high: {
        infrastructureInvestment: 14,
        publicTrust: 14,
        crimeRate: -18,
        debtRatio: 14,
      },
    },
  },
];

export function getPolicyById(id: string): PolicyDefinition | undefined {
  return POLICIES.find(p => p.id === id);
}
