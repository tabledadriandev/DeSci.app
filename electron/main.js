const { app, BrowserWindow, Menu, shell, globalShortcut } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// Kill any processes using port 3000 before starting
function killPortProcesses() {
  return new Promise((resolve) => {
    const killPortScript = path.join(__dirname, '../scripts/kill-port.js');
    const fs = require('fs');
    
    if (fs.existsSync(killPortScript)) {
      // Use the kill-port script if available
      exec(`node "${killPortScript}" 3000`, (error) => {
        // Ignore errors, just wait and continue
        setTimeout(resolve, 2000);
      });
    } else {
      // Fallback to direct method
      if (process.platform === 'win32') {
        exec('netstat -ano | findstr :3000', (error, stdout) => {
          if (stdout) {
            const lines = stdout.trim().split('\n');
            const pids = new Set();
            lines.forEach(line => {
              const match = line.match(/\s+(\d+)\s*$/);
              if (match) {
                pids.add(match[1]);
              }
            });
            pids.forEach(pid => {
              exec(`taskkill /PID ${pid} /F`, () => {});
            });
          }
          setTimeout(resolve, 2000); // Wait 2 seconds for processes to die
        });
      } else {
        exec('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', () => {
          setTimeout(resolve, 2000);
        });
      }
    }
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, '../build/icon.ico'),
    title: "Table d'Adrian Wellness",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // Don't show until ready
    backgroundColor: '#FAF8F3',
    titleBarStyle: 'default',
    autoHideMenuBar: true, // Hide menu bar on Windows/Linux
  });

  // Load the app - Wellness App only (not the website)
  if (isDev) {
    // Development: Wait for Next.js dev server to be ready, then load wellness app
    const waitForServer = () => {
      const http = require('http');
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait
      
      // Try multiple ports (3000, 3001, 3002, etc.)
      const tryPorts = [3000, 3001, 3002, 3003, 3004];
      let currentPortIndex = 0;
      
      const checkServer = (port) => {
        attempts++;
        // Try test page first to verify routing works
        const testUrl = `http://localhost:${port}/test-page`;
        const url = `http://localhost:${port}/`;
        const req = http.get(url, (res) => {
          console.log(`Server check attempt ${attempts} on port ${port}: Status ${res.statusCode}`);
          if (res.statusCode === 200) {
            // Server is ready and route exists
            console.log(`Server ready on port ${port}! Loading /app route...`);
            mainWindow.loadURL(url);
            // Open DevTools immediately after load
            mainWindow.webContents.once('did-finish-load', () => {
              if (isDev && mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.openDevTools();
                console.log('DevTools opened after page load');
              }
            });
          } else if (res.statusCode === 404 && attempts < 5) {
            // Route might not be ready yet, keep trying
            console.log('Route not ready yet, retrying...');
            setTimeout(() => checkServer(port), 1000);
          } else if (res.statusCode === 404) {
            // After 5 attempts, try loading anyway (might be a route issue)
            console.log('Loading /app route (may show 404 if route issue)...');
            mainWindow.loadURL(url);
            // Open DevTools immediately after load
            mainWindow.webContents.once('did-finish-load', () => {
              if (isDev && mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.openDevTools();
                console.log('DevTools opened after page load');
              }
            });
          } else {
            setTimeout(() => checkServer(port), 1000);
          }
        });
        
        req.on('error', (err) => {
          console.log(`Server check error on port ${port} (attempt ${attempts}):`, err.message);
          // Try next port if current one fails
          if (currentPortIndex < tryPorts.length - 1) {
            currentPortIndex++;
            console.log(`Trying next port: ${tryPorts[currentPortIndex]}`);
            setTimeout(() => checkServer(tryPorts[currentPortIndex]), 500);
          } else if (attempts < maxAttempts) {
            // Reset to first port and try again
            currentPortIndex = 0;
            setTimeout(() => checkServer(tryPorts[currentPortIndex]), 1000);
          } else {
            console.error('Server did not start in time. Loading default port...');
            mainWindow.loadURL('http://localhost:3000/');
            mainWindow.webContents.openDevTools();
          }
        });
        
        req.setTimeout(2000, () => {
          req.destroy();
          if (attempts < maxAttempts) {
            setTimeout(checkServer, 1000);
          }
        });
      };
      
      // Start checking after a short delay
      setTimeout(() => checkServer(tryPorts[currentPortIndex]), 2000);
    };
    
    waitForServer();
  } else {
    // Production: Start Next.js server and load from it
    const { spawn, exec } = require('child_process');
    const fs = require('fs');
    
    const isPackaged = app.isPackaged;
    const appPath = isPackaged 
      ? path.join(process.resourcesPath, 'app')
      : path.join(__dirname, '..');
    
    // Try standalone server first (smaller bundle)
    const standaloneServerPath = path.join(appPath, '.next', 'standalone', 'server.js');
    const regularServerPath = path.join(appPath, '.next', 'server.js');
    
    let nextServer;
    let serverCwd = appPath;
    
    if (fs.existsSync(standaloneServerPath)) {
      // Use standalone server
      serverCwd = path.join(appPath, '.next', 'standalone');
      nextServer = spawn('node', ['server.js'], {
        cwd: serverCwd,
        env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
        stdio: 'pipe',
      });
    } else if (fs.existsSync(regularServerPath)) {
      // Use regular server (requires node_modules)
      nextServer = spawn('node', [regularServerPath], {
        cwd: appPath,
        env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
        stdio: 'pipe',
      });
    } else {
      // Fallback: try to use next start command
      const nextBinPath = path.join(appPath, 'node_modules', '.bin', 'next');
      const nextBinCmd = process.platform === 'win32' ? `${nextBinPath}.cmd` : nextBinPath;
      
      if (fs.existsSync(nextBinCmd) || fs.existsSync(nextBinPath)) {
        const command = fs.existsSync(nextBinCmd) ? nextBinCmd : nextBinPath;
        
        if (process.platform === 'win32') {
          const cmd = `"${command}" start`;
          nextServer = exec(cmd, {
            cwd: appPath,
            env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
          }, (error) => {
            if (error) {
              console.error('Failed to start Next.js server:', error);
            }
          });
        } else {
          nextServer = spawn(command, ['start'], {
            cwd: appPath,
            env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
            stdio: 'pipe',
          });
        }
      } else {
        console.error('Could not find Next.js server files');
        mainWindow.loadURL('about:blank');
        mainWindow.webContents.executeJavaScript(`
          document.body.innerHTML = '<h1>Error</h1><p>Could not find Next.js server. Please rebuild the application.</p>';
        `);
        return;
      }
    }

    if (nextServer) {
      if (nextServer.stdout) {
        nextServer.stdout.on('data', (data) => {
          try {
            const output = data.toString();
            // Safely log to console (catch EPIPE errors)
            try {
              console.log(`Next.js: ${output}`);
            } catch (e) {
              // Ignore EPIPE errors when console is closed
            }
            if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
              setTimeout(() => {
                mainWindow.loadURL('http://localhost:3000/');
              }, 3000);
            }
          } catch (e) {
            // Ignore errors in data handler
          }
        });
      }

      if (nextServer.stderr) {
        nextServer.stderr.on('data', (data) => {
          try {
            const output = data.toString();
            // Safely log to console (catch EPIPE errors)
            try {
              console.error(`Next.js error: ${output}`);
            } catch (e) {
              // Ignore EPIPE errors when console is closed
            }
            // Sometimes Next.js outputs to stderr but it's not an error
            if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
              setTimeout(() => {
                mainWindow.loadURL('http://localhost:3000/');
              }, 3000);
            }
          } catch (e) {
            // Ignore errors in data handler
          }
        });
      }

      nextServer.on('error', (error) => {
        console.error('Failed to start Next.js server:', error);
        mainWindow.loadURL('about:blank');
        mainWindow.webContents.executeJavaScript(`
          document.body.innerHTML = '<h1>Error</h1><p>Failed to start server: ${error.message}</p>';
        `);
    });

    // Clean up server when window closes
    mainWindow.on('closed', () => {
        if (nextServer && !nextServer.killed) {
          if (nextServer.kill) {
            nextServer.kill();
          }
        }
      });
      
      app.on('before-quit', () => {
        if (nextServer && !nextServer.killed) {
          if (nextServer.kill) {
      nextServer.kill();
          }
        }
      });
      
      // Timeout fallback - load after 5 seconds even if we don't see Ready message
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL('http://localhost:3000/');
        }
      }, 5000);
    }
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // ALWAYS OPEN DEVTOOLS IN DEV MODE - try multiple times to ensure it opens
    if (isDev) {
      // Try opening immediately
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.openDevTools();
          console.log('DevTools opened on ready-to-show');
        }
      }, 100);
      
      mainWindow.focus();
      
      // Also try after page loads
      mainWindow.webContents.once('did-finish-load', () => {
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.openDevTools();
            console.log('DevTools opened after did-finish-load');
          }
        }, 500);
      });
      
      // Also try after DOM is ready
      mainWindow.webContents.once('dom-ready', () => {
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.openDevTools();
            console.log('DevTools opened after dom-ready');
          }
        }, 300);
      });
    }
    
    // Inject error handling script for chunk loading errors
    mainWindow.webContents.executeJavaScript(`
      (function() {
        // Handle chunk loading errors
        window.addEventListener('error', function(e) {
          if (e.message && e.message.includes('chunk') && e.message.includes('failed')) {
            console.log('Chunk loading error detected, reloading page...');
            setTimeout(function() {
              window.location.reload();
            }, 1000);
          }
        });
        
        // Handle unhandled promise rejections (chunk loading)
        window.addEventListener('unhandledrejection', function(e) {
          if (e.reason && e.reason.message && e.reason.message.includes('chunk')) {
            console.log('Chunk loading promise rejection, reloading page...');
            setTimeout(function() {
              window.location.reload();
            }, 1000);
          }
        });
      })();
    `).catch(() => {});
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle chunk loading errors - reload on chunk load failure
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('Load failed:', errorCode, errorDescription, validatedURL);
    if (errorCode === -6 || errorCode === -105 || errorDescription?.includes('chunk') || validatedURL?.includes('chunk')) {
      // Chunk loading error - reload the page
      console.log('Chunk loading error detected, reloading...', errorDescription);
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.reload();
        }
      }, 2000);
    }
  });
  
  // Also handle console errors for chunk loading
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (message.includes('chunk') && message.includes('failed')) {
      console.log('Chunk error in console, reloading...');
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.reload();
        }
      }, 2000);
    }
  });

  // Prevent navigation to external URLs
  // Keep Electron app within wellness app routes (/app/*)
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Allow navigation within wellness app routes and API routes
    if (parsedUrl.origin === 'http://localhost:3000') {
      // Block navigation to website routes (/coin, /app-download, etc.)
      if (parsedUrl.pathname.startsWith('/coin') ||
          parsedUrl.pathname.startsWith('/app-download')) {
        console.log('Blocked navigation to website route:', parsedUrl.pathname);
        event.preventDefault();
        // Redirect back to wellness app
        mainWindow.loadURL('http://localhost:3000/');
        return;
      }
      // Allow navigation within wellness app routes and API routes
      return;
    }
    
    // Block external URLs
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
  
  // Also handle navigation events (for client-side routing)
  mainWindow.webContents.on('did-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    // Root is the correct route, no redirect needed
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: 'Undo' },
        { role: 'redo', label: 'Redo' },
        { type: 'separator' },
        { role: 'cut', label: 'Cut' },
        { role: 'copy', label: 'Copy' },
        { role: 'paste', label: 'Paste' },
        { role: 'selectAll', label: 'Select All' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Fullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize', label: 'Minimize' },
        { role: 'close', label: 'Close' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Table d\'Adrian',
          click: () => {
            shell.openExternal('https://tabledadrian.com');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
  // Kill any processes using port 3000 before starting
  await killPortProcesses();
  createWindow();
  // Menu removed - explicitly set to null to hide menu bar
  Menu.setApplicationMenu(null);
  
  // Register global keyboard shortcut for DevTools (Ctrl+Shift+I)
  if (isDev) {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.toggleDevTools();
      }
    });
    console.log('DevTools shortcut registered: Ctrl+Shift+I (or Cmd+Shift+I on Mac)');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Unregister shortcuts when app quits
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors (for development)
if (isDev) {
  app.commandLine.appendSwitch('ignore-certificate-errors');
}

