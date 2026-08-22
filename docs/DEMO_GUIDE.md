# FixProof AI — Evaluator Presentation & Demo Guide

This guide provides a structured walkthrough for evaluators, judges, and recruiters reviewing FixProof AI.

---

## Quick Summary of What FixProof AI Does

FixProof AI is a **closed-loop maintenance operations platform** that uses multimodal vision AI to parse facility defect photos, dispatch technicians through controlled agentic tool execution, and enforce **Proof-First Closure** by verifying after-repair evidence with 2nd-stage visual comparison before closing jobs.

---

## 3-Minute Fast Demo Script

### Step 1: Landing Page & Positioning (30 Seconds)
- Open `/`. Point out the closed-loop lifecycle banner (`See` $\rightarrow$ `Understand` $\rightarrow$ `Dispatch` $\rightarrow$ `Repair` $\rightarrow$ `Verify` $\rightarrow$ `Recover` $\rightarrow$ `Close`).
- Click **"Supervisor Operations Console"**.

### Step 2: Supervisor Dashboard & Attention Panel (45 Seconds)
- Point out the above-the-fold **"What Requires Immediate Attention?"** card. Highlight how critical hazards, reopened repairs, and low-confidence decisions are prioritized upfront.
- Click **"Report New Incident"** in the header.

### Step 3: Incident Intake & AI Perception (45 Seconds)
- Enter Location: `Science Building, Lab 201`.
- Description: `Water leaking heavily under main sink`.
- Upload an evidence photo. Click **"Submit Incident Report"**.
- On the resulting Command Center screen (`/issues/[id]`), click **"Analyze Issue with AI"**.
- Point out the Gemini vision perception output (`PLUMBING`, `HIGH` severity, confidence score).

### Step 4: Autonomous Agent Dispatch & Technician Portal (45 Seconds)
- Click **"Dispatch Technician"**. Point out the **FIXPROOF AI DECISION** card showing category-strict routing to `Rajesh Kumar` (Lead Plumber).
- Switch role to `Technician` using the header switcher pill.
- View `Rajesh Kumar`'s portal (`/technician`). Point out job isolation (only plumbing jobs appear).
- Click **"Start Repair Work"**, upload an after-repair photo, and click **"Submit Repair Proof"**.

### Step 5: 2nd-Stage Verification & Closure (15 Seconds)
- Return to the Issue Command Center (`/issues/[id]`).
- Click **"Trigger 2nd-Stage AI Repair Verification"**.
- View side-by-side Before/After comparison and `VERIFIED PASS` transition to `CLOSED`.

---

## 5-Minute Deep-Dive Presentation Script

In addition to the 3-minute flow, demonstrate these key technical differentiators:

### 1. Controlled Tool Execution Trace (1 Minute)
- On the Issue Command Center (`/issues/[id]`), expand the button labeled **"AI Execution Audit — Technical Details"**.
- Show the 5 controlled tool steps:
  1. `executeGetIssueDetails`
  2. `evaluateConfidenceThreshold`
  3. `executeGetAvailableTechnicians`
  4. `selectTechnicianStrategy`
  5. `executeCreateWorkOrder`
- Explain: *"FixProof AI does not allow an LLM to run arbitrary SQL or make unconstrained database writes. Dispatches execute through validated, step-by-step application tools."*

### 2. Low Confidence Safeguard Demonstration (1 Minute)
- Demonstrate what happens when confidence is $<80\%$ (or click an ambiguous report).
- Show how auto-routing pauses and sets status to `PENDING_REVIEW`.
- Demonstrate the **Supervisor Override** panel, allowing manual category adjustment.

### 3. Failed Repair Reopening Loop (1 Minute)
- Demonstrate a scenario where 2nd-stage verification returns `FAIL`.
- Show how the issue status transitions to `REOPENED`.
- Switch to the Technician portal and point out the **Reopened Repair Banner**, prompting the technician to inspect the defect again and upload new proof.

---

## What NOT to Spend Time Explaining During a Demo

- **Do NOT focus on raw code or file structure**: Focus on live operational screens (`/supervisor`, `/technician`, `/issues/[id]`).
- **Do NOT claim production auth**: Explain clearly: *"We implemented a demo role-switcher pill to make evaluator review frictionless without requiring password logins."*
- **Do NOT claim AI performs deterministic logic**: Emphasize that category matching, job isolation, state machine transitions, and database writes are enforced by deterministic application rules.
