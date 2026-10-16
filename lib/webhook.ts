import { db } from "./db";
import { isValidDiscordWebhook } from "./webhook-url";
import type { Question } from "./validate";
export const MAX_ATTEMPTS = 5;
const ST = { under_review: { ar: "قيد المراجعة", en: "Under Review" }, accepted: { ar: "مقبول", en: "Accepted" }, rejected: { ar: "مرفوض", en: "Rejected" } } as const;
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
type Field = { name: string; value: string; inline?: boolean };
// Respects Discord limits: 25 fields/embed, 1024/field value, ~5500 chars/embed, 10 embeds/message.
export function buildMessages(app: any, form: any, qs: Question[], origin: string) {
  const ar = app.lang === "ar"; const L = (a: string, e: string) => (ar ? a : e);
  const head: Field[] = [
    { name: L("رقم التقديم", "Application code"), value: app.code, inline: true },
    { name: "Discord", value: cut(app.discord_username, 100), inline: true }, { name: "Discord ID", value: app.discord_id, inline: true },
    { name: L("التاريخ", "Submitted"), value: app.created_at.slice(0, 16).replace("T", " ") + " UTC", inline: true },
    { name: L("الحالة", "Status"), value: ST[app.status as keyof typeof ST][app.lang as "ar" | "en"], inline: true },
    { name: L("رابط الطلب", "Admin link"), value: `${origin}/admin/applications/${app.id}` }];
  const qa: Field[] = [];
  for (const q of qs.filter((x) => x.enabled && x.type !== "heading")) {
    const raw = app.answers[q.id]; const o = (s: string) => q.options?.find((x) => x.value === s)?.[app.lang as "ar" | "en"] ?? s;
    const txt = Array.isArray(raw) ? raw.map(o).join(", ") : raw ? (q.type === "yesno" ? (raw === "yes" ? L("نعم", "Yes") : L("لا", "No")) : o(String(raw))) : "—";
    const parts = txt.match(/[\s\S]{1,1000}/g) ?? ["—"];
    parts.forEach((p: string, i: number) => qa.push({ name: cut(i ? "↳" : ar ? q.label_ar : q.label_en, 256), value: p }));
  }
  const embeds: any[] = []; let cur: any = { title: cut(`${ar ? form.name_ar : form.name_en} — ${app.code}`, 256), color: 0x00d4ff, fields: head }; let size = 800;
  for (const f of qa) { const s = f.name.length + f.value.length;
    if (cur.fields.length >= 25 || size + s > 5500) { embeds.push(cur); cur = { color: 0xa855f7, fields: [] }; size = 0; } cur.fields.push(f); size += s; }
  embeds.push(cur);
  const msgs: object[] = []; for (let i = 0; i < embeds.length; i += 10) msgs.push({ embeds: embeds.slice(i, i + 10), allowed_mentions: { parse: [] } });
  return msgs;
}
export async function sendTo(url: string, payload: object) {
  if (!isValidDiscordWebhook(url)) throw new Error("INVALID_WEBHOOK_URL");
  const r = await fetch(url + "?wait=true", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(r.status === 429 ? "RATE_LIMITED" : `HTTP_${r.status}`);   // never include the URL in errors/logs
}
export async function deliver(id: string): Promise<"sent" | "failed" | "skipped"> {
  const sb = db(); const { data: d } = await sb.from("webhook_deliveries").select("*").eq("id", id).maybeSingle();
  if (!d || d.status === "sent" || d.attempts >= MAX_ATTEMPTS) return "skipped";
  const { data: claimed } = await sb.from("webhook_deliveries").update({ attempts: d.attempts + 1 }).eq("id", id).eq("attempts", d.attempts).select("id");
  if (!claimed?.length) return "skipped";                       // another worker took it
  const fail = async (e: string) => { await sb.from("webhook_deliveries").update({ status: "failed", last_error: cut(e, 200), next_attempt_at: new Date(Date.now() + 2 ** d.attempts * 5 * 60e3).toISOString() }).eq("id", id); return "failed" as const; };
  try {
    const { data: app } = await sb.from("applications").select("*").eq("id", d.application_id).single();
    const { data: form } = await sb.from("forms").select("*").eq("id", app.form_id).single();
    if (!form.webhook_url) return fail("NO_WEBHOOK");
    const { data: v } = await sb.from("form_versions").select("questions").eq("form_id", form.id).eq("version", app.form_version).single();
    const msgs = buildMessages(app, form, (v?.questions ?? []) as Question[], new URL(process.env.DISCORD_REDIRECT_URI!).origin);
    for (let i = d.sent_parts; i < msgs.length; i++) { await sendTo(form.webhook_url, msgs[i]); await sb.from("webhook_deliveries").update({ sent_parts: i + 1 }).eq("id", id); }
    await sb.from("webhook_deliveries").update({ status: "sent", last_error: null }).eq("id", id); return "sent";
  } catch (e) { return fail((e as Error).message); }
}
