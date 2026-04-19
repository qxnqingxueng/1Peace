1. Project Summary

**1Peace** is a Malaysian civic-tech super-platform covering two mandates:

- **Category 1 — Policy & Finance:** Translates government bills into plain language, calculates personal economic impact, maps infrastructure affected by policy
- **Category 2 — Disaster Intelligence:** Real-time 3D flood warning, evacuation routing, and an autonomous post-disaster aid agent that submits Bantuan Wang Ihsan applications end-to-end without citizen friction.

The platform transitions from **Chat → Action** across both categories, which is the core judging axis for the Build with AI programme.

**Grand Challenges addressed:** Civic participation, financial inclusion for B40/M40, annual flood disaster response, and reducing bureaucratic friction in government aid delivery.

---

## 2. Google AI Ecosystem Stack Mapping

| Requirement | 1Peace Implementation |
|---|---|
| **Brain — Gemini Flash** | Cat 1 chat Q&A, news summarisation, flood JSON parsing (low latency) |
| **Brain — Gemini Pro** | Policy translation, BWI multimodal photo assessment, complex legal reasoning |
| **Brain — Gemini 2.0 Multimodal** | Reads TNB utility bill photo + disaster photos for BWI agent |
| **Orchestrator — Firebase Genkit** | All agentic flows: policy → action, flood routing, BWI submission |
| **Orchestrator — Vertex AI Agent Builder** | Autonomous form submission, aid application, PPS routing agent |
| **Dev Lifecycle — Cloud Run** | Frontend (Next.js) + Backend (Genkit/Express), both containerised |
| **Context — Vertex AI Search** | Malaysian policy PDFs + NADMA disaster SOPs (grounded RAG, zero hallucination) |
| **Prototype — Google AI Studio + Cloud Run** | Prompts prototyped in AI Studio; live on Cloud Run |
---

## 3. Feature Catalogue

### Category 1 — Policy & Finance

| # | Feature | Status |
|---|---|---|
| 1.1 | Plain-Language Policy Translator | Core |
| 1.2 | Hyper-Personalised Economic Impact Calculator | Core |
| 1.3 | 3D Geospatial Public Facility Impact Map | New |
| 1.4 | Live Malaysian Policy & Financial News Feed | New |

### Category 2 — Disaster Intelligence

| # | Feature | Status |
|---|---|---|
| 2.1 | 3D Flood Zones & Evacuation Routing | New |
| 2.2 | Ultra-Fast Disaster Situational Awareness | New |
| 2.3 | Post-Disaster Aid Approver Agent (Multimodal BWI) | New |
| 2.4 | National Disaster Policy RAG Brain | New |
| 2.5 | AI Post-Disaster Aid Instant Approval Chat | New |

---

## 5. Frontend

### Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR, React Server Components, easy Cloud Run containerisation |
| Language | **TypeScript** | Type safety across policy data + GeoJSON + news schemas |
| Styling | **Tailwind CSS** | Utility-first; matches existing 1Peace design system |
| State | **Zustand** | Global store: user profile, chat history, flood alerts, map state |
| Map | **MapLibre GL JS** | Open-source, WebGL 3D maps; Google-compatible tiles |
| 3D Data | **Deck.gl** | 3D flood zones, evacuation routes, facility heatmaps |
| Streaming | **Server-Sent Events (SSE)** | Gemini token-by-token streaming for chat |
| Notifications | **Firebase Cloud Messaging (FCM)** | Flood push alerts |
| i18n | **next-intl** | English + Bahasa Malaysia |
| Auth UI | **Firebase Auth UI** | Google sign-in + phone OTP |

### Pages & Routes

```
app/
├── page.tsx                    → Landing (redirects to /chat)
├── chat/
│   └── page.tsx                → Main chat + Policy Translator + Calculator
├── map/
│   ├── policy/page.tsx         → 3D Facility Impact Map (Feature 1.3)
│   └── flood/page.tsx          → 3D Flood Warning + Evacuation (Feature 2.1)
├── news/
│   └── page.tsx                → Live News Feed (Feature 1.4)
├── disaster/
│   ├── alert/page.tsx          → Real-time flood situational dashboard (Feature 2.2)
│   └── claim/page.tsx          → BWI Aid application agent (Feature 2.3)
├── tasks/
│   └── page.tsx                → My Tasks — pending applications
├── profile/
│   └── page.tsx                → Citizen profile setup
└── api/                        → Next.js proxy routes to backend

### Design System (unchanged from prototype)

```css
--blue:       #003399   Primary, nav, buttons
--gold:       #F7C800   Accent, AI avatar
--red:        #CC0001   Danger, calculator CTA
--green:      #16a34a   Success, aid highlight
--surface:    #F9FAFB
--border:     #E5E7EB
Font:         'Segoe UI', system-ui, Arial
```

## 6. Backend

### Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js 20** | Firebase Genkit is Node-native |
| Framework | **Firebase Genkit** | Google-mandated orchestrator for all AI flows |
| Agent | **Vertex AI Agent Builder** | Autonomous form submission + routing |
| API | **Express.js** (via Genkit) | REST + SSE streaming endpoints |
| Containerisation | **Docker → Cloud Run** | Serverless, scales to zero |

### All Firebase Genkit Flows

