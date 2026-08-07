const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: require('path').join(__dirname, '.env') });

const { startServer } = require('./src/app');

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

