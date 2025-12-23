# Deployment Guide - Table d'Adrian Web App

This guide explains how to build and deploy the Table d'Adrian web application.

## Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- PostgreSQL database (for production)
- Environment variables configured

## Quick Start

### 1. Install Dependencies

```bash
cd tabledadrian2.0
npm install
```

### 2. Set Up Environment Variables

For **development**, create a `.env.local` file in the root directory.

For **production**, see the `.env.production.example` template file for all required environment variables. Copy it to `.env.production` and fill in your actual values.

**Required Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: Your production domain
- `NEXT_PUBLIC_BASE_RPC_URL`: Base network RPC URL
- `NEXT_PUBLIC_TA_CONTRACT_ADDRESS`: Token contract address (0xee47670a6ed7501aeeb9733efd0bf7d93ed3cb07)
- `OPENAI_API_KEY`: For AI food vision
- `ANTHROPIC_API_KEY`: For AI longevity plans
- `OURA_CLIENT_ID` / `OURA_CLIENT_SECRET`: Oura Ring OAuth
- `GOOGLE_FIT_CLIENT_ID` / `GOOGLE_FIT_CLIENT_SECRET`: Google Fit OAuth
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your production domain

**Optional but Recommended**:
- `REDIS_URL`: For caching
- `NEXT_PUBLIC_SENTRY_DSN`: For error tracking
- `NEXT_PUBLIC_GA_ID`: For analytics
- `BACKEND_WALLET_PRIVATE_KEY`: For on-chain token operations

See `.env.production.example` for the complete list with descriptions.

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npx prisma db seed
```

### 4. Build for Production

```bash
# Create production build
npm run build
```

This will:
- Optimize all assets
- Create a `.next` folder with the production build
- Check for build errors

### 5. Run Production Server Locally

```bash
npm start
```

The app will be available at `http://localhost:3000`

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

Vercel is already configured with `vercel.json`. 

#### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   For production deployment:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all the environment variables from `.env.local`

5. **Configure Database**:
   - Set up a PostgreSQL database (Supabase, Railway, or Neon)
   - Add the `DATABASE_URL` to Vercel environment variables
   - Run migrations: `npx prisma migrate deploy`

#### Automatic Deployments:
- Connect your GitHub repository to Vercel
- Every push to `main` branch will automatically deploy

### Option 2: Deploy to Other Platforms

#### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard

#### Railway

1. Connect your GitHub repository
2. Railway will auto-detect Next.js
3. Add environment variables
4. Deploy automatically

#### Self-Hosted (VPS/Docker)

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Create a Dockerfile** (if using Docker):
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

3. **Run with PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start npm --name "tabledadrian" -- start
   pm2 save
   pm2 startup
   ```

## Production Deployment Scripts

### Database Migration

Use the production migration script to safely migrate the database:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run migration script
./scripts/migrate-production.sh
```

This script will:
- Create a database backup
- Run Prisma migrations
- Verify data integrity
- Provide rollback instructions if migration fails

### Production Deployment

Use the deployment script for automated production deployments:

```bash
# Set required environment variables
export DATABASE_URL="..."
export NEXT_PUBLIC_TA_CONTRACT_ADDRESS="0xee47670a6ed7501aeeb9733efd0bf7d93ed3cb07"

# Run deployment script
./scripts/deploy-production.sh
```

This script will:
- Run pre-deployment checks (tests, security scans)
- Deploy to Vercel (blue-green deployment)
- Run smoke tests
- Provide rollback instructions

**Note**: These scripts require bash. On Windows, use Git Bash or WSL.

## Post-Deployment Checklist

### 1. Smart Contract Authorization

Authorize your backend wallet in the smart contract:

```solidity
// Call these functions on the deployed contract
authorizeBookingService(backendWalletAddress, "Backend booking service");
authorizeNFTPlatform(backendWalletAddress, "Backend NFT platform");
authorizeEventService(backendWalletAddress, "Backend event service");
```

### 2. Database Setup

- Ensure all migrations are applied (use `./scripts/migrate-production.sh`)
- Verify database connection
- Test API endpoints
- Verify health check endpoint: `curl https://your-domain.com/api/health`

### 3. Environment Verification

- Check all environment variables are set in Vercel dashboard
- Verify API keys are working
- Test wallet connections
- Test OAuth flows (Oura, Google Fit)

### 4. Performance Optimization

- Enable CDN for static assets (automatic with Vercel)
- Set up caching headers (configured in `vercel.json`)
- Monitor Core Web Vitals
- Check Redis cache is working

### 5. Monitoring Setup

- Verify Sentry error tracking is working
- Set up Google Analytics
- Configure health check monitoring
- Set up alerts (see [MONITORING.md](./MONITORING.md))

## Build Output

After running `npm run build`, you'll get:

```
.next/
├── static/          # Static assets
├── server/          # Server-side code
└── cache/           # Build cache
```

## Production Build Features

- ✅ Optimized JavaScript bundles
- ✅ Image optimization (WebP, AVIF)
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Security headers
- ✅ PWA support (service worker)

## Troubleshooting

### Build Errors

1. **TypeScript errors**: Run `npm run lint` to check
2. **Missing dependencies**: Run `npm install`
3. **Database connection**: Verify `DATABASE_URL` is correct

### Runtime Errors

1. **Check logs**: `npm start` will show errors
2. **Environment variables**: Ensure all are set
3. **Database**: Verify connection and migrations

### Performance Issues

1. **Enable caching**: Check `next.config.js`
2. **Optimize images**: Use Next.js Image component
3. **Bundle size**: Check with `npm run build -- --analyze`

## Rollback Procedure

If a deployment causes issues:

1. **Vercel Rollback**:
   ```bash
   # List recent deployments
   vercel ls
   
   # Rollback to previous deployment
   vercel rollback [deployment-url]
   ```

2. **Database Rollback**:
   ```bash
   # Restore from backup created by migrate-production.sh
   psql $DATABASE_URL < backup-YYYYMMDD-HHMMSS.sql
   ```

3. **Environment Variables**:
   - Revert environment variable changes in Vercel dashboard
   - Or use Vercel CLI: `vercel env pull .env.production`

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in with Vercel
- **Sentry**: Error tracking (see [MONITORING.md](./MONITORING.md))
- **Google Analytics**: User analytics
- **Lighthouse**: Performance monitoring
- **Health Check**: `/api/health` endpoint

See [MONITORING.md](./MONITORING.md) for detailed monitoring setup and alert configuration.

## Related Documentation

- **[TESTING.md](./TESTING.md)**: How to run tests, test coverage goals, writing tests
- **[SECURITY.md](./SECURITY.md)**: Security practices, incident response, vulnerability disclosure
- **[MONITORING.md](./MONITORING.md)**: Health checks, alerts, observability, troubleshooting

## Support

For issues or questions:
- Check the README.md
- Review COMPLETE-FEATURES.md
- Check GitHub issues
- Review documentation in `docs/` directory

---

**Last Updated**: 2025-01-XX

