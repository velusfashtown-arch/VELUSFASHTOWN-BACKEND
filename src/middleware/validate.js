const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware to validate request body/query/params using Zod schemas.
 * Usage: validate(loginSchema) - validates req.body
 *        validate(schema, 'query') - validates req.query
 *        validate(schema, 'params') - validates req.params
 */
const validate = (schema, source = 'body') => {
  // Check if schema expects a nested object (e.g., { body: z.object({...}) })
  // or a flat object (e.g., z.object({...})) — determined once per schema,
  // not per request, and kept outside try/catch so it's visible to the
  // error handler below.
  const schemaShape = schema.shape || {};
  const hasSourceWrapper = Object.keys(schemaShape).length === 1 && schemaShape[source];

  return (req, res, next) => {
    try {
      let parsed;
      if (hasSourceWrapper) {
        // Schema wraps with source key: { body: z.object({...}) }
        parsed = schema.parse({ [source]: req[source] });
        req[source] = parsed[source];
      } else {
        // Schema is flat: z.object({...})
        parsed = schema.parse(req[source]);
        req[source] = parsed;
      }
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = (error.issues || []).map((e) => ({
          field: e.path.slice(hasSourceWrapper ? 1 : 0).join('.') || e.path[0],
          message: e.message,
        }));
        return ApiResponse.badRequest(res, {
          message: 'Validation failed',
          errors,
        });
      }
      logger.error('Validation middleware error:', error);
      return ApiResponse.badRequest(res, { message: 'Invalid request data' });
    }
  };
};

module.exports = { validate };

