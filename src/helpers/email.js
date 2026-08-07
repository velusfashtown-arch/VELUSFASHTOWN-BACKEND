const { getTransport, FROM, FRONTEND_URL } = require('../config/mail');
const logger = require('../utils/logger');

/**
 * Send an email. If SMTP is not configured, logs to console.
 */
async function sendMail({ to, subject, html }) {
  const transport = getTransport();
  if (!transport) {
    logger.info(`\n========== 📧 EMAIL (not sent - SMTP not configured) ==========`);
    logger.info(`To:      ${to}`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Body:\n${html.replace(/<[^>]*>/g, '')}`);
    logger.info(`============================================================\n`);
    return { messageId: 'logged-to-console' };
  }

  try {
    const info = await transport.sendMail({
      from: FROM(),
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
    throw err;
  }
}

/**
 * Send admin password-reset email.
 */
async function sendAdminResetEmail({ email, resetToken }) {
  const frontendUrl = FRONTEND_URL();
  const resetUrl = `${frontendUrl}/admin/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Aytin Admin</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e3a5f, #2d5f8a); padding: 40px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 600; }
    .header p { color: #b0c4de; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 36px 32px; }
    .body h2 { font-size: 20px; color: #1e3a5f; margin: 0 0 12px; }
    .body p { font-size: 14px; line-height: 1.7; color: #4b5563; margin: 0 0 16px; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: #1e3a5f; color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-size: 14px; font-weight: 600; border-radius: 8px; transition: background 0.2s; }
    .btn:hover { background: #2d5f8a; }
    .footer { padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 0 0 4px; }
    .fallback { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 20px; font-size: 12px; word-break: break-all; }
    .fallback a { color: #1e3a5f; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Aytin</h1>
      <p>Admin Panel</p>
    </div>
    <div class="body">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset the password for your <strong>admin account</strong> at Aytin.</p>
      <p>Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.</p>
      <div class="btn-wrap">
        <a class="btn" href="${resetUrl}" target="_blank">Reset Password</a>
      </div>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
      <div class="fallback">
        <strong>Button not working?</strong><br>
        Copy and paste this URL into your browser:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Aytin. All rights reserved.</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;

  return sendMail({
    to: email,
    subject: 'Password Reset - Aytin Admin',
    html,
  });
}

module.exports = {
  sendMail,
  sendAdminResetEmail,
};

