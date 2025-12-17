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

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tabledadrian"

# Next.js
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
NEXT_PUBLIC_BASE_RPC_URL="https://mainnet.base.org"

# Web3
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your-walletconnect-project-id"
BACKEND_WALLET_PRIVATE_KEY="your-backend-wallet-private-key"

# Email (EmailJS)
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your-service-id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your-template-id"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your-public-key"

# OpenAI (for AI Coach)
OPENAI_API_KEY="your-openai-api-key"

# Redis (optional, for caching)
REDIS_URL="redis://localhost:6379"
```

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

- Ensure all migrations are applied
- Verify database connection
- Test API endpoints

### 3. Environment Verification

- Check all environment variables are set
- Verify API keys are working
- Test wallet connections

### 4. Performance Optimization

- Enable CDN for static assets
- Set up caching headers
- Monitor Core Web Vitals

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

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in with Vercel
- **Sentry**: Error tracking
- **Google Analytics**: User analytics
- **Lighthouse**: Performance monitoring

## Support

For issues or questions:
- Check the README.md
- Review COMPLETE-FEATURES.md
- Check GitHub issues

---

**Last Updated**: 2025-01-XX

