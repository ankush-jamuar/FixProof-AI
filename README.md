# FixProof AI

**An AI-Powered Closed-Loop Campus Maintenance Intelligence & Proof-First Repair Verification Platform.**

---

## Vercel

[Live Demo](https://fix-proof-ai-sand.vercel.app/)

## Contributors

- Ankush Jamuar
- Vaibhav Kumar

---

## What is FixProof AI?

Traditional facility maintenance management systems (CMMS) often follow a simple linear flow:
$$\text{Reported} \longrightarrow \text{Assigned} \longrightarrow \text{Repaired} \longrightarrow \text{Marked Complete}$$

In traditional setups, "technician marked job complete" is accepted as proof of repair without verification. This leads to unverified repairs, recurring leaks/hazards, supervisor guesswork, and lost accountability.

**FixProof AI** introduces a closed-loop, proof-first operational workflow:
$$\text{Report} \longrightarrow \text{Perceive} \longrightarrow \text{Decide} \longrightarrow \text{Dispatch} \longrightarrow \text{Repair} \longrightarrow \text{Proof} \longrightarrow \text{Verify} \longrightarrow \text{Recover} \longrightarrow \text{Close}$$

By combining multimodal vision AI parsing, controlled agent tool dispatch, deterministic category matching, and 2nd-stage visual repair verification, FixProof AI ensures no maintenance job is closed without verified visual proof.

---

## The Core Problem

1. **Incomplete Maintenance Complaints**: Campus users submit vague text complaints ("water leaking somewhere in lab") without standardized categorization or severity tags.
2. **Inefficient Dispatch**: Dispatchers manually guess which technician to assign, leading to wrong skill matching (e.g. assigning an electrician to a plumbing defect).
3. **Lack of Repair Verification**: Jobs are routinely closed as soon as a technician checks a box, with no visual proof that the underlying issue was fixed.
4. **Silent Recurring Failures**: Incomplete repairs remain unnoticed until a secondary flood or electrical hazard occurs.
5. **Supervisor Visibility Gaps**: Facility supervisors lack structured audit trails detailing what AI decided, why a technician was chosen, and whether verification passed.

---

## The FixProof Approach: "Proof-First Closure"

FixProof AI enforces **Proof-First Closure**: an issue cannot transition to `CLOSED` status simply because a button was clicked.

Before closure can occur:
1. The technician must upload after-repair photograph evidence from the field.
2. The 2nd-stage Multimodal AI Verification Engine performs a visual comparison between the **BEFORE** (original incident photo) and **AFTER** (repaired photo).
3. The system confirms defect resolution (`PASS`), flags remaining defects (`FAIL` $\rightarrow$ auto-reopens repair), or requests supervisor review (`INCONCLUSIVE`).

---

## Why This Is More Than an AI Wrapper

FixProof AI is an operational AI engine backed by deterministic application logic, state machine constraints, and relational database persistence:

1. **Multimodal Vision Perception**: Parses physical scene evidence, categorizes issues (`plumbing`, `electrical`, `cleaning`), and assesses severity (`low`, `medium`, `high`, `critical`).
2. **Structured Classification**: Sanitizes unstructured visual & textual inputs into schema-validated domain objects.
3. **Deterministic Operational Decision Logic**: Enforces business rules (e.g., confidence threshold $\ge 80\%$) before allowing automated agent routing.
4. **Category-Aware Technician Dispatch**: Queries available technicians matching the exact defect category (`plumbing` $\rightarrow$ Plumber only).
5. **Technician-Specific Job Isolation**: Filters work orders so technicians see only jobs assigned to their ID.
6. **State-Machine Controlled Workflow**: Guards all status jumps against illegal transitions (e.g. blocking `CLOSED` $\rightarrow$ `IN_PROGRESS`).
7. **Before / After Evidence Storage**: Persists image URLs and metadata via Cloudinary and Neon PostgreSQL.
8. **Second-Stage AI Verification**: Uses independent visual comparison logic to verify repair completeness.
9. **Failed-Verification Recovery Loop**: Automatically reopens failed repairs (`REOPENED`) and notifies the assigned technician for a retry.
10. **Confidence-Aware Human-in-the-Loop**: Routes low-confidence perception calls ($<80\%$) to `PENDING_REVIEW` for supervisor override.
11. **Operational Risk / Attention Calculation**: Dynamically assigns `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW` attention levels based on severity and status.
12. **Immutable Audit Trail & Request Correlation**: Tracks every action with timestamps, actor badges (`SYSTEM`, `AI_AGENT`, `TECHNICIAN`, `SUPERVISOR`), and correlation IDs.
13. **Persistent Relational Database**: Uses Neon PostgreSQL and Drizzle ORM for complete data durability.

---

## Product Workflow

```
┌────────────────┐     ┌────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  1. INCIDENT   │ ──> │ 2. MULTIMODAL  │ ──> │  3. CONFIDENCE   │ ──> │ 4. AGENT TOOL    │
│   REPORTED     │     │  AI PERCEPTION │     │   THRESHOLD      │     │    DISPATCH      │
└────────────────┘     └────────────────┘     └──────────────────┘     └──────────────────┘
                                                       │                        │
                                               (<80% Confidence)       (Tech Category Match)
                                                       │                        │
                                                       v                        v
                                              ┌──────────────────┐     ┌──────────────────┐
                                              │  PENDING REVIEW  │     │   WORK ORDER     │
                                              │ (Supervisor Override)  │   (ASSIGNED)     │
                                              └──────────────────┘     └──────────────────┘
                                                                                │
                                                                                v
┌────────────────┐     ┌────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   8. CLOSED    │ <── │ 7. 2ND-STAGE   │ <── │ 6. SUBMIT PROOF  │ <── │  5. WORK STARTED │
│ (Verified Pass)│     │  AI VERIFICATION│    │  (After Photo)   │     │  (IN_PROGRESS)   │
└────────────────┘     └────────────────┘     └──────────────────┘     └──────────────────┘
                               │
                       (Verification FAIL)
                               │
                               v
                      ┌──────────────────┐
                      │ 9. REOPENED LOOP │ ──> (Technician Retry)
                      └──────────────────┘
```

---

## Roles & Product Experiences

FixProof AI provides two distinct role-oriented experiences via an evaluator presentation role selector pill:

### 1. Supervisor Operations Console (`/supervisor`)
- **What Requires Immediate Attention?**: Above-the-fold operational panel highlighting Critical Hazards, Reopened Repairs, Awaiting Verification, and Low-Confidence AI calls.
- **Active Operations Queue**: Real-time filterable queue displaying incident category, severity, status, assigned technician, AI confidence meter, and operational risk.
- **Issue Command Center (`/issues/[id]`)**: Full lifecycle command center featuring the 9-stage `ClosedLoopPipelineBar`, visual intake evidence, Controlled Agent Tool Trace, side-by-side Before/After verification, multi-attempt verification history, and chronological audit timeline.

### 2. Technician Field Portal (`/technician`)
- **Field Job Workspace**: Mobile-optimized field app returning ONLY work orders assigned to the selected technician (`assignedTechnicianId === selectedTechnicianId`).
- **Job Details & Safety Notes**: Displays location, severity, category, original user description, and before photo evidence.
- **On-Site Work Execution**: "Start Repair Work" trigger (`IN_PROGRESS`), after-repair photo upload (`PENDING_VERIFICATION`), and Reopened Repair retry alert banners.

> **Note on Authentication**: FixProof AI uses a **Demo Presentation Role Switcher** (`Supervisor` $\leftrightarrow$ `Technician`) to allow evaluators to inspect both operational perspectives without authentication friction.

---

## AI Architecture

FixProof AI integrates Google Gemini (`gemini-2.5-flash`) via the official `@google/genai` SDK for two distinct multimodal tasks:

1. **Stage 1 — Perception Engine (`lib/ai/perception.ts`)**:
   - Parses physical scene evidence, classifies problem category (`plumbing`, `electrical`, `cleaning`), identifies severity (`low`, `medium`, `high`, `critical`), and outputs confidence ($0.0 - 1.0$).
2. **Stage 2 — Verification Engine (`lib/ai/verification.ts`)**:
   - Compares BEFORE and AFTER images side-by-side to evaluate whether the defect has been visually resolved (`PASS`, `FAIL`, or `INCONCLUSIVE`).

### System Architecture ASCII Diagram

```
                        +----------------------------------------+
                        |        User / Technician / Supervisor   |
                        +----------------------------------------+
                                            |
                                            v
                        +----------------------------------------+
                        |          Next.js App Router            |
                        |      (React 19, Tailwind CSS v4)       |
                        +----------------------------------------+
                               /            |             \
                              /             |              \
                             v              v               v
                +-----------------+  +--------------+  +-------------------+
                | Incident Intake |  | Supervisor   |  | Technician Portal |
                |    (/report)    |  | (/supervisor)|  |   (/technician)   |
                +-----------------+  +--------------+  +-------------------+
                         |                  |                    |
                         v                  v                    v
                +----------------------------------------------------------+
                |                  Next.js API Routes                      |
                | (/api/report, /api/analyze, /api/agent, /api/verify)     |
                +----------------------------------------------------------+
                      /                     |                      \
                     /                      |                       \
                    v                       v                        v
        +-----------------------+ +--------------------+ +-----------------------+
        |  Google Gemini 2.5    | | Controlled Agent   | | Cloudinary Media      |
        |  Perception/Verify    | | Orchestrator       | | Evidence Storage      |
        +-----------------------+ +--------------------+ +-----------------------+
                    \                       |                       /
                     \                      |                      /
                      v                     v                     v
                +----------------------------------------------------------+
                |                Neon PostgreSQL Database                  |
                |               (Drizzle ORM & Serverless SQL)             |
                +----------------------------------------------------------+
```

---

## AI vs. Deterministic Application Logic

| Responsibility | Handled By | Implementation Detail |
| :--- | :---: | :--- |
| **Visual Scene Parsing** | **AI** | Gemini 2.5 Flash multimodal vision analysis |
| **Problem Classification** | **AI** | Categorizes defect as `plumbing`, `electrical`, or `cleaning` |
| **Severity Assessment** | **AI** | Assigns `low`, `medium`, `high`, or `critical` |
| **Perception Confidence Scoring** | **AI** | Outputs numerical confidence score ($0.0 - 1.0$) |
| **Confidence Threshold Enforcement** | **Deterministic** | Compares score against `CONFIDENCE_THRESHOLD = 0.80` |
| **Technician Availability Query** | **Deterministic** | Queries `technicians` where `category === issue.category` and `isAvailable === true` |
| **Technician Selection** | **Deterministic** | Selects compatible category technician deterministically |
| **Work Order Creation** | **Deterministic** | Executes `executeCreateWorkOrder` controlled tool |
| **Technician Job Isolation** | **Deterministic** | Filters `workOrders` strictly by `assignedTechnicianId` |
| **State Machine Enforcement** | **Deterministic** | Validates legal status transitions in `lib/agent/stateMachine.ts` |
| **Operational Risk Calculation** | **Deterministic** | Computes attention level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) |
| **Before / After Comparison** | **AI** | Gemini 2.5 Flash side-by-side verification prompt |
| **Verification Result Decision** | **AI** | Evaluates `PASS`, `FAIL`, or `INCONCLUSIVE` |
| **Repair Reopening on Failure** | **Deterministic** | Automatically sets status to `REOPENED` upon `FAIL` |
| **Audit Event Trail** | **Deterministic** | Logs immutable audit records with timestamps and correlation IDs |

