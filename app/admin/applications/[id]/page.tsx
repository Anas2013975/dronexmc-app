import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { getLang } from "@/lib/i18n";
import { db } from "@/lib/db";
import AdminActions from "@/components/AdminActions";
import type { Question } from "@/lib/validate";
export const dynamic = "force-dynamic";
export default async function Detail({ params }: { params: { id: string } }) {
  await requireAdminPage(); const ar = getLang() === "ar"; const sb = db();
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound();
  const { data: a } = await sb.from("applications").select("*").eq("id", params.id).maybeSingle(); if (!a) notFound();
  const { data: f } = await sb.from("forms").select("name_ar,name_en").eq("id", a.form_id).single();
  const { data: v } = await sb.from("form_versions").select("questions").eq("form_id", a.form_id).eq("version", a.form_version).single(); // snapshot at submit time
  const qs = (v?.questions ?? []) as Question[]; const lg = a.lang as "ar" | "en";
  const show = (q: Question) => { const x = a.answers[q.id]; const m = (s: string) => q.options?.find((o) => o.value === s); const t = (s: string) => (m(s) ? m(s)![lg] : s);
    return Array.isArray(x) ? x.map(t).join(", ") : x ? (q.type === "yesno" ? (x === "yes" ? (lg === "ar" ? "نعم" : "Yes") : (lg === "ar" ? "لا" : "No")) : t(String(x))) : "—"; };
  const avatar = a.discord_avatar ? `https://cdn.discordapp.com/avatars/${a.discord_id}/${a.discord_avatar}.png?size=64` : null;
  return (<main className="p-6 max-w-3xl mx-auto space-y-4"><a href="/admin">←</a>
    <div className="card p-4 space-y-1">{avatar && <img src={avatar} alt="" width={48} height={48} className="rounded-full" />}<div className="font-bold">{a.discord_username}</div>
      <div dir="ltr" className="opacity-70">{a.discord_id} · {a.code}</div><div>{ar ? f?.name_ar : f?.name_en} · {a.lang} · {a.created_at.slice(0, 16).replace("T", " ")} · <b>{a.status}</b></div></div>
    <AdminActions id={a.id} status={a.status} ar={ar} />
    {qs.filter((q) => q.enabled && q.type !== "heading").map((q) => (<div key={q.id} className="card p-3"><div className="font-semibold">{lg === "ar" ? q.label_ar : q.label_en}</div><div className="whitespace-pre-wrap opacity-90">{show(q)}</div></div>))}</main>);
}
