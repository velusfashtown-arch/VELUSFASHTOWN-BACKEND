const mongoose = require('mongoose');

/**
 * Applied to every schema. Composes with any transform a schema already
 * defines (e.g. Admin/Customer strip password fields) and additionally
 * hides _id/__v from JSON output, exposing `id` instead.
 */
function hideMongoIdPlugin(schema) {
  const existingToJSON = schema.options.toJSON || {};
  const existingTransform = existingToJSON.transform;

  schema.set('toJSON', {
    virtuals: true,
    ...existingToJSON,
    transform(doc, ret, options) {
      if (typeof existingTransform === 'function') {
        ret = existingTransform(doc, ret, options) || ret;
      }
      if (ret._id !== undefined) {
        if (ret.id === undefined) ret.id = ret._id.toString();
        delete ret._id;
      }
      delete ret.__v;
      return ret;
    },
  });
}

module.exports = function registerMongoosePlugins() {
  mongoose.plugin(hideMongoIdPlugin);
};
