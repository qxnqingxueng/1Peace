export type Timeframe = 'day' | 'week' | 'month' | 'year';
export type ScenarioType =
  | 'budgetCut'
  | 'resourceAllocationDrop'
  | 'subsidyReduction'
  | 'operatingPressure';
export type UnitType =
  | 'hospital'
  | 'school'
  | 'factory'
  | 'fuelStation'
  | 'clinic'
  | 'pharmacy'
  | 'fireStation'
  | 'policeStation'
  | 'publicTransportHub'
  | 'communityHall';

export interface ImpactMapProfile {
  state: string;
  district: string;
  transport: string;
  incomeGroup: string;
  employmentStatus?: string;
  monthlyIncome?: string;
  monthlyCommuteSpend?: string;
  monthlyUtilityBill?: string;
  kwspBalance?: string;
  dependants?: string;
  housingStatus?: string;
  householdType?: string;
}

export interface ImpactMapUnitStyle {
  label: string;
  short: string;
  top: string;
  left: string;
  right: string;
  accent: string;
  chart: string;
  footprint: { width: number; depth: number };
  baseHeight: number;
  detail: 'cross' | 'flag' | 'chimney' | 'pump' | 'pill' | 'flame' | 'shield' | 'rail' | 'hall';
}

export interface ImpactMapUnit {
  id: string;
  type: UnitType;
  label: string;
  distanceKm: number;
  slot: { x: number; y: number };
  relatedUnitTypes: UnitType[];
  style: ImpactMapUnitStyle;
  trend30Day: number[];
  seriesByTimeframe: Record<Timeframe, number[]>;
  currentImpact: number;
  currentHeight: number;
  currentSeverity: 'stable' | 'watch' | 'high' | 'critical';
  currentStatusColor: string;
  resourceLoss: number;
  brightness: number;
  dropOffset: number;
  warning: boolean;
}

export interface SummaryCard {
  key: string;
  label: string;
  value: string;
  detail: string;
  tone: 'neutral' | 'warning' | 'critical' | 'highlight';
}

export interface ImpactMapPoint {
  label: string;
  value: number;
  periodIndex: number;
}

export interface ImpactMapLineSeries {
  key: string;
  label: string;
  color: string;
  values: number[];
}

export interface ImpactMapPayload {
  sourceQuestion: string;
  profileContext: ImpactMapProfile;
  areaName: string;
  focus: string;
  timeframe: Timeframe;
  timeframeLabel: string;
  timeframeDescription: string;
  scenarioType: ScenarioType;
  scenarioLabel: string;
  scenarioNarrative: string;
  radiusKm: number;
  periodIndex: number;
  periodLabel: string;
  periods: string[];
  units: ImpactMapUnit[];
  focusedUnitId: string;
  focusedUnit: ImpactMapUnit;
  relatedUnits: ImpactMapUnit[];
  impactSeries: ImpactMapPoint[];
  cascadeSeries: ImpactMapLineSeries[];
  focusTrend30Day: number[];
  summaryCards: SummaryCard[];
  topRiskUnit: ImpactMapUnit;
  averageResourceLoss: number;
  predictedServiceDisruption: string;
}

export interface ImpactMapOverrides {
  timeframe?: Timeframe;
  scenarioType?: ScenarioType;
  radiusKm?: number;
  focusedUnitId?: string;
  periodIndex?: number;
}

export const RADIUS_OPTIONS = [3, 5, 10] as const;
export const TIMEFRAME_ORDER: Timeframe[] = ['day', 'week', 'month', 'year'];

export const TIMEFRAME_CONFIG: Record<
  Timeframe,
  {
    label: string;
    periods: number;
    threshold: number;
    amplitude: number;
    trend: number;
    periodLabel: (index: number) => string;
    description: string;
  }
