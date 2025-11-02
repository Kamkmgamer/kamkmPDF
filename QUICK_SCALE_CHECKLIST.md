# Quick Scale Checklist - Get to 1000+ Users Fast 🚀

Use this checklist to quickly scale your system. Each item includes time estimate and impact.

## ✅ Phase 1: Critical Optimizations (30 minutes) - DO THIS NOW

### 1. Add Database Indexes (15 min) ⚡️

**Impact:** 10-100x faster queries

```bash
# Run the index creation script
psql $DATABASE_URL < scripts/add-indexes.sql
```

**Expected results:**

- Job claiming: 100x faster
- User lookups: 50x faster
- File queries: 20x faster

---

### 2. Enable Connection Pooling (5 min) ⚡️

**Impact:** Prevents database connection exhaustion

Add to your `.env`:

```env
DATABASE_MAX_CONNECTIONS=20
DATABASE_IDLE_TIMEOUT=20
DATABASE_CONNECT_TIMEOUT=10
```

**Code already updated!** Just set the env vars and restart.

---

### 3. Increase Worker Concurrency (2 min) ⚡️

**Impact:** 3-8x more PDF generation throughput

Add to your `.env`:

```env
PDFPROMPT_WORKER_CONCURRENCY=8
MAX_PDF_CONCURRENCY=12
BROWSER_POOL_SIZE=10
```

**Code already updated!** Just set the env vars and restart.

---

## ✅ Phase 2: Horizontal Scaling (1-2 hours)

### 4. Deploy Multiple Workers (45 min)

**Impact:** Linear scaling - 3 workers = 3x capacity

**Option A: Same Server (Docker Compose)**

```yaml
# docker-compose.yml
services:
  worker1:
    build: .
    command: pnpm worker
    environment:
      PDFPROMPT_WORKER_CONCURRENCY: 8

  worker2:
    build: .
    command: pnpm worker
    environment:
      PDFPROMPT_WORKER_CONCURRENCY: 8

  worker3:
    build: .
    command: pnpm worker
    environment:
      PDFPROMPT_WORKER_CONCURRENCY: 8
```

**Option B: Separate Servers (Railway, Render, etc)**

1. Deploy worker to 3 different instances
2. Each with same config but separate processes
3. They'll coordinate via database (SKIP LOCKED)

**Expected capacity:**

- 3 workers × 8 concurrency = 24 concurrent PDFs
- ~1,500 PDFs/hour

---

### 5. Database Read Replica (30 min)

**Impact:** 50% reduction in primary database load

**If using Supabase:**

```env
DATABASE_URL=postgresql://...  # Primary (writes)
DATABASE_READ_REPLICA_URL=postgresql://...  # Replica (reads)
```

**If self-hosted PostgreSQL:**

```bash
# Set up streaming replication
# See: https://www.postgresql.org/docs/current/warm-standby.html
```

For now, the code uses single connection. Read replica support is optional.

---

### 6. Setup Monitoring (15 min)

**Impact:** Visibility into performance and issues

**Option A: Simple (Logs)**

```bash
# Monitor queue depth
watch -n 5 "psql $DATABASE_URL -c \"SELECT COUNT(*) FROM pdfprompt_job WHERE status='queued'\""

# Monitor worker throughput
tail -f logs/worker.log | grep "job .* completed"
```

**Option B: Full (DataDog/New Relic)**

```env
DD_API_KEY=your-key
DD_SERVICE=pdfprompt
DD_ENV=production
```

Install:

```bash
npm install dd-trace
```

---

## ✅ Phase 3: Advanced Optimization (1-2 days)

### 7. Redis Caching (2 hours)

**Impact:** 70-90% reduction in database queries

**Setup Upstash (Serverless Redis):**

1. Go to https://upstash.com
2. Create Redis database
3. Copy Redis URL

```env
REDIS_URL=rediss://...upstash.io:6379
```

**Subscription caching already implemented!** Just needs Redis connection.

---

### 8. CDN for Assets (1 hour)

**Impact:** Faster page loads, reduced server load

**If using Vercel:** Automatic!

**If self-hosted:**

- Use Cloudflare (free tier works great)
- Point domain to Cloudflare
- Enable "Proxy" status (orange cloud)

---

### 9. Rate Limiting (3 hours)

