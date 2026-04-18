import {
  createImpactMapPayload,
  type ImpactMapPayload,
  type ImpactMapProfile,
  type SummaryCard,
} from './impactMapSimulation';

export type PolicyActionIntent = 'explain' | 'impact' | 'action';
export type ActionWorkflowId =
  | 'checkEligibility'
  | 'prepareApplication'
  | 'bookAppointment'
  | 'viewRequirements';

export interface ExplanationData {
  heading: string;
  summary: string;
  bullets: string[];
  clauseHint: string;
  tone: string;
}

export interface ImpactData {
  monthlyChange: number;
  monthlyChangeLabel: string;
  supportAmount: number;
  supportAmountLabel: string;
  eligibilityStatus: string;
  netEffectLabel: string;
  drivers: string[];
  confidenceLabel: string;
}

export interface SpatialPreviewData {
  payload: ImpactMapPayload;
  areaLabel: string;
  riskLevel: string;
  affectedServices: number;
  topUnits: Array<{
    id: string;
    label: string;
    sectorLabel: string;
    impact: number;
    statusColor: string;
  }>;
}

export interface ActionOption {
  id: ActionWorkflowId;
  title: string;
  description: string;
  buttonLabel: string;
  recommended: boolean;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
}

export interface ExecutionWorkflow {
  id: ActionWorkflowId;
  title: string;
  intro: string;
  progressLabel: string;
  steps: WorkflowStep[];
  checklist: string[];
  prefilledFields: Array<{ label: string; value: string }>;
  confirmations: string[];
  primaryActionLabel: string;
}

export interface AnalyticsData {
  title: string;
  subtitle: string;
  impactSeries: ImpactMapPayload['impactSeries'];
  cascadeSeries: ImpactMapPayload['cascadeSeries'];
  summaryCards: SummaryCard[];
  highestAffectedSector: string;
  estimatedCostIncrease: string;
  eligibilityStatus: string;
}

export interface PolicyActionBundle {
  question: string;
  intent: PolicyActionIntent;
  explanation: ExplanationData;
  impact: ImpactData;
  spatial: SpatialPreviewData;
  actions: ActionOption[];
  executionWorkflows: Record<ActionWorkflowId, ExecutionWorkflow>;
  analytics: AnalyticsData;
  actionPrompt: string;
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value?: string) {
  if (!value) {
    return 0;
  }
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  const rounded = Math.round(Math.abs(value));
  return `RM ${rounded.toLocaleString('en-MY')}`;
}

