const mongoose = require('mongoose');
const { adminConnection } = require('../config/connections');

// Generic atomic sequence counter, keyed by name (e.g. 'productId').
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

module.exports = adminConnection.model('Counter', CounterSchema);