> = {
  day: {
    label: 'Day',
    periods: 30,
    threshold: 55,
    amplitude: 18,
    trend: 0.42,
    periodLabel: (index) => `Day ${index + 1}`,
    description: 'Daily operational stress and visible service degradation.',
  },
  week: {
    label: 'Week',
    periods: 12,
    threshold: 52,
    amplitude: 14,
    trend: 0.58,
    periodLabel: (index) => `Week ${index + 1}`,
    description: 'Short-term cascading strain and recovery lag.',
  },
  month: {
    label: 'Month',
    periods: 12,
    threshold: 48,
    amplitude: 11,
    trend: 0.75,
    periodLabel: (index) => `Month ${index + 1}`,
    description: 'Accumulated resource pressure across nearby civic anchors.',
  },
  year: {
    label: 'Year',
    periods: 6,
    threshold: 45,
    amplitude: 9,
    trend: 1.05,
    periodLabel: (index) => `Year ${index + 1}`,
    description: 'Long-horizon structural change and strategic service strain.',
  },
};

export const SCENARIO_OPTIONS: Array<{ value: ScenarioType; label: string }> = [
  { value: 'budgetCut', label: 'Budget Cut' },
  { value: 'resourceAllocationDrop', label: 'Resource Allocation Drop' },
  { value: 'subsidyReduction', label: 'Subsidy Reduction' },
  { value: 'operatingPressure', label: 'Operating Pressure' },
];

const UNIT_STYLES: Record<UnitType, ImpactMapUnitStyle> = {
  hospital: {
    label: 'Public Hospital',
    short: 'H',
    top: '#62E7D6',
    left: '#0F766E',
    right: '#14B8A6',
    accent: '#CFFCF5',
    chart: '#2DD4BF',
    footprint: { width: 34, depth: 22 },
    baseHeight: 94,
    detail: 'cross',
  },
  school: {
    label: 'School',
    short: 'S',
    top: '#D8B4FE',
    left: '#7E22CE',
    right: '#A855F7',
    accent: '#F3E8FF',
    chart: '#C084FC',
    footprint: { width: 30, depth: 18 },
    baseHeight: 82,
    detail: 'flag',
  },
  factory: {
    label: 'Factory',
    short: 'Kg',
    top: '#CBD5E1',
    left: '#475569',
    right: '#64748B',
    accent: '#F8FAFC',
    chart: '#94A3B8',
    footprint: { width: 36, depth: 22 },
    baseHeight: 88,
    detail: 'chimney',
  },
  fuelStation: {
    label: 'Fuel Station',
    short: 'F',
    top: '#FDBA74',
    left: '#C2410C',
    right: '#F97316',
    accent: '#FFEDD5',
    chart: '#FB923C',
    footprint: { width: 30, depth: 14 },
    baseHeight: 64,
    detail: 'pump',
  },
  clinic: {
    label: 'Clinic',
    short: 'C',
    top: '#7DD3FC',
    left: '#0369A1',
    right: '#0EA5E9',
    accent: '#E0F2FE',
    chart: '#38BDF8',
    footprint: { width: 24, depth: 16 },
    baseHeight: 70,
    detail: 'cross',
  },
  pharmacy: {
    label: 'Pharmacy',
    short: 'P',
    top: '#93C5FD',
    left: '#1D4ED8',
    right: '#3B82F6',
    accent: '#DBEAFE',
    chart: '#60A5FA',
    footprint: { width: 22, depth: 16 },
    baseHeight: 66,
    detail: 'pill',
  },
  fireStation: {
    label: 'Fire Station',
    short: 'B',
    top: '#FCA5A5',
    left: '#B91C1C',
    right: '#EF4444',
    accent: '#FEE2E2',
    chart: '#F87171',
    footprint: { width: 26, depth: 18 },
    baseHeight: 78,
    detail: 'flame',
  },
  policeStation: {
    label: 'Police Station',
    short: 'PS',
    top: '#BFDBFE',
    left: '#1E3A8A',
    right: '#2563EB',
    accent: '#DBEAFE',
    chart: '#3B82F6',
    footprint: { width: 28, depth: 18 },
    baseHeight: 76,
    detail: 'shield',
  },
  publicTransportHub: {
    label: 'Public Transport Hub',
    short: 'T',
    top: '#FDE68A',
    left: '#A16207',
    right: '#EAB308',
    accent: '#FEF9C3',
    chart: '#FACC15',
    footprint: { width: 32, depth: 18 },
    baseHeight: 74,
    detail: 'rail',
  },
  communityHall: {
    label: 'Community Hall',
    short: 'CH',
    top: '#FDA4AF',
    left: '#BE123C',
    right: '#F43F5E',
    accent: '#FFE4E6',
    chart: '#FB7185',
    footprint: { width: 26, depth: 18 },
    baseHeight: 68,
    detail: 'hall',
  },
};

