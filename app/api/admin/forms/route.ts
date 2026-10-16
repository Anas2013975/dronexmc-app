import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, audit } from "@/lib/admin";
export async function POST(req: Request) {
  const a = await guardApi(req); if (a instanceof Response) return a;
  const p = z.object({ slug: z.string().regex(/^[a-z0-9-]{2,60}$/), prefix: z.string().regex(/^[A-Z]{2,5}$/), name_ar: z.string().min(1).max(100), name_en: z.string().min(1).max(100) }).safeParse(await req.json().catch(() => ({})));
  if (!p.success) return Response.json({ error: "VALIDATION" }, { status: 422 });
  const sb = db(); const { data: f, error } = await sb.from("forms").insert({ ...p.data, is_open: false }).select("id").single();
  if (error) return Response.json({ error: error.code === "23505" ? "SLUG_EXISTS" : "SERVER" }, { status: error.code === "23505" ? 409 : 500 });
  await sb.from("form_versions").insert({ form_id: f.id, version: 1, questions: [] }); await audit(a.id, "form_created", f.id);
  return Response.json({ id: f.id });
}