---

## Safety & Human-in-the-Loop Safeguards

1. **Low-Confidence Safeguard ($<80\%$)**: If AI perception confidence falls below 0.80, automated routing pauses and the issue transitions to `PENDING_REVIEW` for supervisor override.
2. **Inconclusive Review Safeguard**: If verification produces an `INCONCLUSIVE` result (e.g. blurry evidence photo), the job remains in `PENDING_REVIEW` awaiting manual supervisor approval or rejection.
3. **Failed Repair Recovery**: If verification returns `FAIL`, the job transitions to `REOPENED`, alerting the assigned technician to retry the repair.
4. **State Machine Boundary Protection**: Invalid status jumps (e.g., `CLOSED` $\rightarrow$ `IN_PROGRESS`) are blocked at runtime and logged as `ILLEGAL_STATUS_TRANSITION_REJECTED`.

---

## Data Model & Persistence

FixProof AI uses **Neon PostgreSQL** via Drizzle ORM (`drizzle-orm/neon-http`):

- **`issues`**: Stores reported title, description, location, before image URL, AI perception metadata (`aiCategory`, `aiProblem`, `aiSeverity`, `aiConfidence`, `aiReasoning`, `aiModel`, `aiLatencyMs`), human correction override, and workflow status.
- **`work_orders`**: Stores linked issue ID, assigned technician ID, category, problem title, severity, status, technician notes, after image URL, controlled agent logs, and timestamps.
- **`technicians`**: Stores technician name, category specialization (`plumbing`, `electrical`, `cleaning`), availability status, and phone number.
- **`verification_results`**: Stores linked work order ID, before/after image URLs, verification result (`PASS`, `FAIL`, `INCONCLUSIVE`), confidence score, reasoning, model telemetry, and detected issues JSON.
- **`audit_events`**: Stores chronological system events, actor type (`SYSTEM`, `AI_AGENT`, `TECHNICIAN`, `SUPERVISOR`), event type, status transitions, and correlation IDs.

