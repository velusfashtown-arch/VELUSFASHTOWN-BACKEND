const express = require('express');
const router = express.Router();
const FormSubmissionController = require('../../../../controllers/admin/forms/FormSubmission/FormSubmissionController');
const { authenticate, authorize, validate } = require('../../../../middleware');
const { updateSubmissionStatusSchema } = require('../../../../validators/admin/forms/FormSubmission/formSubmission.validator');
const { ROLES } = require('../../../../constants');

router.use(authenticate);

const contentAllowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CONTENT_MANAGER];

// ─── Form Submissions ───────────────────────────────────────────────────
router.get('/:id/forms/:formId/submissions', authorize(...contentAllowed), FormSubmissionController.list);
router.get('/:id/submissions', authorize(...contentAllowed), FormSubmissionController.list);
router.get('/:id/submissions/:submissionId', authorize(...contentAllowed), FormSubmissionController.getById);
router.put('/:id/submissions/:submissionId', authorize(...contentAllowed), validate(updateSubmissionStatusSchema), FormSubmissionController.updateStatus);
router.delete('/:id/submissions/:submissionId', authorize(...contentAllowed), FormSubmissionController.delete);

module.exports = router;
