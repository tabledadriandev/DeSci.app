# Table d'Adrian Wellness App - Complete Project Information

## Project Overview

**Project Name:** Table d'Adrian Wellness App 
**Type:** Web3-Powered Longevity & Wellness Platform 
**Status:** In Active Development 
**Last Updated:** January 2025

### Core Concept
A comprehensive wellness and longevity platform built on Web3 technology, token-gated with $TA tokens on the Base network. The app combines health tracking, AI-powered coaching, gamification, social features, and decentralized governance into a unified wellness ecosystem.

---

## Technical Stack

### Frontend Framework
- **Next.js 15** with TypeScript
- **React** with Server Components
- **Tailwind CSS** for styling
- **Responsive Design** (mobile-first approach)

### Backend & Database
- **Prisma ORM** with **PostgreSQL** database
- **Next.js API Routes** for backend functionality
- **Redis** (optional) for caching and session management

### Web3 Integration
- **wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Base Network** (Chain ID: 8453) - Primary blockchain
- **$TA Token Contract:** `0x9Cb5254319f824A2393ECbF6aDCf608867AA1b07`
- **Wallet Support:** MetaMask, Rainbow Wallet, Coinbase Wallet

### AI & External Services
- **OpenAI GPT-4** - AI Health Coach
- **Farcaster** - Social media integration and automated posting
- **Coinbase API** - Wallet integration
- **USDA FoodData Central API** - Nutrition data
- **Wearable APIs** (placeholders): Apple Watch, Fitbit, Oura Ring

### Desktop Application
- **Electron** - Desktop app wrapper
- **electron-builder** - Windows installer generation
- Window size: 1400x900 (minimum: 1200x700)
- Security: Context isolation enabled, Node integration disabled

---

## Core Features

### 1. Health & Wellness Tracking

#### Comprehensive Health Features (Neko Health Inspired)
- **Health Assessment** - Comprehensive health questionnaire
- **Health Score** - Overall health score with category breakdowns
- **Biomarker Tracking** - Lab results logging with trend visualization
- **Camera Analysis** - Facial, body composition, and vital signs analysis
- **Symptom Tracker** - Daily symptom logging with pattern recognition
- **Daily Habits** - Track water, steps, sleep, and daily wellness habits

#### Standard Health Tracking
- Steps tracking
- Sleep monitoring
- Heart rate tracking
- Blood pressure logging
- Glucose monitoring
- Weight tracking
- Mood logging
- Biometric data collection

#### Nutrition & Meal Planning
- **Nutrition Analysis** - Photo-based meal logging and nutrition tracking
- **Meal Plans** - Personalized meal plan generation
- **Recipe Database** - Community recipe sharing with videos
- **Meal Logging** - Detailed meal tracking with nutrition calculator
- **Disease-Specific Guidance** - Diabetes, heart health, allergies support
- **Supplement Recommendations** - AI-powered supplement suggestions

#### AI & Advanced Features
- **AI Health Coach** - GPT-4 powered health coaching with quick actions:
 - Heart Health
 - Mental Wellness
 - Nutrition
 - Exercise
 - Longevity
- **Biological Age Tracking** - Calculate and track biological age
- **Biomarker Analysis** - Advanced biomarker interpretation
- **Wellness Plan** - Personalized wellness recommendations
- **Health Reports** - Comprehensive health report generation (PDF export)

### 2. Gamification System

- **XP & Leveling** - Experience points and level progression
- **Daily Streaks** - Track consecutive days of activity
- **Achievement System** - Badge collection and achievements
- **Challenge System** - Weekly and custom challenges
- **Leaderboards** - Competitive rankings
- **Battle Pass** - Seasonal progression system
- **Clans** - Group challenges and social features
- **Tournaments** - Competitive events

### 3. Web3 & Tokenomics

#### Token Gating
- **Minimum Requirement:** $5 worth of $TA tokens
- **Network:** Base (Chain ID: 8453)
- **Contract Address:** `0x9Cb5254319f824A2393ECbF6aDCf608867AA1b07`

