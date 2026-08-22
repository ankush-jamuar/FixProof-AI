# FixProof AI — Product Overview & Positioning

## Executive Summary

FixProof AI is an AI-powered closed-loop campus maintenance intelligence platform. It transforms unverified facility complaint reporting into an accountable, visual-first operational workflow:

$$\text{Report} \longrightarrow \text{Perceive} \longrightarrow \text{Decide} \longrightarrow \text{Dispatch} \longrightarrow \text{Repair} \longrightarrow \text{Proof} \longrightarrow \text{Verify} \longrightarrow \text{Recover} \longrightarrow \text{Close}$$

Unlike traditional CMMS platforms that close jobs as soon as a technician checks a box, FixProof AI enforces **Proof-First Closure**: no job is closed without visual proof verified by 2nd-stage multimodal AI.

---

## Target Audience

1. **Facility Operations Directors & Campus Managers**: Require real-time operational risk tracking, automated technician dispatch, and verified repair assurance across buildings.
2. **Field Technicians**: Require mobile-optimized work orders with exact defect category matching, clear location details, safety instructions, and photo evidence upload.
3. **Campus Tenants / Facilities Users**: Require simple photo-assisted incident reporting without needing to fill out complicated technical categorization forms.

---

## The Core Product Problem

In traditional maintenance operations:
- **60% of incident complaints** lack accurate technical categorization.
- **25% of dispatched technicians** arrive without the proper tools due to misassigned skill categories.
- **Unverified closures** lead to recurring leaks, secondary water damage, and unaddressed electrical hazards.
- **Supervisors lack accountability** when AI or technicians make routing decisions.

---

## The FixProof Solution & Key Differentiators

### 1. Proof-First Closure
Jobs cannot be closed without an after-repair photo. A 2nd-stage Multimodal AI compares Before and After photographs side-by-side to verify defect resolution before formal closure.

### 2. Autonomous Controlled Agent Dispatch
Instead of unconstrained LLM execution, the AI Agent executes step-by-step validated tool calls to match active technicians based on exact category specializations (`plumbing`, `electrical`, `cleaning`).

### 3. Verification Recovery Loop
If 2nd-stage verification returns `FAIL` (e.g. water droplets still visible after a pipe repair), the system automatically reopens the job (`REOPENED`) and alerts the technician to retry.

### 4. Confidence-Aware Human Safeguards
Perception calls with confidence $<80\%$ pause auto-routing and trigger `HIGH ATTENTION` operational risk, requiring supervisor review.

### 5. Immutable System Auditability
Every event is recorded with timestamps, actor badges (`SYSTEM`, `AI_AGENT`, `TECHNICIAN`, `SUPERVISOR`), and correlation IDs (`req_<timestamp>`).

---

## Product Roadmap & Future Extensions

- **Phase 1 (Current Build)**: Closed-loop maintenance, multimodal perception & verification, category-strict technician routing, technician job isolation, operational risk matrix, and Neon PostgreSQL persistence.
- **Phase 2 (Future Extension)**: Enterprise SAML/SSO authentication, role-based access control (RBAC), and mobile PWA push notifications.
- **Phase 3 (Future Extension)**: IoT sensor integration (automatic pipe leak / breaker trip detection), technician route optimization, and CMMS/ERP connectors (ServiceNow, SAP, Maximo).
