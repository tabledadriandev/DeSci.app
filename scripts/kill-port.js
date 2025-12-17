const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function killPort(port) {
  try {
    if (process.platform === 'win32') {
      // Find processes using the port
      try {
        const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
        
        if (stdout && stdout.trim()) {
          const lines = stdout.trim().split('\n');
          const pids = new Set();
          
          lines.forEach(line => {
            const match = line.match(/\s+(\d+)\s*$/);
            if (match) {
              pids.add(match[1]);
            }
          });
          
          // Kill each process
          for (const pid of pids) {
            try {
              console.log(`Killing process ${pid} on port ${port}...`);
              await execPromise(`taskkill /PID ${pid} /F`);
              console.log(`Successfully killed process ${pid}`);
            } catch (err) {
              // Process might already be dead, ignore
              console.log(`Could not kill process ${pid}: ${err.message}`);
            }
          }
          
          // Wait a bit for ports to be released
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log(`No processes found on port ${port}`);
        }
      } catch (err) {
        // No processes found or netstat failed - port is likely free
        console.log(`Port ${port} appears to be free`);
      }
    } else {
      // Unix/Linux/Mac
      try {
        await execPromise(`lsof -ti:${port} | xargs kill -9`);
        console.log(`Killed processes on port ${port}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.log(`No processes found on port ${port} - port is free`);
      }
    }
  } catch (error) {
    // Ignore errors - port might already be free
    console.log(`Port ${port} check completed`);
  }
}

// If run directly, kill port 3000
if (require.main === module) {
  const port = process.argv[2] || 3000;
  killPort(port).then(() => {
    console.log(`Port ${port} is now free`);
    process.exit(0);
  });
}

module.exports = { killPort };

