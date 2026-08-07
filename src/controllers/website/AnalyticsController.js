const { DailyVisit } = require('../../models/admin/Analytics');
const logger = require('../../utils/logger');

/*
 * Track a visitor (called from middleware).
 * Lightweight function that runs async and doesn't block the response.
 */
async function trackVisit({ ip, path: pagePath }) {
  try {
    const today = new Date().toISOString().split('T')[0];

    await DailyVisit.findOneAndUpdate(
      { date: today },
      {
        $inc: { count: 1, pageViews: 1 },
        $addToSet: { uniqueIPs: ip },
        $inc: { [`topPages.${pagePath || '/'}`]: 1 },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    logger.error(`Analytics trackVisit error: ${err.message}`);
  }
}

module.exports = { trackVisit };

