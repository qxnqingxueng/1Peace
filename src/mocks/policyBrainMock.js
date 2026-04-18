function buildImpactMock(question, profile) {
  return `## Personalized Monthly Impact
- Estimated monthly impact: RM 145 to RM 210
- Household profile: ${profile.householdType}, ${profile.incomeGroup}, ${profile.district}, ${profile.state}

## What Is Driving The Cost Change
- Transport and fuel sensitivity remain the main exposure for "${question}".
- Utility and daily goods costs are likely to move second.

## Benefit Eligibility
- Likely supports need official verification through the relevant agency.
- A Firebase Genkit flow should replace this mock once deployed.

## Net Monthly Change
- Directional change: moderate increase in monthly pressure.

## Recommendation
- Review transport-heavy spending first, then validate aid eligibility against the official policy workflow.

## Key Assumptions
- Mock response returned because the backend flow is not yet reachable locally.`;
}

function buildTranslatorMock(question, profile) {
  return `## Plain-Language Summary
The current local environment returned a mock explanation for "${question}".

## Why It Matters
For a ${profile.incomeGroup} household in ${profile.district}, unclear policy wording can hide direct cost and eligibility effects.

## Clause References
- Vertex AI Search retrieval is scaffolded but not configured.
- Official clause grounding should replace this mock once Discovery Engine credentials are present.

## What To Do Next
- Deploy the Firebase Functions + Genkit backend.
- Connect Vertex AI Search and rerun the same prompt for grounded output.`;
}

function buildGeospatialMock(question, profile, geospatialPayload) {
  return `## Area Overview
The 3D simulation around ${geospatialPayload.areaName} is active with a ${geospatialPayload.radiusKm}km radius for "${question}".

## Focus Unit System
${geospatialPayload.focusUnit.label} is the focus unit on day ${geospatialPayload.selectedDay} with impact ${geospatialPayload.selectedDaySnapshot.impact}/100.

## Ripple To Other Units
Top linked units:
${geospatialPayload.topLinkedUnits.map((unit, index) => `${index + 1}. ${unit.label} (${unit.sectorLabel})`).join('\n')}

## What To Watch Next
- This is a deterministic mock summary.
- The production path should come from a Genkit geospatial flow backed by Firebase Functions.`;
}

export function buildPolicyBrainMockResponse({ mode, question, profile, geospatialPayload }) {
  if (mode === 'translator') {
    return buildTranslatorMock(question, profile);
  }

  if (mode === 'geospatial' && geospatialPayload) {
    return buildGeospatialMock(question, profile, geospatialPayload);
  }

  return buildImpactMock(question, profile);
}
