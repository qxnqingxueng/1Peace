"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.policyBrainFlow = void 0;
const genkit_1 = require("genkit");
const googleai_1 = require("@genkit-ai/googleai");
const vertexSearch_js_1 = require("../lib/vertexSearch.js");
const requestSchema = genkit_1.z.object({
    mode: genkit_1.z.enum(['impact', 'translator', 'geospatial']),
    question: genkit_1.z.string().min(1),
    profile: genkit_1.z.object({
        incomeGroup: genkit_1.z.string(),
        householdType: genkit_1.z.string(),
        state: genkit_1.z.string(),
        district: genkit_1.z.string(),
        transport: genkit_1.z.string(),
        employmentStatus: genkit_1.z.string().optional(),
        monthlyIncome: genkit_1.z.string().optional(),
        monthlyCommuteSpend: genkit_1.z.string().optional(),
        monthlyUtilityBill: genkit_1.z.string().optional(),
        kwspBalance: genkit_1.z.string().optional(),
        dependants: genkit_1.z.string().optional(),
        housingStatus: genkit_1.z.string().optional(),
    }),
    geospatialPayload: genkit_1.z
        .object({
        areaName: genkit_1.z.string(),
        radiusKm: genkit_1.z.number(),
        focus: genkit_1.z.string(),
        scenarioLabel: genkit_1.z.string(),
        selectedDay: genkit_1.z.number(),
        focusUnit: genkit_1.z.object({
            label: genkit_1.z.string(),
            sectorLabel: genkit_1.z.string(),
            distanceKm: genkit_1.z.number(),
        }),
        selectedDaySnapshot: genkit_1.z.object({
            impact: genkit_1.z.number(),
            stateLabel: genkit_1.z.string(),
        }),
        topLinkedUnits: genkit_1.z.array(genkit_1.z.object({
            label: genkit_1.z.string(),
            sectorLabel: genkit_1.z.string(),
            distanceKm: genkit_1.z.number(),
        })),
    })
        .nullable()
        .optional(),
});
const responseSchema = genkit_1.z.object({
    content: genkit_1.z.string(),
    grounded: genkit_1.z.boolean(),
    source: genkit_1.z.enum(['genkit', 'mock']),
});
const ai = (0, genkit_1.genkit)({
    plugins: [
        (0, googleai_1.googleAI)({
            apiKey: process.env.GEMINI_API_KEY,
        }),
    ],
});
function selectModel(mode) {
    return mode === 'translator' ? 'googleai/gemini-2.0-pro' : 'googleai/gemini-2.0-flash';
}
function buildPrompt(input, groundingContext) {
    const baseContext = [
        'You are 1Peace running inside Firebase Genkit.',
        'Keep output grounded, concise, and operational.',
        `Mode: ${input.mode}`,
        `Question: ${input.question}`,
        `Citizen context: ${input.profile.incomeGroup}, ${input.profile.householdType}, ${input.profile.district}, ${input.profile.state}, transport ${input.profile.transport}`,
        `Grounding context:\n${groundingContext}`,
    ];
    if (input.mode === 'geospatial' && input.geospatialPayload) {
        baseContext.push(`Geospatial area: ${input.geospatialPayload.areaName}`, `Radius: ${input.geospatialPayload.radiusKm}km`, `Focus unit: ${input.geospatialPayload.focusUnit.label}`, `Scenario: ${input.geospatialPayload.scenarioLabel}`);
    }
    return `${baseContext.join('\n')}\nReturn a markdown answer suitable for the React client.`;
}
function buildMockResponse(input, grounded) {
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
exports.policyBrainFlow = ai.defineFlow({
    name: 'policyBrainFlow',
    inputSchema: requestSchema,
    outputSchema: responseSchema,
}, async (input) => {
    const retrieval = await (0, vertexSearch_js_1.retrieveGroundingContext)(input);
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
            source: 'genkit',
        };
    }
    catch {
        return buildMockResponse(input, !retrieval.usedMock);
    }
});