#### Token Rewards System
Users earn $TA tokens for various actions:
- Health tracking: **1 $TA**
- Meal plan creation: **5 $TA**
- Post sharing: **2 $TA**
- Recipe sharing: **10 $TA**
- Wearable sync: **5 $TA**

#### Staking System
- **APY:** 12% annual percentage yield
- Stake/unstake functionality
- Reward tracking

#### Marketplace
- Product listings (supplements, wellness products)
- Service offerings (chef services, consultations)
- Subscription management
- Stock tracking
- Purchase flow with $TA tokens

#### Governance (DAO)
- **Proposal Creation** - Minimum 100 $TA to create proposal
- **Voting System** - Weighted voting (1 token = 1 vote)
- **Proposal Types:**
 - Features
 - Partnerships
 - Treasury
 - Policy
- Vote tracking and results display

#### NFTs
- Achievement NFTs
- Recipe NFTs
- VIP access NFTs
- NFT minting interface
- NFT gallery

### 4. Social Features

- **Community Feed** - Social media-style feed
- **Post Creation** - Share wellness updates, achievements
- **Likes & Comments** - Social interactions
- **Recipe Sharing** - Share recipes with community
- **User Profiles** - Comprehensive user profiles
- **Direct Messaging** - Private messaging system (database ready)
- **Follow System** - Follow other users
- **Group Challenges** - Collaborative challenges

### 5. Additional Features

- **Chef Services** - Book chef services with $TA
- **Exclusive Events** - Token-gated events and experiences
- **Fasting Tracker** - Intermittent fasting tracking
- **Subscriptions** - Subscription management
- **Groceries** - Grocery list management
- **Gronda Integration** - Third-party service integration

---

## Project Structure

```
wellness-app/
├── app/ # Next.js app directory
│ ├── app/ # Main wellness app pages (token-gated)
│ │ ├── page.tsx # Dashboard (22 feature cards)
│ │ ├── layout.tsx # Web3 providers (Wagmi, RainbowKit)
│ │ ├── health/ # Health tracking
│ │ ├── health-assessment/ # Health questionnaire
│ │ ├── health-score/ # Health score dashboard
│ │ ├── biomarkers/ # Biomarker tracking
│ │ ├── camera-analysis/ # Camera-based analysis
│ │ ├── symptoms/ # Symptom tracker
│ │ ├── habits/ # Daily habits
│ │ ├── nutrition/ # Nutrition analysis
│ │ ├── wellness-plan/ # Personalized wellness plan
│ │ ├── meals/ # Meal plans
│ │ ├── coach/ # AI health coach
│ │ ├── health-reports/ # Health reports
│ │ ├── recipes/ # Recipe database
│ │ ├── challenges/ # Challenges
│ │ ├── community/ # Community feed
│ │ ├── marketplace/ # Marketplace
│ │ ├── staking/ # Staking interface
│ │ ├── governance/ # DAO governance
│ │ ├── chef-services/ # Chef booking
│ │ ├── nfts/ # NFTs & achievements
│ │ ├── events/ # Exclusive events
│ │ ├── fasting/ # Fasting tracker
│ │ ├── subscriptions/ # Subscriptions
│ │ ├── clans/ # Clans
│ │ ├── battle-pass/ # Battle pass
│ │ ├── tournaments/ # Tournaments
│ │ ├── groceries/ # Grocery lists
│ │ └── gronda/ # Gronda integration
│ ├── api/ # API routes
│ │ ├── health/ # Health data endpoints
│ │ ├── meals/ # Meal plan endpoints
│ │ ├── recipes/ # Recipe endpoints
│ │ ├── challenges/ # Challenge endpoints
│ │ ├── community/ # Community endpoints
│ │ ├── rewards/ # Reward endpoints
│ │ ├── staking/ # Staking endpoints
│ │ ├── marketplace/ # Marketplace endpoints
│ │ ├── governance/ # Governance endpoints
│ │ ├── nfts/ # NFT endpoints
│ │ ├── achievements/ # Achievement endpoints
│ │ ├── web3/ # Web3 operations
│ │ ├── wearables/ # Wearable sync
│ │ ├── farcaster/ # Farcaster posting
│ │ ├── auth/ # Authentication
│ │ ├── chef/ # Chef services
│ │ ├── events/ # Events
│ │ ├── fasting/ # Fasting
│ │ ├── groceries/ # Groceries
│ │ ├── subscriptions/ # Subscriptions
│ │ ├── clans/ # Clans
│ │ ├── battle-pass/ # Battle pass
│ │ └── tournaments/ # Tournaments
│ └── components/ # Shared components
│ └── ErrorBoundary.tsx
├── lib/ # Utility libraries
│ ├── prisma.ts # Database client
│ ├── wagmi-config.ts # Web3 configuration
│ ├── web3.ts # Web3 utilities
│ ├── farcaster.ts # Farcaster API
│ ├── coinbase.ts # Coinbase API
│ ├── auth.ts # Authentication
│ ├── wearables.ts # Wearable integration
│ ├── contract-service.ts # Smart contract service
│ ├── redis.ts # Redis client
│ ├── websocket.ts # WebSocket server
│ ├── websocket-client.ts # WebSocket client
│ ├── pwa.ts # PWA utilities
│ └── accessibility.ts # Accessibility utilities
├── prisma/
│ ├── schema.prisma # Main database schema
│ ├── schema-complete.prisma
│ └── schema-extended.prisma
├── electron/ # Electron desktop app
│ ├── main.js # Main process
│ ├── preload.js # Preload script
│ └── package.json
├── scripts/ # Automation scripts
│ ├── automated-posting.ts # Social media automation
│ ├── partnership-scraper.ts # Partnership discovery
│ ├── data-scraper/ # Data scraping
│ ├── token-listing-mastermind.js # Token listing
│ ├── monitoring.ts # Monitoring system
│ └── weekly-report.ts # Weekly reports
├── farcaster/
│ └── frame/ # Farcaster Frame
├── mobile/ # Mobile app (React Native/Expo)
├── build/ # Build artifacts
└── dist/ # Electron build output
```

