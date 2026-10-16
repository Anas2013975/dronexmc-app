import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  const r = NextResponse.json({ ok: true }); r.cookies.delete("dx_admin"); return r;
}
