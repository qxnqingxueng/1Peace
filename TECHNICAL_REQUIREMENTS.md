# 1Peace — Technical Requirements
## Google "Build with AI" Submission — Full Stack Architecture

---

## 1. Project Summary

**1Peace** is a Malaysian civic-tech platform that translates government policy into plain language and calculates personalised economic impact for every citizen. It transitions from "Chat" (policy Q&A) to "Action" (autonomous aid application and form submission) — the exact evaluation axis for this programme.

**Grand Challenge addressed:** Civic participation, financial inclusion, and equitable access to government services for underserved B40/M40 communities.

---

## 2. Google AI Ecosystem Stack Mapping

| Requirement | 1Peace Implementation |
|---|---|
| **Brain** — Gemini | Gemini 2.0 Flash for chat; Gemini 1.5 Pro for policy analysis |
| **Orchestrator** — Vertex AI Agent Builder + Firebase Genkit | Genkit flows for RAG pipeline; Agent Builder for autonomous form submission |
| **Dev Lifecycle** — Cloud Workstations + Cloud Run | Next.js frontend + Node.js backend both containerised on Cloud Run |
| **Context** — Vertex AI Search (RAG) | Malaysian parliament PDFs, LHDN circulars, Treasury guidelines indexed in Vertex AI Search |
| **Prototype** — Google AI Studio + Antigravity + Cloud Run | Prompts developed in AI Studio; deployed via Cloud Run |

---

## 3. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CITIZEN                              │
│                   (Web / Mobile Browser)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│              FRONTEND — Cloud Run #1                        │
│         Next.js 14 (App Router) + TypeScript                │
│              Tailwind CSS · Deployed as container           │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST + SSE (streaming)
┌──────────────────────────▼──────────────────────────────────┐
│              BACKEND — Cloud Run #2                         │
│         Node.js + Firebase Genkit (Agentic flows)           │
│         Vertex AI Agent Builder (autonomous execution)      │
└──────┬──────────────┬───────────────┬──────────────┬────────┘
       │              │               │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌────▼───────┐
│ Vertex AI   │ │  Gemini    │ │  Firestore │ │  Cloud     │
│ Search      │ │  API       │ │  Database  │ │  Storage   │
│ (RAG Index) │ │ Flash/Pro  │ │            │ │  (PDFs)    │
└─────────────┘ └────────────┘ └────────────┘ └────────────┘
```

---

## 4. Frontend

### Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR for SEO, React Server Components, easy Cloud Run containerisation |
| Language | **TypeScript** | Type safety for policy data structures |
| Styling | **Tailwind CSS** | Matches existing design system; utility-first |
| State | **Zustand** | Lightweight global state for user profile + chat history |
| Streaming | **Server-Sent Events (SSE)** | Stream Gemini token-by-token responses like Gemini.ai |
| i18n | **next-intl** | English + Bahasa Malaysia toggle |
| Auth UI | **Firebase Auth UI** | Pre-built sign-in with Google/phone |

### Pages & Routes
```
app/
├── page.tsx                  → Welcome / landing (redirects to /chat)
├── chat/
│   └── page.tsx              → Main chat interface (1Peace App)
├── translate/
│   └── page.tsx              → Policy Translator (right panel)
├── calculator/
│   └── page.tsx              → Impact Calculator (right panel)
├── tasks/
│   └── page.tsx              → My Tasks / Agent panel
├── profile/
│   └── page.tsx              → User profile setup (B40/M40, state, household)
└── api/                      → Next.js API routes (thin proxy to backend)
```

### Key Components
```
components/
├── chat/
│   ├── ChatPanel.tsx         → Main scrollable message area
│   ├── MessageBubble.tsx     → User + AI message rendering
│   ├── InputBar.tsx          → Textarea + send button
│   ├── SuggestionChips.tsx   → 22 scrollable question chips
│   └── ActionCard.tsx        → "1Peace can help you apply" inline CTA
├── tools/
│   ├── TranslatorPanel.tsx   → Bill selector + output
│   ├── CalculatorPanel.tsx   → Profile tags + impact result
│   └── AgentPanel.tsx        → Task list + pending actions
├── layout/
│   ├── Sidebar.tsx           → Tool nav + Aid Wallet + profile
│   └── Topbar.tsx            → Brand + lang toggle + profile badge
└── shared/
    ├── InfoBox.tsx           → Coloured policy info boxes
    ├── RefChips.tsx          → Policy source citation chips
    └── LoadingDots.tsx       → Three-dot loading animation
