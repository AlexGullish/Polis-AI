import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CompanyProfile, PolicyCategory } from '@/lib/types';

const client = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY ?? '',
  baseURL: 'https://api.featherless.ai/v1',
});

interface CompaniesRequest {
  cityId: string;
  cityName: string;
  policyId: string;
  policyName: string;
  category: PolicyCategory;
}

export async function POST(req: NextRequest) {
  const { cityName, policyId, policyName, category }: CompaniesRequest = await req.json();

  const prompt = `You are a public procurement advisor for ${cityName}.

List exactly 5 real companies that could implement a "${policyName}" programme in ${cityName}.
Include a mix of local/national and international companies where relevant.
For each company, assess:
- costEfficiency: how much impact they deliver per dollar (0.7 = inefficient, 1.0 = average, 1.3 = highly efficient)
- riskFactor: "low", "medium", or "high" based on track record, financial stability, and project complexity
- isLocal: true if the company is headquartered in the same country as ${cityName}

Respond with ONLY a JSON array (no explanation, no markdown):
[
  {
    "id": "slug-name",
    "name": "Company Full Name",
    "costEfficiency": 1.0,
    "riskFactor": "low",
    "description": "One sentence about their specialisation and why they fit this project.",
    "isLocal": true
  }
]

Category context: ${category} policy in ${cityName}.`;

  try {
    const completion = await client.chat.completions.create({
      model: 'zai-org/GLM-5',
      max_tokens: 800,
      messages: [
        { role: 'system', content: 'You are a JSON-only API. Respond with a raw JSON array and nothing else.' },
        { role: 'user', content: prompt },
      ],
    });

    const text = completion.choices[0].message.content ?? '';
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const arrayMatch = stripped.match(/\[[\s\S]*\]/);
    if (!arrayMatch) throw new Error('No JSON array in response');

    const companies: CompanyProfile[] = JSON.parse(arrayMatch[0]);

    // Validate and sanitise
    const validated = companies.slice(0, 6).map((c, i) => ({
      id: c.id || `company-${policyId}-${i}`,
      name: c.name || 'Unknown Company',
      costEfficiency: Math.max(0.5, Math.min(1.5, Number(c.costEfficiency) || 1.0)),
      riskFactor: (['low', 'medium', 'high'].includes(c.riskFactor) ? c.riskFactor : 'medium') as CompanyProfile['riskFactor'],
      description: c.description || '',
      isLocal: Boolean(c.isLocal),
    }));

    return NextResponse.json({ companies: validated });
  } catch (e) {
    console.error('Companies API error:', e);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}
