import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTurboAreas } from "@/lib/turbo";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const governmentId = Number(req.nextUrl.searchParams.get("governmentId"));
  if (!governmentId) {
    return NextResponse.json({ error: "governmentId is required" }, { status: 400 });
  }

  const areas = await getTurboAreas(governmentId);
  return NextResponse.json({ areas });
}
