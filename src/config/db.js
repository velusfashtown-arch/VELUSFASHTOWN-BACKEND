const logger = require('../utils/logger');
const { adminConnection, websiteConnection } = require('./connections');

const connectDB = async () => {
  try {
    await Promise.all([adminConnection.asPromise(), websiteConnection.asPromise()]);
    logger.info('MongoDB connected successfully (admin + website databases)');
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }

  for (const [label, conn] of [['admin', adminConnection], ['website', websiteConnection]]) {
    conn.on('error', (err) => {
      logger.error(`MongoDB (${label}) connection error`, { error: err.message });
    });
    conn.on('disconnected', () => {
      logger.warn(`MongoDB (${label}) disconnected`);
    });
  }
};

module.exports = connectDB;
