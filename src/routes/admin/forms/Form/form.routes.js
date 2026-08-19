const express = require('express');
const router = express.Router();
const FormController = require('../../../../controllers/admin/forms/Form/FormController');
const { authenticate, authorize, validate } = require('../../../../middleware');
const { createFormSchema, updateFormSchema } = require('../../../../validators/admin/forms/Form/form.validator');
const { ROLES } = require('../../../../constants');

router.use(authenticate);

const contentAllowed = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CONTENT_MANAGER];

// ─── Forms (customer-facing) ───────────────────────────────────────────
router.get('/forms/types', authorize(...contentAllowed), FormController.listTypes);
router.get('/:id/forms', authorize(...contentAllowed), FormController.list);
router.post('/:id/forms', authorize(...contentAllowed), validate(createFormSchema), FormController.create);
router.get('/:id/forms/:formId', authorize(...contentAllowed), FormController.getById);
router.put('/:id/forms/:formId', authorize(...contentAllowed), validate(updateFormSchema), FormController.update);
router.delete('/:id/forms/:formId', authorize(...contentAllowed), FormController.delete);

module.exports = router;
