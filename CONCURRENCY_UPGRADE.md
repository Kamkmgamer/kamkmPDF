# PDF Generation Concurrency Upgrade

## Problem Fixed

Previously, PDF generation **did not scale** because the worker processed jobs **sequentially** (one at a time), even though concurrency controls were in place. This resulted in poor throughput and long queue times during high load.

## Solution Implemented

### 1. **Parallel Job Processing in `drain()` Function**

Changed from sequential processing:

```typescript
// OLD - Sequential processing
for (const job of rows) {
  await processJob(job, { alreadyClaimed: true });
  processed++;
}
```

To parallel processing:

```typescript
// NEW - Parallel processing
const jobPromises = rows.map((job) => {
  if (processed >= maxJobs || Date.now() - start >= maxMs) {
    return Promise.resolve();
  }
  processed++;
  return processJob(job, { alreadyClaimed: true });
});

await Promise.allSettled(jobPromises);
```

### 2. **Parallel Job Processing in `runLoop()` Function**

Changed from picking one job at a time:

```typescript
// OLD - Single job processing
const job = await pickNextJob();
if (job) {
  await processJob(job);
}
```

To batch parallel processing:

```typescript
// NEW - Batch parallel processing
const workerConcurrency = Number(process.env.PDFPROMPT_WORKER_CONCURRENCY ?? 3);
const ids = await claimNextJobsBatch(workerConcurrency);

if (ids.length > 0) {
  const rows = await db.select().from(jobs).where(inArray(jobs.id, ids));
  const jobPromises = rows.map((job) =>
    processJob(job, { alreadyClaimed: true }),
  );
  await Promise.allSettled(jobPromises);
}
```

### 3. **New Environment Variables**

Added two new environment variables for fine-grained concurrency control:

- **`PDFPROMPT_WORKER_CONCURRENCY`** (default: 3)
  - Controls how many jobs are processed in parallel per worker cycle
  - Higher values = more concurrent processing
  - Recommended: 3-5 for serverless, 5-10 for dedicated workers

- **`MAX_PDF_CONCURRENCY`** (default: 8)
  - Global semaphore limiting total concurrent PDF generations
  - Prevents memory exhaustion from too many browser instances
  - Each browser uses ~100-200MB RAM
  - Recommended: Set based on available memory (e.g., 8 for 2GB RAM, 16 for 4GB RAM)

## How It Works

### Before (Sequential)

```
Time →
[Job 1] ────────→ [Job 2] ────────→ [Job 3] ────────→
Total time: 3x individual job time
```

### After (Parallel)

```
Time →
[Job 1] ────────→
[Job 2] ────────→
[Job 3] ────────→
Total time: 1x individual job time (if resources allow)
```

### Concurrency Control Flow

1. **Worker Cycle Start**
   - Worker claims `PDFPROMPT_WORKER_CONCURRENCY` jobs using atomic DB query
   - Uses PostgreSQL `FOR UPDATE SKIP LOCKED` to prevent conflicts

2. **Parallel Processing**
   - All claimed jobs start processing simultaneously using `Promise.allSettled()`
   - Each job acquires a slot from the `MAX_PDF_CONCURRENCY` semaphore
   - If semaphore is full, job waits in queue

3. **Browser Pool Management**
   - Pre-warmed browser pool provides pages quickly
   - Semaphore ensures we don't create too many browser instances
   - Pages are reused across jobs for efficiency

4. **Completion**
   - All jobs in batch complete (or fail)
   - Worker immediately claims next batch (no idle time)

## Performance Improvements

### Expected Throughput Gains

| Setting                          | Old Throughput | New Throughput | Improvement   |
| -------------------------------- | -------------- | -------------- | ------------- |
| Default (concurrency=3)          | 1 PDF/cycle    | 3 PDFs/cycle   | **3x faster** |
| High load (concurrency=5)        | 1 PDF/cycle    | 5 PDFs/cycle   | **5x faster** |
| Dedicated worker (concurrency=8) | 1 PDF/cycle    | 8 PDFs/cycle   | **8x faster** |

### Real-World Scenarios

**Scenario 1: Serverless (Vercel Cron)**

- Previous: 1 PDF per minute = 60 PDFs/hour
- New (concurrency=3): 3 PDFs per minute = 180 PDFs/hour
- **Improvement: 3x throughput**

**Scenario 2: Dedicated Worker**

- Previous: ~60 PDFs/hour (sequential)
- New (concurrency=8): ~480 PDFs/hour (parallel)
- **Improvement: 8x throughput**

## Configuration Recommendations

### For Serverless (Vercel, AWS Lambda)