---

## API Surface

| Method | Endpoint | Purpose | Key Inputs | Response / Output | Mode |
| :---: | :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/report` | Incident Intake | Form-data: `description`, `location`, `file` | Created Issue record | Dynamic |
| `POST` | `/api/analyze` | AI Perception Engine | JSON: `{ issueId }` | Updated perception metadata | Dynamic |
| `POST` | `/api/agent` | AI Agent Dispatch | JSON: `{ issueId, supervisorOverrideCategory? }` | Work Order & assigned Tech | Dynamic |
| `GET` | `/api/technician/data` | Technician Portal Data | Query: `?techId=tech-1` | Technicians & isolated Work Orders | Dynamic |
| `POST` | `/api/work-orders/[id]/start` | Start Repair Work | Path param: `id` | Updated WO (`IN_PROGRESS`) | Dynamic |
| `POST` | `/api/work-orders/[id]/complete` | Submit Repair Proof | Path param `id`, Form-data: `file`, `technicianNotes` | Updated WO (`PENDING_VERIFICATION`) | Dynamic |
| `POST` | `/api/verify/[id]` | AI Repair Verification | Path param: `id` | Verification result record | Dynamic |
| `POST` | `/api/verify/[id]/review` | Supervisor Review | Path param `id`, JSON: `{ action: 'APPROVE' \| 'REJECT' }` | Updated WO status (`CLOSED` or `REOPENED`) | Dynamic |
| `GET` | `/api/evaluation` | Get Benchmark Cases | None | Evaluation suite definitions | Dynamic |
| `POST` | `/api/evaluation/run` | Run Benchmark Suite | None | Evaluation test suite results | Dynamic |

---

## Project Structure

```
FixProof AI/
├── app/                        # Next.js App Router Page Routes & API Endpoints
│   ├── api/                    # Server-side API Endpoints
│   │   ├── agent/              # AI Agent dispatch endpoint
│   │   ├── analyze/            # AI perception engine endpoint
│   │   ├── evaluation/         # Benchmark suite execution endpoints
│   │   ├── report/             # Incident report form endpoint
│   │   ├── technician/         # Technician portal data endpoint
│   │   ├── verify/             # 2nd-stage AI verification endpoints
│   │   └── work-orders/        # Technician start & complete work endpoints
│   ├── evaluation/             # Evaluation benchmark redirect route
│   ├── issues/                 # Issues queue & Issue Command Center ([id])
│   ├── report/                 # Incident Intake form page
│   ├── supervisor/             # Supervisor Operations Dashboard
│   ├── technician/             # Technician Field Portal page
│   ├── layout.tsx              # Root HTML & metadata layout
│   └── page.tsx                # Product Landing Page & Role Entrance
├── components/                 # React 19 UI Components
│   ├── issues/                 # ClosedLoopPipelineBar, SystemAuditTimeline, AgentToolTrace, etc.
│   ├── layout/                 # Navbar header component
│   └── ui/                     # SafeImage, Toast notification components
├── docs/                       # Comprehensive Architecture & Product Documentation
│   ├── ARCHITECTURE.md         # Deep technical system architecture & diagrams
│   ├── DEMO_GUIDE.md           # Step-by-step evaluator presentation guide
│   ├── PRODUCT.md              # Product positioning & business value proposition
│   └── TESTING.md              # QA matrix & test suite documentation
├── drizzle/                    # Database Schema & Migrations
│   └── schema.ts               # Drizzle PostgreSQL schema definitions
├── lib/                        # Core Application Logic & Services
│   ├── agent/                  # Agent orchestrator & state machine engine
│   ├── ai/                     # Gemini perception & verification prompts
│   ├── audit/                  # Centralized audit logger
│   ├── db/                     # Neon DB connection & queries
│   ├── evaluation/             # 15-case evaluation benchmark runner
│   ├── tools/                  # Controlled agent tools (getTechnicians, createWorkOrder)
│   ├── operationalRisk.ts      # Operational risk attention matrix calculator
│   └── errors.ts               # Error sanitization & AppError handling
├── public/                     # Static media & public assets
├── .env.example                # Safe environment variable placeholders
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies & npm build scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## Testing & Verification

