# MVP Deployment Guide

## Overview
This guide covers everything needed to deploy the Table d'Adrian Wellness App to production as an MVP.

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are set in your production environment:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/tabledadrian"

# Next.js
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# Web3
NEXT_PUBLIC_TA_CONTRACT_ADDRESS="0x9Cb5254319f824A2393ECbF6aDCf608867AA1b07"
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL="https://mainnet.base.org"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"

# OpenAI
OPENAI_API_KEY="your_openai_api_key"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# JWT
JWT_SECRET="your_secure_jwt_secret_min_32_chars"

# Optional
REDIS_URL="redis://host:6379"
```

### 2. Database Setup
1. Set up PostgreSQL database (Supabase, Railway, AWS RDS, or similar)
2. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### 3. Build & Test
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test the build locally
npm start
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Option 2: Self-Hosted
1. Build the application: `npm run build`
2. Use PM2 or similar to run: `npm start`
3. Set up reverse proxy (nginx) for HTTPS
4. Configure domain DNS

### Option 3: Docker
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Post-Deployment

### 1. Verify Core Features
- [ ] Wallet connection works
- [ ] Health assessment can be completed
- [ ] Wellness plan generation works
- [ ] AI coach responds to messages
- [ ] Dashboard loads user stats
- [ ] Navigation works across all pages

### 2. Monitor
- Set up error tracking (Sentry recommended)
- Monitor API response times
- Track user sign-ups and engagement
- Monitor database performance

### 3. Security
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] API keys secured
- [ ] Database backups configured

## MVP Feature Status

### ✅ Core Features (Ready)
- Health Assessment
- Wellness Plan Generation
- AI Health Coach
- Dashboard with Stats
- Biomarker Tracking
- Navigation & UI

### ⚠️ Requires Configuration
- Stripe payments (needs live keys)
- OpenAI API (needs API key)
- Database (needs connection string)
- WalletConnect (needs project ID)

### 🔄 Future Enhancements
- Mobile app
- Advanced analytics
- More integrations
- Enhanced gamification

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify DATABASE_URL is correct
- Check database is accessible from deployment server
- Ensure Prisma migrations have run

**API Errors**
- Check all API keys are set
- Verify environment variables are loaded
- Check API rate limits

**Build Errors**
- Ensure Node.js version >= 22.0.0
- Clear .next folder and rebuild
- Check for TypeScript errors

## Support
For issues or questions, refer to:
- `WELLNESS-APP-README.md` - General documentation
- `PHASE-STATUS.md` - Feature completion status
- `COMPLETE-FEATURES.md` - Full feature list

---

**Last Updated**: 2025-01-27
**MVP Status**: ✅ Ready for Deployment

