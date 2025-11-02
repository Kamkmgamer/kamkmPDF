# Scaling to Thousands of Users - Complete Guide

## 📊 Current State vs Target

| Metric                   | Current Capacity  | Target (1000s of users) | Required Improvement |
| ------------------------ | ----------------- | ----------------------- | -------------------- |
| **Concurrent PDFs**      | 3-8               | 100+                    | **12x scale**        |
| **Throughput**           | ~60-180 PDFs/hour | 1,000+ PDFs/hour        | **10x scale**        |
| **Response Time**        | 5-15s per PDF     | < 5s per PDF            | **3x faster**        |
| **Database Connections** | Unmanaged         | Pooled (50-100)         | **Optimized**        |
| **Worker Instances**     | 1                 | 5-10                    | **Horizontal scale** |
| **Caching**              | None              | Redis/Memory            | **Required**         |
| **Monitoring**           | Basic logs        | Full observability      | **Critical**         |

## 🎯 Scaling Strategy

### Phase 1: Critical Optimizations (Week 1) ⚡

#### 1.1 Database Connection Pooling

**Impact:** Prevents connection exhaustion, 2-3x query performance

**Implementation:**

```typescript
// src/server/db/index.ts - UPDATED
import postgres from "postgres";

const conn = postgres(env.DATABASE_URL, {
  max: 20, // Max connections per worker
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Connection timeout 10s
  prepare: false, // Disable prepared statements for connection pool
  onnotice: () => {}, // Silence notices
});
```

**Configuration:**

```env
DATABASE_MAX_CONNECTIONS=20      # Per worker instance
DATABASE_IDLE_TIMEOUT=20
DATABASE_CONNECT_TIMEOUT=10
```

#### 1.2 Add Database Indexes

**Impact:** 10-100x faster queries for job lookup and user data

**Critical Indexes Needed:**

```sql
-- Job queue optimization
CREATE INDEX CONCURRENTLY idx_jobs_status_created
  ON pdfprompt_job(status, created_at) WHERE status = 'queued';

-- User subscription lookup
CREATE INDEX CONCURRENTLY idx_user_subs_user_id
  ON pdfprompt_user_subscription(user_id);

-- File lookup by job
CREATE INDEX CONCURRENTLY idx_files_job_id
  ON pdfprompt_file(job_id);

-- Usage history aggregation
CREATE INDEX CONCURRENTLY idx_usage_user_created
  ON pdfprompt_usage_history(user_id, created_at);
```

#### 1.3 Implement Caching Layer

**Impact:** 80-90% reduction in database queries, 5x faster API responses

**Cache Strategy:**

- **Subscription data**: Cache for 5 minutes (hot data)
- **Tier configurations**: Cache forever (static data)
- **User limits**: Cache for 1 minute (frequently accessed)

#### 1.4 Scale Browser Pool

**Impact:** Support 50-100 concurrent PDF generations

**Configuration:**

```env
BROWSER_POOL_SIZE=10              # Max browsers per worker
BROWSER_MAX_PAGES_PER_BROWSER=5   # Max pages per browser
BROWSER_MAX_AGE_MS=1800000        # 30 minutes
BROWSER_MEMORY_LIMIT_MB=300       # Per browser
```

### Phase 2: Horizontal Scaling (Week 2) 🚀

#### 2.1 Multi-Worker Architecture

**Deployment Strategy:**

```
┌─────────────────────────────────────────────────┐
│                  Load Balancer                   │
│         (Vercel, Cloudflare, AWS ALB)           │
└──────────────────┬──────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐      ┌───▼───┐      ┌──▼────┐
│Web App│      │Web App│      │Web App│
│ (3-5) │      │ (3-5) │      │ (3-5) │
└───┬───┘      └───┬───┘      └───┬───┘
    │              │              │
    └──────────────┼──────────────┘
                   │
           ┌───────▼────────┐
           │   PostgreSQL   │
           │   (Primary +   │
           │   Replicas)    │
           └───────┬────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐    ┌───▼────┐    ┌───▼────┐
│Worker 1│    │Worker 2│    │Worker 3│
│ (8-10) │    │ (8-10) │    │ (8-10) │
└────────┘    └────────┘    └────────┘

Total Capacity: 24-30 concurrent PDFs
Throughput: ~1,500-2,000 PDFs/hour
```

**Worker Configuration (per instance):**

