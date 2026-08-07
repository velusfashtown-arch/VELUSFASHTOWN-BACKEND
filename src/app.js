const express = require('express');
const path = require('path');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const { configureRazorpay } = require('./config/razorpay');
const { createTransport } = require('./config/mail');
const { validateEnv, appConfig } = require('./config/app');

// Must run before any model file is required (routes -> controllers ->
// services -> repositories -> models), since the plugin only attaches to
// schemas constructed after it registers.
require('./config/mongoosePlugins')();

const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');
const { errorHandler, requestLogger, apiLimiter, securityHeaders, corsMiddleware, sanitizeMongo, xssProtection } = require('./middleware');
const { trackVisit } = require('./controllers/website/AnalyticsController');

// Validate environment variables
validateEnv();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(sanitizeMongo);
app.use(xssProtection);

// ─── General Middleware ───────────────────────────────────────────────────
app.use(compression());
app.use(express.json({
  limit: '10mb',
  // Keep the raw bytes around for routes that need to verify a webhook
  // signature (e.g. Razorpay) — re-serializing req.body would not
  // reliably match the signed payload.
  verify: (req, res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// ─── Static Files ─────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── API Rate Limiting ────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── API Documentation (Swagger) ─────────────────────────────────────────
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
customSiteTitle: "VELU'S FASHTOWN API Docs",
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
message: "VELU'S FASHTOWN Backend is running",
    data: {
      environment: appConfig.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ─── Initialize Services ──────────────────────────────────────────────────
let server = null;

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  // Configure Cloudinary
  configureCloudinary();

  // Configure Razorpay
  configureRazorpay();

  // Configure Mail transport
  createTransport();

  // Seed data
  await require('./seed').runSeeds();

  // Start server
  const PORT = appConfig.port;
  server = app.listen(PORT, () => {
    console.log(`\n======================================`);
console.log(`  🚀 VELU'S FASHTOWN Backend Server`);
    console.log(`  Environment: ${appConfig.nodeEnv}`);
    console.log(`  Port: ${PORT}`);
    console.log(`  API: http://localhost:${PORT}/api`);
    console.log(`======================================\n`);
  });

  return server;
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Force shutdown after 10s
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = { app, startServer };

