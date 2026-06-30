# 10 — Deployment Architecture

Cloud-native on **AWS**, orchestrated by **Kubernetes (EKS)**, provisioned by **Terraform**, shipped by
**GitHub Actions**. Designed for multi-AZ HA today and multi-region tomorrow.

## 10.1 Environments

| Env | Purpose | Notes |
|-----|---------|-------|
| `dev` | Local (docker-compose) | Postgres, Redis, MinIO, Mailhog |
| `staging` | Pre-prod, prod-like | Reduced replicas, synthetic tenants |
| `prod` | Live | Multi-AZ, autoscaled, full observability |

## 10.2 Production topology (single region, multi-AZ)

```
                       Route 53 (geo + health)
                              │
                       CloudFront (CDN, static + cache)
                              │
                    AWS WAF + Shield Advanced
                              │
                     ALB (TLS 1.3, ACM cert)
                              │
        ┌─────────────────── EKS Cluster ───────────────────┐
        │  Namespaces: api, web, workers, ai, platform       │
        │  ┌────────┐ ┌────────┐ ┌─────────┐ ┌────────────┐  │
        │  │ api pods│ │web pods│ │worker   │ │ ai-gateway │  │
        │  │ (HPA)   │ │ (HPA)  │ │ pods    │ │ pods       │  │
        │  └────────┘ └────────┘ └─────────┘ └────────────┘  │
        │  Ingress-NGINX · cert-manager · Karpenter autoscale │
        └───────────────────────┬────────────────────────────┘
                                │
   ┌──────────────┬─────────────┼───────────────┬──────────────┐
   │ RDS Postgres │ ElastiCache │  OpenSearch   │ S3 (media/   │
   │ Multi-AZ +   │ Redis (HA,  │  (3-AZ)       │ docs/backups)│
   │ read replicas│ cluster)    │               │ + CloudFront │
   │ + PgBouncer  │             │               │              │
   └──────────────┴─────────────┴───────────────┴──────────────┘
   Secrets Manager/KMS · ECR (images) · SQS/EventBridge · CloudWatch
```

## 10.3 Containerization

- Multi-stage Docker builds; distroless/Alpine runtime images; non-root user; read-only FS.
- One image per app (`api`, `web`, `worker`, `ai-gateway`), tagged by git SHA, scanned (Trivy) before push to ECR.
- Local dev parity via [`infra/docker/docker-compose.yml`](../infra/docker/docker-compose.yml).

## 10.4 Kubernetes

- **Deployments** with `readiness`/`liveness`/`startup` probes; `PodDisruptionBudgets`; rolling updates.
- **HPA** on CPU + custom metrics (RPS, queue depth); **Karpenter** for node autoscaling; spot for workers.
- **Resource requests/limits** per pod; `topologySpreadConstraints` across AZs.
- Config via `ConfigMap`/`Secret` (External Secrets Operator → Secrets Manager).
- Service mesh optional (Istio/Linkerd) for mTLS + traffic shaping at scale.
- Manifests/Helm in [`infra/k8s`](../infra/k8s).

## 10.5 CI/CD pipeline (GitHub Actions)

```
PR opened
  ├─ lint + typecheck (turbo)
  ├─ unit + integration tests (incl. TENANT-ISOLATION suite — blocking)
  ├─ SAST (CodeQL/Semgrep) + secret scan (gitleaks) + dep audit
  └─ build images → scan (Trivy) → push to ECR (sha tag)
Merge to main
  ├─ deploy to staging (Helm) → smoke + e2e (Playwright) → migration dry-run
  └─ manual approval gate
Release
  ├─ DB migrations (Prisma, expand/contract, zero-downtime)
  ├─ canary deploy (5% → 25% → 100%) with automated rollback on SLO breach
  └─ post-deploy synthetic checks + changelog
```

- **Zero-downtime migrations**: expand → deploy code that handles both → backfill → contract.
- **Feature flags** decouple deploy from release.
- **GitOps** (ArgoCD/Flux) optional for declarative cluster state.

## 10.6 Multi-region & DR

- **Active-passive** (warm standby) across regions initially; **active-active** for global tenants later.
- Cross-region RDS read replica (promote on DR); S3 CRR; Route 53 failover.
- Per-tenant **region pinning** for data residency; SILO tenants get a region-locked stack.
- Backups: automated RDS snapshots + PITR (WAL→S3), Redis snapshots, S3 versioning + Object Lock.
- DR drills quarterly; RPO ≤ 5 min, RTO ≤ 30 min.

## 10.7 Observability & SRE

- **Metrics**: Prometheus + Grafana (RED/USE dashboards, per-tenant SLOs).
- **Logs**: structured JSON → Loki (PII-scrubbed), with `tenantId`/`requestId` correlation.
- **Traces**: OpenTelemetry → Tempo; end-to-end across gateway → service → DB.
- **Errors**: Sentry. **Uptime**: synthetic checks (Checkly). **Alerts**: Alertmanager → PagerDuty.
- **Cost**: per-tenant cost attribution via labels for billing & FinOps.

## 10.8 Scaling levers (summary)

Stateless pods scale horizontally (HPA/Karpenter); Postgres scales via read replicas + PgBouncer + partitioning;
Redis via cluster mode; search via OpenSearch shards; heavy/async work via worker fleets. Full plan in
[doc 14](./14-scalability.md).
