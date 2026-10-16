import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, audit } from "@/lib/admin";
import { questionsSchema } from "@/lib/question-schema";
// PUT {questions, publish}: publish=false saves a draft; publish=true writes a NEW immutable version (old applications keep theirs).
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const a = await guardApi(req); if (a instanceof Response) return a;
  const b = await req.json().catch(() => ({})); const q = questionsSchema.safeParse(b.questions);
  if (!q.success || !z.string().uuid().safeParse(params.id).success) return Response.json({ error: "VALIDATION", detail: q.success ? undefined : q.error.issues[0]?.message }, { status: 422 });
  const sb = db(); const { data: f } = await sb.from("forms").select("current_version").eq("id", params.id).maybeSingle(); if (!f) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  if (!b.publish) { await sb.from("forms").update({ draft_questions: q.data }).eq("id", params.id); return Response.json({ ok: true, draft: true }); }
  if (!q.data.some((x) => x.enabled && x.type !== "heading")) return Response.json({ error: "NO_ANSWERABLE_QUESTIONS" }, { status: 422 });
  const v = f.current_version + 1;
  const { error } = await sb.from("form_versions").insert({ form_id: params.id, version: v, questions: q.data }); if (error) return Response.json({ error: "SERVER" }, { status: 500 });
  await sb.from("forms").update({ current_version: v, draft_questions: null }).eq("id", params.id); await audit(a.id, "form_published", `${params.id}@v${v}`);
  return Response.json({ ok: true, version: v });
}
