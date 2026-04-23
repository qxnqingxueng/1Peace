# 1Peace — One Malaysia, One Platform

**🌐 Live Demo:** [https://peace-2c6e2.web.app](https://peace-2c6e2.web.app)

> A citizen-first civic-tech super-platform that turns complex government policy into practical everyday decisions — and transitions communities into real-time flood and disaster response when risk escalates.

---

## 🎯 About

**1Peace** is a Malaysian civic-tech super-platform built to close the gap between government policy and the everyday citizen. Most Malaysians never claim aid they are legally entitled to — not because they are ineligible, but because the system is too complex to navigate. 1Peace changes that.

The platform operates across two mandates:

- **Peace-Time — Policy Compass:** Translates government bills into plain language, calculates the personal financial impact of each policy on your household, and proactively identifies every aid programme you qualify for — then applies on your behalf with one tap.
- **Crisis-Time — Flood Shield:** Delivers real-time 3D flood and tsunami escalation alerts, surfaces the nearest shelters and safer evacuation corridors, and autonomously submits Bantuan Wang Ihsan post-disaster aid applications end-to-end — without any citizen friction.

The platform transitions seamlessly from **Chat → Understand → Act**, making government accessible for every Malaysian regardless of literacy, income, or technical ability.

### ✨ Key Features

- 🗣️ **Policy Chat** — Ask anything about Malaysian subsidies, tax relief, or government programmes in plain language and get an instant, personalised answer.
- 📄 **Policy Translator** — Select any Malaysian bill or act and receive a plain-language summary: what it does, who qualifies, what you receive, and what action is required.
- 💰 **Impact Calculator** — Enter your income group, state, household type, and vehicle to see exactly how a policy shifts your monthly finances — down to the ringgit.
- 🎯 **Aid Eligibility Tracker** — A live dashboard of every government aid programme you match, with clear eligibility status, deadlines, and one-tap application via 1Peace.
- 📜 **Bill Tracker** — Monitor the progress of any Malaysian parliamentary bill through each reading stage, with keyword alerts via WhatsApp or Email.
- 📅 **Policy Timeline** — Side-by-side before/after comparisons of policy clauses in plain language, so you can see exactly what changed and who is affected.
- 📊 **Impact Dashboard** — Macro view of policy expenditure trends, sector impact rankings, operator revenue shifts, and affected local infrastructure.
- ✅ **My Tasks** — 1Peace pre-fills and submits government applications on your behalf. You review and approve every action before it is taken.
- 🌊 **Flood Shield** — Real-time crisis mode with escalation monitoring, nearest shelter routing, and automated post-disaster aid submission.

---

## 🏆 Project 2030: MyAI Future Hackathon

This project was built for **Project 2030: MyAI Future Hackathon**, organised by GDG on Campus Universiti Teknologi Malaysia (UTM) Johor Bahru as part of the **Build with AI 2026** programme.

The hackathon challenges teams to build impactful, AI-powered solutions aligned with Malaysia's national development goals and the United Nations Sustainable Development Goals (SDGs), using Google technologies.

🔗 [Event Page](https://gdg.community.dev/events/details/google-gdg-on-campus-universiti-teknologi-malaysia-johor-bahru-malaysia-presents-build-with-ai-2026-hackathon-project-2030-myai-future-hackathon/cohost-gdg-on-campus-universiti-teknologi-malaysia-johor-bahru-malaysia/)

---

## 🌍 SDG Alignment

1Peace directly contributes to three United Nations Sustainable Development Goals:

### SDG 10 — Reduced Inequalities
**Target 10.2:** Promote social, economic, and political inclusion of all, irrespective of age, sex, disability, race, ethnicity, origin, religion, or economic status.

Malaysia's B40 and M40 households are disproportionately affected by policy changes — subsidy reforms, tax adjustments, and aid restructuring — yet they are the least equipped to navigate the bureaucratic systems designed to protect them. 1Peace directly addresses this by translating complex legal text into plain language, calculating real ringgit impact per household profile, and removing every administrative barrier between a citizen and the aid they are legally entitled to. This is financial inclusion made operational.

### SDG 11 — Sustainable Cities and Communities
**Target 11.5:** Significantly reduce the number of deaths and the number of people affected by disasters, including water-related disasters.

Malaysia experiences annual monsoon flooding that displaces hundreds of thousands of citizens. 1Peace's Flood Shield module provides real-time escalation monitoring, nearest shelter identification, safer movement corridors, and automated post-disaster aid application — reducing both the human cost of floods and the bureaucratic delay that leaves affected families waiting weeks for relief.

### SDG 16 — Peace, Justice and Strong Institutions
**Target 16.6:** Develop effective, accountable, and transparent institutions at all levels.

Government policy is written for lawmakers, not citizens. 1Peace creates a transparent, accessible layer between legislation and the public — making it possible for any Malaysian to understand what a bill means, how it affects them, and what their rights are. By automating aid applications with full citizen approval at every step, 1Peace also reduces opportunities for information asymmetry and bureaucratic gatekeeping in the aid delivery pipeline.

---

## 🏗️ Technical Architecture

### System Overview

1Peace follows a **cloud-native, AI-orchestrated architecture** where a Next.js frontend delivers a fast, interactive citizen experience, while all AI reasoning, agentic flows, and data grounding run on Google Cloud. The platform is split into two runtime layers: a containerised frontend and a containerised backend, both deployed on Cloud Run and scaling to zero when idle.

---

### Frontend Stack

- **Next.js 14 (App Router) & TypeScript** — Server-side rendering and React Server Components for fast page loads and type-safe policy data, GeoJSON, and news schemas across the full application.
- **Tailwind CSS** — Utility-first styling built on the 1Peace design system (Navy `#003399`, Gold `#F7C800`, semantic greens and reds for aid status).
- **Zustand** — Lightweight global state management for citizen profile, chat history, real-time flood alerts, and map state.
- **Firebase Auth UI** — Secure sign-in with Google SSO and phone OTP, backed by Firebase Authentication.
- **next-intl** — Full internationalisation support for English and Bahasa Malaysia.
- **Server-Sent Events (SSE)** — Token-by-token Gemini response streaming for the policy chat interface, keeping the experience fast and conversational.
- **Firebase Cloud Messaging (FCM)** — Push notifications for real-time flood escalation alerts delivered directly to citizens' devices.

---

### 3D Map & Geospatial Engine

- **MapLibre GL JS** — Open-source WebGL map renderer used as the base layer for all geospatial views, compatible with Google-sourced map tiles.
- **Deck.gl** — High-performance 3D data visualisation layer built on top of MapLibre, used to render live flood zone overlays, evacuation route corridors, and public facility impact heatmaps across Malaysian states.

---

### AI & Orchestration Engine

- **Gemini Flash (Google)** — Low-latency model handling real-time policy Q&A chat, Malaysian financial news summarisation, and live flood JSON parsing where speed is critical.
- **Gemini Pro (Google)** — Higher-reasoning model for full policy bill translation, complex legal clause interpretation, and personalised economic impact calculation.
- **Gemini 2.0 Multimodal (Google)** — Reads citizen-uploaded photos (TNB utility bills, disaster damage evidence) to extract data for the Bantuan Wang Ihsan (BWI) post-disaster aid agent — no manual form entry required.
- **Firebase Genkit** — Google's AI orchestration framework, used to define and run all agentic flows: policy-to-action pipelines, flood evacuation routing, and the end-to-end BWI aid submission agent.
- **Vertex AI Agent Builder** — Autonomous agent layer responsible for pre-filling and submitting government aid forms on the citizen's behalf, with citizen approval at every step.
- **Vertex AI Search** — Grounds all AI responses in verified Malaysian government sources — policy PDFs, parliamentary bills, and NADMA disaster SOPs — ensuring zero hallucination on legally sensitive content.

---

### Backend & Cloud Infrastructure

- **Node.js 20 + Express.js (via Genkit)** — Backend runtime serving REST endpoints and SSE streaming, structured around Firebase Genkit flows for clean AI pipeline separation.
- **Docker → Cloud Run** — Both the Next.js frontend and the Genkit/Express backend are containerised and deployed as Cloud Run services, serverless and auto-scaling.
- **Google AI Studio** — Used to prototype and iterate all Gemini prompts before production deployment on Cloud Run.
- **Firebase Authentication** — Manages citizen accounts, sessions, and Google/OTP sign-in across the platform.
- **Firebase Cloud Messaging** — Real-time push delivery for flood warnings and task deadline reminders.

---

## ⚙️ Implementation Details

### Client-Side Routing

1Peace uses a lightweight **hash-based routing** system defined in `App.jsx`. There are no third-party router dependencies — route state is driven entirely by `window.location.hash`, with a `hashchange` event listener keeping the React tree in sync. Four pathways are registered:

```
/policy-brain     → PolicyBrainPage   (Peace-time: Chat, Tracker, Impact)
/disaster-twin    → CrisisOpsPage     (Crisis-time: Flood map, situational ops)
/aid-copilot      → (Aid submission agent — placeholder)
/recovery-ledger  → (Post-disaster recovery — placeholder)
```

Any unrecognised hash falls back to the `MainGatewayLanding` root, keeping navigation stateless and URL-shareable without a server.

---

### Firebase Initialisation

Firebase is initialised once in `src/firebase/client.js` using a **conditional singleton pattern** — if any required environment variable is missing, all Firebase exports (`auth`, `db`, `storage`, `functions`) resolve to `null`, and the application renders in a degraded demo mode without crashing. This allows local development and demo deployments to run without a live Firebase project.

Firebase Functions are scoped to the `asia-southeast1` region (configurable via `VITE_FIREBASE_FUNCTIONS_REGION`) to minimise latency for Malaysian users.

```js
// Exported clients — null-safe across the entire app
export const auth      = app ? getAuth(app)      : null;
export const db        = app ? getFirestore(app)  : null;
export const storage   = app ? getStorage(app)    : null;
export const functions = app ? getFunctions(app, 'asia-southeast1') : null;
```

---

### Policy Brain — Chat & Tools Panel

`src/pages/Policy.jsx` is the core Policy Compass interface. On mount, it calls `onAuthStateChanged` from Firebase Auth and `getRedirectResult` to handle Google SSO redirect flows, then fetches the citizen's profile document from Firestore. The right-hand tools panel (Policy Translator, Impact Calculator, My Tasks) renders as an animated slide-in drawer controlled by local state, progressing through a three-step flow: **Understand → Personalise → Act**.

User profiles are written to Firestore on first sign-in via `setDoc` with `serverTimestamp()` and read back on subsequent sessions via `getDoc`.

---

### Tracker View — Bill Tracker & Aid Eligibility

`src/views/Tracker.jsx` renders three sub-views — Aid Eligibility, Bill Tracker, and Policy Timeline — with animated transitions powered by **Framer Motion** (`AnimatePresence`, `LayoutGroup`, spring physics tokens).

Bill progression is visualised as an animated pipeline bar across six parliamentary stages (Tabled → 1st Reading → 2nd Reading → Committee → 3rd Reading → Gazetted), with each dot animating in with a staggered spring delay. Aid eligibility cards are filtered client-side by category and rendered with per-card status badges (`eligible`, `action`, `ineligible`). Policy Timeline renders before/after clause diffs with draggable section dividers.

All bill data, aid eligibility rules, and policy diffs are **static data co-located in the component** — enabling instant, zero-latency filtering with no API calls required for the core civic information layer.

---

### Map Engine — Peace Mode & Crisis Mode

`src/map/MapView.jsx` is a dual-mode geospatial component powered by **MapLibre GL JS** (via `react-map-gl`) and **Deck.gl**.

In **Peace Mode**, a `ColumnLayer` renders public facility impact scores (clinics, schools, logistics hubs) as 3D extruded columns — height and colour scaled to policy impact severity.

In **Crisis Mode**, three Deck.gl layers activate simultaneously:
- `PolygonLayer` — renders flood zone boundaries as filled polygons with animated opacity pulsing via a `time` ticker (`setInterval` at 60fps equivalent).
- `ScatterplotLayer` — plots PPS shelter locations as radiating circles.
- `PathLayer` — draws the active evacuation route as a directional path from the flood origin to the selected PPS shelter.

Three map style modes are supported — **3D** (CARTO Dark Matter), **Satellite** (ESRI World Imagery, key-free raster tiles), and **Heatmap** (CARTO Positron) — each with a distinct pitch and zoom preset managed by `VIEW_CONFIGS`.

The `useModeTheme` hook (`src/hooks/useModeTheme.js`) synchronises the document's `data-mode` attribute (`peace` / `crisis` / `landing`) on mount and cleans up on unmount, allowing global CSS theming to switch between the navy/gold peace palette and the high-contrast red/dark crisis palette without re-rendering the component tree.

---

### Impact Dashboard

`src/views/Impact.jsx` renders the macro policy expenditure view. All chart data is generated client-side via a `wave()` function that produces realistic spend curves from base, amplitude, peak position, and peak boost parameters — no charting library dependency. Temporal resolution switches between 1Y (12 monthly points), 3Y (12 quarterly points), 5Y, and 10Y via pill selectors, re-deriving the dataset on each selection using `useMemo`.

---

### Firestore Data Structure

```
users/
  {userId}/
    profile: {
      uid, name, email,
      photoURL, provider,
      incomeGroup, state, householdType,
      createdAt (serverTimestamp),
      lastLoginAt (serverTimestamp)
    }
```

---

## 🧪 Developed with Google AI Studio

1Peace was prototyped and iterated entirely inside **Google AI Studio** before production deployment. Every Gemini prompt powering the platform — from policy translation to flood situational parsing — was first designed, tested, and refined there.

### How We Used Google AI Studio

- **Prompt prototyping:** All Gemini Flash and Gemini Pro prompts were written and benchmarked directly in AI Studio's prompt editor, allowing rapid iteration on tone, output structure, and accuracy before touching any code.
- **Multimodal testing:** We used AI Studio's file upload feature to test Gemini 2.0's document reading capability — uploading real TNB utility bills and verifying that the model could correctly extract account holder name, address, and usage data for the BWI aid agent.
- **System instruction tuning:** The citizen-facing chat assistant's system instruction (plain language, B40-aware, bilingual) was refined through dozens of AI Studio sessions before being hardcoded into the Genkit flow.
- **Response structure validation:** We used AI Studio's JSON mode to ensure policy translation outputs consistently returned structured fields (`what_it_does`, `who_qualifies`, `what_you_receive`, `action_required`) before wiring them to the frontend.

### Sample Prompts We Developed

**Policy Translator — System Instruction**
```
You are a Malaysian civic assistant. Translate the following government bill clause into plain language 
that a B40 citizen with no legal background can understand. Respond in both English and Bahasa Malaysia. 
Output must include: what this clause does, who is affected, what action (if any) the citizen must take, 
and the deadline if one exists. Be direct. Avoid jargon.
```

**Impact Calculator — Personalised Analysis**
```
Given this citizen profile: income group B40, state Selangor, household type single parent, 
vehicle diesel car, 2 dependants — calculate the net monthly financial impact of the 
Targeted Diesel Subsidy Rationalisation Bill 2024. Show the fuel cost increase separately 
from the BUDI MADANI credit offset. Return a single net figure in ringgit.
```

**Flood Situational Parser — Crisis Mode**
```
Parse the following NADMA flood alert JSON and return a plain-language situational summary 
for a citizen in the affected district. Include: current water level status, nearest open 
PPS shelters, recommended evacuation route, and whether the Bantuan Wang Ihsan aid window 
is active. Keep the response under 100 words. Prioritise clarity over completeness.
```

**BWI Aid Agent — Multimodal Document Extraction**
```
You are processing a Malaysian citizen's TNB utility bill image to pre-fill a Bantuan Wang Ihsan 
disaster aid application. Extract: full name, IC number if visible, service address, account number, 
and latest billing month. If any field is not clearly visible, return null for that field — do not guess. 
Output as JSON only.
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase project (Authentication, Firestore, and Hosting enabled)
- Google AI Studio API key (for Gemini)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/1peace.git
cd 1peace
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Firebase and Gemini API credentials:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> If any Firebase key is missing, the app launches in **demo mode** — all UI and static data remains visible, but authentication and Firestore sync are disabled.

4. **Start the development server**

```bash
npm run dev
```

5. **Open in browser** — Navigate to `http://localhost:5173`

For full Firebase project setup (Google sign-in, Firestore rules, authorised domains), refer to [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md). For production deployment to Firebase Hosting, refer to [`DEPLOY.md`](./DEPLOY.md).

---

## 📖 User Guide

Welcome to 1Peace! Here's how to get the most out of the platform across both peace-time and crisis-time modes.

### 1. Choose Your Mode

- **Landing Page:** Open 1Peace and select **Policy Compass** (peace-time) or **Flood Shield** (crisis-time). Both modes use the same saved citizen profile.
- **Sign In:** Use your Google account to unlock personalised results. The app is fully functional in demo mode without sign-in, but data will not be saved across sessions.

### 2. Policy Compass — Understand Your Policies

- **Chat:** Type any question in Bahasa Malaysia or English — "Do I qualify for diesel subsidy?", "How much STR 2026 will I get?", "Explain EPF Account 3." Get an instant plain-language answer based on your profile.
- **Policy Translator:** Open the right-hand panel → select a Malaysian bill from the dropdown → click **Translate This Policy** to see a plain-language summary: what it does, who qualifies, what you receive, and your action deadline.
- **Impact Calculator:** Set your Income Group (B40 / M40 / T20), State, Household Type, and Vehicle → click **Calculate My Impact** to see your exact net monthly change in ringgit, with a full breakdown of cost increases against credits received.

### 3. Tracker — Monitor Bills & Aid

- **Aid Eligibility:** See every government aid programme matched to your profile, with status badges (Eligible / Action needed / Not eligible), outstanding requirements, and deadlines.
- **Bill Tracker:** Subscribe to keywords (e.g. "diesel", "housing loan") and receive WhatsApp or Email alerts when a tracked bill advances through parliament. Each bill shows a live six-stage progress bar: Tabled → 1st Reading → 2nd Reading → Committee → 3rd Reading → Gazetted.
- **Policy Timeline:** Select any bill to compare before-and-after clause changes side by side in plain language, with a tag for every group affected by each change.

### 4. My Tasks — Let 1Peace Apply For You

- **Pending Applications:** 1Peace pre-fills government aid applications using your saved profile. Review each submission in the My Tasks panel before anything is sent.
- **Completed History:** Track the status of all past applications, reference numbers, and disbursement dates in one place.
- **You approve every action before it is taken.** 1Peace never submits anything on your behalf without your explicit confirmation.

### 5. Flood Shield — Crisis Response

- **Situational Dashboard:** When flood risk is elevated, Flood Shield activates with real-time water level readings and escalation status (Watch → Warning → Danger).
- **3D Evacuation Map:** Switch between **3D**, **Satellite**, and **Heatmap** views. The map renders flood zone boundaries, PPS shelter locations, and your recommended evacuation route. Tap a different shelter to re-route instantly.
- **Aid Copilot:** After a disaster, upload a photo of your TNB utility bill or property damage. Gemini 2.0 reads it automatically, pre-fills your Bantuan Wang Ihsan (BWI) application, and submits once you approve — no manual form entry required.

---

## 📁 Project Structure

```
1peace/
├── public/                        # Static assets served at root
├── src/
│   ├── assets/                    # Images and icons
│   │   └── hero.png
│   ├── firebase/
│   │   └── client.js              # Firebase initialisation (null-safe singleton)
│   ├── hooks/
│   │   └── useModeTheme.js        # Peace / Crisis / Landing body theme switcher
│   ├── map/
│   │   └── MapView.jsx            # Dual-mode MapLibre GL + Deck.gl map engine
│   ├── pages/
│   │   ├── Landing.jsx            # Root gateway — mode selector and auth entry
│   │   ├── Policy.jsx             # Policy Compass — chat, tools panel, Firestore auth
│   │   └── Flood.jsx              # Crisis Ops — flood map, situational dashboard
│   ├── views/
│   │   ├── Tracker.jsx            # Aid Eligibility, Bill Tracker, Policy Timeline
│   │   └── Impact.jsx             # Macro policy expenditure dashboard
│   ├── App.jsx                    # Hash-based router — four pathways
│   ├── main.jsx                   # React DOM entry point
│   └── index.css                  # Global resets and landing theme tokens
├── .env.local                     # ⚠️ Not committed — your API keys go here
├── .env.example                   # Environment variable template
├── firebase.json                  # Firebase Hosting config (SPA rewrite to index.html)
├── firestore.rules                # Firestore security rules
├── vite.config.js                 # Vite build config — injects process.env from .env
├── tailwind.config.js             # Tailwind configuration
├── FIREBASE_SETUP.md              # Step-by-step Firebase project setup guide
├── DEPLOY.md                      # Build and deploy to Firebase Hosting
├── TECHNICAL_REQUIREMENTS.md      # Full Google AI stack specification
└── package.json                   # Dependencies and npm scripts
```

---

## 🎨 Color Palette

| Color | Hex | Usage |
|---|---|---|
| Primary (Navy) | `#003399` | Nav bar, buttons, active states, brand |
| Navy Mid | `#1a4fad` | Brand mark gradient, hover states |
| Navy Dark | `#001f6b` | Brand mark gradient deep end |
| Gold | `#F7C800` | Accent — AI avatar, CTA highlights, brand name |
| Success (Green) | `#16a34a` | Eligible status, completed steps, aid confirmed |
| Warning (Orange) | `#f59e0b` | Action-needed badges, deadline alerts |
| Danger (Red) | `#dc2626` | Flood alerts, ineligible status, Crisis mode |
| Crisis Red | `#ef4444` | Flood zone fills, escalation indicators |
| Surface | `#f8fafc` | Page background |
| Card | `#ffffff` | Card and panel surfaces |
| Border | `#e2e8f0` | Card borders, dividers |
| Text Primary | `#0f172a` | Body text |
| Text Muted | `#64748b` | Supporting labels, metadata |
| Text Subtle | `#94a3b8` | Placeholders, disabled states |

1Peace uses a two-mode design system. **Peace mode** applies the navy-and-gold civic palette. **Crisis mode** activates automatically via the `useModeTheme` hook, setting `data-mode="crisis"` on `document.body` to switch the entire interface to a high-contrast red-and-dark emergency palette — no manual class toggling required.
