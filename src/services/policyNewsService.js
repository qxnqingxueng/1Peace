import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from '../firebase/client';

const CACHE_TTL = 5 * 60 * 1000;
let cache = { data: null, ts: 0 };

function buildFallbackSections() {
  const make = (category) => ({
    featured: {
      id: `fallback-${category}`,
      title: `Malaysia ${category} headlines unavailable`,
      source: '1Peace',
      url: '#',
      imageUrl: null,
      publishedAt: new Date().toISOString(),
      summary: 'Live headlines will appear here once the news feed is restored.',
      category,
    },
    articles: [],
  });
  return { policy: make('policy'), economic: make('economic'), financial: make('financial') };
}

export function buildFallbackNewsResponse() {
  return {
    generatedAt: new Date().toISOString(),
    timezone: 'Asia/Kuala_Lumpur',
    source: 'fallback',
    sections: buildFallbackSections(),
  };
}

export async function fetchMalaysiaNews({ bust = false } = {}) {
  if (!bust && cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  if (!isFirebaseConfigured || !functions) {
    return buildFallbackNewsResponse();
  }

  try {
    const getMalaysiaNews = httpsCallable(functions, 'getMalaysiaNews');
    const result = await getMalaysiaNews();
    cache = { data: result.data, ts: Date.now() };
    return result.data;
  } catch (error) {
    console.warn('[1Peace] getMalaysiaNews failed, using fallback.', error);
    return buildFallbackNewsResponse();
  }
}
