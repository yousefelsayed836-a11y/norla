import { Resend } from "resend";
import { formatEGP } from "@/lib/format";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
export const FROM = "Norla Designs <orders@norla-designs.com>";

export async function sendAdminOrderNotification(params: {
  to: string;
  orderNo: number;
  customerName: string;
  phone: string | null;
  whatsappNumber?: string | null;
  total: number;
  depositAmount: number;
}) {
  if (!resend || !params.to) return;
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
          <p><strong>Total:</strong> ${formatEGP(params.total)}</p>
          <p><strong>Deposit due:</strong> ${formatEGP(params.depositAmount)}</p>
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
  depositPercent: number;
  depositAmount: number;
}) {
  if (!resend || !params.to) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `تم استلام طلبك #${params.orderNo} — Norla Designs`,
      html: `
        <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:0 auto;text-align:right">
          <h2 style="color:#d14f83">شكرًا لكِ، ${params.customerName}! 🎉</h2>
          <p>تم استلام طلبك رقم <strong>#${params.orderNo}</strong> بنجاح.</p>
          <p>هنتواصل معاكِ قريبًا على الواتساب لترتيب دفع العربون
            (${formatEGP(params.depositAmount)} — ${params.depositPercent}% من قيمة الطلب)
            عن طريق إنستا باي أو فودافون كاش أو كاش عند الاستلام.</p>
          <p style="color:#888;font-size:13px;margin-top:20px">
            We've received your order and will contact you on WhatsApp shortly to arrange the deposit payment.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send customer order confirmation", err);
  }
}