FixProof AI has undergone a full 14-point production QA pass:

1. **TEST 1 — Clean Production State**: Verified 0 `EVAL:*` records or test fixtures appear in production views.
2. **TEST 2 — Technician Isolation**: Verified Rajesh (Plumber), Sarah (Electrician), and Amina (Sanitation) see ONLY their assigned jobs.
3. **TEST 3 — Category-Based Dispatch**: Verified Plumbing $\rightarrow$ Plumber, Electrical $\rightarrow$ Electrician, Cleaning $\rightarrow$ Sanitation.
4. **TEST 4 — Complete Closed-Loop Workflow**: Verified `REPORTED` $\rightarrow$ `ANALYZING` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `PENDING_VERIFICATION` $\rightarrow$ `VERIFIED` $\rightarrow$ `CLOSED`.
5. **TEST 5 — Verification Failure & Recovery**: Verified `FAIL` $\rightarrow$ `REOPENED` $\rightarrow$ Technician retry $\rightarrow$ `PASS` $\rightarrow$ `CLOSED`.
6. **TEST 6 — Inconclusive Verification**: Verified `INCONCLUSIVE` preserves `PENDING_REVIEW` awaiting supervisor review.
7. **TEST 7 — Low Confidence Safeguard**: Verified confidence $<80\%$ halts auto-routing and triggers `HIGH ATTENTION` operational risk.
8. **TEST 8 — Illegal State Transition**: Verified state machine rejects invalid status jumps (e.g. `CLOSED` $\rightarrow$ `IN_PROGRESS`).
9. **TEST 9 — System Audit Trail**: Verified chronological audit timeline ordering and actor badges.
10. **TEST 10 — Persistence**: Verified state persistence across page refreshes via Neon PostgreSQL.
11. **TEST 11 — Role UX**: Verified Supervisor vs Technician view separation.
12. **TEST 12 — UI QA**: Verified responsive layouts, high contrast typography, and 0 React hydration errors.
13. **TEST 13 — Network / API QA**: Verified active Neon DB connection (`PostgreSQL 18.6`) and sanitized JSON error handling.
14. **TEST 14 — Final Build**: Verified `npm run build` passes 100% cleanly in 2.2s across 12 routes.