```env
# Production worker settings
PDFPROMPT_WORKER_CONCURRENCY=10
MAX_PDF_CONCURRENCY=15
PDFPROMPT_BATCH_SIZE=10
BROWSER_POOL_SIZE=10
DATABASE_MAX_CONNECTIONS=15
```

#### 2.2 Database Read Replicas

**Setup:**

```typescript
// src/server/db/index.ts - Multi-database setup
const primaryConn = postgres(env.DATABASE_URL, { max: 20 });
const replicaConn = postgres(env.DATABASE_READ_REPLICA_URL, { max: 50 });

export const dbWrite = drizzle(primaryConn, { schema }); // Writes only
export const dbRead = drizzle(replicaConn, { schema }); // Reads only
```

**Usage Pattern:**

```typescript
// Read from replica (90% of queries)
const jobs = await dbRead.select().from(jobs).where(...);

// Write to primary (10% of queries)
await dbWrite.insert(jobs).values(...);
```

#### 2.3 Redis Caching

**Setup:**

```typescript
// src/lib/cache.ts - Redis client
import Redis from 'ioredis';

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

// Subscription cache with 5min TTL
async function getCachedSubscription(userId: string) {
  const cached = await redis.get(`sub:${userId}`);
  if (cached) return JSON.parse(cached);

  const sub = await dbRead.select()...;
  await redis.setex(`sub:${userId}`, 300, JSON.stringify(sub));
  return sub;
}
```

**Configuration:**

```env
REDIS_URL=redis://localhost:6379
REDIS_MAX_CONNECTIONS=20
CACHE_TTL_SUBSCRIPTIONS=300      # 5 minutes
CACHE_TTL_TIERS=0                # Forever (static)
```

### Phase 3: Advanced Optimization (Week 3) 💎

#### 3.1 Rate Limiting & Queue Management

**Per-User Rate Limiting:**

```typescript
// Prevent abuse and ensure fair resource distribution
const rateLimit = {
  starter: { rpm: 2, daily: 100 }, // 2 per minute
  professional: { rpm: 10, daily: 1000 }, // 10 per minute
  enterprise: { rpm: 50, daily: 10000 }, // 50 per minute
};
```

**Queue Priority System:**

```typescript
// Higher tier = higher priority
enum Priority {
  LOW = 0, // Starter tier
  MEDIUM = 1, // Professional tier
  HIGH = 2, // Enterprise tier
  CRITICAL = 3, // System/admin requests
}
```

#### 3.2 Browser Pool Memory Management

**Auto-scaling based on memory:**

```typescript
// Monitor memory per browser, restart when > 300MB
if (browserMemoryUsage > 300 * 1024 * 1024) {
  await restartBrowser(browserId);
}

// Global memory limit: 80% of available RAM
const systemMemory = os.totalmem();
const memoryThreshold = systemMemory * 0.8;
if (process.memoryUsage().heapUsed > memoryThreshold) {
  await scaleDownBrowserPool();
}
```

#### 3.3 Monitoring & Observability

**Key Metrics to Track:**

```typescript
// Application metrics
metrics.gauge("pdf.queue_depth", queueDepth);
metrics.histogram("pdf.generation_time", duration);
metrics.counter("pdf.completed_total");
metrics.counter("pdf.failed_total");

// System metrics
metrics.gauge("browser.pool_size", browserCount);
metrics.gauge("browser.memory_usage_mb", memoryMB);
metrics.gauge("db.connection_pool_active", activeConns);
metrics.histogram("db.query_duration_ms", queryTime);

// Business metrics
metrics.counter("api.requests_by_tier", tier);
metrics.histogram("api.response_time_ms", responseTime);
```

**Alerting Rules:**

- Queue depth > 100 for > 5 minutes
- PDF generation time > 15s (p95)
- Error rate > 5%
- Memory usage > 85%
- Database connections > 80% capacity

## 🛠️ Infrastructure Requirements

### Minimum Setup for 1000s of Users

#### Option A: Vercel + Managed Services (Recommended for MVP)

```
Components:
- Vercel Pro ($20/mo) - Web app + API
- 3x Dedicated Workers ($15/mo each on Railway/Render)
- Supabase Pro ($25/mo) - PostgreSQL + Read Replicas
- Upstash Redis ($10/mo) - 10GB cache
- UploadThing Pro ($20/mo) - PDF storage

Total: ~$125/month
Capacity: 1,000-2,000 active users, 50,000 PDFs/month
```