```

### Design System (from existing prototype)
```css
Primary:    #003399 (Malaysian government blue)
Accent:     #F7C800 (gold)
Danger:     #CC0001 (red)
Success:    #16a34a (green)
Surface:    #F9FAFB
Border:     #E5E7EB
Font:       'Segoe UI', system-ui, Arial
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_API_BASE_URL=https://backend-xxxx-run.app
```

---

## 5. Backend

### Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js 20** | Firebase Genkit is Node-native |
| Framework | **Firebase Genkit** | Google-mandated; handles Gemini + tool orchestration |
| Agent | **Vertex AI Agent Builder** | Google-mandated; autonomous multi-step execution |
| API | **Express.js** (via Genkit) | REST endpoints + SSE streaming |
| Containerisation | **Docker → Cloud Run** | Serverless, scales to zero |

### Firebase Genkit Flows (Core Logic)

#### Flow 1: `answerPolicyQuestion`
```
Input:  { question: string, userProfile: UserProfile, lang: 'en' | 'bm' }

Steps:
  1. vertexSearchRetrieval(question)
     → Query Vertex AI Search index
     → Returns top-5 policy chunks with source metadata

  2. buildPrompt(chunks, question, userProfile)
     → Injects citizen's B40/M40, state, household into prompt
     → "Answer this as if explaining to a [B40 single parent in Selangor]"

  3. geminiFlashGenerate(prompt)
     → Streams response token-by-token via SSE
     → Returns: { answer, sources[], actionItems[] }

  4. extractActions(actionItems)
     → If action found (e.g. "register on PADU"), create pending task
     → Store in Firestore tasks collection

Output: { answer: string, sources: Source[], task?: AgentTask }
```

#### Flow 2: `translatePolicy`
```
Input:  { billId: string, clauseQuery?: string, userProfile: UserProfile }

Steps:
  1. retrieveBillClauses(billId, clauseQuery)
     → Vertex AI Search filtered by bill metadata
     → Returns matched clauses with section numbers

  2. geminiProGenerate(clauses, userProfile)
     → Pro model for quality — complex legal language
     → Prompt: "Translate these clauses into plain [English/BM]
                for a citizen with this profile: [profile]"

  3. extractAgentAction(response)
     → Checks if registration/application action is needed
     → Returns actionType: 'padu_register' | 'mysejahtera' | 'lhdn' | null

Output: { summary: string, clauses: Clause[], sources: Source[], action?: ActionType }
```

#### Flow 3: `calculateImpact`
```
Input:  { policyId: string, userProfile: UserProfile }

Steps:
  1. retrievePolicyClauses(policyId)
     → Vertex AI Search for this specific policy

  2. applyEligibilityRules(userProfile, clauses)
     → Rule engine: checks income, state, vehicle, household
     → Pure JS logic — deterministic, no LLM for this step

  3. geminiFlashCompute(profile, rules, clauses)
     → Computes: cost_increase, credit_offset, net_change
     → Returns structured JSON { netChange, breakdown[] }

  4. matchAidProgrammes(userProfile)
     → Firestore query: programmes where eligibility rules match profile
     → Returns: qualifyingProgrammes[] sorted by deadline

Output: { netChange: number, breakdown: ImpactItem[], aid: Programme[] }
```

#### Flow 4: `executeAgentTask` (Vertex AI Agent Builder)
```
Input:  { taskType: string, userProfile: UserProfile, confirmed: boolean }

