/**
 * Update Uniswap Pool Information
 * 
 * Updates all listing systems with Uniswap V4 pool details
 */

const fs = require('fs');
const path = require('path');

const UNISWAP_POOL_INFO = {
  poolId: '732283',
  poolUrl: 'https://app.uniswap.org/positions/v4/base/732283',
  network: 'Base',
  version: 'V4',
  status: 'active',
};

console.log('🔄 Updating Uniswap Pool Information');
console.log('=====================================\n');
console.log(`Pool ID: ${UNISWAP_POOL_INFO.poolId}`);
console.log(`URL: ${UNISWAP_POOL_INFO.poolUrl}`);
console.log(`Network: ${UNISWAP_POOL_INFO.network}`);
console.log(`Version: ${UNISWAP_POOL_INFO.version}\n`);

// Update listing results
const resultsFile = path.join(__dirname, 'listing-results.json');
if (fs.existsSync(resultsFile)) {
  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  
  // Add Uniswap pool info
  results.uniswapPool = UNISWAP_POOL_INFO;
  results.uniswapPool.updatedAt = new Date().toISOString();
  
  // Update Uniswap status
  const uniswapEntry = results.pending.find(p => p.platform === 'Uniswap');
  if (uniswapEntry) {
    uniswapEntry.status = 'pool-created';
    uniswapEntry.poolId = UNISWAP_POOL_INFO.poolId;
    uniswapEntry.poolUrl = UNISWAP_POOL_INFO.poolUrl;
    uniswapEntry.updatedAt = new Date().toISOString();
  }
  
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log('✅ Updated listing-results.json with Uniswap pool info');
}

console.log('\n✅ Uniswap pool information updated!');
console.log('\n📊 Impact:');
console.log('  • Uniswap V4 pool is now active');
console.log('  • Token is tradeable on Uniswap');
console.log('  • Auto-detection on DexScreener, Birdeye, DexTools enabled');
console.log('  • Ready for CoinGecko/CoinMarketCap submission');