const SCENARIO_CONFIG: Record<
  ScenarioType,
  {
    label: string;
    narrative: string;
    effects: Record<UnitType, number>;
    duplicates: UnitType[];
  }
> = {
  budgetCut: {
    label: 'Budget Cut',
    narrative: 'Budget compression reduces service resilience, staffing depth, and maintenance readiness.',
    effects: {
      hospital: 1.25,
      school: 1.12,
      factory: 0.72,
      fuelStation: 0.52,
      clinic: 1.18,
      pharmacy: 0.98,
      fireStation: 0.94,
      policeStation: 0.88,
      publicTransportHub: 0.84,
      communityHall: 1.02,
    },
    duplicates: ['hospital', 'school', 'clinic', 'communityHall'],
  },
  resourceAllocationDrop: {
    label: 'Resource Allocation Drop',
    narrative: 'Resources are pulled away unevenly, causing localized service gaps and uneven recovery pressure.',
    effects: {
      hospital: 1.05,
      school: 0.92,
      factory: 0.78,
      fuelStation: 0.58,
      clinic: 1.02,
      pharmacy: 0.88,
      fireStation: 0.82,
      policeStation: 0.8,
      publicTransportHub: 0.9,
      communityHall: 0.95,
    },
    duplicates: ['publicTransportHub', 'communityHall', 'school', 'clinic'],
  },
  subsidyReduction: {
    label: 'Subsidy Reduction',
    narrative: 'Fuel and logistics pressure spreads first, then household-serving units inherit the strain.',
    effects: {
      hospital: 0.78,
      school: 0.84,
      factory: 1.12,
      fuelStation: 1.22,
      clinic: 0.74,
      pharmacy: 0.68,
      fireStation: 0.81,
      policeStation: 0.76,
      publicTransportHub: 1.1,
      communityHall: 0.72,
    },
    duplicates: ['fuelStation', 'factory', 'publicTransportHub', 'fuelStation'],
  },
  operatingPressure: {
    label: 'Operating Pressure',
    narrative: 'Sustained demand and staffing stress create service delays across safety, logistics, and care networks.',
    effects: {
      hospital: 1.14,
      school: 0.74,
      factory: 0.96,
      fuelStation: 0.82,
      clinic: 1.06,
      pharmacy: 0.9,
      fireStation: 1.02,
      policeStation: 1.04,
      publicTransportHub: 0.98,
      communityHall: 0.86,
    },
    duplicates: ['hospital', 'fireStation', 'policeStation', 'publicTransportHub'],
  },
};

const RELATED_UNITS: Record<UnitType, UnitType[]> = {
  hospital: ['clinic', 'pharmacy', 'publicTransportHub', 'fireStation', 'communityHall', 'school'],
  school: ['communityHall', 'publicTransportHub', 'policeStation', 'clinic', 'pharmacy', 'fuelStation'],
  factory: ['fuelStation', 'publicTransportHub', 'fireStation', 'policeStation', 'communityHall', 'hospital'],
  fuelStation: ['factory', 'publicTransportHub', 'policeStation', 'fireStation', 'hospital', 'clinic'],
  clinic: ['hospital', 'pharmacy', 'communityHall', 'publicTransportHub', 'school', 'policeStation'],
  pharmacy: ['hospital', 'clinic', 'communityHall', 'school', 'publicTransportHub', 'fireStation'],
  fireStation: ['hospital', 'policeStation', 'publicTransportHub', 'factory', 'fuelStation', 'clinic'],
  policeStation: ['fireStation', 'communityHall', 'publicTransportHub', 'school', 'hospital', 'fuelStation'],
  publicTransportHub: ['fuelStation', 'school', 'factory', 'hospital', 'communityHall', 'policeStation'],
  communityHall: ['school', 'clinic', 'policeStation', 'publicTransportHub', 'pharmacy', 'hospital'],
};

