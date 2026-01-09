import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import exec from 'k6/execution';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successCounter = new Counter('successful_requests');
const failureCounter = new Counter('failed_requests');

// Stage-specific metrics for conditional thresholds
const steadyStateErrors = new Rate('steady_state_errors');
const peakLoadErrors = new Rate('peak_load_errors');
const steadyStateDuration = new Trend('steady_state_duration');
const peakLoadDuration = new Trend('peak_load_duration');

// Test configuration
export const options = {
  stages: [
    // Ramp-up: 0 to 50 users over 2 minutes
    { duration: '2m', target: 50 },

    // Steady state: 50 users for 5 minutes
    { duration: '5m', target: 50 },

    // Peak load: ramp to 100 users over 2 minutes
    { duration: '2m', target: 100 },

    // Peak steady state: 100 users for 3 minutes
    { duration: '3m', target: 100 },

    // Spike test: sudden jump to 200 users for 1 minute
    { duration: '1m', target: 200 },

    // Recovery: back down to 50 users
    { duration: '2m', target: 50 },

    // Ramp-down: back to 0
    { duration: '2m', target: 0 },
  ],

  thresholds: {
    // Overall error rate should be less than 1%
    'errors': ['rate<0.01'],

    // Response time thresholds (all stages)
    'http_req_duration': [
      'p(95)<500',  // 95% of requests under 500ms
      'p(99)<1000', // 99% of requests under 1s
      'avg<200',    // Average response time under 200ms
    ],

    // Request rate thresholds (conditional by stage)
    // With 0.2s think time + response time overhead: Average across all stages ~250-280 req/s
    // (Includes ramp-up/ramp-down periods which lower the average)
    'http_reqs': ['rate>250'], // Average rate across all stages should exceed 250 req/s

    // Success rate - at least 99% of requests should succeed
    'http_req_failed': ['rate<0.01'],

    // Check performance - 90% of successful requests should be fast
    'http_req_duration{expected_response:true}': ['p(90)<300'],

    // Stage-specific thresholds
    // Steady state (50-100 VUs): Should maintain low error rate and good performance
    'steady_state_errors': ['rate<0.005'],      // Even lower error rate during steady state
    'steady_state_duration': ['avg<150', 'p(95)<400'],

    // Peak load (100-200 VUs): Allow slightly higher response times but errors still low
    'peak_load_errors': ['rate<0.02'],          // Tolerate up to 2% errors during peak
    'peak_load_duration': ['avg<250', 'p(95)<600'],
  },
};

// Environment configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';
const THINK_TIME = 0.2; // seconds between requests (simulates monitoring/API traffic)

