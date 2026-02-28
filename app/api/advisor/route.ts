import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SimulationResult } from '@/lib/types';
import { POLICIES } from '@/lib/policies';

const client = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY ?? '',
  baseURL: 'https://api.featherless.ai/v1',
});

export async function POST(req: NextRequest) {
  const { result, cityName }: { result: SimulationResult; cityName: string } = await req.json();

  const baseline = result.baseline;
  const final = result.projections[result.projections.length - 1];
  const horizon = result.projections.length;

  const policyDetails = result.selectedPolicies.map(sp => {
    const def = POLICIES.find(p => p.id === sp.id);
    return `${def?.name} (${sp.intensity} intensity, ${sp.duration}-year duration)`;
  });

  const scoreDelta = (key: keyof typeof baseline.scores) =>
    `${baseline.scores[key]} → ${final.scores[key]} (${final.scores[key] - baseline.scores[key] >= 0 ? '+' : ''}${final.scores[key] - baseline.scores[key]})`;

  const prompt = `You are a senior urban policy advisor analysing a simulation for ${cityName}.

## Simulation Context
- Projection horizon: ${horizon} years
- Selected policies: ${policyDetails.length > 0 ? policyDetails.join(', ') : 'None'}
- Estimated annual policy cost: $${result.totalCost.toFixed(1)}B

## Pillar Score Changes (Baseline → Final)
- 🌱 Sustainability: ${scoreDelta('sustainability')}
- 🏛 Governance: ${scoreDelta('governance')}
- 💰 Fiscal Stability: ${scoreDelta('fiscalStability')}
- 🙂 Public Approval: ${scoreDelta('publicApproval')}

## Key Metric Changes
- CO₂/capita: ${baseline.metrics.co2PerCapita.toFixed(1)} → ${final.metrics.co2PerCapita.toFixed(1)} t/yr
- Renewable energy: ${baseline.metrics.renewableEnergy}% → ${final.metrics.renewableEnergy.toFixed(0)}%
- Public transit: ${baseline.metrics.publicTransit}% → ${final.metrics.publicTransit.toFixed(0)}%
- Public trust: ${baseline.metrics.publicTrust} → ${final.metrics.publicTrust.toFixed(0)}/100
- Debt ratio: ${baseline.metrics.debtRatio}% → ${final.metrics.debtRatio.toFixed(0)}% of GDP
- Air quality (AQI): ${baseline.metrics.airQuality} → ${final.metrics.airQuality.toFixed(0)}

## Warnings Triggered
${result.projections.flatMap(y => y.warnings).length > 0
  ? [...new Set(result.projections.flatMap(y => y.warnings))].join('\n')
  : 'None'}

Provide your analysis as a JSON object with this exact structure:
{
  "summary": "2-3 sentence executive summary of the policy package and its overall effect",
  "tradeoffs": ["tradeoff 1", "tradeoff 2", "tradeoff 3"],
  "risks": ["risk 1", "risk 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}

Be specific, data-driven, and reference the actual numbers. Keep each bullet to 1-2 sentences.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'zai-org/GLM-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = completion.choices[0].message.content ?? '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const advisory = JSON.parse(jsonMatch[0]);
    return NextResponse.json(advisory);
  } catch (e) {
    console.error('Advisor error:', e);
    return NextResponse.json({ error: 'Failed to generate advisory' }, { status: 500 });
  }
}