---

## Evaluation Benchmark Infrastructure

The repository includes a 15-case Evaluation Benchmark Harness (`lib/evaluation/runner.ts` & `lib/evaluation/cases.ts`) designed as **internal engineering infrastructure** to evaluate agent decision accuracy, edge cases, adversarial inputs, and verification recovery loops.

> **Note**: Benchmark test executions clean up their created fixture records immediately upon completion, ensuring production data remains clean.

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
# Neon PostgreSQL Connection URL
DATABASE_URL=postgresql://user:password@ep-cool-sample-123456.us-east-2.aws.neon.tech/fixproof_db?sslmode=require

# Google Gemini API Key & Model
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Business Rules & System Flags
CONFIDENCE_THRESHOLD=0.80
DEMO_MODE=true
```

---

## Local Development Setup

### 1. Prerequisites
- Node.js v18.x or v20.x
- npm v9.x or higher
- A free Neon PostgreSQL Database instance
- A free Cloudinary account for media uploads
- A Google Gemini API Key

### 2. Installation
```bash
# Clone repository
git clone https://github.com/ankush-jamuar/FixProof-AI.git
cd FixProof-AI

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env.local
# (Fill in your DATABASE_URL, GEMINI_API_KEY, and Cloudinary keys in .env.local)

# Push Database Schema to Neon
npm run db:push

