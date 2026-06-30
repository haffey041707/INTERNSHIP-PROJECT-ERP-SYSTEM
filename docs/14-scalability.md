# 14 — Scalability Strategy (1M+ users, 10k+ tenants)

The architecture scales each tier independently. Below: targets, bottlenecks, and the levers to pull at each
order of magnitude.

## 14.1 Capacity targets

| Dimension | Target |
|-----------|--------|
| Tenants | 10,000+ institutions |
| Total users | 1,000,000+ |
| Peak concurrent | ~150,000 (exam days, fee deadlines, result publishing) |
| API throughput | 50,000+ RPS sustained, burst higher |
| p95 latency | < 250 ms reads, < 500 ms writes |
| Availability | 99.95% |

## 14.2 Stateless compute — scale horizontally

- All app pods (`api`, `web`, `worker`, `ai-gateway`) are **stateless** → HPA on CPU + custom metrics (RPS,
  queue depth); **Karpenter** adds nodes; spot instances for workers.
- Sessions/state live in Redis/DB, never in pod memory → any pod serves any request.
- Graceful shutdown + connection draining for zero-downtime deploys.

## 14.3 Database — the primary bottleneck, and how we beat it

1. **Connection pooling**: PgBouncer (transaction mode) in front of RDS — thousands of app connections → small
   pool of DB connections.
2. **Read replicas**: route reports, lists, dashboards, GraphQL reads to replicas; writes to primary.
3. **Partitioning**: range-partition high-volume tables by month (`attendance_records`, `audit_logs`,
   `notifications`, `ai_usage`, `engagement_events`, `vehicle_locations`); prune/cold-store old partitions.
4. **Indexing discipline**: tenant-leading composite + partial + covering indexes; query budgets in CI (pg_stat).
5. **Materialized views** for dashboards, refreshed async; serve KPIs without hammering OLTP.
6. **CQRS where it pays**: heavy read models (analytics) built in OpenSearch/ClickHouse via CDC (Debezium).
7. **Sharding by tenant** (the big lever): when one cluster is saturated, route tenants to **multiple Postgres
   clusters** by `tenant_id` (a tenant→shard map). Pooled tenants are distributed; SILO tenants get their own
   cluster. Because all access is tenant-scoped, sharding requires **no query rewrites**.
8. **Vertical headroom**: RDS instance scaling + Aurora option for storage auto-scaling and faster failover.

```
            App ── PgBouncer ──┬── Shard A (tenants 0–3k)  [primary + 2 replicas]
                               ├── Shard B (tenants 3k–6k) [primary + 2 replicas]
                               ├── Shard C (tenants 6k–9k) [primary + 2 replicas]
                               └── Silo clusters (enterprise tenants)
   tenant→shard lookup cached in Redis; routing in PrismaService datasource selection.
```

## 14.4 Caching strategy (Redis)

- **Read-through cache** for hot, slow-changing data (tenant settings, permissions, timetables, fee structures)
  — keyed by `tenant:{id}:...`, invalidated on write via events.
- **Session & rate-limit** store.
- **Semantic/result cache** for AI and expensive aggregations.
- Redis in **cluster mode** with replicas; cache-aside pattern; sensible TTLs + stampede protection (locks).

## 14.5 Async & queues

- Offload everything non-interactive to workers: notifications, grading, report generation, AI inference,
  imports/exports, billing.
- **BullMQ/SQS** with per-tenant fairness (weighted queues) so bulk jobs can't starve interactive load.
- **Outbox pattern** for reliable event publication; DLQ + retries with backoff.
- Autoscale worker fleet on queue depth.

## 14.6 Search & analytics offload

- **OpenSearch** for full-text search and log/event analytics (kept in sync via CDC).
- **ClickHouse** (optional) for huge-scale time-series analytics dashboards.
- Keeps OLTP Postgres lean and fast.

## 14.7 Realtime at scale

- Socket.IO with **Redis adapter** (or a managed pub/sub) so WS connections fan out across pods.
- Rooms keyed by `tenant:resource`; sticky-session-free via the adapter.
- For very high fan-out (mass announcements), push through the notification pipeline, not per-socket.

## 14.8 Edge & static

- **CloudFront CDN** for web static assets, images, e-books, video (with signed URLs).
- Next.js: RSC + ISR + edge caching for cacheable pages; per-tenant cache keys.
- Image/media transforms at the edge.

## 14.9 Multi-region

- Tenants pinned to a home region (data residency); CDN global.
- Active-passive → active-active per region as global tenant base grows.
- Cross-region replicas for DR; Route 53 latency + failover routing.

## 14.10 Cost & efficiency (FinOps)

- Per-tenant cost attribution (labels) → fair pricing + spotting abusive tenants.
- Spot for workers, savings plans for steady baseline, autoscale-to-zero for dev/staging.
- Tiered storage: hot (RDS/Redis) → warm (S3) → cold (Glacier) for old partitions/backups.

## 14.11 Scaling playbook by milestone

| Stage | Users | Key moves |
|-------|-------|-----------|
| Launch | <50k | Single region, 1 RDS primary + 1 replica, HPA, Redis single, CDN. |
| Growth | 50k–250k | Add replicas, PgBouncer, partition hot tables, OpenSearch, worker autoscale, materialized views. |
| Scale | 250k–1M | **Shard Postgres by tenant**, Redis cluster, CDC analytics pipeline, multi-AZ everything, canary releases. |
| Global | 1M+ | Multi-region active-active, regional silos for enterprise, ClickHouse analytics, edge compute. |

The crucial enabler throughout: **every data path is tenant-scoped**, so sharding/regional routing is a
configuration change, not a rewrite.
