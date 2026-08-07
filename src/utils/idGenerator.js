const Counter = require('../models/Counter');

async function getNextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

async function generateProductId() {
  const seq = await getNextSequence('productId');
  return `PRD${String(seq).padStart(5, '0')}`;
}

module.exports = { getNextSequence, generateProductId };