export default function () {
  const endpoints = [
    {
      name: 'Metrics',
      url: `${BASE_URL}/metrics`,
      method: 'GET',
      weight: 10, // 10% of traffic
    },
    {
      name: 'Fleet KPIs - Prometheus',
      url: `${BASE_URL}/api/fleet-kpis/prometheus`,
      method: 'GET',
      weight: 15, // 15% of traffic
    },
    {
      name: 'Fleet KPIs - JSON',
      url: `${BASE_URL}/api/fleet-kpis`,
      method: 'GET',
      weight: 15, // 15% of traffic
    },
    {
      name: 'Dashboard KPIs',
      url: `${BASE_URL}/api/dashboard/kpis`,
      method: 'GET',
      weight: 20, // 20% of traffic
    },
    {
      name: 'Get Buses',
      url: `${BASE_URL}/api/bus`,
      method: 'GET',
      weight: 15, // 15% of traffic
    },
    {
      name: 'Fleet Status',
      url: `${BASE_URL}/api/dashboard/fleet-status`,
      method: 'GET',
      weight: 10, // 10% of traffic
    },
    {
      name: 'Business Insights - ROI',
      url: `${BASE_URL}/api/businessinsights/roi-summary`,
      method: 'GET',
      weight: 10, // 10% of traffic
    },
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/health`,
      method: 'GET',
      weight: 5, // 5% of traffic
    },
  ];

  // Weighted random endpoint selection
  const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedEndpoint = endpoints[0];

  for (const endpoint of endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      selectedEndpoint = endpoint;
      break;
    }
  }

  // Execute request
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'k6-load-test/1.0',
    },
    tags: {
      name: selectedEndpoint.name,
    },
  };

  const startTime = Date.now();
  const response = http.request(selectedEndpoint.method, selectedEndpoint.url, null, params);
  const duration = Date.now() - startTime;

  // Determine current stage based on elapsed time (in seconds)
  const elapsedTime = exec.scenario.iterationInTest * THINK_TIME; // Approximate elapsed time
  const currentVUs = exec.vu.idInTest; // Current VU ID (not count, but gives us a sense)

  // Estimate stage based on test progression
  // Stages: 0-2m(120s), 2-7m(420s), 7-9m(540s), 9-12m(720s), 12-13m(780s), 13-15m(900s), 15-17m(1020s)
  let stage = 'ramp-up';
  if (elapsedTime > 120 && elapsedTime <= 420) {
    stage = 'steady-50';
  } else if (elapsedTime > 420 && elapsedTime <= 540) {
    stage = 'ramp-100';
  } else if (elapsedTime > 540 && elapsedTime <= 720) {
    stage = 'steady-100';
  } else if (elapsedTime > 720 && elapsedTime <= 780) {
    stage = 'peak-200';
  } else if (elapsedTime > 780) {
    stage = 'ramp-down';
  }

  // Record custom metrics
  apiDuration.add(duration, { endpoint: selectedEndpoint.name });

  // Validate response
  const checks = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has body': (r) => r.body.length > 0,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'no server errors': (r) => r.status < 500,
  });

  // Determine if this is an actual error (HTTP error) vs just a slow request
  const isHttpError = response.status >= 400;
  const isSlowRequest = response.timings.duration >= 1000 && response.status === 200;

  // Record stage-specific metrics
  const isSteadyState = (stage === 'steady-50' || stage === 'steady-100');
  const isPeakLoad = (stage === 'peak-200' || stage === 'steady-100');

  if (isHttpError) {
    // Actual HTTP error - count as failure
    errorRate.add(1);
    failureCounter.add(1);

    // Record stage-specific errors
    if (isSteadyState) {
      steadyStateErrors.add(1);
    }
    if (isPeakLoad) {
      peakLoadErrors.add(1);
    }

    console.error(`Request failed: ${selectedEndpoint.name} - Status: ${response.status}`);
  } else if (isSlowRequest) {
    // Slow request but successful - log as warning, don't count as error
    console.warn(`Slow request: ${selectedEndpoint.name} - ${response.timings.duration.toFixed(0)}ms`);

    successCounter.add(1);
    errorRate.add(0);

    // Record stage-specific metrics (still track duration)
    if (isSteadyState) {
      steadyStateErrors.add(0);
      steadyStateDuration.add(duration);
    }
    if (isPeakLoad) {
      peakLoadErrors.add(0);
      peakLoadDuration.add(duration);
    }
  } else {
    // Normal successful request
    errorRate.add(0);
    successCounter.add(1);

    // Record stage-specific success
    if (isSteadyState) {
      steadyStateErrors.add(0);
      steadyStateDuration.add(duration);
    }
    if (isPeakLoad) {
      peakLoadErrors.add(0);
      peakLoadDuration.add(duration);
    }
  }

  // Think time between requests
  sleep(THINK_TIME);
}

// Setup function - runs once before the test
export function setup() {
  console.log('🚀 Starting Fleet Management Load Test');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log(`⏱️  Duration: ~19 minutes`);
  console.log(`👥 Max users: 200`);

  // Health check
  const healthCheck = http.get(`${BASE_URL}/metrics`);
  if (healthCheck.status !== 200) {
    throw new Error(`Service not healthy. Status: ${healthCheck.status}`);
  }

  console.log('✅ Service health check passed');
  return { startTime: new Date().toISOString() };
}

// Teardown function - runs once after the test
export function teardown(data) {
  console.log(`🏁 Load test completed. Started at: ${data.startTime}`);
  console.log('📊 Check the summary report above for detailed results');
}

// Handle summary - custom summary output
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`reports/load-test-${timestamp}.json`]: JSON.stringify(data, null, 2),
    [`reports/load-test-${timestamp}.html`]: htmlReport(data),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n';
  summary += `${indent}📊 FLEET MANAGEMENT LOAD TEST SUMMARY\n`;
  summary += `${indent}${'='.repeat(50)}\n\n`;

  // Test duration
  summary += `${indent}⏱️  Duration: ${(data.state.testRunDurationMs / 1000).toFixed(1)}s\n\n`;

  // HTTP metrics
  summary += `${indent}🌐 HTTP Metrics:\n`;
  summary += `${indent}  • Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}  • Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n`;
  summary += `${indent}  • Failed Requests: ${data.metrics.http_req_failed.values.rate.toFixed(2)}%\n\n`;

  // Response times
  summary += `${indent}⚡ Response Times:\n`;
  summary += `${indent}  • Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  • Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  summary += `${indent}  • Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  summary += `${indent}  • p(95): ${data.metrics.http_req_duration.values['p(95)']?.toFixed(2) || 'N/A'}ms\n`;
  summary += `${indent}  • p(99): ${data.metrics.http_req_duration.values['p(99)']?.toFixed(2) || 'N/A'}ms\n\n`;

  // Thresholds
  summary += `${indent}✅ Thresholds:\n`;
  if (data.thresholds && typeof data.thresholds === 'object') {
    for (const [name, threshold] of Object.entries(data.thresholds)) {
      const passed = threshold.ok ? '✓' : '✗';
      summary += `${indent}  ${passed} ${name}\n`;
    }
  } else {
    summary += `${indent}  (No threshold data available)\n`;
  }

  return summary;
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Fleet Management Load Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #666; margin-top: 30px; }
    .metric { display: inline-block; margin: 10px 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; min-width: 200px; }
    .metric-label { font-size: 12px; color: #999; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: bold; color: #4CAF50; }
    .passed { color: #4CAF50; }
    .failed { color: #f44336; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #4CAF50; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Fleet Management Load Test Report</h1>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Duration:</strong> ${(data.state.testRunDurationMs / 1000).toFixed(1)} seconds</p>

    <h2>📊 Key Metrics</h2>
    <div class="metric">
      <div class="metric-label">Total Requests</div>
      <div class="metric-value">${data.metrics.http_reqs.values.count}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Avg Response Time</div>
      <div class="metric-value">${data.metrics.http_req_duration.values.avg.toFixed(0)}ms</div>
    </div>
    <div class="metric">
      <div class="metric-label">Request Rate</div>
      <div class="metric-value">${data.metrics.http_reqs.values.rate.toFixed(1)}/s</div>
    </div>
    <div class="metric">
      <div class="metric-label">Error Rate</div>
      <div class="metric-value ${data.metrics.http_req_failed.values.rate < 1 ? 'passed' : 'failed'}">${data.metrics.http_req_failed.values.rate.toFixed(2)}%</div>
    </div>

    <h2>⚡ Response Time Distribution</h2>
    <table>
      <tr>
        <th>Percentile</th>
        <th>Response Time</th>
      </tr>
      <tr><td>Average</td><td>${data.metrics.http_req_duration.values.avg?.toFixed(2) || 'N/A'} ms</td></tr>
      <tr><td>Minimum</td><td>${data.metrics.http_req_duration.values.min?.toFixed(2) || 'N/A'} ms</td></tr>
      <tr><td>Maximum</td><td>${data.metrics.http_req_duration.values.max?.toFixed(2) || 'N/A'} ms</td></tr>
      <tr><td>p(90)</td><td>${data.metrics.http_req_duration.values['p(90)']?.toFixed(2) || 'N/A'} ms</td></tr>
      <tr><td>p(95)</td><td>${data.metrics.http_req_duration.values['p(95)']?.toFixed(2) || 'N/A'} ms</td></tr>
      <tr><td>p(99)</td><td>${data.metrics.http_req_duration.values['p(99)']?.toFixed(2) || 'N/A'} ms</td></tr>
    </table>

    <h2>✅ Threshold Results</h2>
    <table>
      <tr>
        <th>Threshold</th>
        <th>Result</th>
      </tr>
      ${data.thresholds && typeof data.thresholds === 'object'
        ? Object.entries(data.thresholds).map(([name, threshold]) => `
          <tr>
            <td>${name}</td>
            <td class="${threshold.ok ? 'passed' : 'failed'}">${threshold.ok ? '✓ PASSED' : '✗ FAILED'}</td>
          </tr>
        `).join('')
        : '<tr><td colspan="2">No threshold data available</td></tr>'
      }
    </table>
  </div>
</body>
</html>
  `;
}
