export type PolicyMode = 'impact' | 'translator' | 'geospatial';

export interface CitizenProfile {
  incomeGroup: string;
  householdType: string;
  state: string;
  district: string;
  transport: string;
  employmentStatus?: string;
  monthlyIncome?: string;
  monthlyCommuteSpend?: string;
  monthlyUtilityBill?: string;
  kwspBalance?: string;
  dependants?: string;
  housingStatus?: string;
}

export interface LinkedUnit {
  label: string;
  sectorLabel: string;
  distanceKm: number;
}

export interface GeospatialPayload {
  areaName: string;
  radiusKm: number;
  focus: string;
  scenarioLabel: string;
  selectedDay: number;
  focusUnit: LinkedUnit;
  selectedDaySnapshot: {
    impact: number;
    stateLabel: string;
  };
  topLinkedUnits: LinkedUnit[];
}

export interface PolicyBrainRequest {
  mode: PolicyMode;
  question: string;
  profile: CitizenProfile;
  geospatialPayload?: GeospatialPayload | null;
}

export interface PolicyBrainResponse {
  content: string;
  grounded: boolean;
  source: 'genkit' | 'mock';
}

export type NewsCategory = 'policy' | 'economic' | 'financial';

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  summary: string;
  category: NewsCategory;
}

export interface MalaysiaNewsSection {
  featured: NewsArticle | null;
  articles: NewsArticle[];
}

export interface MalaysiaNewsResponse {
  generatedAt: string;
  timezone: 'Asia/Kuala_Lumpur';
  source: 'live' | 'fallback';
  sections: Record<NewsCategory, MalaysiaNewsSection>;
}
