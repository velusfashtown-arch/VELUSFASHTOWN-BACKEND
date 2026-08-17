const Master = require('../../../../models/admin/Products/Masters/Master');
const logger = require('../../../../utils/logger');

// Every field the Add Product form rendered as a fixed, hardcoded section
// before the form became admin-configurable — seeded once so the form
// looks identical on day one, but every field's label/type/order/section
// is fully editable (and deletable) from the Masters admin screen.
// A field's `key` doubles as the Product form field it writes to when it
// matches one of `initialFormValues`' keys (see DynamicFields.js); any
// other key is stored generically in Product.customFields instead.
//
// Not included here — kept as their own fixed sections in the form
// because their structure doesn't fit a flat field (repeatable rows with
// nested image uploads, or a simple string array): Variants, Tags.
const SEED_FIELDS = [
  // ─── Basic Information ─────────────────────────────────────────────
  { key: 'productName', label: 'Product Name', fieldType: 'text', required: true, placeholder: 'e.g. Banarasi Silk Saree in Red & Gold', group: 'Basic Information' },
  { key: 'sku', label: 'SKU', fieldType: 'text', placeholder: 'Auto-generated', helpText: 'Auto-generated', group: 'Basic Information' },

  // ─── Pricing ────────────────────────────────────────────────────────
  { key: 'mrp', label: 'MRP (₹)', fieldType: 'number', required: true, placeholder: 'e.g. 4999', helpText: 'Maximum retail price', min: 0, group: 'Pricing' },
  { key: 'sellingPrice', label: 'Selling Price (₹)', fieldType: 'number', required: true, placeholder: 'e.g. 2999', min: 0, group: 'Pricing' },
  { key: 'costPrice', label: 'Cost Price (₹)', fieldType: 'number', placeholder: 'e.g. 1500', helpText: 'Your cost', min: 0, group: 'Pricing' },
  {
    key: 'gst', label: 'GST (%)', fieldType: 'dropdown', placeholder: 'Select GST', group: 'Pricing',
    options: [
      { value: '0', label: '0%' }, { value: '5', label: '5%' }, { value: '12', label: '12%' },
      { value: '18', label: '18%' }, { value: '28', label: '28%' },
    ],
  },

  // ─── Inventory ──────────────────────────────────────────────────────
  { key: 'stock', label: 'Stock Quantity', fieldType: 'number', required: true, placeholder: 'e.g. 100', min: 0, group: 'Inventory' },
  { key: 'lowStockAlert', label: 'Low Stock Alert', fieldType: 'number', placeholder: 'e.g. 10', helpText: 'Alert when stock below', min: 1, group: 'Inventory' },

  // ─── Images ─────────────────────────────────────────────────────────
  { key: 'images', label: 'Product Images', fieldType: 'image', required: true, multiple: true, helpText: 'First image is the thumbnail', group: 'Images' },

  // ─── Videos ─────────────────────────────────────────────────────────
  { key: 'productVideo', label: 'Product Video URL', fieldType: 'text', placeholder: 'https://...', group: 'Videos' },
  { key: 'youtubeUrl', label: 'YouTube URL', fieldType: 'text', placeholder: 'https://youtube.com/...', group: 'Videos' },
  { key: 'instagramReelUrl', label: 'Instagram Reel URL', fieldType: 'text', placeholder: 'https://instagram.com/...', group: 'Videos' },

  // ─── Description ────────────────────────────────────────────────────
  { key: 'shortDescription', label: 'Short Description', fieldType: 'textarea', placeholder: 'A brief summary shown in listings', maxLength: 300, group: 'Description' },
  { key: 'longDescription', label: 'Description', fieldType: 'richtext', placeholder: 'Full product description', group: 'Description' },
];

async function seedMasters() {
  const existingCount = await Master.countDocuments({});
  if (existingCount > 0) {
    logger.info(`Masters already seeded (${existingCount}). Skipping.`);
    return;
  }

  const docs = SEED_FIELDS.map((field, index) => ({
    ...field,
    order: index,
    required: field.required || false,
    options: field.options || [],
    // Seeded fields are the Add Product form's minimum viable set — they
    // can be edited (label, section, etc) but never deleted.
    isCore: true,
  }));

  await Master.insertMany(docs, { ordered: false });
  logger.info(`Seeded ${docs.length} master fields (the Add Product form)`);
}

module.exports = { seedMasters };
