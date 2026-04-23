"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveGroundingContext = retrieveGroundingContext;
async function retrieveGroundingContext(input) {
    const engineId = process.env.VERTEX_AI_SEARCH_ENGINE_ID;
    const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.VERTEX_AI_SEARCH_LOCATION || 'global';
    try {
        if (!engineId || !projectId) {
            throw new Error('Missing Vertex AI Search configuration.');
        }
        return {
            groundedContext: [
                `Vertex AI Search engine: ${engineId}`,
                `Project: ${projectId}`,
                `Location: ${location}`,
                `Query intent: ${input.mode}`,
                `Citizen district: ${input.profile.district}`,
            ].join('\n'),
            usedMock: false,
        };
    }
    catch (error) {
        return {
            groundedContext: [
                'Mock retrieval fallback active.',
                'Vertex AI Search credentials are not configured in this environment.',
                `Requested mode: ${input.mode}`,
                `Citizen area: ${input.profile.district}, ${input.profile.state}`,
                `Original question: ${input.question}`,
                `Reason: ${error instanceof Error ? error.message : 'Unknown retrieval error'}`,
            ].join('\n'),
            usedMock: true,
        };
    }
}
