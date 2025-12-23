# Table d'Adrian Wellness App - Development Guide

## 🚀 Overview

A comprehensive Web3-powered longevity and wellness platform built on Base network, token-gated with $tabledadrian tokens.

## 🔑 API Keys & Secrets

**⚠️ IMPORTANT: Never commit API keys to the repository!**

All API keys should be stored in `.env` file (which is gitignored) and accessed via environment variables.

### Required Environment Variables

See `.env.example` for the complete list. Key variables:
- `FARCASTER_API_KEY` - For automated Farcaster posting
- `COINBASE_API_KEY` - For Coinbase wallet integration
- `COINBASE_KEY_ID` - Coinbase API key ID
- `COINBASE_SECRET_KEY` - Coinbase API secret key

## 📁 Project Structure

```
tabledadrian2.0/
├── app/
│   ├── app/              # Main wellness app (token-gated)
│   │   ├── page.tsx      # Dashboard
│   │   └── layout.tsx     # Web3 providers
│   └── api/              # API routes
│       ├── farcaster/    # Farcaster posting
│       └── web3/         # Web3 operations
├── lib/
│   ├── prisma.ts         # Database client
│   ├── farcaster.ts      # Farcaster API
│   ├── coinbase.ts       # Coinbase API
│   └── web3.ts           # Web3 utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── scripts/
    ├── automated-posting.ts    # Social media automation
    └── partnership-scraper.ts  # Partnership discovery
```

## 🗄️ Database Schema

The app uses Prisma with PostgreSQL. Key models:

- **User**: Wallet-based authentication, profiles, gamification
- **HealthData**: Steps, sleep, biometrics, mood tracking
- **MealPlan**: Personalized meal plans
- **Recipe**: Community recipe sharing
- **Challenge**: Gamified challenges with rewards
- **Reward**: $tabledadrian token rewards system
- **NFT**: Achievement NFTs
- **Partnership**: Partnership tracking
- **MarketplaceItem**: Products/services for $tabledadrian
- **GovernanceProposal**: DAO governance

## 🔐 Token Gating

Users need minimum **$5 worth of $tabledadrian tokens** to access the app:
- Contract: `0xee47670a6ed7501aeeb9733efd0bf7d93ed3cb07`
- Network: Base (Chain ID: 8453)
- Minimum: 5 TA tokens (assuming $1 per token)

## 🚀 Getting Started

### 1. Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tabledadrian"

# Web3
NEXT_PUBLIC_TA_CONTRACT_ADDRESS="0xee47670a6ed7501aeeb9733efd0bf7d93ed3cb07"
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_BASE_RPC_URL="https://mainnet.base.org"

# Farcaster
FARCASTER_API_KEY="your_farcaster_api_key"

# Coinbase
COINBASE_API_KEY="your_coinbase_api_key"
COINBASE_KEY_ID="your_coinbase_key_id"
COINBASE_SECRET_KEY="your_coinbase_secret_key"

# OpenAI (for AI health coach)
OPENAI_API_KEY="your_openai_key"
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (when ready)
npx prisma migrate dev
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/app` to access the wellness app.

## 🤖 Automated Systems

### Social Media Posting

Start automated Farcaster posting:

```bash
npm run posting:start
```

Posts:
- Daily wellness tips (9 AM)
- Weekly challenges (Monday 10 AM)
- Partnership announcements
- User achievements
- Recipe shares

### Partnership Scraping

Discover and contact potential partners:

```bash
npm run partnerships:scrape
```

Scrapes:
- Wellness brands
- Supplement companies
- Longevity clinics
- Health tech startups
- Fitness influencers

## 📱 Features

### Core Wellness
- ✅ Health tracking (steps, sleep, biometrics, mood)
- ✅ Personalized meal plans
- ✅ Nutrition calculator
- ✅ Disease-specific guidance
- ✅ Recipe database

### AI & Longevity
- 🤖 AI health coach
- 📊 Biological age tracking
- 💊 Supplement recommendations
- 🧬 Biomarker analysis

### Gamification
- 🔥 Daily streaks
- 🏆 Achievement badges
- 📊 Leaderboards
- 🎯 Weekly challenges
- ⭐ XP leveling
- 🎨 NFT rewards

### Web3 Features
- 🔐 Token gating ($5 minimum)
- 💰 $tabledadrian rewards for actions
- 💎 Staking for premium features
- 🛒 Marketplace ($tabledadrian payments)
- 🗳️ DAO governance

### Social
- 📱 Community feed
- 👨‍🍳 Recipe sharing
- 💬 Direct messaging
- 👥 Group challenges

## 🔄 Next Steps

1. **Complete Core Features**
   - [ ] Health tracking UI
   - [ ] Meal plan generator
   - [ ] AI coach interface
   - [ ] Challenge system
   - [ ] Marketplace

2. **Integrations**
   - [ ] Apple Watch API
   - [ ] Fitbit API
   - [ ] Oura Ring API
   - [ ] Telemedicine platforms

3. **Mobile Apps**
   - [ ] React Native setup
   - [ ] iOS app
   - [ ] Android app

4. **Farcaster Frame**
   - [ ] Frame development
   - [ ] In-feed interactions

5. **Partnerships**
   - [ ] Automated outreach
   - [ ] Partnership dashboard
   - [ ] Co-marketing tools

## 📊 Monitoring

- User metrics
- Token activity
- Partnership progress
- Social engagement
- App performance

## 🔒 Security

- Wallet-based authentication
- Token gating
- Secure API keys
- Database encryption
- Rate limiting

---

**Status**: 🚧 In Development  
**Last Updated**: 2025-11-22

