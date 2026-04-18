import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from '../firebase/client';
import { buildPolicyBrainMockResponse } from '../mocks/policyBrainMock';

export async function submitPolicyBrainQuery({ mode, question, profile, geospatialPayload }) {
  const fallback = () =>
    buildPolicyBrainMockResponse({
      mode,
      question,
      profile,
      geospatialPayload,
    });

  if (!isFirebaseConfigured || !functions) {
    return fallback();
  }

  try {
    const runPolicyBrainFlow = httpsCallable(functions, 'runPolicyBrainFlow');
    const response = await runPolicyBrainFlow({
      mode,
      question,
      profile,
      geospatialPayload,
    });

    return response?.data?.content || fallback();
  } catch (error) {
    console.warn('Falling back to mock policy response.', error);
    return fallback();
  }
}
