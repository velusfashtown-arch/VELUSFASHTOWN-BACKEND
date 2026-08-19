const Form = require('../../../../models/tenant/Forms/Form/Form');
const FormSubmission = require('../../../../models/tenant/Forms/FormSubmission/FormSubmission');
const Website = require('../../../../models/tenant/Website');
const logger = require('../../../../utils/logger');
const { FORM_TYPES, FORM_SUBMISSION_STATUS } = require('../../../../constants');

// A demo "Contact Us" form plus a few visitor submissions, so the Form
// Builder / Submissions / Integrations screens aren't empty on first login.
async function seedForms() {
  const forceReset = String(process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

  const website = await Website.findOne({ isDefault: true });
  if (!website) {
    logger.info('Default website not found yet — skipping form seed.');
    return;
  }

  if (forceReset) {
    await FormSubmission.deleteMany({ website: website._id });
    await Form.deleteMany({ website: website._id });
  }

  const existingCount = await Form.countDocuments({ website: website._id });
  if (existingCount > 0) {
    logger.info(`Forms already seeded (${existingCount}). Skipping.`);
    return;
  }

  const form = await Form.create({
    website: website._id,
    name: 'Contact Us',
    type: FORM_TYPES.CONTACT_US,
    title: 'Get in touch',
    description: "Have a question about an order or a saree? Send us a message and we'll reply within 24 hours.",
    fields: [
      { key: 'name', label: 'Your Name', fieldType: 'text', required: true, placeholder: 'Priya Sharma' },
      { key: 'email', label: 'Email', fieldType: 'text', required: true, placeholder: 'you@example.com' },
      { key: 'phone', label: 'Phone', fieldType: 'text', required: false, placeholder: '98765 43210' },
      {
        key: 'subject', label: 'Subject', fieldType: 'dropdown', required: true,
        options: [
          { value: 'order', label: 'Order Query' },
          { value: 'product', label: 'Product Question' },
          { value: 'return', label: 'Return / Exchange' },
          { value: 'other', label: 'Other' },
        ],
      },
      { key: 'message', label: 'Message', fieldType: 'textarea', required: true, placeholder: 'How can we help?' },
    ],
    submitButtonText: 'Send Message',
    successMessage: "Thanks for reaching out! We'll get back to you within 24 hours.",
    isActive: true,
  });

  const submissions = [
    {
      form: form._id,
      website: website._id,
      status: FORM_SUBMISSION_STATUS.NEW,
      data: [
        { key: 'name', value: 'Riya Mehta' },
        { key: 'email', value: 'riya.mehta@example.com' },
        { key: 'phone', value: '9812345670' },
        { key: 'subject', value: 'order' },
        { key: 'message', value: 'My order was placed 3 days ago but the status still shows Processing. Could you check?' },
      ],
    },
    {
      form: form._id,
      website: website._id,
      status: FORM_SUBMISSION_STATUS.READ,
      data: [
        { key: 'name', value: 'Aisha Khan' },
        { key: 'email', value: 'aisha.khan@example.com' },
        { key: 'phone', value: '9823456781' },
        { key: 'subject', value: 'product' },
        { key: 'message', value: 'Do you have the Banarasi silk saree in a different color?' },
      ],
    },
    {
      form: form._id,
      website: website._id,
      status: FORM_SUBMISSION_STATUS.ARCHIVED,
      data: [
        { key: 'name', value: 'Neha Joshi' },
        { key: 'email', value: 'neha.joshi@example.com' },
        { key: 'phone', value: '' },
        { key: 'subject', value: 'return' },
        { key: 'message', value: 'I would like to exchange my saree for a smaller blouse size.' },
      ],
    },
  ];

  await FormSubmission.insertMany(submissions);
  await Form.updateOne({ _id: form._id }, { $inc: { submissionCount: submissions.length } });
  logger.info(`Seeded 1 form with ${submissions.length} submissions`);
}

module.exports = { seedForms };
