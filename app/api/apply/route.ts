import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/session";
import { db } from "@/lib/db";
import { deliver } from "@/lib/webhook";
import { validate, Question, Answers } from "@/lib/validate";
export async function POST(req: Request) {
  const user = await getUserSession();               // identity comes ONLY from the signed session
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b.slug !== "string" || (b.lang !== "ar" && b.lang !== "en") || typeof b.answers !== "object" || b.answers === null)
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  const sb = db();
  const { data: form } = await sb.from("forms").select("id,is_open,is_archived,current_version,success_ar,success_en").eq("slug", b.slug).maybeSingle();
  if (!form || form.is_archived) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (!form.is_open) return NextResponse.json({ error: "FORM_CLOSED" }, { status: 403 });
  const { data: ver } = await sb.from("form_versions").select("questions").eq("form_id", form.id).eq("version", form.current_version).single();
  const qs = (ver?.questions ?? []) as Question[];
  // keep only known, enabled question ids (ignore anything extra the client sent)
  const clean: Answers = {};
  for (const q of qs) if (q.enabled && q.type !== "heading" && b.answers[q.id] !== undefined) clean[q.id] = b.answers[q.id];
  const errors = validate(qs, clean, b.lang);
  if (Object.keys(errors).length) return NextResponse.json({ error: "VALIDATION", errors }, { status: 422 });
  const { data: code, error } = await sb.rpc("submit_application", { p_form_id: form.id, p_discord_id: user.discordId,
    p_username: user.username, p_avatar: user.avatar, p_lang: b.lang, p_answers: clean });
  if (error) {
    if (error.message.includes("ALREADY_APPLIED")) return NextResponse.json({ error: "ALREADY_APPLIED" }, { status: 409 });
    if (error.message.includes("FORM_CLOSED")) return NextResponse.json({ error: "FORM_CLOSED" }, { status: 403 });
    return NextResponse.json({ error: "SERVER" }, { status: 500 });   // no DB details leaked
  }
  try { const { data: d } = await sb.from("webhook_deliveries").select("id,applications!inner(code)").eq("applications.code", code).maybeSingle(); if (d) await deliver(d.id); } catch {}
  return NextResponse.json({ code });
}
