import { onCall } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { policyBrainFlow } from './flows/policyBrainFlow.js';
import { fetchMalaysiaNews } from './news/fetchMalaysiaNews.js';
import type { PolicyBrainRequest } from './types.js';

initializeApp();

export const runPolicyBrainFlow = onCall(
  {
    cors: true,
    region: process.env.FUNCTIONS_REGION || 'asia-southeast1',
  },
  async (request) => {
    const payload = request.data as PolicyBrainRequest;
    return policyBrainFlow(payload);
  },
);

export const getMalaysiaNews = onCall(
  {
    cors: true,
    region: process.env.FUNCTIONS_REGION || 'asia-southeast1',
    timeoutSeconds: 30,
  },
  async () => fetchMalaysiaNews(),
);