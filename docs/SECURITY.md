# Security Guide - Table d'Adrian

This guide outlines security practices, incident response procedures, and security testing.

## Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Users and services have minimum required access
3. **Secure by Default**: Secure configurations out of the box
4. **Privacy First**: User data is protected and encrypted
5. **Regular Audits**: Continuous security monitoring and updates

## Authentication Security

### Password Requirements
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Password hashing with bcrypt (cost factor 12+)
- Rate limiting on login attempts

### Multi-Factor Authentication (2FA)
- Supported methods: Email, SMS, Authenticator app
- Backup codes for account recovery
- Rate limiting on 2FA attempts

### Session Management
- Secure, HTTP-only cookies
- Session expiration (24 hours default)
- Session rotation on privilege changes
- Logout on all devices option

### OAuth Security
- State parameter validation
- PKCE for public clients
- Token refresh rotation
- Scope validation

## API Security

### Authentication
- Bearer tokens for API access
- Token expiration and refresh
- Rate limiting per user/IP

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- User data isolation

### Input Validation
- Zod schema validation
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React auto-escaping)
- CSRF protection (SameSite cookies)

### API Rate Limiting
- 100 requests/minute per user (default)
- 1000 requests/hour per IP
- Stricter limits for sensitive endpoints
- Exponential backoff on rate limit

## Data Security

### Encryption
- **At Rest**: Database encryption (PostgreSQL)
- **In Transit**: TLS 1.3 for all connections
- **Sensitive Fields**: Encrypted before storage (PII, medical data)

### Data Privacy
- GDPR compliance
- User data export (GDPR right to access)
- Account deletion (GDPR right to erasure)
- Data minimization (only collect necessary data)

### Medical Data
- Extra encryption for medical results
- HIPAA-inspired security practices
- Audit logging for medical data access
- Restricted access to medical data

### Wallet/Blockchain
- Private keys never stored on server
- Wallet operations require user signature
- Transaction verification
- Smart contract security audits

## Dependency Security

### Regular Audits
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Snyk scan
npm run security:scan
```

### Dependency Management
- Pin dependency versions
- Regular updates (weekly)
- Automated security alerts (GitHub Dependabot)
- Review and test updates before deployment

## Infrastructure Security

### Environment Variables
- Never commit secrets to version control
- Use secure secret management (Vercel, AWS Secrets Manager)
- Rotate secrets regularly
- Different secrets for staging/production

### Database Security
- SSL/TLS connections required
- Strong database passwords
- Network isolation (private subnets)
- Regular backups with encryption
- Access logging

### Server Security
- Security headers (see `vercel.json`)
- HTTPS only (HSTS)
- Content Security Policy (CSP)
- X-Frame-Options, X-Content-Type-Options
- Regular security updates

## Security Headers

Configured in `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Security Testing

### Automated Tests
```bash
# Run security tests
npm run security:audit
npm run security:scan
npm run security:owasp
```

### Manual Testing
- Penetration testing (quarterly)
- Code reviews for security
- Dependency audits
- Configuration reviews

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor Sentry for errors
   - Review security logs
   - User reports

2. **Assessment**
   - Determine severity (Critical/High/Medium/Low)
   - Identify affected systems/users
   - Document timeline

3. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Disable affected features if needed

4. **Remediation**
   - Fix security vulnerability
   - Deploy patch
   - Verify fix

5. **Communication**
   - Notify affected users (if required)
   - Document incident
   - Post-mortem review

### Security Contacts

- **Security Email**: security@your-domain.com
- **Emergency**: [Your emergency contact]
- **Bug Bounty**: [Your bug bounty program]

## Vulnerability Disclosure

### Responsible Disclosure
1. Report to security@your-domain.com
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. **Do NOT**:
   - Exploit the vulnerability
   - Share publicly before fix
   - Access unauthorized data

### Response Timeline
- Acknowledge receipt: 24 hours
- Initial assessment: 3 days
- Fix deployment: 7-30 days (depending on severity)
- Public disclosure: After fix is deployed

## Security Checklist

### Pre-Deployment
- [ ] All dependencies updated
- [ ] Security tests passing
- [ ] No secrets in code
- [ ] Environment variables set
- [ ] Database migrations reviewed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Logging enabled

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check security alerts
- [ ] Verify security headers
- [ ] Test authentication flows
- [ ] Verify data encryption

## Compliance

### GDPR
- Privacy policy
- Cookie consent
- Data export functionality
- Account deletion
- Data processing agreements

### Health Data
- Extra security for medical data
- Audit logging
- Access controls
- Data retention policies

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Snyk Security Best Practices](https://snyk.io/learn/)

## Security Updates

- **Last Security Audit**: [Date]
- **Last Dependency Update**: [Date]
- **Last Penetration Test**: [Date]
- **Next Review**: [Date]

---

**Last Updated**: 2025-01-XX
