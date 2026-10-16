import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, audit } from "@/lib/admin";
import { isValidDiscordWebhook } from "@/lib/webhook-url";
export async function POST(req: Request) {
  const a = await guardApi(req); if (a instanceof Response) return a;
  const p = z.object({ slug: z.string().max(80), url: z.string().max(300) }).safeParse(await req.json().catch(() => ({})));
  if (!p.success || (p.data.url && !isValidDiscordWebhook(p.data.url))) return Response.json({ error: "VALIDATION" }, { status: 422 });
  const { error } = await db().from("forms").update({ webhook_url: p.data.url || null }).eq("slug", p.data.slug);
  if (error) return Response.json({ error: "SERVER" }, { status: 500 });
  await audit(a.id, "webhook_config", p.data.slug); return Response.json({ ok: true });   // URL itself is never logged
}
