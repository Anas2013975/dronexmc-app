import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, audit } from "@/lib/admin";
import { deliver } from "@/lib/webhook";
export async function POST(req: Request) {
  const a = await guardApi(req); if (a instanceof Response) return a;
  const p = z.object({ id: z.string().uuid() }).safeParse(await req.json().catch(() => ({}))); if (!p.success) return Response.json({ error: "VALIDATION" }, { status: 422 });
  await db().from("webhook_deliveries").update({ attempts: 0 }).eq("id", p.data.id).neq("status", "sent");   // only failed/pending; sent ones are never resent
  const r = await deliver(p.data.id); await audit(a.id, "webhook_retry_" + r, p.data.id); return Response.json({ result: r });
}
