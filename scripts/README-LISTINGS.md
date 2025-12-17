# Table d'Adrian ($TA) Token Listing Mastermind System

## Overview

This automated system maximizes visibility and listings for Table d'Adrian ($TA) token across all major Web3 platforms, exchanges, DEX/CEX portals, listing services, token directories, and DeFi/NFT platforms.

**Contract**: `0x9Cb5254319f824A2393ECbF6aDCf608867AA1b07`  
**Network**: Base (Chain ID: 8453)  
**Symbol**: TA  
**Name**: TableDadrian

## Quick Start

```bash
# Run comprehensive platform scan
npm run listings:scan

# Submit to all platforms
npm run listings:submit

# Monitor listing status
npm run listings:monitor

# Discover new platforms
npm run listings:discover
```

## System Components

### 1. Token Listing Mastermind (`token-listing-mastermind.js`)
Main orchestrator that:
- Discovers new listing opportunities
- Submits token information to all platforms
- Tracks submission status
- Generates comprehensive reports

### 2. Auto Submission System (`auto-submit-listings.js`)
Automated submission engine that:
- Prepares submission data for each platform
- Checks current listing status
- Generates submission links and forms
- Handles platform-specific requirements

### 3. Monitoring System (`monitor-listings.js`)
Real-time monitoring that:
- Checks listing status across all platforms
- Detects new listings automatically
- Provides status summaries
- Logs all changes

### 4. Platform Discovery (`discover-platforms.js`)
Continuous discovery engine that:
- Searches for new listing opportunities
- Identifies platform requirements
- Updates platform database
- Suggests next steps

### 5. Scheduled Monitoring (`schedule-monitoring.js`)
Automated monitoring that:
- Runs checks on a schedule (default: every 6 hours)
- Logs all status changes
- Alerts on new listings
- Can run continuously

## Current Status

### ✅ Already Listed
- **BaseScan**: Contract verified and visible
- **DexScreener**: Auto-detected from on-chain data (liquidity present)

### 📝 Pending Submissions
- CoinGecko (manual submission required)
- CoinMarketCap (manual submission required)
- Base Ecosystem Directory
- TokenLists (Uniswap)
- DefiLlama
- DappRadar
- And 10+ more platforms

### 🔍 Auto-Detected Platforms
These platforms automatically detect tokens when liquidity is added:
- DexScreener ✅ (already active)
- Birdeye (will appear with more liquidity)
- DexTools (will appear with more liquidity)

## Submission Guide

See `listing-submission-guide.md` for detailed submission instructions for each platform.

### Priority Actions

1. **CoinGecko** (High Priority)
   - URL: https://www.coingecko.com/en/coins/new
   - Requires: Contract, name, symbol, description, website, logo, social links
   - Note: Requires liquidity and trading volume

2. **CoinMarketCap** (High Priority)
   - URL: https://coinmarketcap.com/currencies/new/
   - Requires: Same as CoinGecko
   - Note: Requires significant trading volume

3. **Base Ecosystem**
   - URL: https://base.org/ecosystem
   - Focus: Highlight culinary/NFT innovation

4. **TokenLists**
   - URL: https://github.com/uniswap/token-lists
   - Method: Create PR to add token to Base token list

## Monitoring

### Manual Check
```bash
npm run listings:monitor
```

### Scheduled Monitoring
```bash
# Run once
node scripts/schedule-monitoring.js

# Run continuously (every 6 hours)
node scripts/schedule-monitoring.js --schedule
```

### Results
All results are saved to:
- `listing-results.json` - Submission results and status
- `monitoring-log.json` - Historical monitoring data

## Platform Categories

### Price Trackers
- CoinGecko
- CoinMarketCap
- CryptoCompare
- LiveCoinWatch

### DEX Trackers (Auto-Detected)
- DexScreener ✅
- DexTools
- Birdeye

### Ecosystem Directories
- Base Ecosystem
- TokenLists (Uniswap)

### Analytics & Data
- DefiLlama
- DappRadar
- Token Terminal

### Wallets
- TokenPocket
- MetaMask (via TokenLists)

### Social & Community
- Zora ✅ (connected)
- Farcaster ✅ (connected)
- Base ✅ (connected)

## Token Information

All token data is centralized in `token-listing-mastermind.js`:

```javascript
const TOKEN_INFO = {
  contractAddress: '0x9Cb5254319f824A2393ECbF6aDCf608867AA1b07',
  symbol: 'TA',
  name: 'TableDadrian',
  network: 'Base',
  // ... full details
};
```

## Adding New Platforms

To add a new platform, update `LISTING_PLATFORMS` in `token-listing-mastermind.js`:

```javascript
{
  name: 'New Platform',
  type: 'price-tracker',
  url: 'https://newplatform.com',
  submissionUrl: 'https://newplatform.com/submit',
  requires: ['contract', 'name', 'symbol', 'description'],
  status: 'pending',
}
```

## Automation Tips

1. **Run scans regularly**: Set up a cron job or scheduled task
2. **Monitor status**: Check monitoring logs weekly
3. **Update information**: Keep token info current
4. **Follow up**: Complete manual submissions promptly
5. **Track results**: Review `listing-results.json` regularly

## Requirements

- Node.js 16+
- `axios` package (installed via `npm install`)
- Internet connection for API calls

## Notes

- Most platforms require manual submission via forms
- Auto-detected platforms (DexScreener, Birdeye) require liquidity
- Major trackers (CoinGecko, CMC) require trading volume
- Some platforms have approval processes (can take days/weeks)

## Support

For issues or questions:
1. Check `listing-results.json` for submission status
2. Review `listing-submission-guide.md` for platform-specific instructions
3. Run `npm run listings:monitor` to check current status

---

**Last Updated**: 2025-11-22  
**Status**: Active monitoring and submission system operational

