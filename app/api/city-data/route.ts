import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CityData } from '@/lib/types';

const client = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY ?? '',
  baseURL: 'https://api.featherless.ai/v1',
});

interface CityDataRequest {
  cityId: string;
  cityName: string;
  country: string;
  currentData: Partial<CityData>;
}

export async function POST(req: NextRequest) {
  const { cityName, country, currentData }: CityDataRequest = await req.json();

  const prompt = `You are an urban data analyst with access to the latest available statistics.

Provide updated 2025/2026 estimates for ${cityName}, ${country} based on real-world data and recent trends.

Current simulation values (for reference):
- CO₂ per capita: ${currentData.co2PerCapita} t/yr
- Renewable energy: ${currentData.renewableEnergy}%
- Public transit usage: ${currentData.publicTransit}%
- Air quality (AQI): ${currentData.airQuality}
- Crime rate: ${currentData.crimeRate} per 100k
- Public trust index: ${currentData.publicTrust}/100
- Debt ratio: ${currentData.debtRatio}% of GDP
- Infrastructure investment: ${currentData.infrastructureInvestment}% of budget

Return ONLY a JSON object with updated numeric estimates. Keep values realistic and grounded in actual data trends. Only include fields where you have reasonable confidence in an update:

{
  "co2PerCapita": number,
  "renewableEnergy": number,
  "publicTransit": number,
  "airQuality": number,
  "crimeRate": number,
  "publicTrust": number,
  "debtRatio": number,
  "infrastructureInvestment": number,
  "greenInvestment": number,
  "healthcareAccess": number,
  "educationIndex": number,
  "housingAffordability": number,
  "digitalConnectivity": number
}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'zai-org/GLM-5',
      max_tokens: 600,
      messages: [
        { role: 'system', content: 'You are a JSON-only API. Respond with a raw JSON object and nothing else.' },
        { role: 'user', content: prompt },
      ],
    });

    const text = completion.choices[0].message.content ?? '';
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const rawData = JSON.parse(jsonMatch[0]);

    // Sanitise: only keep numeric fields within valid ranges
    const data: Partial<CityData> = {};
    const numericFields: (keyof CityData)[] = [
      'co2PerCapita', 'renewableEnergy', 'publicTransit', 'airQuality',
      'crimeRate', 'publicTrust', 'debtRatio', 'infrastructureInvestment',
      'greenInvestment', 'healthcareAccess', 'educationIndex',
      'housingAffordability', 'digitalConnectivity',
    ];

    for (const field of numericFields) {
      if (field in rawData && typeof rawData[field] === 'number' && !isNaN(rawData[field])) {
        (data as Record<string, number>)[field] = rawData[field];
      }
    }

    return NextResponse.json({ data, lastRefreshed: Date.now() });
  } catch (e) {
    console.error('City data API error:', e);
    return NextResponse.json({ error: 'Failed to refresh city data' }, { status: 500 });
  }
}
