# 09 — Security Architecture

Security is layered (defense in depth) and compliance-driven (GDPR, FERPA, SOC 2-ready). Tenant isolation is
covered in depth in [doc 03](./03-multi-tenant-architecture.md); this doc covers identity, data protection,
network, and governance.

## 9.1 Authentication

Multi-strategy, all funneling to one session/JWT model:

| Method | Notes |
|--------|-------|
| Institution ID + identifier (email/username) + password | Argon2id hashing; password policy + breach check (HIBP k-anon) |
| Mobile OTP | 6-digit, 5-min TTL, rate-limited, hashed at rest |
| Google / Microsoft OAuth2/OIDC | Domain-restricted per tenant (allow-listed email domains) |
| SAML 2.0 / SSO | For enterprise universities (Okta/Azure AD/Shibboleth) |
| Magic link | Optional passwordless |

- **MFA**: TOTP (authenticator apps) + WebAuthn/passkeys; SMS as fallback. Enforced by policy/role.
- **Tokens**: short-lived access JWT (10 min) + rotating refresh token (httpOnly, secure cookie, reuse-detection).
  JWT claims: `sub`, `tid`, `roles`, `scope`, `sid` (session), `amr` (auth methods). Signed with rotating
  asymmetric keys (RS256/EdDSA) published via JWKS.
- **Sessions**: stored in Redis; device-bound; concurrent-session limits per plan; "log out everywhere".
- **Device management**: each login registers a device fingerprint; users/admins can list & revoke devices.

## 9.2 Authorization — RBAC + ABAC

- **RBAC**: system roles (`SUPER_ADMIN`, `INSTITUTION_ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `ACCOUNTANT`,
  `LIBRARIAN`, `HR`, `TRANSPORT_MANAGER`, `HOSTEL_MANAGER`) + custom tenant-defined roles.
- **Permissions** are granular keys (`students:create`, `finance:invoice:approve`). Roles ⊃ permissions.
- **ABAC scopes** refine access by attributes: campus, department, owned-records ("a teacher sees only their
  sections", "a parent sees only their children").
- Enforced by NestJS **Guards** (`AuthGuard` → `RbacGuard` → `PolicyGuard`) and mirrored in GraphQL field
  resolvers. Default-deny. See [`apps/api/src/core/rbac`](../apps/api/src/core/rbac).
- **Feature flags** gate modules by subscription plan — checked alongside permissions.

## 9.3 Data protection

- **In transit**: TLS 1.3 everywhere; HSTS; mTLS between internal services.
- **At rest**: AES-256 (RDS/EBS/S3 SSE-KMS). Per-tenant KMS data keys for SILO tenants.
- **Field-level encryption** for the most sensitive PII (medical records, government IDs) via envelope
  encryption (KMS-wrapped DEKs).
- **Secrets**: AWS Secrets Manager / SSM; never in code or env files in prod; rotation enabled.
- **PII tagging & masking**: columns classified; logs/observability scrub PII; role-based field masking in API
  responses.
- **End-to-end encryption** option for in-app messaging (per-tenant keys).

## 9.4 Application security

- Input validation (class-validator / Zod) on every DTO; output encoding to prevent XSS.
- Parameterized queries via Prisma (no string SQL); RLS backstop.
- CSRF protection for cookie-based flows; SameSite + double-submit.
- Security headers (CSP, X-Frame-Options, Referrer-Policy) via Helmet.
- File uploads: presigned S3, content-type allow-list, AV scan (ClamAV/Lambda), size caps, no execution.
- Rate limiting + bot/abuse detection; account lockout + exponential backoff on failed logins.
- Dependency scanning (Snyk/Dependabot), SAST (CodeQL/Semgrep), DAST, container image scanning (Trivy) in CI.
- Secret scanning (gitleaks) pre-commit + CI.

## 9.5 Network & infrastructure

```
Internet ─► CloudFront + AWS WAF + Shield (DDoS) ─► ALB ─► EKS (private subnets)
                                                          │
   Data tier (RDS, Redis, OpenSearch) in isolated private subnets, no public IPs.
   Security Groups least-privilege · NAT for egress · VPC endpoints for AWS services.
```
- Network segmentation (public/app/data subnets); least-privilege Security Groups & NACLs.
- IAM least-privilege; IRSA (IAM Roles for Service Accounts) per workload; no long-lived keys.
- Bastion-less access via SSM Session Manager.

## 9.6 Audit & monitoring

- **Immutable audit log** (`audit_logs`, append-only, WORM-exported to S3 Object Lock) for every mutation:
  actor, tenant, action, resource, before/after diff, IP, device, requestId, timestamp.
- **Session monitoring**: anomaly detection (impossible travel, new device, privilege escalation) → step-up MFA.
- Centralized logs (Loki), metrics (Prometheus), traces (Tempo/OTel), alerts (Alertmanager → PagerDuty).
- Security events → SIEM; tamper-evident.

## 9.7 Compliance

| Framework | How addressed |
|-----------|---------------|
| **GDPR** | Lawful basis, DPA, data residency by region, right-to-access/erasure/portability jobs, consent records, DPO contact, breach-notification runbook (72h). |
| **FERPA** | Education-record access controls, parent/eligible-student rights, directory-info flags, disclosure logging. |
| **SOC 2** | Change management, access reviews, audit trails, monitoring, incident response, vendor management. |
| **Data residency** | Tenants pinned to a region; SILO tenants get region-locked silos. |
| **Backups/DR** | Encrypted, tested restores; RPO ≤ 5 min, RTO ≤ 30 min. |

## 9.8 Incident response

Documented runbooks, on-call rotation, severity matrix, blameless postmortems, customer-comms templates,
and a quarterly tabletop exercise. Break-glass admin access is time-boxed, MFA-gated, and fully audited.