---

## Database Schema

### Core Models

#### User & Authentication
- **User** - Wallet-based user accounts
 - Wallet address (unique)
 - Email, username
 - Token balance, staked amount
 - XP, level, streak
 - Last check-in timestamp
- **UserProfile** - Extended user information
 - Personal details (name, age, gender)
 - Physical metrics (height, weight)
 - Activity level
 - Health goals
 - Allergies and dietary restrictions
- **UserSession** - Session management
- **UserProgress** - User progression tracking

#### Health & Wellness
- **HealthData** - General health tracking (steps, sleep, heart rate, etc.)
- **HealthMetrics** - Aggregated health metrics
- **HealthAssessment** - Comprehensive health assessments
- **HealthScore** - Calculated health scores
- **Biomarker** - Lab results and biomarkers
- **SymptomLog** - Symptom tracking
- **CameraAnalysis** - Camera-based analysis results
- **WellnessPlan** - Personalized wellness plans
- **MealLog** - Meal logging
- **MealLogItem** - Individual meal items
- **DailyHabits** - Daily habit tracking
- **HealthReport** - Generated health reports

#### Nutrition & Food
- **MealPlan** - Meal plans
- **Meal** - Individual meals
- **Recipe** - Community recipes
- **Food** - Food database
- **Nutrient** - Nutrient information
- **MedicalCondition** - Medical conditions
- **DietaryGuideline** - Disease-specific guidelines

#### Gamification
- **Challenge** - Challenges
- **ChallengeProgress** - User challenge progress
- **Achievement** - Achievements and badges
- **Reward** - Token rewards
- **Transaction** - Token transactions

#### Social
- **Post** - Community posts
- **Comment** - Post comments
- **Follow** - User follows
- **Message** - Direct messages

#### Web3
- **NFT** - NFT records
- **GovernanceProposal** - DAO proposals
- **Vote** - Governance votes

