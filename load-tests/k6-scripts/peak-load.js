/**
 * Peak Load Test - 500 concurrent users
 * Simulates peak traffic scenarios
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '3m', target: 500 }, // Ramp up to 500 users
    { duration: '10m', target: 500 }, // Stay at 500 users
    { duration: '3m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.02'], // Error rate under 2%
  },
};

export default function () {
  const baseURL = __ENV.BASE_URL || 'http://localhost:3000';

  // Test multiple endpoints
  const endpoints = [
    '/',
    '/dashboard',
    '/api/health',
    '/api/biomarkers/latest',
  ];

  endpoints.forEach((endpoint) => {
    const res = http.get(`${baseURL}${endpoint}`);
    check(res, {
      [`${endpoint} status <500`]: (r) => r.status < 500,
    }) || errorRate.add(1);
  });

  sleep(2);
}