const SLOT_LAYOUT: Array<{ x: number; y: number }> = [
  { x: 0.9, y: 0.95 },
  { x: 1.8, y: 0.6 },
  { x: 2.75, y: 0.82 },
  { x: 3.75, y: 1.08 },
  { x: 1.15, y: 1.88 },
  { x: 2.15, y: 1.56 },
  { x: 3.1, y: 1.92 },
  { x: 4.08, y: 2.36 },
  { x: 1.42, y: 2.88 },
  { x: 2.48, y: 2.58 },
  { x: 3.48, y: 2.98 },
  { x: 2.25, y: 3.46 },
];

const FUEL_BRANDS = ['Shell', 'Caltex', 'Petronas', 'BHPetrol'];
const AREA_SUFFIXES = ['Utama', 'Jaya', 'Sentral', 'Perdana', 'Barat', 'Timur'];
const ALL_UNIT_TYPES = Object.keys(UNIT_STYLES) as UnitType[];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashSeed(value: string) {
  return value.split('').reduce((sum, character, index) => sum + character.charCodeAt(0) * (index + 1), 0);
}

function seeded(seed: number, offset = 0) {
  const raw = Math.sin(seed * 12.9898 + (offset + 1) * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function seededBetween(seed: number, offset: number, min: number, max: number) {
  return min + seeded(seed, offset) * (max - min);
}

function seededInt(seed: number, offset: number, min: number, max: number) {
  return Math.round(seededBetween(seed, offset, min, max));
}

function shuffleWithSeed<T>(items: T[], seed: number) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(seeded(seed, index + 49) * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function toTitleCase(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

function extractRadius(question: string) {
  const match = question.match(/(\d+(?:\.\d+)?)\s*km/i);
  if (!match) {
    return 5;
  }

  const radius = Number(match[1]);
  return RADIUS_OPTIONS.reduce((best, option) =>
    Math.abs(option - radius) < Math.abs(best - radius) ? option : best,
  );
}

function inferScenario(question: string): ScenarioType {
  const lowerQuestion = question.toLowerCase();
  if (/allocation drop|reallocation|resource allocation|resource shift/.test(lowerQuestion)) {
    return 'resourceAllocationDrop';
  }
  if (/subsidy|diesel|fuel|petrol|caltex|shell/.test(lowerQuestion)) {
    return 'subsidyReduction';
  }
  if (/operating pressure|staff shortage|service delay|demand surge|pressure/.test(lowerQuestion)) {
    return 'operatingPressure';
  }
  return 'budgetCut';
}

function inferFocus(question: string) {
  const lowerQuestion = question.toLowerCase();
  if (/hospital|clinic|pharmacy|medical/.test(lowerQuestion)) {
    return 'Healthcare support network';
  }
  if (/school|education|student|teacher/.test(lowerQuestion)) {
    return 'Education and community access';
  }
  if (/fuel|diesel|petrol|transport|commute|station/.test(lowerQuestion)) {
    return 'Mobility and fuel affordability';
  }
  if (/factory|kilang|industrial|manufacturing/.test(lowerQuestion)) {
    return 'Industrial operating resilience';
  }
  if (/fire|police|safety|response/.test(lowerQuestion)) {
    return 'Emergency response readiness';
  }
  return 'Mixed civic infrastructure exposure';
}

function inferFocusedType(question: string): UnitType | null {
  const lowerQuestion = question.toLowerCase();
  if (/hospital/.test(lowerQuestion)) return 'hospital';
  if (/school|tvet/.test(lowerQuestion)) return 'school';
  if (/factory|kilang/.test(lowerQuestion)) return 'factory';
  if (/fuel|station|shell|caltex|petrol/.test(lowerQuestion)) return 'fuelStation';
  if (/clinic/.test(lowerQuestion)) return 'clinic';
  if (/pharmacy|farmasi/.test(lowerQuestion)) return 'pharmacy';
  if (/fire|bomba/.test(lowerQuestion)) return 'fireStation';
  if (/police|polis/.test(lowerQuestion)) return 'policeStation';
  if (/transport|hub|transit|lrt|mrt|bus/.test(lowerQuestion)) return 'publicTransportHub';
  if (/community|hall|library|dewan/.test(lowerQuestion)) return 'communityHall';
  return null;
}

function createUnitLabel(type: UnitType, district: string, index: number) {
  const area = toTitleCase(district);
  const suffix = AREA_SUFFIXES[index % AREA_SUFFIXES.length];
  switch (type) {
    case 'hospital':
      return `Hospital ${area} ${suffix}`;
    case 'school':
      return index % 2 === 0 ? `SMK ${area} ${suffix}` : `SK ${area} ${suffix}`;
    case 'factory':
      return `Kilang ${area} ${suffix}`;
    case 'fuelStation':
      return `${FUEL_BRANDS[index % FUEL_BRANDS.length]} ${area} ${suffix}`;
    case 'clinic':
      return `Klinik ${area} ${suffix}`;
    case 'pharmacy':
      return `Farmasi ${area} ${suffix}`;
    case 'fireStation':
      return `Balai Bomba ${area} ${suffix}`;
    case 'policeStation':
      return `Balai Polis ${area} ${suffix}`;
    case 'publicTransportHub':
      return `Hab Transit ${area} ${suffix}`;
    case 'communityHall':
      return `Dewan ${area} ${suffix}`;
    default:
      return `${area} ${suffix}`;
  }
}

function buildTypeSequence(radiusKm: number, scenarioType: ScenarioType, seed: number) {
  const basePriority = [
    ...SCENARIO_CONFIG[scenarioType].duplicates,
    ...ALL_UNIT_TYPES,
  ].filter((type, index, array) => array.indexOf(type) === index) as UnitType[];

  const targetCount = radiusKm === 3 ? 8 : radiusKm === 5 ? 10 : 12;
  const sequence = basePriority.slice(0, Math.min(targetCount, basePriority.length));

  while (sequence.length < targetCount) {
    sequence.push(SCENARIO_CONFIG[scenarioType].duplicates[(sequence.length - basePriority.length) % SCENARIO_CONFIG[scenarioType].duplicates.length]);
  }

  return shuffleWithSeed(sequence, seed + 73);
}

function createSeries(baseImpact: number, timeframe: Timeframe, effect: number, seed: number, offset: number) {
  const config = TIMEFRAME_CONFIG[timeframe];
  return Array.from({ length: config.periods }, (_, index) => {
    const progress = config.periods === 1 ? 0 : index / (config.periods - 1);
    const wave = Math.sin(progress * Math.PI * 2 + seeded(seed, offset + 31) * 3.4) * config.amplitude;
    const pulse = Math.cos(progress * Math.PI * 1.3 + offset * 0.45) * (config.amplitude * 0.35);
    const drift = effect * 18 * config.trend * (0.55 + progress);
    const noise = seededBetween(seed, offset + index + 101, -4.8, 4.8);
    return clamp(Math.round(baseImpact + wave + pulse + drift + noise), 4, 100);
  });
}

function getSeverity(impact: number) {
  if (impact >= 80) return 'critical';
  if (impact >= 62) return 'high';
  if (impact >= 42) return 'watch';
  return 'stable';
}

function getStatusColor(severity: ReturnType<typeof getSeverity>) {
  switch (severity) {
    case 'critical':
      return '#F87171';
    case 'high':
      return '#FB923C';
    case 'watch':
      return '#FACC15';
    default:
      return '#4ADE80';
  }
}

function getPredictedDisruption(averageImpact: number, topRiskUnit: ImpactMapUnit) {
  if (averageImpact >= 76) {
    return `High disruption risk around ${topRiskUnit.label} with visible service delays and queue spillover.`;
  }
  if (averageImpact >= 58) {
    return `Moderate disruption likely, especially around ${topRiskUnit.style.label.toLowerCase()} coverage and response timing.`;
  }
  if (averageImpact >= 42) {
    return `Watch-level disruption with isolated strain across nearby support units.`;
  }
  return 'Low disruption with manageable pressure across the selected radius.';
}

export function createImpactMapPayload(
  question: string,
  profile: ImpactMapProfile,
  overrides: ImpactMapOverrides = {},
): ImpactMapPayload {
  const timeframe = overrides.timeframe ?? 'day';
  const scenarioType = overrides.scenarioType ?? inferScenario(question);
  const radiusKm = overrides.radiusKm ?? extractRadius(question);
  const baseSeed = hashSeed(
    `${question}-${profile.state}-${profile.district}-${profile.transport}-${profile.incomeGroup}-${radiusKm}-${scenarioType}-${timeframe}`,
  );

  const orderedTypes = buildTypeSequence(radiusKm, scenarioType, baseSeed);
  const slots = shuffleWithSeed(SLOT_LAYOUT, baseSeed + 9);

  const unitsBase = orderedTypes.map((type, index) => {
    const style = UNIT_STYLES[type];
    const affordabilityBias = /b40/i.test(profile.incomeGroup) ? 5 : /t20/i.test(profile.incomeGroup) ? -3 : 1;
    const commuteBias = /diesel|petrol|transport/i.test(profile.transport) ? 4 : 1;
    const employmentBias = /self|gig|factory/i.test(profile.employmentStatus || '') ? 3 : 0;
    const scenarioEffect = SCENARIO_CONFIG[scenarioType].effects[type];
    const baseImpact = clamp(
      Math.round(28 + scenarioEffect * 21 + affordabilityBias + commuteBias + employmentBias + seededBetween(baseSeed, index + 1, -9, 9)),
      10,
      88,
    );

    const trend30Day = createSeries(baseImpact, 'day', scenarioEffect, baseSeed, index + 1);
    const seriesByTimeframe = {
      day: trend30Day,
      week: createSeries(baseImpact + scenarioEffect * 4, 'week', scenarioEffect, baseSeed, index + 35),
      month: createSeries(baseImpact + scenarioEffect * 6, 'month', scenarioEffect, baseSeed, index + 71),
      year: createSeries(baseImpact + scenarioEffect * 9, 'year', scenarioEffect, baseSeed, index + 109),
    } satisfies Record<Timeframe, number[]>;

    return {
      id: `${type}-${radiusKm}-${scenarioType}-${index}`,
      type,
      label: createUnitLabel(type, profile.district, index),
      distanceKm: Number(seededBetween(baseSeed, index + 11, 0.4, Math.max(radiusKm - 0.15, 1.1)).toFixed(1)),
      slot: slots[index] || SLOT_LAYOUT[index % SLOT_LAYOUT.length],
      relatedUnitTypes: RELATED_UNITS[type],
      style,
      trend30Day,
      seriesByTimeframe,
    };
  });

  const periods = Array.from({ length: TIMEFRAME_CONFIG[timeframe].periods }, (_, index) => TIMEFRAME_CONFIG[timeframe].periodLabel(index));
  const clampedPeriodIndex = clamp(overrides.periodIndex ?? Math.floor(periods.length / 2), 0, periods.length - 1);
  const hintedType = inferFocusedType(question);

  const hydratedUnits: ImpactMapUnit[] = unitsBase.map((unit) => {
    const currentImpact = unit.seriesByTimeframe[timeframe][clampedPeriodIndex];
    const currentSeverity = getSeverity(currentImpact);
    const currentHeight = clamp(Math.round(unit.style.baseHeight - currentImpact * 0.52), 22, unit.style.baseHeight + 10);
    const resourceLoss = clamp(Math.round(currentImpact * 0.64 + seededBetween(baseSeed, currentImpact, 2, 14)), 6, 96);

    return {
      ...unit,
      currentImpact,
      currentSeverity,
      currentStatusColor: getStatusColor(currentSeverity),
      currentHeight,
      resourceLoss,
      brightness: clamp(1 - currentImpact / 155, 0.46, 1),
      dropOffset: Math.round(currentImpact * 0.16),
      warning: currentImpact >= 68,
    };
  });

  const focusedUnit =
    hydratedUnits.find((unit) => unit.id === overrides.focusedUnitId) ||
    (hintedType ? hydratedUnits.find((unit) => unit.type === hintedType) : null) ||
    [...hydratedUnits].sort((left, right) => right.currentImpact - left.currentImpact)[0];

  const relatedUnits = focusedUnit.relatedUnitTypes
    .map((type) =>
      hydratedUnits
        .filter((unit) => unit.type === type)
        .sort((left, right) => right.currentImpact - left.currentImpact || left.distanceKm - right.distanceKm)[0],
    )
    .filter(Boolean)
    .slice(0, 3) as ImpactMapUnit[];

  const impactSeries: ImpactMapPoint[] = periods.map((label, index) => {
    const affectedCount = hydratedUnits.filter((unit) => unit.seriesByTimeframe[timeframe][index] >= TIMEFRAME_CONFIG[timeframe].threshold).length;
    return { label, value: affectedCount, periodIndex: index };
  });

  const cascadeSeries: ImpactMapLineSeries[] = [
    {
      key: focusedUnit.id,
      label: focusedUnit.label,
      color: '#FFCC00',
      values: focusedUnit.seriesByTimeframe[timeframe],
    },
    ...focusedUnit.relatedUnitTypes.slice(0, 3).map((type) => {
      const matching = hydratedUnits.filter((unit) => unit.type === type);
      return {
        key: type,
        label: UNIT_STYLES[type].label,
        color: UNIT_STYLES[type].chart,
        values: Array.from({ length: periods.length }, (_, index) => {
          const total = matching.reduce((sum, unit) => sum + unit.seriesByTimeframe[timeframe][index], 0);
          return Math.round(total / Math.max(1, matching.length));
        }),
      };
    }),
  ];

  const topRiskUnit = [...hydratedUnits].sort((left, right) => right.currentImpact - left.currentImpact)[0];
  const averageResourceLoss = Math.round(
    hydratedUnits.reduce((sum, unit) => sum + unit.resourceLoss, 0) / Math.max(1, hydratedUnits.length),
  );
  const disruptedCount = hydratedUnits.filter((unit) => unit.currentImpact >= TIMEFRAME_CONFIG[timeframe].threshold).length;
  const predictedServiceDisruption = getPredictedDisruption(
    hydratedUnits.reduce((sum, unit) => sum + unit.currentImpact, 0) / Math.max(1, hydratedUnits.length),
    topRiskUnit,
  );

  const summaryCards: SummaryCard[] = [
    {
      key: 'impacted',
      label: 'Total impacted units',
      value: `${disruptedCount}`,
      detail: `${disruptedCount} units are above the ${TIMEFRAME_CONFIG[timeframe].threshold} impact threshold in ${TIMEFRAME_CONFIG[timeframe].periodLabel(clampedPeriodIndex).toLowerCase()}.`,
      tone: disruptedCount >= 6 ? 'critical' : disruptedCount >= 4 ? 'warning' : 'neutral',
    },
    {
      key: 'highestRisk',
      label: 'Highest risk unit',
      value: topRiskUnit.label,
      detail: `${topRiskUnit.currentImpact}/100 impact score in ${TIMEFRAME_CONFIG[timeframe].periodLabel(clampedPeriodIndex).toLowerCase()}.`,
      tone: topRiskUnit.currentImpact >= 80 ? 'critical' : 'warning',
    },
    {
      key: 'resourceLoss',
      label: 'Average resource loss',
      value: `${averageResourceLoss}%`,
      detail: 'Synthetic estimate of staffing, supply, and maintenance erosion across the radius.',
      tone: averageResourceLoss >= 55 ? 'warning' : 'highlight',
    },
    {
      key: 'disruption',
      label: 'Predicted service disruption',
      value: averageResourceLoss >= 70 ? 'High' : averageResourceLoss >= 48 ? 'Moderate' : 'Low',
      detail: predictedServiceDisruption,
      tone: averageResourceLoss >= 70 ? 'critical' : averageResourceLoss >= 48 ? 'warning' : 'neutral',
    },
  ];

  return {
    sourceQuestion: question,
    profileContext: profile,
    areaName: `${profile.district}, ${profile.state}`,
    focus: inferFocus(question),
    timeframe,
    timeframeLabel: TIMEFRAME_CONFIG[timeframe].label,
    timeframeDescription: TIMEFRAME_CONFIG[timeframe].description,
    scenarioType,
    scenarioLabel: SCENARIO_CONFIG[scenarioType].label,
    scenarioNarrative: SCENARIO_CONFIG[scenarioType].narrative,
    radiusKm,
    periodIndex: clampedPeriodIndex,
    periodLabel: TIMEFRAME_CONFIG[timeframe].periodLabel(clampedPeriodIndex),
    periods,
    units: hydratedUnits,
    focusedUnitId: focusedUnit.id,
    focusedUnit,
    relatedUnits,
    impactSeries,
    cascadeSeries,
    focusTrend30Day: focusedUnit.trend30Day,
    summaryCards,
    topRiskUnit,
    averageResourceLoss,
    predictedServiceDisruption,
  };
}
