const { getTransport, FROM, FRONTEND_URL } = require('../config/mail');
const logger = require('../utils/logger');

// Brand palette (kept in sync with FRONTEND/src/styles.css :root and
// tailwind.config.js) — table-based layout + inline styles throughout
// since Outlook/Gmail strip <style> blocks and ignore flex/grid.
const BRAND = {
  ink: '#241b18',
  muted: '#756b65',
  terra: '#a74e3e',
  wine: '#6c2424',
  cream: '#f9f5ee',
  paper: '#fffdfa',
  line: 'rgba(47,31,25,.12)',
};

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
 * Shared brand shell every transactional email renders inside — a single
 * place to keep VELU'S FASHTOWN emails looking consistent. Table-based
 * markup for maximum compatibility across email clients.
 */
function renderEmailShell({ title, preheader = '', bodyHtml }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.cream};-webkit-text-size-adjust:100%;">
  ${preheader ? `<span style="display:none;font-size:1px;color:${BRAND.cream};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:${BRAND.paper};border:1px solid ${BRAND.line};">
          <tr>
            <td style="padding:38px 40px 28px;text-align:center;border-bottom:1px solid ${BRAND.line};">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:23px;letter-spacing:.09em;color:${BRAND.terra};font-weight:bold;">VELU'S FASHTOWN</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:.24em;color:${BRAND.muted};text-transform:uppercase;margin-top:8px;">Timeless Indian Fashion</div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 8px;font-family:Arial,Helvetica,sans-serif;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid ${BRAND.line};text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:${BRAND.muted};">This is an automated message — please do not reply to this email.</p>
              <p style="margin:6px 0 0;font-size:11px;line-height:1.6;color:${BRAND.muted};">&copy; ${year} VELU'S FASHTOWN. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderButton(label, url) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
  <tr>
    <td style="background:${BRAND.terra};">
      <a href="${url}" target="_blank" style="display:inline-block;padding:15px 38px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:bold;color:#fffaf5;text-decoration:none;">${label}</a>
    </td>
  </tr>
</table>`;
}

/**
 * Send admin password-reset email (link-based flow).
 */
async function sendAdminResetEmail({ email, resetToken }) {
  const resetUrl = `${FRONTEND_URL()}/admin/reset-password?token=${resetToken}`;

  const bodyHtml = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:600;color:${BRAND.ink};">Reset your password</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.75;color:${BRAND.muted};">We received a request to reset the password for your <strong style="color:${BRAND.ink};">admin account</strong> at VELU'S FASHTOWN.</p>
    <p style="margin:0;font-size:14px;line-height:1.75;color:${BRAND.muted};">Click below to choose a new password. This link is valid for <strong style="color:${BRAND.ink};">15 minutes</strong>.</p>
    ${renderButton('Reset Password', resetUrl)}
    <p style="margin:0 0 24px;font-size:13px;line-height:1.7;color:${BRAND.muted};">If you didn't request this, you can safely ignore this email — your password will stay the same.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};border:1px solid ${BRAND.line};">
      <tr>
        <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${BRAND.muted};word-break:break-all;">
          <strong style="color:${BRAND.ink};">Button not working?</strong> Copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color:${BRAND.terra};">${resetUrl}</a>
        </td>
      </tr>
    </table>`;

  return sendMail({
    to: email,
    subject: "Password Reset - VELU'S FASHTOWN Admin",
    html: renderEmailShell({
      title: 'Reset your admin password',
      preheader: 'Reset the password for your VELU’S FASHTOWN admin account. This link expires in 15 minutes.',
      bodyHtml,
    }),
  });
}

/**
 * Send customer password-reset OTP email (code-based flow).
 */
async function sendCustomerOtpEmail({ email, otp }) {
  const bodyHtml = `
    <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:600;color:${BRAND.ink};">Reset your password</h1>
    <p style="margin:0;font-size:14px;line-height:1.75;color:${BRAND.muted};">Use the verification code below to reset your VELU'S FASHTOWN account password. It expires in <strong style="color:${BRAND.ink};">10 minutes</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};border:1px solid rgba(167,78,62,.3);">
            <tr>
              <td style="padding:18px 40px;font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:bold;letter-spacing:.4em;color:${BRAND.terra};">${otp}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.7;color:${BRAND.muted};">If you didn't request this, you can safely ignore this email — your password will stay the same.</p>`;

  return sendMail({
    to: email,
    subject: "Your VELU'S FASHTOWN password reset code",
    html: renderEmailShell({
      title: 'Your password reset code',
      preheader: `Your VELU'S FASHTOWN verification code is ${otp}. It expires in 10 minutes.`,
      bodyHtml,
    }),
  });
}

module.exports = {
  sendMail,
  sendAdminResetEmail,
  sendCustomerOtpEmail,
};