Agent Tools available:
  - navigatePortal(url)        → Open government portal
  - fillForm(fields)           → Pre-fill form fields from profile
  - submitForm(formId)         → Submit (only if confirmed: true)
  - checkStatus(referenceNo)   → Check application status
  - setReminder(date, msg)     → Schedule notification

Steps:
  1. Validate confirmed === true (human-in-the-loop gate)
  2. Agent selects tools based on taskType
  3. Executes multi-step: navigate → fill → present to user → submit
  4. Returns reference number + stores in Firestore

Output: { status: 'submitted' | 'pending_review', referenceNo?: string }
```

### REST API Endpoints
```
POST   /api/chat              → answerPolicyQuestion flow (SSE stream)
POST   /api/translate         → translatePolicy flow
POST   /api/calculate         → calculateImpact flow
GET    /api/aid/eligibility   → matchAidProgrammes (profile from token)
GET    /api/bills             → List indexed bills
GET    /api/bills/:id         → Bill metadata + clause count
POST   /api/tasks             → Create agent task
GET    /api/tasks             → List user tasks (from Firestore)
PUT    /api/tasks/:id/confirm → Confirm task (triggers agent execution)
DELETE /api/tasks/:id         → Cancel task
GET    /api/profile           → Get user profile
PUT    /api/profile           → Update user profile
```

### Backend Environment Variables
```env
GOOGLE_CLOUD_PROJECT=1peace-prod
GOOGLE_APPLICATION_CREDENTIALS=/secrets/sa-key.json
GEMINI_MODEL_FLASH=gemini-2.0-flash
GEMINI_MODEL_PRO=gemini-1.5-pro
VERTEX_SEARCH_INDEX_ID=malaysian-policy-index
VERTEX_SEARCH_LOCATION=asia-southeast1
FIRESTORE_DATABASE=(default)
```

---

## 6. Database

### Firestore Collections

#### `users/{userId}`
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  createdAt: Timestamp,
  profile: {
    incomeGroup: 'B40' | 'M40' | 'T20',
    state: string,
    householdType: 'single_parent' | 'married' | 'single' | 'senior' | 'oku',
    vehicleType: 'diesel' | 'petrol' | 'motorcycle' | 'none',
    dependants: number,
    monthlyIncome: number,
    isFirstHomeBuyer: boolean,
    isPtptnBorrower: boolean,
    paduRegistered: boolean,
    eKasihRegistered: boolean,
  },
  language: 'en' | 'bm',
  updatedAt: Timestamp
}
```

#### `conversations/{conversationId}`
```typescript
{
  userId: string,
  createdAt: Timestamp,
  messages: [
    {
      role: 'user' | 'assistant',
      content: string,
      sources: Source[],
      timestamp: Timestamp,
      type: 'chat' | 'translation' | 'calculation'
    }
  ]
}
```

#### `tasks/{taskId}`
```typescript
{
  userId: string,
  taskType: 'budi_madani' | 'str' | 'ptptn_defer' | 'pr1ma' | 'peka_b40' | 'mysalam',
  status: 'pending_review' | 'confirmed' | 'submitted' | 'completed' | 'failed',
  portalUrl: string,
  preFillData: Record<string, string>,
  deadline: Timestamp,
  referenceNo?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `programmes/{programmeId}`
```typescript
{
  name: string,                    // "BUDI MADANI"
  nameMs: string,                  // Bahasa Malaysia name
  description: string,
  amount: string,                  // "RM200/month"
  disbursementDate: string,
  deadline: Timestamp,
  portalUrl: string,
  eligibilityRules: {
    maxIncomeGroup: 'B40' | 'M40' | 'T20',
    eligibleStates: string[],      // [] = all states
    householdTypes: string[],
    vehicleRequired: string[],
    minDependants: number,
    requiresPadu: boolean,
    requiresEkasih: boolean,
  },
  category: 'fuel' | 'cash' | 'housing' | 'health' | 'education',
  isActive: boolean,
  updatedAt: Timestamp
}
```

#### `bills/{billId}`
```typescript
{
  title: string,
  titleMs: string,
  year: number,
  category: 'subsidy' | 'tax' | 'housing' | 'social' | 'digital',
  status: 'first_reading' | 'committee' | 'passed' | 'royal_assent' | 'gazetted',
  gazetteUrl: string,             // Cloud Storage path
  vertexSearchDocId: string,      // Reference to Vertex AI Search index
  clauses: number,                // Total indexed clauses
  lastUpdated: Timestamp,
  affectedGroups: string[]        // ["B40", "diesel_vehicle_owner"]
}
```

### Cloud Storage Buckets
```
gs://1peace-policy-docs/
  parliament/           → Gazetted bills (PDF)
  lhdn/                 → LHDN practice notes + circulars
  treasury/             → Budget speeches, treasury circulars
  epf/                  → EPF amendment circulars
  moh/                  → Ministry of Health guidelines
  processed/            → Chunked text files after Document AI processing