#### Marketplace & Services
- **MarketplaceItem** - Marketplace products/services
- **Partnership** - Partnership tracking
- **ChefBooking** - Chef service bookings
- **Event** - Exclusive events

#### Data Pipeline
- **DataScrapeLog** - Data scraping logs
- **DataValidation** - Data validation records

---

## Authentication System

### Multi-Method Authentication

1. **Wallet Connect (Primary)**
 - MetaMask, Rainbow, Coinbase Wallet support
 - Encrypted wallet address storage (AES-256)
 - $5 minimum $TA verification
 - Auto-reconnect on page refresh
 - 30-day session persistence

2. **Traditional Auth**
 - Email/password with bcrypt hashing
 - JWT tokens with refresh tokens
 - httpOnly cookies for security
 - Rate limiting (5 attempts/15min)

3. **Social Login (Ready for Integration)**
 - OAuth 2.0 structure
 - Google, Apple, Twitter, Farcaster
 - Link multiple authentication methods

### Session Management
- Redis caching for fast session retrieval
- Secure session tokens
- Automatic session expiration

---

## Environment Variables

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tabledadrian"

# Next.js
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
NEXT_PUBLIC_BASE_RPC_URL="https://mainnet.base.org"

# Web3
NEXT_PUBLIC_TA_CONTRACT_ADDRESS="0x9Cb5254319f824A2393ECbF6aDCf608867AA1b07"
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your-walletconnect-project-id"
BACKEND_WALLET_PRIVATE_KEY="your-backend-wallet-private-key"

# Farcaster
FARCASTER_API_KEY="your_farcaster_api_key"

# Coinbase
COINBASE_API_KEY="your_coinbase_api_key"
COINBASE_KEY_ID="your_coinbase_key_id"
COINBASE_SECRET_KEY="your_coinbase_secret_key"

# OpenAI (for AI Coach)
OPENAI_API_KEY="your_openai_key"

# Email (EmailJS)
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your-service-id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your-template-id"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your-public-key"

# Redis (optional, for caching)
REDIS_URL="redis://localhost:6379"
```

---

## API Endpoints

### Health Endpoints
- `GET /api/health` - Get health data
- `POST /api/health` - Log health data
- `GET /api/health/assessment` - Get health assessment
- `POST /api/health/assessment` - Submit health assessment
- `GET /api/health/score` - Get health score
- `GET /api/health/biomarkers` - Get biomarkers
- `POST /api/health/biomarkers` - Add biomarker
- `GET /api/health/symptoms` - Get symptoms
- `POST /api/health/symptoms` - Log symptom
- `GET /api/health/habits` - Get daily habits
- `POST /api/health/habits` - Log daily habits
- `GET /api/health/reports` - Get health reports
- `POST /api/health/reports` - Generate health report

### Nutrition Endpoints
- `GET /api/meals/plans` - Get meal plans
- `POST /api/meals/generate` - Generate meal plan
- `GET /api/nutrition` - Get nutrition data
- `POST /api/nutrition` - Log nutrition data

### Recipe Endpoints
- `GET /api/recipes` - Get recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/[id]` - Get recipe details

### Challenge Endpoints
- `GET /api/challenges` - Get challenges
- `POST /api/challenges/join` - Join challenge
- `GET /api/challenges/progress` - Get progress

