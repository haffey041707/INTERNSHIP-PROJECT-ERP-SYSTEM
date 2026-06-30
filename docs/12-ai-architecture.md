# 12 — AI Integration Architecture

AI is delivered through a single, model-agnostic **AI Gateway** service so every assistant, insight, and
automation shares one place for prompts, guardrails, RAG, cost metering, and tenant isolation.

**Primary model: Claude (Anthropic)** — `claude-opus-4-8` for complex reasoning/report generation,
`claude-haiku-4-5` for low-latency chat and classification. The gateway is provider-agnostic so models can be
swapped or mixed per task and per tenant policy.

## 12.1 AI Gateway responsibilities

```
            ┌─────────────────────────── AI GATEWAY ───────────────────────────┐
 request ─► │ tenant guard → policy/PII filter → prompt assembly → RAG retrieve │
            │ → model router (task→model) → tool/function calling → stream out  │
            │ → guardrail/output check → usage metering → audit                 │
            └───────────────────────────────────────────────────────────────────┘
                    │ pgvector (embeddings)    │ tool APIs (read-only, RBAC-scoped)
                    │ S3 (source docs)         │ event bus (insights)
```

- **Tenant isolation**: every prompt and every retrieval is scoped to `tenantId`; embeddings are partitioned by
  tenant; the model never sees another tenant's data. PII is minimized/redacted before egress per tenant policy.
- **Model router**: chooses model by task, latency budget, and tenant plan.
- **Guardrails**: input/output filters (jailbreak, PII, toxicity), allow-listed tools, max tokens, grounding
  checks (answers must cite retrieved context for factual queries).
- **Metering**: `ai_usage` records tokens/cost per tenant/user/feature → billing + quotas.
- **Caching**: prompt + embedding caches in Redis; semantic cache for FAQ-style queries.

## 12.2 Retrieval-Augmented Generation (RAG)

- Sources: institution handbooks, syllabi, policies, FAQs, a student's own records (for personalized
  assistants) — ingested, chunked, embedded, stored in **pgvector** (`ai_embeddings`, partitioned by tenant).
- Query: embed user question → vector search (HNSW) within tenant → rerank → assemble grounded prompt → Claude.
- Freshness: ingestion pipeline (worker) re-embeds on document change; CDC keeps it current.

## 12.3 The assistants

| Assistant | Audience | Capabilities | Guardrails |
|-----------|----------|--------------|------------|
| **AI Student Assistant** | Students | Explain topics, study plans, homework help (Socratic, not answers-for-graded-work), summarize lessons | No cheating on active assessments; scoped to own data |
| **AI Teacher Assistant** | Teachers | Draft lesson plans, generate quiz questions from syllabus, grade-assist with rubrics, write feedback, summarize class performance | Human-in-the-loop for grades |
| **AI Parent Assistant** | Parents | Plain-language summaries of child's progress, attendance, fees; suggest interventions | Scoped to own children only |
| **AI Academic/Admin Assistant** | Admins | Natural-language analytics ("show at-risk students in grade 9"), report drafting, policy Q&A | Read-only tools, RBAC-scoped |
| **AI Chatbot (support)** | All | Help/navigation, ticket deflection | Falls back to human ticket |

## 12.4 Predictive & analytical AI (ML, not just LLM)

| Feature | Approach |
|---------|----------|
| **Performance prediction** | Gradient-boosted models on attendance, grades, engagement → predicted GPA / pass-risk |
| **Risk / dropout detection** | Early-warning classifier; produces `ai_insight` (risk score + drivers) → counselor workflow |
| **Attendance analysis** | Anomaly detection on patterns (chronic lateness, sudden drops) |
| **Recommendation engine** | Next-best courses/resources; remedial content suggestions |
| **Timetable optimization** | Constraint solver (OR-Tools) for conflict-free, preference-aware schedules |
| **Financial insights** | Fee-default prediction, cash-flow forecasting, anomaly detection on expenses |
| **Report generation** | LLM composes narrative report cards / executive summaries from structured data + templates |

ML models are trained per-region on **aggregated, de-identified** data (or per-tenant for large tenants),
served via a model-serving layer (SageMaker / KServe); predictions are explainable (SHAP) and logged.

## 12.5 Tooling / function-calling

The gateway exposes **read-only, RBAC-scoped tools** to the LLM (e.g. `getStudentSummary`, `queryAttendance`,
`listAtRiskStudents`). Tools enforce the caller's permissions and tenant scope — the model can only ever reach
data the requesting user is already allowed to see. Write-actions require explicit human confirmation in the UI.

## 12.6 Safety, ethics & governance

- **Human-in-the-loop** for any consequential output (grades, disciplinary, financial actions).
- **Bias & fairness** monitoring on predictive models; documented model cards; opt-out per tenant.
- **Transparency**: AI outputs are labeled; sources cited; users can see "why".
- **Data usage**: tenant data is **not** used to train foundation models; embeddings/insights stay tenant-scoped.
- **Audit**: every AI interaction logged (prompt hash, model, tokens, sources, output) for review.
- **Cost controls**: per-tenant token quotas by plan; graceful degradation (smaller model) when exceeded.

## 12.7 Reference flow — "Generate term report for Section 9-A"

```
Admin asks → AI Gateway (tenant scope) → tools: fetch results+attendance+remarks (RBAC-checked)
→ assemble grounded prompt + template → Claude (opus) drafts narrative per student
→ guardrail check → return draft for teacher review → on approve, render PDF (worker) → publish to parents
→ ai_usage metered · audit logged
```