function formatSignedMoney(value: number) {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${formatMoney(value)}`;
}

function inferTheme(question: string) {
  const lowerQuestion = question.toLowerCase();

  if (/diesel|fuel|petrol|subsidy|budi|station|transport/.test(lowerQuestion)) {
    return {
      policyName: 'Targeted transport and fuel support policy',
      clauseHint: 'Simulated clause 4.2 - household transport support eligibility and subsidy filtering.',
      tone: 'Transport affordability and household cost pressure',
      actionPrompt: 'Review fuel-support eligibility and prepare the supporting documents first.',
    };
  }

  if (/tax|income tax|amendment|deduction|levy/.test(lowerQuestion)) {
    return {
      policyName: 'Tax and household contribution update',
      clauseHint: 'Simulated clause 3.1 - contribution changes, household exposure, and verification rules.',
      tone: 'Household deductions, take-home pay, and policy clarity',
      actionPrompt: 'Check the deduction rules, then prepare any employer or household proof needed.',
    };
  }

  if (/hospital|clinic|health|medical/.test(lowerQuestion)) {
    return {
      policyName: 'Public healthcare resource shift',
      clauseHint: 'Simulated clause 5.4 - service prioritization for clinics, hospitals, and medicine access.',
      tone: 'Healthcare access, queue pressure, and local service readiness',
      actionPrompt: 'Check which nearby services are most affected and prepare any required verification early.',
    };
  }

  if (/school|education|student|tvet|teacher/.test(lowerQuestion)) {
    return {
      policyName: 'Education allocation and access policy',
      clauseHint: 'Simulated clause 2.7 - education support, resource reallocation, and service eligibility.',
      tone: 'Education support, child-related costs, and district service quality',
      actionPrompt: 'Review the education-related support path and gather household documents before applying.',
    };
  }

  return {
    policyName: 'General public policy adjustment',
    clauseHint: 'Simulated clause 1.9 - household effect, qualifying conditions, and agency workflow.',
    tone: 'General household affordability and public-service effect',
    actionPrompt: 'Start with the explanation, then verify the likely support route for your household.',
  };
}

function buildExplanation(
  question: string,
  profile: ImpactMapProfile,
  theme: ReturnType<typeof inferTheme>,
  spatialPayload: ImpactMapPayload,
): ExplanationData {
  return {
    heading: theme.policyName,
    summary:
      `This policy most likely changes how costs or support are distributed for households in ${profile.district}, ${profile.state}. ` +
      `For a ${profile.incomeGroup} household using ${profile.transport.toLowerCase()}, the main effect is clearer eligibility rules and a visible shift in monthly pressure.`,
    bullets: [
      'The policy reduces ambiguity by narrowing who receives support first.',
      `The biggest day-to-day effect for this profile is on ${theme.tone.toLowerCase()}.`,
      `Nearby public services around ${spatialPayload.areaName} may also feel uneven strain as implementation ramps up.`,
      'Official figures still need agency verification, but the likely citizen-facing effect is directionally clear.',
    ],
    clauseHint: theme.clauseHint,
    tone: theme.tone,
  };
}

function buildImpact(
  question: string,
  profile: ImpactMapProfile,
  seed: number,
): ImpactData {
  const monthlyIncome = toNumber(profile.monthlyIncome);
  const monthlyCommute = toNumber(profile.monthlyCommuteSpend);
  const monthlyUtilities = toNumber(profile.monthlyUtilityBill);
  const dependants = toNumber(profile.dependants);
  const incomeBias = profile.incomeGroup === 'B40' ? 18 : profile.incomeGroup === 'M40' ? 11 : 6;
  const transportBias = /diesel/i.test(profile.transport) ? 26 : /public transport/i.test(profile.transport) ? 9 : 16;
  const policyBias = /fuel|diesel|subsidy|petrol|transport/i.test(question) ? 18 : /tax|levy|contribution/i.test(question) ? 13 : 10;
  const householdBias = dependants * 6 + (/single parent/i.test(profile.householdType || '') ? 9 : 0);
  const utilityBias = Math.round(monthlyUtilities * 0.05);
  const commuteBias = Math.round(monthlyCommute * 0.11);
  const seededVariance = Math.round(seededBetween(seed, 7, 10, 34));

  const grossChange = clamp(
    incomeBias + transportBias + policyBias + householdBias + utilityBias + commuteBias + seededVariance,
    38,
    240,
  );

  const subsidyEligible =
    profile.incomeGroup === 'B40' ||
    (profile.incomeGroup === 'M40' && (/diesel|transport|fuel/i.test(question) || monthlyCommute >= 250));

  const supportAmount = subsidyEligible
    ? profile.incomeGroup === 'B40'
      ? clamp(180 + Math.round(seededBetween(seed, 8, 0, 40)), 180, 220)
      : clamp(80 + Math.round(seededBetween(seed, 9, 0, 40)), 80, 120)
    : 0;

  const netChange = grossChange - supportAmount;
  const monthlyPressureRatio = monthlyIncome > 0 ? (netChange / monthlyIncome) * 100 : 0;

  return {
    monthlyChange: netChange,
    monthlyChangeLabel: `${formatSignedMoney(netChange)}/month`,
    supportAmount,
    supportAmountLabel: supportAmount > 0 ? formatMoney(supportAmount) : 'No direct support detected',
    eligibilityStatus: supportAmount > 0 ? 'Likely eligible' : 'Needs manual verification',
    netEffectLabel:
      monthlyPressureRatio >= 4
        ? 'High pressure on take-home budget'
        : monthlyPressureRatio >= 2
          ? 'Manageable but noticeable monthly pressure'
          : 'Low-to-moderate monthly pressure',
    drivers: [
      `Transport exposure contributes about ${formatMoney(Math.max(18, grossChange * 0.38))} of the shift.`,
      `Household and utility sensitivity contribute about ${formatMoney(Math.max(12, grossChange * 0.24))}.`,
      supportAmount > 0
        ? `Likely aid or subsidy support offsets around ${formatMoney(supportAmount)}.`
        : 'No strong automatic subsidy offset is visible from the current profile.',
    ],
    confidenceLabel: 'Deterministic local estimate for demo use',
  };
}

function buildSpatialPreview(spatialPayload: ImpactMapPayload): SpatialPreviewData {
  const topUnits = [...spatialPayload.units]
    .sort((left, right) => right.currentImpact - left.currentImpact)
    .slice(0, 4)
    .map((unit) => ({
      id: unit.id,
      label: unit.label,
      sectorLabel: unit.style.label,
      impact: unit.currentImpact,
      statusColor: unit.currentStatusColor,
    }));

  const averageImpact =
    spatialPayload.units.reduce((sum, unit) => sum + unit.currentImpact, 0) /
    Math.max(1, spatialPayload.units.length);

  return {
    payload: spatialPayload,
    areaLabel: spatialPayload.areaName,
    riskLevel: averageImpact >= 72 ? 'High' : averageImpact >= 52 ? 'Moderate' : 'Watch',
    affectedServices: spatialPayload.units.filter((unit) => unit.currentImpact >= 55).length,
    topUnits,
  };
}

function createPrefilledFields(profile: ImpactMapProfile, impact: ImpactData) {
  return [
    { label: 'Income Group', value: profile.incomeGroup },
    { label: 'State', value: profile.state },
    { label: 'District', value: profile.district },
    { label: 'Primary Transport', value: profile.transport },
    { label: 'Monthly Income', value: `RM ${profile.monthlyIncome || '0'}` },
    { label: 'Monthly Commute', value: `RM ${profile.monthlyCommuteSpend || '0'}` },
    { label: 'Dependants', value: profile.dependants || '0' },
    { label: 'Estimated Net Effect', value: impact.monthlyChangeLabel },
  ];
}

function buildWorkflows(
  profile: ImpactMapProfile,
  impact: ImpactData,
  spatialPayload: ImpactMapPayload,
): Record<ActionWorkflowId, ExecutionWorkflow> {
  const sharedPrefill = createPrefilledFields(profile, impact);

  return {
    checkEligibility: {
      id: 'checkEligibility',
      title: 'Check Eligibility',
      intro: `Match ${profile.incomeGroup} household details against the likely support path for ${spatialPayload.areaName}.`,
      progressLabel: 'Eligibility route',
      steps: [
        { id: 'profile', title: 'Confirm profile context', description: 'Review income band, transport type, and district coverage.' },
        { id: 'rules', title: 'Match policy conditions', description: 'Compare household details against the likely support criteria.' },
        { id: 'evidence', title: 'Validate evidence needed', description: 'Identify the documents needed to prove eligibility.' },
        { id: 'result', title: 'Issue likely result', description: 'Summarize the most likely support route and next step.' },
      ],
      checklist: ['MyKad or identity proof', 'Latest utility bill', 'Income or salary evidence', 'Vehicle or transport proof if relevant'],
      prefilledFields: sharedPrefill,
      confirmations: [
        `${impact.eligibilityStatus} for a support route based on the current profile.`,
        `Highest nearby policy pressure is around ${spatialPayload.topRiskUnit.label}.`,
      ],
      primaryActionLabel: 'Confirm likely eligibility',
    },
    prepareApplication: {
      id: 'prepareApplication',
      title: 'Prepare Application',
      intro: 'Create a citizen-ready draft application path with prefilled household data and document prompts.',
      progressLabel: 'Application draft',
      steps: [
        { id: 'select', title: 'Select program route', description: 'Choose the most likely subsidy or support pathway first.' },
        { id: 'prefill', title: 'Prefill household details', description: 'Use the saved citizen profile to complete the draft form.' },
        { id: 'attach', title: 'Attach required proofs', description: 'List the documents and confirmations needed for submission.' },
        { id: 'review', title: 'Prepare submission summary', description: 'Show the user what will be submitted and what still needs review.' },
      ],
      checklist: ['Household profile details', 'Contact email', 'Proof of residence', 'Income proof', 'Transport-related proof where needed'],
      prefilledFields: sharedPrefill,
      confirmations: [
        `Draft form prepared around an estimated ${impact.monthlyChangeLabel} monthly effect.`,
        'Submission remains simulated in v1 and does not send real data to any agency.',
      ],
      primaryActionLabel: 'Generate draft application',
    },
    bookAppointment: {
      id: 'bookAppointment',
      title: 'Book Appointment',
      intro: 'Guide the citizen into a service-center or agency follow-up visit with the right supporting context.',
      progressLabel: 'Appointment setup',
      steps: [
        { id: 'location', title: 'Select service area', description: `Use ${profile.district}, ${profile.state} as the preferred service area.` },
        { id: 'purpose', title: 'Define visit purpose', description: 'Set the appointment reason based on eligibility or document review.' },
        { id: 'slot', title: 'Choose likely time slot', description: 'Suggest a practical appointment window and the required checklist.' },
        { id: 'confirm', title: 'Confirm readiness', description: 'Show what the citizen should bring before visiting.' },
      ],
      checklist: ['Identity proof', 'Latest bill or address proof', 'Reference note for the policy question', 'Any missing household or vehicle documents'],
      prefilledFields: sharedPrefill,
      confirmations: [
        `Nearest service pressure remains around ${spatialPayload.focusedUnit.label}.`,
        'Appointment booking is simulated and does not reserve a real slot.',
      ],
      primaryActionLabel: 'Simulate appointment booking',
    },
    viewRequirements: {
      id: 'viewRequirements',
      title: 'View Requirements',
      intro: 'Surface the most important requirements before the citizen begins any official process.',
      progressLabel: 'Requirements scan',
      steps: [
        { id: 'review', title: 'Review policy requirement summary', description: 'Condense the likely agency requirements into plain language.' },
        { id: 'compare', title: 'Compare against citizen profile', description: 'Highlight which fields are already present and which are still missing.' },
        { id: 'missing', title: 'List missing evidence', description: 'Show the proofs the citizen may still need to gather.' },
        { id: 'next', title: 'Recommend next action', description: 'Guide the user toward eligibility check, application prep, or appointment booking.' },
      ],
      checklist: ['Household profile verification', 'Address confirmation', 'Income evidence', 'Transport or subsidy-related proof'],
      prefilledFields: sharedPrefill,
      confirmations: [
        `The current policy tone is ${impact.netEffectLabel.toLowerCase()}.`,
        `Top sector under pressure is ${spatialPayload.topRiskUnit.style.label.toLowerCase()}.`,
      ],
      primaryActionLabel: 'Review requirements',
    },
  };
}

function buildActions(impact: ImpactData): ActionOption[] {
  return [
    {
      id: 'checkEligibility',
      title: 'Check Eligibility',
      description: 'Match your saved profile to the most likely support path.',
      buttonLabel: 'Check Eligibility',
      recommended: impact.supportAmount > 0,
    },
    {
      id: 'prepareApplication',
      title: 'Prepare Application',
      description: 'Prefill a guided application draft using your saved details.',
      buttonLabel: 'Prepare Application',
      recommended: impact.supportAmount > 0,
    },
    {
      id: 'bookAppointment',
      title: 'Book Appointment',
      description: 'Plan an agency or service-center follow-up with the right checklist.',
      buttonLabel: 'Book Appointment',
      recommended: false,
    },
    {
      id: 'viewRequirements',
      title: 'View Requirements',
      description: 'See the likely documents, rules, and evidence you should prepare.',
      buttonLabel: 'View Requirements',
      recommended: false,
    },
  ];
}

function buildAnalytics(
  spatialPayload: ImpactMapPayload,
  impact: ImpactData,
): AnalyticsData {
  return {
    title: 'Insight Panel',
    subtitle: `Cascading public-unit impact around ${spatialPayload.areaName}.`,
    impactSeries: spatialPayload.impactSeries,
    cascadeSeries: spatialPayload.cascadeSeries,
    summaryCards: spatialPayload.summaryCards,
    highestAffectedSector: spatialPayload.topRiskUnit.style.label,
    estimatedCostIncrease: impact.monthlyChangeLabel,
    eligibilityStatus: impact.eligibilityStatus,
  };
}

export function buildPolicyToActionBundle({
  question,
  profile,
  intent = 'impact',
}: {
  question: string;
  profile: ImpactMapProfile;
  intent?: PolicyActionIntent;
}): PolicyActionBundle {
  const seed = hashSeed(
    `${question}-${profile.state}-${profile.district}-${profile.incomeGroup}-${profile.transport}-${profile.householdType || ''}`,
  );
  const theme = inferTheme(question);
  const spatialPayload = createImpactMapPayload(question, profile, {
    timeframe: /month|quarter|year/i.test(question) ? 'month' : 'day',
    periodIndex: clamp(Math.round(seededBetween(seed, 5, 6, 18)), 0, 29),
  });
  const explanation = buildExplanation(question, profile, theme, spatialPayload);
  const impact = buildImpact(question, profile, seed);
  const spatial = buildSpatialPreview(spatialPayload);
  const actions = buildActions(impact);
  const executionWorkflows = buildWorkflows(profile, impact, spatialPayload);
  const analytics = buildAnalytics(spatialPayload, impact);

  return {
    question,
    intent,
    explanation,
    impact,
    spatial,
    actions,
    executionWorkflows,
    analytics,
    actionPrompt: theme.actionPrompt,
  };
}

