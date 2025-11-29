const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const storeRoutes = require('./routes/store');
const ratingRoutes = require('./routes/rating');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/rating', ratingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Database connection and server start
const BROWSER_FLAG_FILE = path.join(__dirname, '.browser-opened.flag');
let browserOpenAttempted = false; // In-memory flag to prevent multiple opens in same process
let browserOpenTimeout = null; // Track the timeout to prevent multiple timeouts
let browserOpening = false; // Additional flag to prevent concurrent opens

// Helper function to open browser using exec (fallback)
const openBrowserFallback = (url) => {
  const platform = process.platform;
  let command;
  let shell = false; // Use shell for Windows commands
  
  if (platform === 'win32') {
    // Windows: use cmd /c start to work in both CMD and PowerShell
    // Use /min to minimize and prevent multiple windows
    command = `cmd /c start /min "" "${url}"`;
    shell = true;
  } else if (platform === 'darwin') {
    // macOS: use open command
    command = `open "${url}"`;
  } else {
    // Linux: use xdg-open
    command = `xdg-open "${url}"`;
  }
  
  exec(command, { shell }, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Could not open browser automatically:', error.message);
      console.log(`\n📌 Please manually open: ${url}\n`);
    } else {
      console.log('✅ Browser opened using fallback method\n');
    }
  });
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database (create tables if they don't exist, preserve existing data)
    await sequelize.sync();
    console.log('Database synchronized successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      const url = `http://localhost:${PORT}`;
      
      // Auto-open browser in development mode
      const isProduction = process.env.NODE_ENV === 'production';
      
      // Only check in-memory flags to prevent multiple opens within the same process
      // Don't use flag file - we want each new `npm run dev` to open a new tab
      // The flag file will be cleaned up on process exit, allowing new runs to open tabs
      
      // Multiple checks to prevent multiple opens within same process/nodemon restarts
      const shouldOpenBrowser = !isProduction && 
                                 !browserOpenAttempted && 
                                 !browserOpenTimeout && 
                                 !browserOpening;
      
      if (shouldOpenBrowser) {
        // Set ALL flags immediately to prevent multiple opens within this process
        browserOpenAttempted = true;
        browserOpening = true;
        
        // Clean up on process exit (this allows new `npm run dev` to open a new tab)
        const cleanup = () => {
          try {
            // Clean up flag file if it exists
            if (fs.existsSync(BROWSER_FLAG_FILE)) {
              fs.unlinkSync(BROWSER_FLAG_FILE);
            }
            if (browserOpenTimeout) {
              clearTimeout(browserOpenTimeout);
            }
            browserOpening = false;
            browserOpenAttempted = false; // Reset so new process can open
          } catch (err) {
            // Ignore cleanup errors
          }
        };
        
        // Only set cleanup handlers once
        if (!process.listeners('SIGINT').includes(cleanup)) {
          process.once('SIGINT', cleanup);
          process.once('SIGTERM', cleanup);
          process.once('exit', cleanup);
        }
        
        // Open browser after a short delay to ensure server is ready
        browserOpenTimeout = setTimeout(() => {
          // Double-check we should still open (prevent race conditions)
          if (!browserOpening) {
            browserOpenTimeout = null;
            return;
          }
          
          console.log(`\n🌐 Opening browser at ${url}...\n`);
          
          // Try using the 'open' package first (it's in devDependencies)
          try {
            const open = require('open');
            // Open browser - allow new tabs for each new npm run dev
            open(url, { wait: false }).then(() => {
              console.log('✅ Browser opened successfully\n');
              browserOpening = false;
            }).catch((error) => {
              console.log('⚠️  open package failed, trying fallback...');
              openBrowserFallback(url);
              browserOpening = false;
            });
          } catch (err) {
            // Fallback to exec if 'open' package is not available
            console.log('⚠️  Using fallback method...');
            openBrowserFallback(url);
            browserOpening = false;
          }
          
          browserOpenTimeout = null;
        }, 2000); // 2 second delay to ensure server is fully ready
      } else {
        // Server is ready but browser won't open
        if (!isProduction) {
          console.log(`\n📋 Server ready at ${url}`);
          if (browserOpenAttempted) {
            console.log('ℹ️  Browser open already attempted in this process\n');
          } else if (browserOpenTimeout) {
            console.log('ℹ️  Browser open timeout is set\n');
          } else {
            console.log('ℹ️  Browser will not open (check conditions above)\n');
          }
        } else {
          console.log(`Server ready at ${url}`);
        }
      }
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
