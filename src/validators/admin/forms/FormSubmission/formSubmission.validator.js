const { z } = require('zod');
const { FORM_SUBMISSION_STATUS } = require('../../../../constants');

const updateSubmissionStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(FORM_SUBMISSION_STATUS)),
  }),
});

module.exports = {
  updateSubmissionStatusSchema,
};
