import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { retrieveGroundingContext } from '../lib/vertexSearch.js';
import type { PolicyBrainRequest, PolicyBrainResponse } from '../types.js';

const requestSchema = z.object({
  mode: z.enum(['impact', 'translator', 'geospatial']),
  question: z.string().min(1),
  profile: z.object({
    incomeGroup: z.string(),
    householdType: z.string(),
    state: z.string(),
    district: z.string(),
    transport: z.string(),
    employmentStatus: z.string().optional(),
    monthlyIncome: z.string().optional(),
    monthlyCommuteSpend: z.string().optional(),
    monthlyUtilityBill: z.string().optional(),
    kwspBalance: z.string().optional(),
    dependants: z.string().optional(),
    housingStatus: z.string().optional(),
  }),
  geospatialPayload: z
    .object({
      areaName: z.string(),
      radiusKm: z.number(),
      focus: z.string(),
      scenarioLabel: z.string(),
      selectedDay: z.number(),
      focusUnit: z.object({
        label: z.string(),
        sectorLabel: z.string(),
        distanceKm: z.number(),
      }),
      selectedDaySnapshot: z.object({
        impact: z.number(),
        stateLabel: z.string(),
      }),
      topLinkedUnits: z.array(
        z.object({
          label: z.string(),
          sectorLabel: z.string(),
          distanceKm: z.number(),
        }),
      ),
    })
    .nullable()
    .optional(),
});

const responseSchema = z.object({
  content: z.string(),
  grounded: z.boolean(),
  source: z.enum(['genkit', 'mock']),
});

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

function selectModel(mode: PolicyBrainRequest['mode']) {
  return mode === 'translator' ? 'googleai/gemini-2.0-pro' : 'googleai/gemini-2.0-flash';
}

function buildPrompt(input: PolicyBrainRequest, groundingContext: string) {
  const baseContext = [
    'You are 1Peace running inside Firebase Genkit.',
    'Keep output grounded, concise, and operational.',
    `Mode: ${input.mode}`,
    `Question: ${input.question}`,
    `Citizen context: ${input.profile.incomeGroup}, ${input.profile.householdType}, ${input.profile.district}, ${input.profile.state}, transport ${input.profile.transport}`,
    `Grounding context:\n${groundingContext}`,
  ];

  if (input.mode === 'geospatial' && input.geospatialPayload) {
    baseContext.push(
      `Geospatial area: ${input.geospatialPayload.areaName}`,
      `Radius: ${input.geospatialPayload.radiusKm}km`,
      `Focus unit: ${input.geospatialPayload.focusUnit.label}`,
      `Scenario: ${input.geospatialPayload.scenarioLabel}`,
    );
  }

  return `${baseContext.join('\n')}\nReturn a markdown answer suitable for the React client.`;
}

function buildMockResponse(input: PolicyBrainRequest, grounded: boolean): PolicyBrainResponse {
  return {
    content: [
      `## ${input.mode === 'translator' ? 'Plain-Language Summary' : input.mode === 'geospatial' ? 'Area Overview' : 'Personalized Monthly Impact'}`,
      'Mock backend response returned.',
      'Firebase Genkit is scaffolded, but this environment is missing cloud credentials or packages.',
      `Question: ${input.question}`,
    ].join('\n'),
    grounded,
    source: 'mock',
  };
}

export const policyBrainFlow = ai.defineFlow(
  {
    name: 'policyBrainFlow',
    inputSchema: requestSchema,
    outputSchema: responseSchema,
  },
  async (input) => {
    const retrieval = await retrieveGroundingContext(input);

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Missing GEMINI_API_KEY.');
      }

      const response = await ai.generate({
        model: selectModel(input.mode),
        prompt: buildPrompt(input, retrieval.groundedContext),
      });

      return {
        content: response.text,
        grounded: !retrieval.usedMock,
        source: 'genkit' as const,
      };
    } catch {
      return buildMockResponse(input, !retrieval.usedMock);
    }
  },
);
