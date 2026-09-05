import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

export async function GET() {
  const logoBuffer = readFileSync(join(process.cwd(), "public/brand/logo.webp"));
  const logoSrc = `data:image/webp;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#d14f83",
      }}
    >
      <img src={logoSrc} width={520} height={180} />
    </div>,
    { width: 1200, height: 630 }
  );
}
