import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIScenarioRequest } from '@/lib/types';
import { POLICIES } from '@/lib/policies';

const client = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY ?? '',
  baseURL: 'https://api.featherless.ai/v1',
});

export async function POST(req: NextRequest) {
  const { cityName, currentData, goal, simulationYears }: AIScenarioRequest = await req.json();

  const policyList = POLICIES.map(p =>
    `- id="${p.id}" name="${p.name}" category=${p.category} budgetRange=$${p.budgetRange.minPerYear}M-$${p.budgetRange.maxPerYear}M/yr (ref $${p.budgetRange.refPerYear}M)`
  ).join('\n');

  const prompt = `You are an urban policy advisor for ${cityName}. A city planner wants to achieve: "${goal}" within ${simulationYears} years.

Current city data:
- CO2/capita: ${currentData.co2PerCapita} t/yr
- Renewable energy: ${currentData.renewableEnergy}%
- Public transit: ${currentData.publicTransit}%
- Air quality AQI: ${currentData.airQuality}
- Public trust: ${currentData.publicTrust}/100
- Debt ratio: ${currentData.debtRatio}% of GDP

Available policies:
${policyList}

Respond with a JSON object in this EXACT format (no other text):
{
  "reasoning": "1-2 sentence explanation",
  "policies": [
    {"id": "policy-id-here", "startYear": 1, "endYear": ${simulationYears}, "budgetPerYear": 300},
    {"id": "policy-id-here", "startYear": 1, "endYear": ${simulationYears}, "budgetPerYear": 150}
  ]
}

Rules:
- Only use IDs from the available policies list above
- Choose 3-5 policies that directly address the goal
- startYear >= 1, endYear <= ${simulationYears}, budgetPerYear within each policy's stated range
- Do not include any text outside the JSON object`;

  try {
    const completion = await client.chat.completions.create({
      model: 'zai-org/GLM-5',
      max_tokens: 2000,
      stream: false,
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only API. Respond with a single valid JSON object. No markdown, no code fences, no explanation outside the JSON.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const raw = (completion.choices[0]?.message?.content ?? '').trim();
    console.log('[ai-scenario] Raw response (%d chars):', raw.length, raw);

    // Strip markdown fences if present
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    // Extract first JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[ai-scenario] No JSON object found in:', cleaned);
      return NextResponse.json({ error: 'No JSON in response', raw: cleaned }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log('[ai-scenario] Parsed policies:', JSON.stringify(parsed.policies));

    // Validate and clamp policies
    const validPolicies = (parsed.policies ?? [])
      .filter((p: { id: string }) => POLICIES.some(def => def.id === p.id))
      .map((p: { id: string; startYear?: number; endYear?: number; budgetPerYear?: number }) => {
        const def = POLICIES.find(d => d.id === p.id)!;
        return {
          id: p.id,
          startYear: Math.max(1, Math.round(Number(p.startYear) || 1)),
          endYear: Math.min(simulationYears, Math.max(1, Math.round(Number(p.endYear) || simulationYears))),
          budgetPerYear: Math.max(
            def.budgetRange.minPerYear,
            Math.min(def.budgetRange.maxPerYear, Number(p.budgetPerYear) || def.budgetRange.refPerYear)
          ),
        };
      });

    return NextResponse.json({
      reasoning: parsed.reasoning ?? '',
      policies: validPolicies,
    });
  } catch (e) {
    console.error('[ai-scenario] Error:', e);
    return NextResponse.json({ error: 'Failed to generate scenario' }, { status: 500 });
  }
}
