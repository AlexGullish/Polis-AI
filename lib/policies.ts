import { PolicyDefinition } from './types';

// baseImpact = delta applied per active year when budgetPerYear == budgetRange.refPerYear
// budgetRange values are in USD millions/year

export const POLICIES: PolicyDefinition[] = [
  // ─── ENERGY (4) ────────────────────────────────────────────────────────────
  {
    id: 'renewable-expansion',
    name: 'Renewable Energy Expansion',
    category: 'energy',
    description: 'Fund large-scale solar, wind, and geothermal projects to displace fossil fuels from the grid.',
    budgetRange: { minPerYear: 50, refPerYear: 400, maxPerYear: 1500 },
    baseImpact: {
      renewableEnergy: 5,
      co2PerCapita: -0.6,
      co2Total: -4,
      debtRatio: 1.5,
      greenInvestment: 1,
    },
  },
  {
    id: 'carbon-tax',
    name: 'Carbon Pricing & Tax',
    category: 'energy',
    description: 'Introduce a carbon price on industrial and commercial emissions, returning revenue to citizens.',
    budgetRange: { minPerYear: 10, refPerYear: 80, maxPerYear: 300 },
    baseImpact: {
      co2PerCapita: -0.4,
      co2Total: -3,
      publicTrust: -3,
      debtRatio: -2, // generates revenue
    },
  },
  {
    id: 'building-retrofit',
    name: 'Building Energy Retrofit',
    category: 'energy',
    description: 'Subsidise insulation, heat pumps, and smart HVAC upgrades across residential and commercial buildings.',
    budgetRange: { minPerYear: 30, refPerYear: 200, maxPerYear: 800 },
    baseImpact: {
      co2PerCapita: -0.3,
      co2Total: -2,
      airQuality: -5,
      publicTrust: 2,
    },
  },
  {
    id: 'nuclear-energy',
    name: 'Nuclear Energy Programme',
    category: 'energy',
    description: 'Invest in next-generation nuclear power plants for reliable low-carbon baseload electricity.',
    budgetRange: { minPerYear: 200, refPerYear: 1200, maxPerYear: 4000 },
    baseImpact: {
      renewableEnergy: 8,
      co2PerCapita: -0.8,
      co2Total: -6,
      debtRatio: 3,
      publicTrust: -2,
    },
  },

  // ─── TRANSPORTATION (4) ────────────────────────────────────────────────────
  {
    id: 'expand-transit',
    name: 'Public Transit Expansion',
    category: 'transportation',
    description: 'Build new metro lines, BRT corridors, and expand bus networks to increase transit mode share.',
    budgetRange: { minPerYear: 80, refPerYear: 500, maxPerYear: 2000 },
    baseImpact: {
      publicTransit: 5,
      co2PerCapita: -0.3,
      co2Total: -2,
      publicTrust: 4,
      debtRatio: 2,
    },
  },
  {
    id: 'congestion-pricing',
    name: 'Congestion Pricing',
    category: 'transportation',
    description: 'Charge vehicles for entering high-density city zones, reinvesting revenue in public transport.',
    budgetRange: { minPerYear: 10, refPerYear: 60, maxPerYear: 200 },
    baseImpact: {
      publicTransit: 3,
      co2PerCapita: -0.2,
      co2Total: -1.5,
      publicTrust: -4,
      debtRatio: -1.5,
    },
  },
  {
    id: 'ev-subsidy',
    name: 'Electric Vehicle Subsidy',
    category: 'transportation',
    description: 'Subsidise EV purchase and charging infrastructure to accelerate fleet electrification.',
    budgetRange: { minPerYear: 20, refPerYear: 150, maxPerYear: 500 },
    baseImpact: {
      co2PerCapita: -0.2,
      co2Total: -1.5,
      airQuality: -6,
      publicTrust: 3,
      debtRatio: 1,
    },
  },
  {
    id: 'cycling-infrastructure',
    name: 'Cycling & Micromobility Network',
    category: 'transportation',
    description: 'Build protected bike lanes, shared e-bike systems, and pedestrian zones across the city.',
    budgetRange: { minPerYear: 10, refPerYear: 80, maxPerYear: 300 },
    baseImpact: {
      publicTransit: 2,
      co2PerCapita: -0.1,
      airQuality: -4,
      publicTrust: 5,
      crimeRate: -3,
    },
  },

  // ─── GOVERNANCE (3) ────────────────────────────────────────────────────────
  {
    id: 'anti-corruption',
    name: 'Anti-Corruption Reform',
    category: 'governance',
    description: 'Strengthen transparency agencies, whistleblower protections, and public procurement audits.',
    budgetRange: { minPerYear: 15, refPerYear: 100, maxPerYear: 350 },
    baseImpact: {
      publicTrust: 6,
      crimeRate: -10,
      infrastructureInvestment: 0.5,
    },
  },
  {
    id: 'infra-modernisation',
    name: 'Infrastructure Modernisation',
    category: 'governance',
    description: 'Upgrade roads, water systems, bridges, and digital backbone through a multi-year capital plan.',
    budgetRange: { minPerYear: 100, refPerYear: 600, maxPerYear: 2500 },
    baseImpact: {
      infrastructureInvestment: 3,
      publicTrust: 4,
      crimeRate: -5,
      debtRatio: 2,
    },
  },
  {
    id: 'open-data-portal',
    name: 'Open Government Data Portal',
    category: 'governance',
    description: 'Publish city datasets and performance metrics in real time, enabling civic oversight and innovation.',
    budgetRange: { minPerYear: 5, refPerYear: 30, maxPerYear: 100 },
    baseImpact: {
      publicTrust: 4,
      greenInvestment: 0.5,
    },
  },

  // ─── HOUSING (4) ───────────────────────────────────────────────────────────
  {
    id: 'social-housing',
    name: 'Social & Affordable Housing',
    category: 'housing',
    description: 'Build or subsidise below-market housing to reduce homelessness and housing cost burden.',
    budgetRange: { minPerYear: 50, refPerYear: 350, maxPerYear: 1500 },
    baseImpact: {
      publicTrust: 5,
      crimeRate: -8,
      housingAffordability: 5,
      debtRatio: 2,
    },
  },
  {
    id: 'rent-control',
    name: 'Rent Stabilisation Policy',
    category: 'housing',
    description: 'Cap annual rent increases and strengthen tenant protections to prevent displacement.',
    budgetRange: { minPerYear: 5, refPerYear: 25, maxPerYear: 80 },
    baseImpact: {
      housingAffordability: 4,
      publicTrust: 3,
    },
  },
  {
    id: 'zoning-reform',
    name: 'Zoning & Density Reform',
    category: 'housing',
    description: 'Upzone transit corridors and allow mixed-use development to increase housing supply.',
    budgetRange: { minPerYear: 10, refPerYear: 60, maxPerYear: 200 },
    baseImpact: {
      housingAffordability: 3,
      publicTransit: 1,
      publicTrust: 2,
    },
  },
  {
    id: 'homelessness-reduction',
    name: 'Homelessness Reduction Programme',
    category: 'housing',
    description: 'Housing-first programmes combined with wraparound services to end chronic homelessness.',
    budgetRange: { minPerYear: 20, refPerYear: 120, maxPerYear: 450 },
    baseImpact: {
      crimeRate: -10,
      publicTrust: 4,
      housingAffordability: 2,
    },
  },

  // ─── HEALTHCARE (3) ────────────────────────────────────────────────────────
  {
    id: 'universal-primary-care',
    name: 'Universal Primary Healthcare',
    category: 'healthcare',
    description: 'Fund community health centres providing free or subsidised primary and preventive care for all residents.',
    budgetRange: { minPerYear: 50, refPerYear: 300, maxPerYear: 1200 },
    baseImpact: {
      publicTrust: 6,
      healthcareAccess: 8,
      crimeRate: -3,
    },
  },
  {
    id: 'mental-health-expansion',
    name: 'Mental Health Services Expansion',
    category: 'healthcare',
    description: 'Increase community mental health clinics, crisis response teams, and telehealth access.',
    budgetRange: { minPerYear: 20, refPerYear: 130, maxPerYear: 500 },
    baseImpact: {
      publicTrust: 4,
      healthcareAccess: 5,
      crimeRate: -6,
    },
  },
  {
    id: 'preventive-screening',
    name: 'Preventive Health Screening',
    category: 'healthcare',
    description: 'Mass screening programmes for chronic disease, vaccination drives, and public health campaigns.',
    budgetRange: { minPerYear: 15, refPerYear: 90, maxPerYear: 350 },
    baseImpact: {
      publicTrust: 3,
      healthcareAccess: 4,
    },
  },

  // ─── EDUCATION (3) ─────────────────────────────────────────────────────────
  {
    id: 'early-childhood-edu',
    name: 'Early Childhood Education',
    category: 'education',
    description: 'Universal pre-K and subsidised childcare to improve long-term outcomes and labour force participation.',
    budgetRange: { minPerYear: 30, refPerYear: 200, maxPerYear: 800 },
    baseImpact: {
      educationIndex: 5,
      publicTrust: 4,
      crimeRate: -4,
    },
  },
  {
    id: 'vocational-training',
    name: 'Vocational & Skills Training',
    category: 'education',
    description: 'Fund trade schools, apprenticeships, and reskilling programmes aligned with local industry needs.',
    budgetRange: { minPerYear: 20, refPerYear: 120, maxPerYear: 500 },
    baseImpact: {
      educationIndex: 4,
      publicTrust: 3,
      infrastructureInvestment: 0.5,
    },
  },
  {
    id: 'digital-literacy',
    name: 'Digital Literacy Initiative',
    category: 'education',
    description: 'Equip residents with digital skills through school programmes and adult learning centres.',
    budgetRange: { minPerYear: 10, refPerYear: 60, maxPerYear: 250 },
    baseImpact: {
      educationIndex: 3,
      digitalConnectivity: 3,
      publicTrust: 2,
    },
  },

  // ─── DIGITAL / SMART CITY (4) ─────────────────────────────────────────────
  {
    id: 'smart-grid',
    name: 'Smart Energy Grid',
    category: 'digital',
    description: 'Upgrade the electricity grid with IoT sensors, demand response, and AI-driven load balancing.',
    budgetRange: { minPerYear: 40, refPerYear: 250, maxPerYear: 1000 },
    baseImpact: {
      renewableEnergy: 3,
      co2PerCapita: -0.2,
      digitalConnectivity: 4,
      infrastructureInvestment: 1,
    },
  },
  {
    id: 'fiber-broadband',
    name: 'Universal Fibre Broadband',
    category: 'digital',
    description: 'Roll out gigabit fibre to all homes and businesses, closing the digital divide.',
    budgetRange: { minPerYear: 30, refPerYear: 200, maxPerYear: 800 },
    baseImpact: {
      digitalConnectivity: 8,
      publicTrust: 3,
      infrastructureInvestment: 1,
      debtRatio: 1,
    },
  },
  {
    id: 'iot-sensors',
    name: 'City-Wide IoT Sensor Network',
    category: 'digital',
    description: 'Deploy environmental, traffic, and utility sensors to enable data-driven urban management.',
    budgetRange: { minPerYear: 15, refPerYear: 80, maxPerYear: 300 },
    baseImpact: {
      airQuality: -3,
      crimeRate: -4,
      digitalConnectivity: 3,
    },
  },
  {
    id: 'digital-gov-services',
    name: 'Digital Government Services',
    category: 'digital',
    description: 'Migrate public services online with single-sign-on portals, e-permits, and automated processing.',
    budgetRange: { minPerYear: 10, refPerYear: 60, maxPerYear: 250 },
    baseImpact: {
      publicTrust: 5,
      digitalConnectivity: 4,
      crimeRate: -2,
    },
  },

  // ─── BUSINESS (3) ──────────────────────────────────────────────────────────
  {
    id: 'startup-grants',
    name: 'Startup & SME Grants',
    category: 'business',
    description: 'Provide grants, co-working spaces, and mentorship programmes to support new businesses.',
    budgetRange: { minPerYear: 15, refPerYear: 100, maxPerYear: 400 },
    baseImpact: {
      publicTrust: 3,
      infrastructureInvestment: 0.5,
      greenInvestment: 0.5,
    },
  },
  {
    id: 'trade-zone',
    name: 'Special Economic & Trade Zone',
    category: 'business',
    description: 'Designate low-regulation, tax-advantaged zones to attract foreign direct investment.',
    budgetRange: { minPerYear: 30, refPerYear: 200, maxPerYear: 800 },
    baseImpact: {
      infrastructureInvestment: 2,
      publicTrust: 2,
      debtRatio: -1,
    },
  },
  {
    id: 'r-and-d-incentives',
    name: 'R&D Tax Incentives',
    category: 'business',
    description: 'Offer tax credits and grants for private-sector research and development investment.',
    budgetRange: { minPerYear: 20, refPerYear: 120, maxPerYear: 500 },
    baseImpact: {
      greenInvestment: 1,
      digitalConnectivity: 2,
      publicTrust: 2,
    },
  },

  // ─── AGRICULTURE (3) ───────────────────────────────────────────────────────
  {
    id: 'urban-farming',
    name: 'Urban Agriculture & Vertical Farms',
    category: 'agriculture',
    description: 'Fund rooftop gardens, community plots, and vertical farm facilities to localise food production.',
    budgetRange: { minPerYear: 10, refPerYear: 60, maxPerYear: 250 },
    baseImpact: {
      co2Total: -0.5,
      airQuality: -4,
      publicTrust: 3,
      greenInvestment: 0.5,
    },
  },
  {
    id: 'food-waste-reduction',
    name: 'Food Waste Reduction Programme',
    category: 'agriculture',
    description: 'Implement smart supply-chain tracking, composting mandates, and surplus food redistribution.',
    budgetRange: { minPerYear: 8, refPerYear: 50, maxPerYear: 200 },
    baseImpact: {
      co2Total: -1,
      co2PerCapita: -0.1,
      publicTrust: 2,
    },
  },
  {
    id: 'sustainable-supply-chain',
    name: 'Sustainable Agricultural Supply Chain',
    category: 'agriculture',
    description: 'Certify and subsidise sustainable farming practices and reduce pesticide and water usage.',
    budgetRange: { minPerYear: 15, refPerYear: 90, maxPerYear: 350 },
    baseImpact: {
      co2Total: -1.5,
      co2PerCapita: -0.15,
      airQuality: -3,
      publicTrust: 2,
    },
  },

  // ─── INDUSTRY (3) ──────────────────────────────────────────────────────────
  {
    id: 'clean-manufacturing',
    name: 'Clean Manufacturing Standards',
    category: 'industry',
    description: 'Enforce and subsidise adoption of clean production technologies in heavy manufacturing.',
    budgetRange: { minPerYear: 40, refPerYear: 250, maxPerYear: 1000 },
    baseImpact: {
      co2Total: -3,
      co2PerCapita: -0.3,
      airQuality: -10,
      publicTrust: 2,
    },
  },
  {
    id: 'industrial-decarbonisation',
    name: 'Industrial Decarbonisation Fund',
    category: 'industry',
    description: 'Co-finance green hydrogen, electrification, and carbon capture in steel, cement, and chemicals.',
    budgetRange: { minPerYear: 100, refPerYear: 700, maxPerYear: 3000 },
    baseImpact: {
      co2Total: -5,
      co2PerCapita: -0.5,
      renewableEnergy: 2,
      debtRatio: 2,
    },
  },
  {
    id: 'circular-economy',
    name: 'Circular Economy Initiative',
    category: 'industry',
    description: 'Promote product design for reuse, extended producer responsibility, and industrial symbiosis.',
    budgetRange: { minPerYear: 15, refPerYear: 100, maxPerYear: 400 },
    baseImpact: {
      co2Total: -1.5,
      airQuality: -4,
      greenInvestment: 1,
      publicTrust: 3,
    },
  },
];

export const POLICY_CATEGORIES: PolicyDefinition['category'][] = [
  'energy',
  'transportation',
  'governance',
  'housing',
  'healthcare',
  'education',
  'digital',
  'business',
  'agriculture',
  'industry',
];

export const CATEGORY_LABELS: Record<PolicyDefinition['category'], string> = {
  energy: 'Energy',
  transportation: 'Transport',
  governance: 'Governance',
  housing: 'Housing',
  healthcare: 'Healthcare',
  education: 'Education',
  digital: 'Digital',
  business: 'Business',
  agriculture: 'Agriculture',
  industry: 'Industry',
};

export function getPolicyById(id: string): PolicyDefinition | undefined {
  return POLICIES.find(p => p.id === id);
}
