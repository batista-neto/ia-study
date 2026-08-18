import { isCursorConfigured } from "@/lib/cursor-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    cursorConfigured: isCursorConfigured(),
    model: process.env.CURSOR_MODEL?.trim() || "composer-2.5",
  });
}