```

---

## 7. Vertex AI Search — RAG Setup

### Index Configuration
```yaml
Index name:    malaysian-policy-index
Location:      asia-southeast1
Data type:     Unstructured (PDF + text chunks)
Chunk size:    512 tokens
Chunk overlap: 64 tokens
Embedding:     text-multilingual-embedding-002 (supports BM + EN)
```

### Data Ingestion Pipeline
```
1. PDF uploaded to Cloud Storage
   ↓
2. Cloud Storage trigger → Pub/Sub → Cloud Run ingestion job
   ↓
3. Document AI (Form Parser) → extracts structured text + section numbers
   ↓
4. Chunker splits by clause boundary (regex on "§", "Section", "Seksyen")
   ↓
5. Metadata attached: { billId, section, year, category, affectedGroups }
   ↓
6. Vertex AI Search import → chunks indexed with embeddings
   ↓
7. Firestore bill record updated with vertexSearchDocId + clauses count
```

### RAG Query Pattern (inside Genkit flow)
```typescript
const searchResults = await vertexSearch.query({
  query: userQuestion,
  filter: buildFilter(userProfile),   // e.g. category:subsidy AND year>=2024
  pageSize: 5,
  queryExpansionSpec: { condition: 'AUTO' },
  spellCorrectionSpec: { mode: 'AUTO' },
});

// Returns: chunks with metadata, relevance scores, source bill
```

---

## 8. Google Cloud Infrastructure

### Services Used
| Service | Purpose | Tier |
|---|---|---|
| **Cloud Run** #1 | Frontend (Next.js) | min-instances: 0, max: 10 |
| **Cloud Run** #2 | Backend (Genkit + Express) | min-instances: 1, max: 20 |
| **Vertex AI Search** | RAG index | Standard |
| **Vertex AI (Gemini)** | Flash + Pro API calls | Pay-per-use |
| **Vertex AI Agent Builder** | Autonomous agent | Standard |
| **Firestore** | Database | Native mode |
| **Cloud Storage** | Policy PDFs | Standard |
| **Firebase Auth** | Authentication | Spark / Blaze |
| **Cloud Build** | CI/CD pipeline | Standard |
| **Secret Manager** | API keys + service accounts | Standard |
| **Cloud Pub/Sub** | Document ingestion pipeline | Standard |

### Cloud Run Deployment Config
```yaml
# frontend service
name: 1peace-frontend
image: gcr.io/1peace-prod/frontend:latest
region: asia-southeast1
memory: 512Mi
cpu: 1
max-instances: 10
env:
  - NEXT_PUBLIC_API_BASE_URL: https://1peace-backend-xxxx-as.a.run.app