### Community Endpoints
- `GET /api/community/posts` - Get posts
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/[id]/like` - Like post
- `POST /api/community/posts/[id]/comment` - Comment on post

### Reward Endpoints
- `POST /api/rewards` - Create reward

### Staking Endpoints
- `GET /api/staking` - Get staking info
- `POST /api/staking/stake` - Stake tokens
- `POST /api/staking/unstake` - Unstake tokens

### Marketplace Endpoints
- `GET /api/marketplace` - Get items
- `POST /api/marketplace/purchase` - Purchase item

### Governance Endpoints
- `GET /api/governance/proposals` - Get proposals
- `POST /api/governance/proposals` - Create proposal
- `POST /api/governance/vote` - Vote on proposal

### NFT Endpoints
- `GET /api/nfts` - Get user NFTs
- `POST /api/nfts/mint` - Mint NFT

### Achievement Endpoints
- `GET /api/achievements` - Get achievements

### Web3 Endpoints
- `GET /api/web3/balance` - Check token balance

### Wearable Endpoints
- `POST /api/wearables/sync` - Sync wearable data

### Farcaster Endpoints
- `POST /api/farcaster/post` - Post to Farcaster
- `GET /app/farcaster/frame` - Farcaster Frame

### Authentication Endpoints
- `POST /api/auth/wallet` - Wallet authentication
- `POST /api/auth/email` - Email authentication
- `GET /api/auth/session` - Get session

### Chef Services Endpoints
- `GET /api/chef/bookings` - Get bookings
- `POST /api/chef/book` - Book chef service

### Event Endpoints
- `GET /api/events` - Get events
- `POST /api/events/purchase` - Purchase event ticket

---

## Design System

### Brand Colors
- **Cream** - Primary background color
- **Cobalt** - Primary accent color
- **Walnut** - Secondary accent color
- **White** - Base color

### UI Components
- Responsive grid layouts
- Card-based design
- Smooth animations
- Accessible UI (WCAG compliant)
- Dark mode ready (structure in place)

### Typography
- Custom font family (font-display)
- Responsive text sizing
- Clear hierarchy

---

## Development Workflow

### Getting Started

1. **Install Dependencies**
 ```bash
 npm install
 ```

2. **Set Up Environment Variables**
 - Copy `.env.example` to `.env`
 - Fill in all required variables

3. **Set Up Database**
 ```bash
 npx prisma generate
 npx prisma migrate dev
 ```

4. **Run Development Server**
 ```bash
 npm run dev
 ```
 Visit `http://localhost:3000/app` to access the wellness app.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run electron:dev` - Run Electron app in development
- `npm run electron:build:win` - Build Windows installer
- `npm run listings:scan` - Scan token listing platforms
- `npm run partnerships:scrape` - Scrape partnership opportunities
- `npm run posting:start` - Start automated Farcaster posting
- `npm run monitoring:start` - Start monitoring system
- `npm run report:weekly` - Generate weekly report

---

## Automation Systems

### Social Media Posting
- **Farcaster Integration** - Automated posting to Farcaster
- **Post Types:**
 - Daily wellness tips (9 AM)
 - Weekly challenges (Monday 10 AM)
 - Partnership announcements
 - User achievements
 - Recipe shares

### Partnership Discovery
- Automated scraping of wellness brands
- Supplement companies discovery
- Longevity clinics identification
- Health tech startups discovery
- Fitness influencers discovery

### Data Pipeline
- **USDA FoodData Central API** - Nutrition data
- **NIH Medical Guidelines** - Health guidelines
- **Mayo Clinic** - Dietary recommendations
- **CDC Nutrition Databases** - Nutrition information
- **Multi-source Validation** - Cross-reference data sources
- **Auto-update Weekly** - Keep data current

### Monitoring System
- User metrics tracking
- Token activity monitoring
- Partnership progress tracking
- Social engagement metrics
- App performance monitoring

---

## Platform Support

### Web Application
- Responsive web app (desktop and mobile browsers)
- PWA support (service worker ready)
- Offline functionality (structure in place)

### Desktop Application (Electron)
- Windows installer (.exe)
- Portable executable
- Window management
- Menu bar with standard options
- Navigation protection
- Security features (context isolation, no Node integration)

### Mobile Application (In Development)
- React Native/Expo structure in place
- iOS app (planned)
- Android app (planned)

---

## Security Features

- API keys stored in environment variables (never committed)
- .env files gitignored
- Token gating ($5 minimum $TA)
- Wallet-based authentication
- Encrypted wallet address storage
- JWT tokens with httpOnly cookies
- Rate limiting ready
- Context isolation (Electron)
- Web security enabled
- Database encryption ready

