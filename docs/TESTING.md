# Testing Guide - Table d'Adrian

This guide explains how to run tests, understand test coverage, and contribute new tests.

## Test Structure

```
ta_app/
├── __tests__/
│   ├── components/          # Component unit tests
│   ├── lib/                 # Utility function tests
│   ├── integration/         # Playwright E2E tests
│   ├── security/            # Security-focused tests
│   ├── performance/         # Performance tests
│   └── mobile/              # Responsive design tests
├── jest.config.js           # Jest configuration
├── jest.setup.js            # Jest setup file
└── playwright.config.ts     # Playwright configuration
```

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run in watch mode (for development)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Update snapshots
npm run test:update
```

### Integration Tests (Playwright)

```bash
# Run all integration tests
npm run test:integration

# Run with UI mode (interactive)
npm run test:integration:ui

# Run specific test file
npx playwright test __tests__/integration/food-logging.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed
```

### Security Tests

```bash
# Run security audit
npm run security:audit

# Run Snyk security scan
npm run security:scan

# Run OWASP-focused scan
npm run security:owasp
```

### Accessibility Tests

```bash
# Run accessibility audit (requires server running)
npm run dev  # In one terminal
npm run test:a11y  # In another terminal

# Run CI-friendly accessibility tests
npm run test:a11y:ci
```

### Load Tests (k6)

```bash
# Install k6 first: https://k6.io/docs/getting-started/installation/

# Normal load (100 users)
npm run test:load:normal

# Peak load (500 users)
npm run test:load:peak

# Stress test (1000+ users)
npm run test:load:stress

# Custom base URL
BASE_URL=https://staging.example.com k6 run load-tests/k6-scripts/normal-load.js
```

## Test Coverage Goals

### Unit Tests
- **Target**: 80%+ coverage
- **Focus**: Business logic, utilities, data transformations
- **Current**: Check with `npm run test:coverage`

### Integration Tests
- **Target**: All critical user flows
- **Focus**: 
  - Authentication flows
  - Food logging
  - Medical upload
  - Wearable sync
  - Protocol completion
  - Token staking

### Security Tests
- **Target**: Zero high/critical vulnerabilities
- **Focus**: 
  - Authentication security
  - API security
  - Data privacy
  - Dependency vulnerabilities

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from '@jest/globals';
import { calculateBiologicalAge } from '@/lib/biomarkers/biologicalAgeCalculator';

describe('calculateBiologicalAge', () => {
  it('should calculate biological age from HRV', () => {
    const hrv = 55; // ms
    const chronologicalAge = 45;
    const result = calculateBiologicalAge({ hrv }, chronologicalAge);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);
  });
});
```

### Integration Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can log a meal', async ({ page }) => {
  await page.goto('/food/log');
  await page.click('button[aria-label="Take photo"]');
  // ... test implementation
});
```

## Test Best Practices

### 1. Unit Tests
- ✅ Test one thing at a time
- ✅ Use descriptive test names
- ✅ Mock external dependencies
- ✅ Test edge cases and error conditions
- ❌ Don't test implementation details
- ❌ Don't test third-party libraries

### 2. Integration Tests
- ✅ Test complete user flows
- ✅ Use realistic data
- ✅ Clean up after tests
- ✅ Test both success and error paths
- ❌ Don't test things already covered by unit tests
- ❌ Don't make tests dependent on each other

### 3. Security Tests
- ✅ Test authentication flows
- ✅ Test authorization checks
- ✅ Test input validation
- ✅ Test data sanitization
- ✅ Keep dependencies updated

## Continuous Integration

Tests run automatically on:
- Every pull request
- Every push to `main` branch
- Before deployment

See `.github/workflows/ci-cd.yml` for CI configuration.

## Debugging Tests

### Jest Debugging

```bash
# Run specific test file
npm test -- BiometricCard.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging

```bash
# Run with UI mode
npm run test:integration:ui

# Run with debugger
npx playwright test --debug

# Run specific test
npx playwright test food-logging.spec.ts --debug
```

## Test Data

### Mock Data
- Use factories for creating test data
- Keep mock data realistic
- Don't use production data in tests

### Test Database
- Use a separate test database
- Reset database between test runs
- Use transactions for isolation

## Performance Testing

### Lighthouse Tests

```bash
# Run Lighthouse CI (requires setup)
npm run test:lighthouse
```

### Bundle Size Tests

```bash
# Check bundle size
npm run build
npm run test:bundle-size
```

## Troubleshooting

### Tests Failing Locally

1. **Clear cache**: `npm test -- --clearCache`
2. **Reinstall dependencies**: `rm -rf node_modules && npm install`
3. **Check environment variables**: Ensure `.env.test` is set up
4. **Check database**: Ensure test database is accessible

### Playwright Issues

1. **Install browsers**: `npx playwright install`
2. **Check browser versions**: `npx playwright --version`
3. **Run with verbose output**: `npx playwright test --reporter=list`

### Coverage Issues

1. **Check coverage thresholds** in `jest.config.js`
2. **Review uncovered lines** in coverage report
3. **Add tests for uncovered code**

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [React Testing Library](https://testing-library.com/react)
- [k6 Documentation](https://k6.io/docs/)

---

**Last Updated**: 2025-01-XX
