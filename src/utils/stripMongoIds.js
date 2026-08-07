const mongoose = require('mongoose');

/**
 * Mirrors what the global Mongoose toJSON plugin (config/mongoosePlugins.js)
 * does, but for plain objects returned by .lean() queries, which never go
 * through a document's toJSON() and so bypass that plugin entirely.
 * Recursively renames _id -> id and drops __v, including in populated
 * sub-documents and arrays (e.g. variants, populated category/collection).
 */
function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  if (value instanceof Date) return false;
  if (value instanceof mongoose.Types.ObjectId) return false;
  if (Buffer.isBuffer(value)) return false;
  return true;
}

function stripMongoIds(input) {
  if (Array.isArray(input)) {
    return input.map(stripMongoIds);
  }
  if (!isPlainObject(input)) {
    return input;
  }

  const out = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === '__v') continue;
    if (key === '_id') {
      out.id = value instanceof mongoose.Types.ObjectId ? value.toString() : value;
      continue;
    }
    out[key] = stripMongoIds(value);
  }
  return out;
}

module.exports = { stripMongoIds };