---

## Deployment

### Deployment Options

1. **Vercel (Recommended)**
 - Already configured with `vercel.json`
 - Automatic deployments from GitHub
 - Environment variables in dashboard

2. **Netlify**
 - Configured with `netlify.toml`
 - Build command: `npm run build`
 - Publish directory: `.next`

3. **Railway**
 - Auto-detects Next.js
 - Environment variables in dashboard
 - Automatic deployments

4. **Self-Hosted (VPS/Docker)**
 - Dockerfile ready
 - PM2 process manager support

### Post-Deployment Checklist

1. **Database Setup**
 - Set up PostgreSQL (Supabase, Railway, or AWS RDS)
 - Run Prisma migrations
 - Verify database connection

2. **Environment Configuration**
 - Add all API keys to production environment
 - Set up WalletConnect project ID
 - Configure OpenAI API key

3. **Smart Contract Authorization**
 - Authorize backend wallet in smart contract
 - Test token interactions
 - Verify staking contract

4. **Monitoring Setup**
 - Set up error tracking (Sentry)
 - Configure analytics
 - Set up alerts

---

## Current Status

### Completed Features
- Core infrastructure (Next.js 15, Prisma, Web3)
- All 22 main dashboard features
- Health tracking system
- Nutrition analysis
- AI health coach
- Gamification system
- Web3 integration
- Marketplace
- Governance (DAO)
- Social features
- Electron desktop app
- API structure
- Database schema

### In Development
- Mobile apps (iOS/Android)
- Wearable API integrations (Apple Watch, Fitbit, Oura)
- Advanced AI features
- Enhanced analytics
- Performance optimizations

### Planned Features
- Telemedicine platform integration
- Advanced biomarker analysis
- Enhanced social features
- More NFT collections
- Additional marketplace categories
- International expansion

---

## Documentation Files

- `WELLNESS-APP-README.md` - Main development guide
- `COMPLETE-FEATURES.md` - Complete feature list
- `DEPLOYMENT.md` - Deployment guide
- `ELECTRON-APP-TEST-REPORT.md` - Electron app testing checklist
- `DATA-PIPELINE-README.md` - Data pipeline documentation
- `DATA-PIPELINE-COMPLETE.md` - Complete data pipeline info
- `BUILD-WINDOWS-APP.md` - Windows app build guide
- `NATIVE-APP-GUIDE.md` - Native app development guide
- `EXPO-SETUP.md` - Expo setup guide
- `EXPO-APP-STRUCTURE.md` - Expo app structure
- `TEST-REPORT.md` - Testing report

---

## Key Integrations

### Blockchain
- **Base Network** - Primary blockchain
- **$TA Token** - Native token
- **Smart Contracts** - Staking, NFTs, governance

### External APIs
- **OpenAI** - AI health coach
- **Farcaster** - Social media
- **Coinbase** - Wallet services
- **USDA** - Nutrition data
- **NIH** - Medical guidelines
- **Mayo Clinic** - Health information
- **CDC** - Health data

### Wearables (Placeholders Ready)
- Apple Watch
- Fitbit
- Oura Ring

---

## Key Differentiators

1. **Web3 Integration** - First wellness app with full Web3 integration
2. **Token Rewards** - Earn tokens for healthy actions
3. **DAO Governance** - Community-driven decision making
4. **Comprehensive Health Tracking** - Beyond basic fitness tracking
5. **AI-Powered Coaching** - GPT-4 health coach
6. **Gamification** - Engaging reward system
7. **Social Wellness** - Community-driven wellness
8. **Longevity Focus** - Biological age tracking and biomarker analysis

---

## Support & Resources

### Development Resources
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- wagmi Documentation: https://wagmi.sh
- RainbowKit Documentation: https://www.rainbowkit.com

### Community
- Farcaster integration for community engagement
- Direct messaging system
- Community feed for sharing

---

**Project Status:** Active Development 
**Version:** 0.1.0 
**Last Comprehensive Update:** January 2025





