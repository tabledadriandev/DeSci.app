/**
 * Scheduled Monitoring System
 * 
 * Runs listing checks on a schedule
 * Can be set up with cron or task scheduler
 */

const { monitorAllPlatforms } = require('./monitor-listings');
const fs = require('fs');
const path = require('path');

const MONITORING_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
const LOG_FILE = path.join(__dirname, 'monitoring-log.json');

class ScheduledMonitor {
  constructor() {
    this.isRunning = false;
    this.lastCheck = null;
  }

  async runCheck() {
    console.log(`\n🕐 Scheduled Check: ${new Date().toLocaleString()}\n`);
    
    try {
      const results = await monitorAllPlatforms();
      
      // Log results
      const logEntry = {
        timestamp: new Date().toISOString(),
        results: results,
      };
      
      // Load existing log
      let log = [];
      if (fs.existsSync(LOG_FILE)) {
        log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
      }
      
      log.push(logEntry);
      
      // Keep last 100 entries
      if (log.length > 100) {
        log = log.slice(-100);
      }
      
      fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
      
      this.lastCheck = new Date();
      
      // Check for new listings
      const newlyListed = results.filter(r => r.status === 'listed');
      if (newlyListed.length > 0) {
        console.log('\n🎉 NEW LISTINGS DETECTED!');
        newlyListed.forEach(r => {
          console.log(`  ✅ ${r.platform}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error in scheduled check:', error);
    }
  }

  start(interval = MONITORING_INTERVAL) {
    if (this.isRunning) {
      console.log('⚠️  Monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting scheduled monitoring...');
    console.log(`   Interval: ${interval / 1000 / 60} minutes`);
    console.log('   Press Ctrl+C to stop\n');

    // Run immediately
    this.runCheck();

    // Then run on schedule
    this.intervalId = setInterval(() => {
      this.runCheck();
    }, interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('\n⏹️  Monitoring stopped');
    }
  }
}

// CLI usage
if (require.main === module) {
  const monitor = new ScheduledMonitor();
  
  // Run once if no --schedule flag
  if (process.argv.includes('--schedule')) {
    monitor.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      monitor.stop();
      process.exit(0);
    });
  } else {
    // Run single check
    monitor.runCheck().then(() => process.exit(0));
  }
}

module.exports = { ScheduledMonitor };

