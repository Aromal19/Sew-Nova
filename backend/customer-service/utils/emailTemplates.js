/**
 * SewNova Email Templates
 * All templates use inline CSS only (email clients strip <style> tags).
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BRAND_COLOR  = '#7C3AED'; // purple-600
const BRAND_PINK   = '#EC4899';

/**
 * Booking Confirmation Email with embedded GST breakdown
 *
 * @param {Object} booking - Mongoose booking document (or plain object)
 * @param {Object} meta    - { customerName, tailorName, fabricName }
 */
function bookingConfirmationTemplate(booking, meta = {}) {
  const bookingId    = booking?._id?.toString() || booking?.bookingId || 'N/A';
  const shortId      = bookingId.substring(0, 10).toUpperCase();
  const customerName = meta.customerName || 'Customer';
  const tailorName   = meta.tailorName   || 'Assigned Tailor';
  const fabricName   = meta.fabricName   || booking?.fabricDetails?.name || 'Selected Fabric';
  const garmentType  = booking?.orderDetails?.garmentType || 'Custom Garment';
  const quantity     = booking?.orderDetails?.quantity || 1;
  const totalAmount  = booking?.pricing?.totalAmount || 0;
  const trackingUrl  = `${FRONTEND_URL}/track/${bookingId}`;

  // GST calculation (SAC 9988 — 5% total)
  const baseAmount = Number(totalAmount) || 0;
  const cgst       = (baseAmount * 0.025).toFixed(2);
  const sgst       = (baseAmount * 0.025).toFixed(2);
  const grandTotal = (baseAmount + parseFloat(cgst) + parseFloat(sgst)).toFixed(2);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND_COLOR},${BRAND_PINK});padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 8px 0;letter-spacing:-0.5px;">SewNova</h1>
            <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Custom Tailoring Platform</p>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:32px;text-align:center;">
            <div style="width:64px;height:64px;background-color:#ecfdf5;border-radius:50%;margin:0 auto 16px;line-height:64px;font-size:28px;">✅</div>
            <h2 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 8px 0;">Your booking is confirmed!</h2>
            <p style="color:#6b7280;font-size:14px;margin:0;">Hi ${customerName}, your order has been successfully placed.</p>
          </td>
        </tr>

        <!-- Booking Summary -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
              <tr><td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Booking Summary</p>
              </td></tr>
              <tr><td style="padding:16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#374151;">
                  <tr><td style="padding:6px 0;color:#6b7280;">Booking ID</td><td style="padding:6px 0;text-align:right;font-weight:600;font-family:monospace;color:${BRAND_COLOR};">#${shortId}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;">Garment</td><td style="padding:6px 0;text-align:right;font-weight:600;text-transform:capitalize;">${garmentType} × ${quantity}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;">Tailor</td><td style="padding:6px 0;text-align:right;font-weight:600;">✂️ ${tailorName}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;">Fabric</td><td style="padding:6px 0;text-align:right;font-weight:600;">🧵 ${fabricName}</td></tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- GST Breakdown -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf5ff;border-radius:12px;border:1px solid #e9d5ff;">
              <tr><td style="padding:16px 20px;border-bottom:1px solid #e9d5ff;">
                <p style="margin:0;font-size:11px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:1px;">GST Breakdown (SAC 9988)</p>
              </td></tr>
              <tr><td style="padding:16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#374151;">
                  <tr><td style="padding:6px 0;color:#6b7280;">Subtotal</td><td style="padding:6px 0;text-align:right;font-weight:600;">₹${baseAmount.toFixed(2)}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;">CGST @ 2.5%</td><td style="padding:6px 0;text-align:right;font-weight:600;">₹${cgst}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;">SGST @ 2.5%</td><td style="padding:6px 0;text-align:right;font-weight:600;">₹${sgst}</td></tr>
                  <tr><td colspan="2" style="border-top:2px solid #d8b4fe;padding-top:10px;"></td></tr>
                  <tr><td style="padding:6px 0;font-weight:800;color:${BRAND_COLOR};font-size:15px;">Grand Total</td><td style="padding:6px 0;text-align:right;font-weight:800;color:${BRAND_COLOR};font-size:15px;">₹${grandTotal}</td></tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Track CTA -->
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <a href="${trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,${BRAND_COLOR},${BRAND_PINK});color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:12px;">
              🚚 Track Your Order
            </a>
            <p style="color:#9ca3af;font-size:11px;margin:12px 0 0 0;">Or copy: ${trackingUrl}</p>
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td style="padding:0 32px 32px;">
            <p style="font-size:14px;font-weight:700;color:#111827;margin:0 0 16px 0;">What happens next?</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                { num: '1', title: 'Fabric Shipped', desc: 'Your vendor will pack and ship the fabric to the tailor.' },
                { num: '2', title: 'Garment Made',   desc: 'The tailor will craft your custom garment to your measurements.' },
                { num: '3', title: 'Delivered!',      desc: 'Your finished garment will be delivered right to your door.' },
              ].map(s => `
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:36px;">
                    <div style="width:28px;height:28px;background-color:${BRAND_COLOR};color:#ffffff;border-radius:50%;text-align:center;line-height:28px;font-size:12px;font-weight:700;">${s.num}</div>
                  </td>
                  <td style="padding:8px 0 8px 12px;">
                    <p style="margin:0;font-size:13px;font-weight:600;color:#111827;">${s.title}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${s.desc}</p>
                  </td>
                </tr>
              `).join('')}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} SewNova. All rights reserved.</p>
            <p style="margin:4px 0 0;font-size:10px;color:#d1d5db;">This is an automated email. Please do not reply.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { bookingConfirmationTemplate };
