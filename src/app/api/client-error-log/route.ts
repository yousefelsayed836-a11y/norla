import { NextRequest, NextResponse } from "next/server";

// Temporary diagnostic endpoint: logs uncaught client-side JS errors (with
// device/browser info) to the server console so real production errors from
// devices we can't manually test on (e.g. older iPhones) show up in `pm2 logs`.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  console.error("[client-error]", JSON.stringify(body));
  return NextResponse.json({ ok: true });
}
