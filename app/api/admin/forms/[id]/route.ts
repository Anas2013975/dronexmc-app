import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, audit } from "@/lib/admin";
const opt = (n: number) => z.string().max(n).transform((s) => s || null).nullable().optional();
const S = z.object({ name_ar: z.string().min(1).max(100), name_en: z.string().min(1).max(100), description_ar: z.string().max(400), description_en: z.string().max(400),
  icon: z.string().max(30), color: z.string().regex(/^#[0-9a-fA-F]{6}$/), sort_order: z.coerce.number().int().min(0).max(1000), prefix: z.string().regex(/^[A-Z]{2,5}$/),
  success_ar: opt(500), success_en: opt(500), closed_ar: opt(500), closed_en: opt(500), is_open: z.boolean(), is_archived: z.boolean() }).partial();
async function update(req: Request, id: string) {
  const a = await guardApi(req); if (a instanceof Response) return a;
  const p = S.safeParse(await req.json().catch(() => ({}))); if (!p.success || !z.string().uuid().safeParse(id).success) return Response.json({ error: "VALIDATION" }, { status: 422 });
  const sb = db();
  if (p.data.is_open) { // cannot open a form that has no published questions
    const { data: f } = await sb.from("forms").select("current_version").eq("id", id).single();
    const { data: v } = await sb.from("form_versions").select("questions").eq("form_id", id).eq("version", f?.current_version ?? 1).single();
    if (!Array.isArray(v?.questions) || !v!.questions.some((q: any) => q.enabled && q.type !== "heading")) return Response.json({ error: "NO_PUBLISHED_QUESTIONS" }, { status: 409 });
  }
  const { error } = await sb.from("forms").update(p.data).eq("id", id); if (error) return Response.json({ error: "SERVER" }, { status: 500 });
  await audit(a.id, "form_updated", id); return Response.json({ ok: true });
}
export const PATCH = (r: Request, c: { params: { id: string } }) => update(r, c.params.id);
export const POST = PATCH;
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const a = await guardApi(req); if (a instanceof Response) return a; const sb = db();
  const { count } = await sb.from("applications").select("id", { count: "exact", head: true }).eq("form_id", params.id);
  if (count) return Response.json({ error: "HAS_APPLICATIONS_ARCHIVE_INSTEAD" }, { status: 409 });
  const { error } = await sb.from("forms").delete().eq("id", params.id); if (error) return Response.json({ error: "SERVER" }, { status: 500 });
  await audit(a.id, "form_deleted", params.id); return Response.json({ ok: true });
}