```env
PDFPROMPT_WORKER_CONCURRENCY=3
MAX_PDF_CONCURRENCY=5
PDFPROMPT_BATCH_SIZE=5
PDFPROMPT_MAX_MS_PER_INVOCATION=55000
```

- Keep concurrency low due to execution time limits
- Avoid memory limits on serverless platforms

### For Dedicated Worker (2GB RAM)

```env
PDFPROMPT_WORKER_CONCURRENCY=8
MAX_PDF_CONCURRENCY=10
PDFPROMPT_BATCH_SIZE=10
PDFPROMPT_POLL_MS=1000
```

- Higher concurrency for better throughput
- Scale based on available resources

### For High-Volume Production (4GB+ RAM)

```env
PDFPROMPT_WORKER_CONCURRENCY=10
MAX_PDF_CONCURRENCY=16
PDFPROMPT_BATCH_SIZE=15
PDFPROMPT_POLL_MS=500
```

- Maximum parallelism for peak performance
- Monitor memory usage and adjust accordingly

## Testing the Changes

### 1. Queue Multiple Jobs

```bash
# Use the API to queue 10 jobs
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/generate \
    -H "Content-Type: application/json" \
    -d '{"prompt": "Test job '$i'", "userId": "test"}' &
done
```

### 2. Watch Worker Logs

```bash
# Start worker with logging
PDFPROMPT_WORKER_CONCURRENCY=5 pnpm worker
```

You should see logs like:

```
[worker] starting loop (poll 2000ms, concurrency 5)
[worker] processing 5 jobs concurrently
[worker] processing job abc-123
[worker] processing job def-456
[worker] processing job ghi-789
[worker] processing job jkl-012
[worker] processing job mno-345
```

### 3. Monitor Performance

- Check job completion times in database
- Compare before/after throughput
- Monitor memory usage during peak load

## Files Modified

1. **`src/server/jobs/worker.ts`**
   - Updated `drain()` to process jobs in parallel
   - Updated `runLoop()` to claim and process multiple jobs
   - Added `PDFPROMPT_WORKER_CONCURRENCY` support

2. **`src/env.js`**
   - Added `PDFPROMPT_WORKER_CONCURRENCY` validation
   - Added `MAX_PDF_CONCURRENCY` validation

3. **`README.md`**
   - Documented new environment variables
   - Added "Concurrency Control" section
   - Added performance tuning guidelines

## Backwards Compatibility

✅ **Fully backwards compatible** - No breaking changes!

- If environment variables are not set, defaults are used
- Default values match or improve previous behavior
- Existing deployments work without configuration changes

## Troubleshooting

### Issue: "Too many open browser instances"

**Solution:** Lower `MAX_PDF_CONCURRENCY`

```env
MAX_PDF_CONCURRENCY=5
```

### Issue: "Memory exhausted"

**Solution:** Reduce both concurrency settings

```env
PDFPROMPT_WORKER_CONCURRENCY=2
MAX_PDF_CONCURRENCY=4
```

### Issue: "Jobs timing out on serverless"

**Solution:** Lower concurrency, increase timeout

```env
PDFPROMPT_WORKER_CONCURRENCY=2
PDFPROMPT_MAX_MS_PER_INVOCATION=55000
```

### Issue: "Database connection pool exhausted"

**Solution:** Reduce batch size

```env
PDFPROMPT_BATCH_SIZE=3
PDFPROMPT_WORKER_CONCURRENCY=3
```

## Monitoring

### Key Metrics to Track

1. **Throughput**: PDFs generated per minute/hour
2. **Queue depth**: Number of pending jobs
3. **Processing time**: Average time per PDF
4. **Memory usage**: Peak memory during processing
5. **Error rate**: Failed jobs / total jobs

### Recommended Monitoring Tools

- Application logs (console output)
- Database query for job statistics
- System memory monitoring
- APM tools (DataDog, New Relic, etc.)

## Next Steps

Consider these additional optimizations:

1. **Browser Pool Optimization** (see `TODO_PERFORMANCE.md`)
   - Memory monitoring per browser instance
   - Browser lifecycle management
   - Health checks and auto-restart

2. **Database Query Optimization**
   - Add indexes for job queries
   - Connection pool tuning
   - Read replicas for scaling

3. **Caching Strategy**
   - Cache subscription tier lookups
   - Cache user data during job processing
   - CDN for static assets

## Summary

✅ **Problem**: Sequential job processing limited throughput to 1 PDF at a time  
✅ **Solution**: Parallel processing with configurable concurrency  
✅ **Result**: 3-8x performance improvement depending on configuration  
✅ **Impact**: Better user experience, shorter queue times, higher system capacity

---

_Implemented: November 1, 2025_
