import { NextRequest, NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await sendContactMessage({
    name: name.trim().slice(0, 100),
    email: email.trim().slice(0, 200),
    message: message.trim().slice(0, 4000),
  });

  return NextResponse.json({ ok: true });
}
