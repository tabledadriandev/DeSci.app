/**
 * Normal Load Test - 100 concurrent users
 * Simulates typical production load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests under 300ms
    errors: ['rate<0.01'], // Error rate under 1%
  },
};

export default function () {
  const baseURL = __ENV.BASE_URL || 'http://localhost:3000';

  // Test homepage
  const homeRes = http.get(`${baseURL}/`);
  check(homeRes, {
    'homepage status 200': (r) => r.status === 200,
    'homepage load time <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test API health check
  const healthRes = http.get(`${baseURL}/api/health`);
  check(healthRes, {
    'health check status 200': (r) => r.status === 200,
    'health check response time <200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(2);

  // Test dashboard (would require auth in production)
  const dashboardRes = http.get(`${baseURL}/dashboard`);
  check(dashboardRes, {
    'dashboard accessible': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);

  sleep(1);
}