# backend service
name: 1peace-backend
image: gcr.io/1peace-prod/backend:latest
region: asia-southeast1
memory: 1Gi
cpu: 2
min-instances: 1
max-instances: 20
service-account: 1peace-backend-sa@1peace-prod.iam.gserviceaccount.com
```

### IAM Roles (Backend Service Account)
```
roles/aiplatform.user              → Vertex AI Search + Gemini API
roles/discoveryengine.editor       → Vertex AI Search indexing
roles/datastore.user               → Firestore read/write
roles/storage.objectViewer         → Cloud Storage PDF access
roles/secretmanager.secretAccessor → Secret Manager
```

---

## 9. Authentication & Security

### Auth Flow
```
1. User opens 1Peace
2. Firebase Auth → Sign in with Google (or phone OTP for B40 accessibility)
3. Firebase ID token issued
4. Frontend sends token in Authorization header on every API call
5. Backend verifies token via Firebase Admin SDK
6. User profile loaded from Firestore users/{uid}
```

### Security Rules
- All Firestore reads/writes scoped to `request.auth.uid == userId`
- Cloud Run backend is not publicly accessible — only via Firebase Auth token
- Agent task execution requires `confirmed: true` in request body (human-in-the-loop)
- No government portal credentials stored — agent navigates as the user's browser session

---

## 10. Development Workflow

### Local Setup
```bash
# Clone and install
git clone https://github.com/your-org/1peace
cd 1peace && npm install

# Frontend
cd apps/frontend
cp .env.example .env.local
npm run dev         # localhost:3000

# Backend (Genkit)
cd apps/backend
npm run genkit:dev  # localhost:3400 (Genkit dev UI)
npm run dev         # localhost:8080 (Express API)
```

### Monorepo Structure
```
1peace/
├── apps/
│   ├── frontend/         → Next.js app
│   └── backend/          → Genkit + Express
├── packages/
│   ├── types/            → Shared TypeScript types
│   └── policy-rules/     → Aid eligibility rule engine (pure JS)
├── scripts/
│   ├── ingest-pdfs.ts    → Document ingestion pipeline
│   └── seed-programmes.ts → Seed Firestore with aid programme data
├── infra/
│   ├── cloudbuild.yaml   → CI/CD pipeline
│   └── terraform/        → Cloud Run + IAM setup
├── docs/
│   └── prototype/        → 1peace-app.html (existing UI prototype)
└── CLAUDE.md             → Project brief for AI assistants
```

### CI/CD Pipeline (Cloud Build)
```yaml
# cloudbuild.yaml
steps:
  - name: node:20
    entrypoint: npm
    args: [ci, --workspace=apps/frontend, --workspace=apps/backend]

  - name: node:20
    entrypoint: npm
    args: [run, test, --workspaces]

  - name: gcr.io/cloud-builders/docker
    args: [build, -t, gcr.io/$PROJECT_ID/frontend, ./apps/frontend]

  - name: gcr.io/cloud-builders/docker
    args: [build, -t, gcr.io/$PROJECT_ID/backend, ./apps/backend]

  - name: gcr.io/cloud-builders/gcloud
    args: [run, deploy, 1peace-frontend, --image, gcr.io/$PROJECT_ID/frontend, --region, asia-southeast1]

  - name: gcr.io/cloud-builders/gcloud
    args: [run, deploy, 1peace-backend, --image, gcr.io/$PROJECT_ID/backend, --region, asia-southeast1]
```

---

## 11. Gemini Prompt Architecture

### Prompt 1 — Policy Q&A (Gemini Flash)
```
System:
You are 1Peace, a Malaysian civic-tech assistant. You help citizens understand 
government policies in plain, friendly language — no legal jargon.
Always answer as if speaking to a [${profile.incomeGroup}] ${profile.householdType} 
living in ${profile.state}. Use simple English (or Bahasa Malaysia if asked).
End every answer with one clear action the citizen should take.
Never mention RAG, LLM, AI, or technical systems.

Context (retrieved policy clauses):
${chunks.map(c => `[${c.source} ${c.section}]: ${c.text}`).join('\n')}

User question: ${question}
```

### Prompt 2 — Policy Translation (Gemini Pro)
```
System:
You are a Malaysian policy translator. Convert the following legal clauses into 
plain language a citizen with no legal background can understand.
Profile: ${profile.incomeGroup}, ${profile.householdType}, ${profile.state}, 
vehicle: ${profile.vehicleType}.
Output format:
- What this means (2-3 sentences)
- Who is affected
- What changes from before
- What action is needed + deadline
Keep it under 200 words. No legal jargon.

