// drop-stale-slug-index.js
//
// One-time cleanup: removes the legacy `slug_1` unique index that was left
// behind on the categories / subcategories collections by an older schema.
// The current Category and SubCategory models no longer define a `slug`
// field, but MongoDB keeps the index around, which breaks inserts with
// "E11000 duplicate key error ... index: slug_1 dup key: { slug: null }".
//
// Usage:
//   node scripts/drop-stale-slug-index.js
//
// Safe to re-run – it no-ops if the index is already gone.

require('dotenv').config();
const mongoose = require('mongoose');

const adminUri = process.env.MONGODB_ADMIN_URI;

if (!adminUri) {
  console.error('MONGODB_ADMIN_URI is missing in environment variables');
  process.exit(1);
}

async function dropStaleIndexes() {
  const conn = mongoose.createConnection(adminUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  await conn.asPromise();

  const db = conn.db;
  const staleIndexes = [{ coll: 'categories', names: ['slug_1', 'nameKey_1'] }, { coll: 'subcategories', names: ['slug_1', 'nameKey_1'] }];

  for (const { coll, names } of staleIndexes) {
    try {
      const indexes = await db.collection(coll).indexes();
      for (const ix of indexes) {
        if (names.includes(ix.name)) {
          await db.collection(coll).dropIndex(ix.name);
          console.log(`Dropped ${ix.name} from ${coll}`);
        }
      }
    } catch (err) {
      if (err.codeName === 'NamespaceNotFound') {
        console.log(`Collection ${coll} does not exist — skipping`);
      } else {
        console.error(`Error processing ${coll}:`, err.message);
      }
    }
  }

  await conn.close();
  console.log('Done. Stale slug indexes removed.');
}

dropStaleIndexes().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});