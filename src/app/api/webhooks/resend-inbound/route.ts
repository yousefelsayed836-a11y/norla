import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { FROM } from "@/lib/email";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FORWARD_TO = "me.nouryossry00@gmail.com";

export async function POST(req: NextRequest) {
  if (!resend || !process.env.RESEND_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const payload = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
  }

  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type === "email.received") {
    try {
      await resend.emails.receiving.forward({
        emailId: event.data.email_id,
        to: FORWARD_TO,
        from: FROM,
        passthrough: true,
      });
    } catch (err) {
      console.error("Failed to forward inbound email", err);
    }
  }

  return NextResponse.json({ ok: true });
}
