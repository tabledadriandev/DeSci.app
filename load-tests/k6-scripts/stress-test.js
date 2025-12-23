/**
 * Stress Test - 1000+ concurrent users
 * Tests system limits and graceful degradation
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '2m', target: 1500 },
    { duration: '5m', target: 1500 }, // Stress at 1500 users
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% under 1s (relaxed for stress)
    errors: ['rate<0.05'], // Error rate under 5% (graceful degradation)
  },
};

export default function () {
  const baseURL = __ENV.BASE_URL || 'http://localhost:3000';

  // Test critical endpoints
  const res = http.get(`${baseURL}/api/health`);
  
  const success = check(res, {
    'health check responds': (r) => r.status !== 0,
    'health check status <500': (r) => r.status < 500,
  });

  if (!success) {
    errorRate.add(1);
  }

  sleep(1);
}
