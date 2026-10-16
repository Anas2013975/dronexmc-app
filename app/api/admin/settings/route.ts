import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, audit } from "@/lib/admin";
const url = z.string().url().refine((u) => /^https?:\/\//.test(u)).or(z.literal(""));
const S = z.object({ site_name: z.string().max(80), discord_url: url, store_url: url, site_url: url, terms_url: url, privacy_url: url }).partial();
export async function POST(req: Request) {
  const a = await guardApi(req); if (a instanceof Response) return a;
  const p = S.safeParse(await req.json().catch(() => ({}))); if (!p.success) return Response.json({ error: "VALIDATION" }, { status: 422 });
  const rows = Object.entries(p.data).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
  if (rows.length) { const { error } = await db().from("site_settings").upsert(rows); if (error) return Response.json({ error: "SERVER" }, { status: 500 }); }
  await audit(a.id, "settings_updated"); return Response.json({ ok: true });
}
