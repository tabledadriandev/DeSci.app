# Monitoring Guide - Table d'Adrian

This guide explains monitoring setup, health checks, alerts, and observability practices.

## Monitoring Stack

### Error Tracking
- **Sentry**: Real-time error tracking and performance monitoring
- Client-side and server-side error capture
- Session replay for debugging

### Analytics
- **Google Analytics**: User behavior and page views
- **Vercel Analytics**: Performance metrics (if using Vercel)
- Custom event tracking

### Infrastructure
- **Vercel Dashboard**: Deployment status, logs, metrics
- **Database**: Connection monitoring, query performance
- **Redis**: Cache hit rates, connection health

## Health Checks

### Health Check Endpoint

**URL**: `/api/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XXT00:00:00Z",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "oura_api": "healthy",
    "openai_api": "healthy",
    "base_rpc": "healthy"
  }
}
```

### Health Check Statuses
- `healthy`: Service is operational
- `unhealthy`: Service is down or unreachable
- `degraded`: Service is responding but with issues

### Monitoring Health Checks

```bash
# Manual check
curl https://your-domain.com/api/health

# Automated monitoring (cron job)
*/5 * * * * curl -f https://your-domain.com/api/health || alert
```

## Error Tracking (Sentry)

### Setup

1. **Create Sentry Project**: https://sentry.io
2. **Get DSN**: Copy DSN from project settings
3. **Set Environment Variable**: `NEXT_PUBLIC_SENTRY_DSN`

### Configuration

Files:
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server error tracking
- `lib/monitoring/sentry.ts` - Utility functions

### Usage

```typescript
import { captureException, captureMessage } from '@/lib/monitoring/sentry';

try {
  // Your code
} catch (error) {
  captureException(error, { context: 'additional info' });
}

// Log important events
captureMessage('User completed protocol', 'info');
```

### Sentry Features
- Error grouping and deduplication
- Stack traces with source maps
- User context (ID, email)
- Breadcrumbs (user actions before error)
- Performance monitoring
- Session replay

## Analytics

### Google Analytics

**Setup**:
1. Create Google Analytics property
2. Get Measurement ID (G-XXXXXXXXXX)
3. Set `NEXT_PUBLIC_GA_ID` environment variable

**Usage**:
```typescript
import { trackPageView, trackEvent } from '@/lib/monitoring/analytics';

// Track page view
trackPageView('/dashboard');

// Track custom event
trackEvent('food_logged', {
  meal_type: 'breakfast',
  calories: 450
});
```

### Custom Events

Track important user actions:
- Food logging
- Medical uploads
- Protocol completion
- Token earnings
- Wearable connections
- Authentication events

## Logging

### Application Logs

**Development**:
- Console logs (console.log, console.error)
- Structured logging with context

**Production**:
- Log aggregation (Vercel logs, or external service)
- Log levels: error, warn, info, debug
- Include user ID, request ID, timestamp

### Log Structure

```typescript
{
  level: 'error',
  message: 'Failed to sync Oura data',
  userId: 'user_123',
  requestId: 'req_456',
  timestamp: '2025-01-XXT00:00:00Z',
  error: {
    name: 'OuraAPIError',
    message: 'Rate limit exceeded',
    stack: '...'
  },
  context: {
    provider: 'oura',
    userId: 'user_123'
  }
}
```

## Performance Monitoring

### Core Web Vitals

Monitor:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### API Performance

Track:
- Response times (p50, p95, p99)
- Error rates
- Request volume
- Database query times

### Database Performance

Monitor:
- Query execution time
- Slow queries (> 100ms)
- Connection pool usage
- Database size

## Alerts

### Alert Conditions

Set up alerts for:

1. **Error Rate**
   - > 5% error rate for 5 minutes
   - Critical errors (500s)

2. **Response Time**
   - p95 > 1s for 5 minutes
   - Health check failures

3. **Availability**
   - Health check down for 2 minutes
   - Database connection failures

4. **Resource Usage**
   - High memory usage (> 80%)
   - High CPU usage (> 80%)

### Alert Channels

- **Email**: For non-critical alerts
- **SMS/PagerDuty**: For critical alerts
- **Slack**: For team notifications
- **Sentry**: Automatic error alerts

## Dashboards

### Recommended Dashboards

1. **Application Health**
   - Health check status
   - Error rate
   - Response times
   - Request volume

2. **User Activity**
   - Active users
   - New signups
   - Feature usage
   - Retention metrics

3. **Performance**
   - Core Web Vitals
   - API response times
   - Database query times
   - Cache hit rates

4. **Business Metrics**
   - Token distributions
   - Protocol completions
   - Food logs
   - Medical uploads

## Monitoring Best Practices

### 1. Set Up Baselines
- Establish normal metrics
- Track trends over time
- Identify anomalies

### 2. Use Structured Logging
- Consistent log format
- Include context (user ID, request ID)
- Use appropriate log levels

### 3. Monitor Dependencies
- External API health
- Database connection
- Cache availability
- Third-party services

### 4. Alert Fatigue Prevention
- Set appropriate thresholds
- Group related alerts
- Use alert severity levels
- Review and tune alerts regularly

### 5. Regular Reviews
- Weekly: Review error trends
- Monthly: Performance review
- Quarterly: Full observability audit

## Troubleshooting

### High Error Rate

1. Check Sentry for error details
2. Review recent deployments
3. Check external API status
4. Review database performance
5. Check for dependency issues

### Slow Response Times

1. Check database query performance
2. Review API endpoint performance
3. Check cache hit rates
4. Review external API calls
5. Check server resource usage

### Health Check Failures

1. Check database connectivity
2. Verify Redis connection
3. Check external API availability
4. Review recent code changes
5. Check server logs

## Monitoring Tools

### Free/Open Source
- **Sentry** (free tier available)
- **Google Analytics** (free)
- **Vercel Analytics** (included with Vercel)

### Paid Options
- **Datadog**: Full observability platform
- **New Relic**: APM and monitoring
- **LogRocket**: Session replay and logging
- **Honeycomb**: Observability platform

## Metrics to Track

### Application Metrics
- Request rate (requests/second)
- Error rate (%)
- Response time (p50, p95, p99)
- Uptime (%)

### Business Metrics
- Daily active users (DAU)
- Monthly active users (MAU)
- User retention (D1, D7, D30)
- Feature adoption rates
- Token distribution
- Protocol completion rate

### Technical Metrics
- Database query time
- Cache hit rate
- API response time
- Page load time
- Bundle size

## Incident Response

### When Alerts Fire

1. **Acknowledge**: Confirm you're investigating
2. **Assess**: Determine severity and impact
3. **Investigate**: Check logs, metrics, recent changes
4. **Mitigate**: Take action to reduce impact
5. **Resolve**: Fix root cause
6. **Document**: Update runbook, post-mortem

### On-Call Rotation

- Primary on-call: Handles incidents
- Secondary on-call: Backup support
- Escalation: For critical issues

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Google Analytics Documentation](https://developers.google.com/analytics)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Observability Best Practices](https://opentelemetry.io/docs/concepts/observability-primer/)

---

**Last Updated**: 2025-01-XX
