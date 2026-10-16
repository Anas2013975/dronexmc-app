import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, audit } from "@/lib/admin";
import { sendTo } from "@/lib/webhook";
export async function POST(req: Request) {
  const a = await guardApi(req); if (a instanceof Response) return a;
  const p = z.object({ slug: z.string().max(80) }).safeParse(await req.json().catch(() => ({}))); if (!p.success) return Response.json({ error: "VALIDATION" }, { status: 422 });
  const { data: f } = await db().from("forms").select("webhook_url,name_en").eq("slug", p.data.slug).maybeSingle();
  if (!f?.webhook_url) return Response.json({ error: "NO_WEBHOOK" }, { status: 400 });
  try { await sendTo(f.webhook_url, { embeds: [{ title: "DronexMC webhook test", description: f.name_en, color: 0x00d4ff }] }); await audit(a.id, "webhook_test", p.data.slug); return Response.json({ ok: true }); }
  catch (e) { return Response.json({ error: (e as Error).message }, { status: 502 }); }
}