Clauses: ${clauses}
```

### Prompt 3 — Impact Calculation (Gemini Flash with JSON output)
```
System:
Calculate the monthly financial impact of this policy change on this citizen.
Return ONLY valid JSON matching this schema:
{
  "netChange": number,       // negative = citizen loses money
  "costIncrease": number,
  "creditOffset": number,
  "explanation": string,     // one plain-language sentence
  "urgentAction": string | null
}

Profile: ${JSON.stringify(profile)}
Policy rules: ${JSON.stringify(rules)}
```

---

## 12. Aid Eligibility Rule Engine

This is **pure JavaScript — no LLM** for the matching logic (deterministic, no hallucination risk).

```typescript
// packages/policy-rules/src/eligibility.ts

export function matchAidProgrammes(
  profile: UserProfile,
  programmes: Programme[]
): MatchedProgramme[] {
  return programmes
    .filter(p => p.isActive)
    .filter(p => checkIncomeGroup(profile, p))
    .filter(p => checkState(profile, p))
    .filter(p => checkHousehold(profile, p))
    .filter(p => checkVehicle(profile, p))
    .filter(p => checkDependants(profile, p))
    .map(p => ({
      ...p,
      metCriteria: getCriteriaMet(profile, p),
      unmetCriteria: getCriteriaUnmet(profile, p),
    }))
    .sort((a, b) => a.deadline.seconds - b.deadline.seconds); // urgent first
}
```

---

## 13. Chat-to-Action Transition (Evaluation Criterion)

This is how 1Peace moves from **Chat → Action** — the core judging criterion:

```
CHAT (passive)                    ACTION (autonomous)
─────────────────────────────────────────────────────
"You qualify for BUDI MADANI"  →  Agent pre-fills PADU form
"STR deadline is 30 April"     →  Agent sets WhatsApp reminder
"PTPTN deferment available"    →  Agent submits deferment form
"PeKa B40 covers screening"    →  Agent books nearest clinic slot
"eKasih school aid open"       →  Agent completes application
```

Every chat answer that surfaces an actionable item creates an **Agent Task** in Firestore. The task appears in the "My Tasks" panel. The citizen reviews the pre-filled form, taps "Confirm", and the Vertex AI Agent executes the submission — with a reference number returned.

---

## 14. Estimated Cost (Google Cloud, monthly at MVP scale)

| Service | Est. Usage | Est. Cost |
|---|---|---|
| Cloud Run (2 services) | 500k requests/mo | ~$15 |
| Gemini Flash | 1M input tokens/day | ~$30 |
| Gemini Pro | 100k input tokens/day | ~$25 |
| Vertex AI Search | 10k queries/day | ~$40 |
| Firestore | 1M reads, 200k writes | ~$5 |
| Cloud Storage | 10GB | ~$2 |
| Firebase Auth | Free tier | $0 |
| **Total** | | **~$117/month** |

*Google Cloud credits from the Build with AI programme cover initial deployment costs.*

---

## 15. Phase Delivery Plan

| Phase | Deliverable | Timeline |
|---|---|---|
| **0 — Prototype** | 1peace-app.html deployed on Cloud Run static | Day 1 |
| **1 — Backend** | Genkit flows + Gemini API working (mock Vertex Search) | Week 1 |
| **2 — RAG** | Vertex AI Search indexed with 20 pilot bills | Week 2 |
| **3 — Auth + DB** | Firebase Auth + Firestore user profiles + task queue | Week 2 |
| **4 — Frontend** | Next.js app matching existing HTML prototype | Week 3 |
| **5 — Agent** | Vertex AI Agent Builder — PADU + STR form tasks | Week 3 |
| **6 — Polish** | BM language, mobile responsive, analytics | Week 4 |
| **Demo day** | Live on Cloud Run, Vertex AI Search grounded, Agent demo | Week 4 |
