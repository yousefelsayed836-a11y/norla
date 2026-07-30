import { Resend } from "resend";
import { formatEGP } from "@/lib/format";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
export const FROM = "Norla Designs <orders@norla-designs.com>";
const OWNER_EMAIL = "me.nouryossry00@gmail.com";
const SITE_URL = "https://norla-designs.com";
const EMAIL_FONT = "Georgia, 'Times New Roman', serif";

function absoluteImageUrl(url?: string) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

function paymentMethodLabel(method?: string | null) {
  if (method === "instapay") return "InstaPay";
  if (method === "vodafone_cash") return "Vodafone Cash";
  return null;
}

export async function sendAdminOrderNotification(params: {
  to: string;
  orderNo: number;
  customerName: string;
  phone: string | null;
  whatsappNumber?: string | null;
  items: { title: string; quantity: number; imageUrl?: string }[];
  total: number;
  depositAmount: number;
  paymentMethod?: string | null;
}) {
  if (!resend || !params.to) return;
  const methodLabel = paymentMethodLabel(params.paymentMethod);

  const itemsRows = params.items
    .map((item) => {
      const img = absoluteImageUrl(item.imageUrl);
      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;width:52px">
            ${
              img
                ? `<img src="${img}" width="44" height="44" alt="" style="display:block;width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #eee" />`
                : `<div style="width:44px;height:44px;border-radius:6px;background:#fbe4ee"></div>`
            }
          </td>
          <td style="padding:8px 0 8px 10px;border-bottom:1px solid #eee;color:#333;font-size:14px">
            ${item.title} <span style="color:#999">× ${item.quantity}</span>
          </td>
        </tr>`;
    })
    .join("");

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `New order #${params.orderNo} — ${params.customerName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#d14f83">New Order #${params.orderNo}</h2>
          <p><strong>Customer:</strong> ${params.customerName}</p>
          <p><strong>Phone:</strong> ${params.phone}</p>
          ${params.whatsappNumber ? `<p><strong>WhatsApp:</strong> ${params.whatsappNumber}</p>` : ""}
          <table style="width:100%;border-collapse:collapse;margin:12px 0">${itemsRows}</table>
          <p><strong>Total:</strong> ${formatEGP(params.total)}</p>
          <p><strong>Deposit due:</strong> ${formatEGP(params.depositAmount)}</p>
          ${methodLabel ? `<p><strong>Deposit payment method:</strong> ${methodLabel}</p>` : ""}
          <p style="color:#888;font-size:13px;margin-top:20px">Open the admin dashboard to view full order details.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send admin order notification", err);
  }
}

export async function sendCustomerOrderConfirmation(params: {
  to: string;
  orderNo: number;
  customerName: string;
  items: { title: string; price: number; quantity: number; imageUrl?: string }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  depositPercent: number;
  depositAmount: number;
  paymentMethod?: string | null;
  address: string;
  city: string;
  governorate: string;
}) {
  if (!resend || !params.to) return;
  const methodLabel = paymentMethodLabel(params.paymentMethod);

  const itemsRows = params.items
    .map((item) => {
      const img = absoluteImageUrl(item.imageUrl);
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee;width:60px">
            ${
              img
                ? `<img src="${img}" width="52" height="52" alt="" style="display:block;width:52px;height:52px;object-fit:cover;border-radius:6px;border:1px solid #eee" />`
                : `<div style="width:52px;height:52px;border-radius:6px;background:#fbe4ee"></div>`
            }
          </td>
          <td style="padding:12px 0 12px 12px;border-bottom:1px solid #eee;color:#333;font-size:14px;font-family:${EMAIL_FONT}">
            ${item.title}<br/>
            <span style="color:#999;font-size:12px;font-family:${EMAIL_FONT}">Qty: ${item.quantity}</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eee;color:#333;font-size:14px;text-align:right;font-family:${EMAIL_FONT}">
            ${formatEGP(item.price * item.quantity)}
          </td>
        </tr>`;
    })
    .join("");

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Order Confirmation #${params.orderNo} — Norla Designs`,
      html: `
        <div style="font-family:Georgia,'Times New Roman',serif;max-width:520px;margin:0 auto;color:#2b2226">
          <div style="text-align:center;padding:32px 0 24px;border-bottom:2px solid #d14f83">
            <h1 style="margin:0;font-size:22px;letter-spacing:2px;text-transform:uppercase;color:#2b2226">
              Norla Designs
            </h1>
          </div>

          <div style="padding:32px 0 8px">
            <p style="font-size:16px;margin:0 0 4px;font-family:${EMAIL_FONT}">Dear ${params.customerName},</p>
            <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 24px;font-family:${EMAIL_FONT}">
              Thank you for your order. We are pleased to confirm that order
              <strong>#${params.orderNo}</strong> has been received and is being prepared.
            </p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-family:${EMAIL_FONT}">
            ${itemsRows}
          </table>

          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;font-family:${EMAIL_FONT}">
            <tr>
              <td style="padding:4px 0;color:#777;font-family:${EMAIL_FONT}">Subtotal</td>
              <td style="padding:4px 0;text-align:right;color:#333;font-family:${EMAIL_FONT}">${formatEGP(params.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#777;font-family:${EMAIL_FONT}">Shipping</td>
              <td style="padding:4px 0;text-align:right;color:#333;font-family:${EMAIL_FONT}">${params.shippingFee === 0 ? "Free" : formatEGP(params.shippingFee)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0 4px;border-top:1px solid #eee;font-weight:bold;color:#2b2226;font-family:${EMAIL_FONT}">Total</td>
              <td style="padding:10px 0 4px;border-top:1px solid #eee;text-align:right;font-weight:bold;color:#d14f83;font-family:${EMAIL_FONT}">${formatEGP(params.total)}</td>
            </tr>
          </table>

          <div style="background:#fbe4ee;border-radius:8px;padding:16px 20px;margin-bottom:24px">
            <p style="margin:0;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#d14f83;font-weight:bold;font-family:${EMAIL_FONT}">
              Deposit Due Now (${params.depositPercent}%)
            </p>
            <p style="margin:6px 0 0;font-size:20px;font-weight:bold;color:#2b2226;font-family:${EMAIL_FONT}">
              ${formatEGP(params.depositAmount)}
            </p>
            ${methodLabel ? `<p style="margin:6px 0 0;font-size:13px;color:#2b2226;font-family:${EMAIL_FONT}">via ${methodLabel}</p>` : ""}
          </div>

          <div style="margin-bottom:24px">
            <p style="margin:0 0 4px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#999;font-family:${EMAIL_FONT}">
              Delivery Address
            </p>
            <p style="margin:0;font-size:14px;color:#333;line-height:1.5;font-family:${EMAIL_FONT}">
              ${params.address}<br/>
              ${params.city}, ${params.governorate}
            </p>
          </div>

          <p style="font-size:14px;line-height:1.6;color:#555;border-top:1px solid #eee;padding-top:20px">
            Our team will contact you on WhatsApp shortly to arrange payment of the deposit via
            InstaPay, Vodafone Cash, or cash. The remaining balance is due on delivery.
          </p>

          <div style="text-align:center;padding-top:24px;margin-top:8px;border-top:1px solid #eee">
            <p style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#aaa;margin:0">
              Norla Designs
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send customer order confirmation", err);
  }
}

export async function sendContactMessage(params: { name: string; email: string; message: string }) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: OWNER_EMAIL,
      replyTo: params.email,
      subject: `New message from ${params.name} — Contact Us`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#d14f83">New Contact Form Message</h2>
          <p><strong>From:</strong> ${params.name} (${params.email})</p>
          <p style="white-space:pre-line">${params.message}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send contact message", err);
  }
}
