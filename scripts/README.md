# Fleet Management Load Test

Comprehensive k6 load testing suite for the Fleet Management API with realistic monitoring traffic patterns and stage-specific performance thresholds.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Configuration](#test-configuration)
- [Understanding Results](#understanding-results)
- [Thresholds Explained](#thresholds-explained)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

---

## Overview

This load test simulates realistic production traffic patterns for the Fleet Management system, including:
- **Prometheus/Grafana scraping**: Continuous monitoring endpoints
- **Dashboard users**: Interactive API usage
- **Business analytics**: KPI and insights queries

### Key Features

- ✅ **5x faster than typical user traffic** (0.2s think time)
- ✅ **Stage-specific thresholds** (different expectations for steady vs peak load)
- ✅ **Weighted endpoint distribution** (realistic traffic patterns)
- ✅ **17-minute progressive load test** (ramp-up, steady state, peak, ramp-down)
- ✅ **Detailed reports** (JSON + HTML output)

---

## Quick Start

### Prerequisites

1. **Install k6**: https://k6.io/docs/get-started/installation/
   ```bash
   # macOS
   brew install k6

   # Windows
   choco install k6

   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Ensure API is running**: The Fleet Management API should be running on `localhost:5001`

### Run Tests

```bash
# Full 17-minute comprehensive test (recommended)
k6 run scripts/load-test.js

# Quick 30-second smoke test
k6 run --duration 30s --vus 20 scripts/load-test.js

# Custom configuration
BASE_URL=http://localhost:5001 k6 run scripts/load-test.js

# Different server
BASE_URL=https://staging.example.com k6 run scripts/load-test.js
```

---

## Test Configuration

### Load Stages (17 minutes total)

| Stage | Duration | VUs | Purpose |
|-------|----------|-----|---------|
| **Ramp-up** | 2 min | 0→50 | Gradual traffic increase |
| **Steady State 1** | 5 min | 50 | Normal production load |
| **Ramp-up** | 2 min | 50→100 | Increase to high load |
| **Steady State 2** | 3 min | 100 | High production load |
| **Peak Load** | 1 min | 100→200 | Spike/stress test |
| **Recovery** | 2 min | 200→50 | Load reduction |
| **Ramp-down** | 2 min | 50→0 | Graceful shutdown |

### Traffic Distribution

Endpoints are called with weighted randomization to simulate realistic traffic:

| Endpoint | Weight | Purpose |
|----------|--------|---------|
| `/metrics` | 10% | Prometheus scraping |
| `/api/fleet-kpis/prometheus` | 15% | Grafana metrics |
| `/api/fleet-kpis` | 15% | JSON KPI data |
| `/api/dashboard/kpis` | 20% | Main dashboard |
| `/api/bus` | 15% | Fleet data |
| `/api/dashboard/fleet-status` | 10% | Real-time status |
| `/api/businessinsights/roi-summary` | 10% | Analytics |
| `/api/health` | 5% | Health checks |

### Think Time

**0.2 seconds** between requests per VU - simulates monitoring/API traffic patterns:
- Prometheus typically scrapes every 15-30 seconds
- Dashboards auto-refresh every few seconds
- 0.2s think time = ~5 requests/second per VU
- 200 VUs × 5 req/s = **~1000 req/s peak throughput**

---

## Understanding Results

### Output Sections

#### 1. **Thresholds** (Pass/Fail Criteria)
```
█ THRESHOLDS
  errors
  ✓ 'rate<0.01' rate=0.00%          ← Overall error rate < 1%

  http_reqs
  ✓ 'rate>300' rate=456.23/s        ← Average throughput > 300 req/s
```

#### 2. **Total Results** (Overall Metrics)
```
checks_succeeded...: 100.00%        ← All validation checks passed
http_reqs..........: 2798           ← Total requests made
http_req_duration..: avg=14.66ms    ← Average response time
```

#### 3. **Custom Metrics**
```
steady_state_duration: avg=150ms    ← Performance during steady load
peak_load_duration...: avg=250ms    ← Performance during peak load
```

### Key Metrics to Watch

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| **Error Rate** | < 0.5% | 0.5-1% | > 1% |
| **Avg Response Time** | < 150ms | 150-200ms | > 200ms |
| **p(95) Response Time** | < 400ms | 400-500ms | > 500ms |
| **Request Rate** | > 260/s | 200-260/s | < 200/s |

---

## Thresholds Explained

### Overall Thresholds (All Stages)

```javascript
'errors': ['rate<0.01']                    // < 1% error rate
'http_req_duration': ['avg<200']           // Average < 200ms
'http_req_duration': ['p(95)<500']         // 95th percentile < 500ms
'http_req_duration': ['p(99)<1000']        // 99th percentile < 1s
'http_reqs': ['rate>250']                  // > 250 requests/second (averaged across all stages)
'http_req_failed': ['rate<0.01']           // < 1% failed requests
```

### Stage-Specific Thresholds

**Steady State (50-100 VUs)** - Stricter requirements:
```javascript
'steady_state_errors': ['rate<0.005']      // < 0.5% errors
'steady_state_duration': [
  'avg<150',                                // Average < 150ms
  'p(95)<400'                               // 95th percentile < 400ms
]
```

**Peak Load (100-200 VUs)** - More tolerant:
```javascript
'peak_load_errors': ['rate<0.02']          // < 2% errors (allows degradation)
'peak_load_duration': [
  'avg<250',                                // Average < 250ms
  'p(95)<600'                               // 95th percentile < 600ms
]
```

### Why Conditional Thresholds?

- **Steady state** represents normal production → must be fast and reliable
- **Peak load** is stress testing → some degradation is acceptable
- Separating these gives you **actionable insights** about system limits

---

## Customization

### Change Target Server

```bash
BASE_URL=https://production.example.com k6 run scripts/load-test.js
```

### Modify Think Time

Edit `scripts/load-test.js`:
```javascript
const THINK_TIME = 0.5; // Increase for less aggressive testing
```

| Think Time | VUs Needed for 300 req/s |
|------------|--------------------------|
| 0.1s | ~30 VUs |
| 0.2s | ~65 VUs |
| 0.5s | ~150 VUs |
| 1.0s | ~300 VUs |

### Add New Endpoints

Edit the `endpoints` array in `scripts/load-test.js`:
```javascript
{
  name: 'My New Endpoint',
  url: `${BASE_URL}/api/my-endpoint`,
  method: 'GET',
  weight: 10, // 10% of traffic
}
```

### Adjust Thresholds

Edit the `thresholds` object in `options`:
```javascript
thresholds: {
  'errors': ['rate<0.05'],              // Allow 5% errors
  'http_req_duration': ['avg<300'],     // Allow 300ms average
  'http_reqs': ['rate>500'],            // Require 500 req/s
}
```

### Custom Load Stages

Edit the `stages` array:
```javascript
stages: [
  { duration: '1m', target: 100 },      // Fast ramp to 100
  { duration: '5m', target: 100 },      // Hold at 100
  { duration: '1m', target: 0 },        // Quick ramp down
]
```

---

## Troubleshooting

### Issue: "Service not healthy" error

**Cause**: API is not running or not accessible

**Solution**:
```bash
# Check if API is running
curl http://localhost:5001/metrics

# Start the API
cd backend/FleetManagement.API
dotnet run
```

### Issue: High error rate (> 1%)

**Possible causes**:
1. **Database connection issues** - Check connection strings
2. **Insufficient resources** - API may be CPU/memory constrained
3. **Timeout issues** - Requests taking too long

**Debug**:
```bash
# Check API logs
# Check database connectivity
# Monitor system resources (CPU, memory, network)
```

### Issue: Threshold failures on `http_reqs` rate

**Cause**: Not generating enough requests

**Solutions**:
1. **Short tests** - Rate threshold requires sustained load (use full 17-min test)
2. **Increase VUs** - Need ~65+ VUs to hit 300 req/s
3. **Reduce think time** - Lower THINK_TIME value

### Issue: Slow response times

**Expected during**:
- First few requests (cold start)
- Peak load stages (100-200 VUs)

**Investigate if**:
- Steady state performance is slow
- Response times don't improve after warm-up

**Check**:
```bash
# Database query performance
# API caching configuration
# Network latency
# Resource constraints
```

### Issue: Script errors or crashes

**Check**:
1. **k6 version** - `k6 version` (should be v0.40+)
2. **JavaScript syntax** - Ensure no syntax errors in load-test.js
3. **Reports directory** - `mkdir -p reports`

---

## Reports

Test results are saved to:

1. **Console output** - Real-time progress and summary
2. **JSON report** - `reports/load-test-[timestamp].json`
3. **HTML report** - `reports/load-test-[timestamp].html`

### View HTML Report

```bash
# Find latest report
ls -t reports/*.html | head -1

# Open in browser (macOS)
open $(ls -t reports/*.html | head -1)

# Open in browser (Linux)
xdg-open $(ls -t reports/*.html | head -1)

# Open in browser (Windows)
start $(ls -t reports/*.html | head -1)
```

---

## Expected Results (Full 17-min Test)

Based on 0.2s think time and the configured stages:

| Metric | Expected Value |
|--------|---------------|
| **Total Requests** | ~300,000-400,000 |
| **Avg Request Rate** | 250-280 req/s |
| **Peak Request Rate** | 400-500 req/s (during 100-200 VU stages) |
| **Avg Response Time** | 10-30ms |
| **p(95) Response Time** | 30-100ms |
| **Error Rate** | < 0.1% |
| **Data Transferred** | ~2-3 GB |

---

## Performance Baselines

Use these as reference for your system:

### Development Environment (Docker Desktop, local DB)
- 50 VUs: ~250 req/s, avg 20ms
- 100 VUs: ~500 req/s, avg 50ms
- 200 VUs: ~800 req/s, avg 100ms

### Staging/Production (Cloud hosted)
- 50 VUs: ~250 req/s, avg 10ms
- 100 VUs: ~500 req/s, avg 20ms
- 200 VUs: ~1000 req/s, avg 40ms

---

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Load Test
  run: |
    k6 run --duration 5m --vus 50 scripts/load-test.js

- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: load-test-results
    path: reports/
```

### GitLab CI

```yaml
load-test:
  script:
    - k6 run --duration 5m --vus 50 scripts/load-test.js
  artifacts:
    paths:
      - reports/
```

---

## Next Steps

1. **Establish baseline** - Run the test on your current setup and document results
2. **Set alerts** - Configure monitoring to alert when metrics exceed thresholds
3. **Regular testing** - Run weekly/monthly to track performance trends
4. **Optimize** - Use results to identify bottlenecks and optimize

---

## Support

For issues or questions:
- Check API logs: `docker logs <api-container>`
- Check k6 docs: https://k6.io/docs/
- Review test output for specific error messages

---

**Last Updated**: January 2026
**Test Version**: 2.0 (Conditional Thresholds + Realistic Traffic)
