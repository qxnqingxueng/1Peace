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
