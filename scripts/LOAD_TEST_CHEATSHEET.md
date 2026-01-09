# Load Test Quick Reference

## Common Commands

```bash
# Full test (17 minutes)
k6 run scripts/load-test.js

# Quick smoke test (30 seconds, 20 VUs)
k6 run --duration 30s --vus 20 scripts/load-test.js

# Medium test (5 minutes, 50 VUs)
k6 run --duration 5m --vus 50 scripts/load-test.js

# Stress test (10 minutes, 100 VUs)
k6 run --duration 10m --vus 100 scripts/load-test.js

# Custom server
BASE_URL=http://localhost:5000 k6 run scripts/load-test.js

# Production test
BASE_URL=https://api.production.com k6 run scripts/load-test.js
```

## Quick Metrics Reference

| Metric | What It Means | Good Value |
|--------|---------------|------------|
| `http_reqs` | Requests per second | > 250 req/s |
| `http_req_duration` avg | Average response time | < 200ms |
| `http_req_duration` p(95) | 95% of requests under | < 500ms |
| `http_req_failed` | Failed request rate | < 1% |
| `errors` | Custom error rate | < 1% |
| `steady_state_duration` | Performance during normal load | avg < 150ms |
| `peak_load_duration` | Performance during peak | avg < 250ms |

## Expected Throughput (0.2s think time)

| VUs | Requests/sec | Use Case |
|-----|--------------|----------|
| 10 | ~50 | Development testing |
| 20 | ~100 | Smoke testing |
| 50 | ~250 | Normal load |
| 100 | ~500 | High load |
| 200 | ~1000 | Peak/stress test |

## Threshold Pass/Fail

```
✓ = Passed
✗ = Failed (investigate!)
```

### Overall Thresholds
- `errors rate<0.01` → Overall error rate must be < 1%
- `http_req_duration avg<200` → Average response must be < 200ms
- `http_reqs rate>250` → Must sustain > 250 req/s average

### Stage-Specific
- `steady_state_errors rate<0.005` → < 0.5% errors during steady load
- `steady_state_duration avg<150` → < 150ms avg during steady load
- `peak_load_errors rate<0.02` → < 2% errors during peak (allows degradation)
- `peak_load_duration avg<250` → < 250ms avg during peak

## Test Stages (17-minute test)

```
0-2m:   Ramp 0→50 VUs     (warm-up)
2-7m:   Hold 50 VUs       (steady state - measured)
7-9m:   Ramp 50→100 VUs   (scaling up)
9-12m:  Hold 100 VUs      (high load - measured)
12-13m: Spike 100→200 VUs (stress test - measured)
13-15m: Drop 200→50 VUs   (recovery)
15-17m: Ramp 50→0 VUs     (cool down)
```

## Troubleshooting One-Liners

```bash
# Check if API is running
curl http://localhost:5001/metrics

# View API health
curl http://localhost:5001/api/health/status | jq

# Check k6 version
k6 version

# Find latest report
ls -t reports/*.html | head -1

# Open latest HTML report (macOS)
open $(ls -t reports/*.html | head -1)

# View JSON report summary
cat $(ls -t reports/*.json | head -1) | jq '.metrics.http_req_duration'

# Count total requests in last test
cat $(ls -t reports/*.json | head -1) | jq '.metrics.http_reqs.values.count'
```

## Common Failures & Fixes

| Failure | Likely Cause | Fix |
|---------|--------------|-----|
| `errors rate>0.01` | API errors or timeouts | Check API logs, DB connection |
| `http_reqs rate<250` | Test too short or not enough VUs | Use full test or increase VUs |
| `http_req_duration avg>200` | Slow API responses | Check DB queries, caching |
| `Service not healthy` | API not running | Start the API: `dotnet run` |
| `steady_state_errors rate>0.005` | Errors during normal load | Investigate stability issues |
| `peak_load_duration avg>250` | Slow under high load | Scaling/performance issue |

## Reading the Output

### During Test
```
running (5m30s), 050/200 VUs, 15432 complete and 0 interrupted iterations
        ↑           ↑      ↑      ↑                    ↑
    elapsed    active  max   completed              interrupted
```

### After Test
```
http_req_duration..............: avg=14.66ms  min=400µs  med=13.14ms  max=113.07ms
                                     ↑            ↑          ↑            ↑
                                  average      fastest    median       slowest
```

## Endpoint Weights

| Endpoint | % of Traffic |
|----------|--------------|
| `/metrics` | 10% |
| `/api/fleet-kpis/prometheus` | 15% |
| `/api/fleet-kpis` | 15% |
| `/api/dashboard/kpis` | 20% |
| `/api/bus` | 15% |
| `/api/dashboard/fleet-status` | 10% |
| `/api/businessinsights/roi-summary` | 10% |
| `/api/health` | 5% |

## Performance Targets

### Minimum (Must Pass)
- Error rate: < 1%
- Avg response: < 200ms
- p(95): < 500ms
- Throughput: > 250 req/s

### Good
- Error rate: < 0.5%
- Avg response: < 150ms
- p(95): < 400ms
- Throughput: > 280 req/s

### Excellent
- Error rate: < 0.1%
- Avg response: < 100ms
- p(95): < 300ms
- Throughput: > 300 req/s

## Quick Customization

### Change think time
Edit `scripts/load-test.js` line 56:
```javascript
const THINK_TIME = 0.2; // seconds between requests
```

### Change target
```bash
BASE_URL=http://new-server:5001 k6 run scripts/load-test.js
```

### Custom duration & VUs
```bash
k6 run --duration 10m --vus 75 scripts/load-test.js
```

---

**Tip**: Bookmark this file for quick reference during load testing sessions!