**Impact:** Prevent abuse, fair resource allocation

Create `src/lib/rate-limit.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

Use in API routes:

```typescript
const { success } = await ratelimit.limit(userId);
if (!success) throw new Error("Rate limit exceeded");
```

---

### 10. Auto-Scaling (4 hours)

**Impact:** Automatic capacity based on load

**AWS/GCP:**

- Set up auto-scaling groups
- Scale on CPU > 70% or queue depth > 50

**Railway:**

- Enable auto-scaling in dashboard
- Set min/max replicas

**Render:**

- Horizontal Pod Autoscaler
- Based on memory/CPU metrics

---

## 📊 Capacity Planning

After Phase 1 + 2, you should have:

| Metric                  | Value                 |
| ----------------------- | --------------------- |
| **Concurrent PDFs**     | 20-30                 |
| **Throughput**          | 1,000-1,500 PDFs/hour |
| **Concurrent Users**    | 1,000-2,000           |
| **Response Time (p95)** | < 5 seconds           |
| **Database Load**       | -70% (with caching)   |
| **Infrastructure Cost** | $150-300/month        |

---

## 🎯 Quick Wins Checklist

Copy this and paste in your terminal:

```bash
# 1. Add database indexes (15 min)
psql $DATABASE_URL < scripts/add-indexes.sql

# 2. Update .env (2 min)
cat >> .env << EOF
# Database pooling
DATABASE_MAX_CONNECTIONS=20
DATABASE_IDLE_TIMEOUT=20
DATABASE_CONNECT_TIMEOUT=10

# Worker scaling
PDFPROMPT_WORKER_CONCURRENCY=8
MAX_PDF_CONCURRENCY=12
BROWSER_POOL_SIZE=10
PDFPROMPT_BATCH_SIZE=10
PDFPROMPT_POLL_MS=1000
EOF

# 3. Restart application
pm2 restart all
# OR
docker-compose restart
# OR
vercel --prod

# 4. Monitor queue
watch -n 5 "psql $DATABASE_URL -c \"SELECT status, COUNT(*) FROM pdfprompt_job GROUP BY status\""
```

---

## 🔍 Troubleshooting

### Issue: Queue keeps growing

**Solution:** Add more workers or increase concurrency

```bash
# Check current queue depth
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pdfprompt_job WHERE status='queued'"

# If > 50: Add more workers
# If > 100: Urgent - scale immediately
```

### Issue: High database connection errors

**Solution:** Increase connection pool or reduce concurrency

```env
DATABASE_MAX_CONNECTIONS=30  # Increase this
PDFPROMPT_WORKER_CONCURRENCY=6  # OR decrease this
```

### Issue: Out of memory errors

**Solution:** Reduce browser pool size

```env
BROWSER_POOL_SIZE=5  # Decrease from 10
MAX_PDF_CONCURRENCY=8  # Decrease from 12
```

### Issue: Slow PDF generation

**Solution:** Check if AI provider (OpenRouter) is rate limiting

```bash
# Check logs for rate limit errors
grep "rate limit" logs/worker.log

# Add more API keys for load distribution
OPENROUTER_API_KEY1=...
OPENROUTER_API_KEY2=...
```

---

## 📈 Success Metrics

Track these to measure scaling success:

```sql
-- Queue depth (should be < 50)
SELECT COUNT(*) FROM pdfprompt_job WHERE status='queued';

-- Average processing time (should be < 30s)
SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)))
FROM pdfprompt_job
WHERE status='completed'
AND created_at > NOW() - INTERVAL '1 hour';

-- Throughput (PDFs per hour)
SELECT COUNT(*)
FROM pdfprompt_job
WHERE status='completed'
AND created_at > NOW() - INTERVAL '1 hour';

-- Error rate (should be < 5%)
SELECT
  status,
  COUNT(*),
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM pdfprompt_job
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY status;
```

---

## 🎉 You're Done!

After completing Phase 1 + 2, your system should handle **1,000-2,000 concurrent users** easily.

**Next steps:**

- Monitor performance for 1-2 weeks
- Scale to Phase 3 when needed
- See [SCALING_GUIDE.md](./SCALING_GUIDE.md) for advanced optimizations

**Questions?** Check the detailed [SCALING_GUIDE.md](./SCALING_GUIDE.md)