# Seed Initial Technicians Data
npm run db:seed

# Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view FixProof AI.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## Deployment

FixProof AI is configured for one-click deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Configure the Environment Variables in Vercel settings (`DATABASE_URL`, `GEMINI_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CONFIDENCE_THRESHOLD=0.80`).
4. Deploy. Vercel automatically runs `next build`.

---

## Quick Evaluator Demo Walkthrough (3 Minutes)

1. **Landing Page (`/`)**: View the closed-loop lifecycle banner (`See` $\rightarrow$ `Understand` $\rightarrow$ `Dispatch` $\rightarrow$ `Repair` $\rightarrow$ `Verify` $\rightarrow$ `Recover` $\rightarrow$ `Close`). Click **"Supervisor Operations Console"**.
2. **Supervisor Dashboard (`/supervisor`)**: Review the **"What Requires Immediate Attention?"** operational risk cards and active queue. Click **"Report New Incident"**.
3. **Incident Intake (`/report`)**: Submit a location (e.g. `Science Lab 201`), description (e.g. `Burst pipe leaking under main sink`), and upload an evidence photo. Click **"Submit Incident Report"**.
4. **Issue Command Center (`/issues/[id]`)**: Click **"Analyze Issue with AI"** to view Gemini perception classification (`PLUMBING`, `HIGH` severity). Click **"Dispatch Technician"** to view controlled tool routing to `Rajesh Kumar` (Lead Plumber).
5. **Technician Portal (`/technician`)**: Switch role to `Rajesh Kumar`. Click **"Start Repair Work"**, upload an after-repair photo, and click **"Submit Repair Proof"**.
6. **2nd-Stage Verification (`/issues/[id]`)**: Return to the Command Center and click **"Trigger 2nd-Stage AI Repair Verification"**. View side-by-side visual comparison and `VERIFIED PASS` status transition to `CLOSED`.

---

## Key Differentiators

- **Proof-First Closure**: Eliminates unverified job completions by requiring visual proof and 2nd-stage AI verification.
- **Closed-Loop Recovery**: Automatically reopens failed repairs for technician retry rather than leaving defects unresolved.
- **Controlled Agent Tools**: AI agent routes dispatches through step-by-step validated tool execution instead of unconstrained DB writes.
- **Deterministic Category & Job Isolation**: Server-side enforced routing ensures plumbers receive plumbing tasks, electricians receive electrical tasks, and sanitation techs receive cleaning tasks.
- **Full Operational Auditability**: Chronological audit trail with actor badges, correlation IDs, and timestamps.

---

## Known Limitations

- **Demo Role Selector**: Uses a UI presentation switcher (`Supervisor` $\leftrightarrow$ `Technician`) rather than enterprise RBAC/SSO authentication.
- **External API Dependencies**: Relies on active internet connectivity for Google Gemini API and Cloudinary media uploads.

---

## Future Roadmap (Not Currently Implemented)

- Enterprise SAML/SSO Authentication & Role-Based Access Control (RBAC).
- IoT Sensor Integration (automatic leak/fire sensor reporting).
- Predictive Equipment Maintenance Analytics.
- SMS / WhatsApp Mobile Technician Notifications (Twilio integration).
- CMMS / ERP System Connectors (SAP, ServiceNow, Maximo).

---

## License

MIT License. See [LICENSE](LICENSE) for details.