#### Option B: AWS/GCP Self-Hosted (Max Control)

```
Components:
- 2x t3.medium (Web app) - $60/mo
- 3x t3.large (Workers) - $180/mo
- RDS PostgreSQL db.t3.large - $150/mo
- ElastiCache Redis - $50/mo
- S3 + CloudFront - $50/mo

Total: ~$490/month
Capacity: 5,000-10,000 active users, 200,000 PDFs/month
```

### Resource Allocation per Worker

**For 1000s of concurrent users:**

| Worker Spec     | CPU    | RAM  | Concurrent PDFs | Cost/month |
| --------------- | ------ | ---- | --------------- | ---------- |
| **Starter**     | 2 core | 4GB  | 5-8             | $15        |
| **Standard**    | 4 core | 8GB  | 10-15           | $45        |
| **Performance** | 8 core | 16GB | 20-30           | $120       |

**Recommended for 1000s of users:** 3x Standard workers = 30-45 concurrent PDFs

## 📈 Capacity Planning

### Expected Load by User Count

| Active Users | Peak PDFs/hour | Concurrent PDFs Needed | Worker Count | DB Connections |
| ------------ | -------------- | ---------------------- | ------------ | -------------- |
| 100          | 50             | 3-5                    | 1            | 10             |
| 500          | 250            | 10-15                  | 2            | 30             |
| 1,000        | 500            | 20-30                  | 3            | 60             |
| 5,000        | 2,500          | 100-150                | 10           | 200            |
| 10,000       | 5,000          | 200-300                | 20           | 400            |

### Cost Projections

| Users  | Infrastructure | Storage | Total/month | Per User |
| ------ | -------------- | ------- | ----------- | -------- |
| 1,000  | $125           | $20     | $145        | $0.15    |
| 5,000  | $490           | $100    | $590        | $0.12    |
| 10,000 | $980           | $200    | $1,180      | $0.12    |

## 🚀 Quick Start - Scale Now

### 1. Database Optimization (15 minutes)

```bash
# Add indexes
psql $DATABASE_URL < scripts/add-indexes.sql

# Update connection pooling
# Add to .env:
DATABASE_MAX_CONNECTIONS=20
DATABASE_IDLE_TIMEOUT=20
```

### 2. Scale Workers (30 minutes)

```bash
# Deploy 3 worker instances with updated config
PDFPROMPT_WORKER_CONCURRENCY=8
MAX_PDF_CONCURRENCY=12
BROWSER_POOL_SIZE=8

# Start workers
pnpm worker  # Run on 3 separate instances
```

### 3. Enable Caching (45 minutes)

```bash
# Setup Redis
# Option 1: Upstash (Serverless)
REDIS_URL=rediss://...upstash.io:6379

# Option 2: Local/Self-hosted
docker run -d -p 6379:6379 redis:alpine

# Enable caching in code (already prepared)
ENABLE_REDIS_CACHE=true
```

### 4. Monitor Performance (15 minutes)

```bash
# Add monitoring
npm install @vercel/analytics @vercel/speed-insights

# Or use Datadog/New Relic
DD_API_KEY=your-key pnpm start
```

## 📊 Success Metrics

### Week 1 (Database + Caching)

- ✅ 70% reduction in database queries
- ✅ 50% faster API response times
- ✅ Support 500 concurrent users

### Week 2 (Horizontal Scaling)

- ✅ 10x throughput improvement
- ✅ Support 2,000 concurrent users
- ✅ < 5s p95 PDF generation time

### Week 3 (Polish + Monitoring)

- ✅ Full observability dashboard
- ✅ Auto-scaling based on load
- ✅ 99.9% uptime SLA ready

## 🎯 Next Steps

1. **Immediate** (Today):
   - [ ] Add database indexes (15 min)
   - [ ] Configure connection pooling (5 min)
   - [ ] Update worker concurrency settings (2 min)

2. **This Week**:
   - [ ] Deploy 3 worker instances
   - [ ] Setup Redis caching
   - [ ] Add monitoring dashboard

3. **Next Week**:
   - [ ] Implement rate limiting
   - [ ] Add read replicas
   - [ ] Setup auto-scaling

4. **Month 1**:
   - [ ] Full observability stack
   - [ ] Automated capacity planning
   - [ ] Load testing & optimization

---

**Ready to scale?** Start with the Quick Start section above! 🚀
