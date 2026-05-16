const nodemailer = require('nodemailer');

/**
 * Generic mail sender for SewNova.
 * Config from env: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS
 * Never throws — logs warning/error and returns { success, error }
 */
async function sendMail(to, subject, html) {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;

  // Guard: missing credentials
  if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS) {
    console.warn('[Mailer] ⚠️  MAIL_* env vars not configured — skipping email send.');
    return { success: false, error: 'Mail credentials not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: parseInt(MAIL_PORT, 10) || 587,
      secure: parseInt(MAIL_PORT, 10) === 465,
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });

    const info = await transporter.sendMail({
      from: `"SewNova" <${MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[Mailer] ✅ Email sent to ${to} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Mailer] ❌ Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendMail };
