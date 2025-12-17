/**
 * Listing Status Monitor
 * 
 * Continuously monitors listing status across all platforms
 */

const axios = require('axios');
const { TOKEN_INFO } = require('./token-listing-mastermind');

const MONITORING_ENDPOINTS = [
  {
    name: 'DexScreener',
    url: `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_INFO.contractAddress}`,
    check: (data) => data.pairs && data.pairs.length > 0,
  },
  {
    name: 'CoinGecko',
    url: `https://api.coingecko.com/api/v3/coins/base/contract/${TOKEN_INFO.contractAddress}`,
    check: (data) => data.id !== undefined,
  },
  {
    name: 'CoinMarketCap',
    url: `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/market-pairs/latest?slug=${TOKEN_INFO.symbol.toLowerCase()}`,
    check: (data) => data.data !== undefined,
  },
];

async function monitorAllPlatforms() {
  console.log('👀 Monitoring Listing Status');
  console.log('===========================\n');
  console.log(`Token: ${TOKEN_INFO.symbol} (${TOKEN_INFO.contractAddress})\n`);

  const results = [];

  for (const endpoint of MONITORING_ENDPOINTS) {
    try {
      console.log(`Checking ${endpoint.name}...`);
      const response = await axios.get(endpoint.url, { timeout: 10000 });
      
      const isListed = endpoint.check(response.data);
      
      if (isListed) {
        console.log(`  ✅ Listed on ${endpoint.name}`);
        results.push({ platform: endpoint.name, status: 'listed', data: response.data });
      } else {
        console.log(`  ⏳ Not yet listed on ${endpoint.name}`);
        results.push({ platform: endpoint.name, status: 'pending' });
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`  ⏳ Not yet listed on ${endpoint.name}`);
        results.push({ platform: endpoint.name, status: 'not-listed' });
      } else {
        console.log(`  ⚠️  Error checking ${endpoint.name}: ${error.message}`);
        results.push({ platform: endpoint.name, status: 'error', error: error.message });
      }
    }
    console.log('');
  }

  return results;
}

async function main() {
  const results = await monitorAllPlatforms();
  
  console.log('\n📊 Summary:');
  console.log('==========\n');
  
  const listed = results.filter(r => r.status === 'listed');
  const pending = results.filter(r => r.status === 'pending' || r.status === 'not-listed');
  
  console.log(`✅ Listed: ${listed.length} platforms`);
  listed.forEach(r => console.log(`  • ${r.platform}`));
  
  console.log(`\n⏳ Pending: ${pending.length} platforms`);
  pending.forEach(r => console.log(`  • ${r.platform}`));
  
  console.log('\n💡 Tip: Run this script regularly to monitor listing status');
  console.log('   Schedule: npm run monitor-listings (every 6 hours)');
}

if (require.main === module) {
  main();
}

module.exports = { monitorAllPlatforms };

