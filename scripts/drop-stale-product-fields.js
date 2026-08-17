// drop-stale-product-fields.js
//
// One-time cleanup: removes the legacy hard-coded product attribute fields
// (sareeFabric, blouseFabric, workType, borderType, palluType, sareeLength,
// blouseLength, primaryColor, secondaryColor, pattern, printType, style,
// blouseIncluded, blouseType, blouseColor) from the products collection.
//
// Product attributes are now stored dynamically via the `customFields` array,
// so the old fixed columns are no longer used. This script also drops the
// stale `slug_1` unique index on the products collection since the slug field
// has been removed from the Product model.
//
// Usage:
//   node scripts/drop-stale-product-fields.js
//
// Safe to re-run – it no-ops if the fields/index are already gone.

require('dotenv').config();
const mongoose = require('mongoose');

const adminUri = process.env.MONGODB_ADMIN_URI;

if (!adminUri) {
  console.error('MONGODB_ADMIN_URI is missing in environment variables');
  process.exit(1);
}

const FIELDS_TO_DROP = [
  'slug',
  'sareeFabric',
  'blouseFabric',
  'workType',
  'borderType',
  'palluType',
  'sareeLength',
  'blouseLength',
  'primaryColor',
  'secondaryColor',
  'pattern',
  'printType',
  'style',
  'blouseIncluded',
  'blouseType',
  'blouseColor',
];

async function dropStaleProductFields() {
  const conn = mongoose.createConnection(adminUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  await conn.asPromise();

  const db = conn.db;
  const coll = db.collection('products');

  // 1. Drop the stale `slug_1` unique index (the slug field no longer exists)
  try {
    const indexes = await coll.indexes();
    for (const ix of indexes) {
      if (ix.name === 'slug_1') {
        await coll.dropIndex('slug_1');
        console.log('Dropped slug_1 index from products');
      }
    }
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound') {
      console.log('Collection products does not exist — skipping index cleanup');
    } else {
      console.error('Error dropping slug_1 index:', err.message);
    }
  }

  // 2. Unset the stale fields from all product documents
  const unset = {};
  FIELDS_TO_DROP.forEach((field) => { unset[field] = ''; });

  try {
    const result = await coll.updateMany({}, { $unset: unset });
    console.log(`Removed stale fields from ${result.modifiedCount} product document(s)`);
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound') {
      console.log('Collection products does not exist — skipping field cleanup');
    } else {
      console.error('Error removing stale fields:', err.message);
    }
  }

  await conn.close();
  console.log('Done. Stale product fields removed.');
}

dropStaleProductFields().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});