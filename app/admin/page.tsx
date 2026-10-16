import { requireAdminPage } from "@/lib/admin";
import { getLang } from "@/lib/i18n";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function AdminHome({ searchParams: q }: { searchParams: { q?: string; status?: string; form?: string } }) {
  await requireAdminPage(); const ar = getLang() === "ar"; const sb = db();
  const cnt = async (s?: string) => { let x = sb.from("applications").select("id", { count: "exact", head: true }); if (s) x = x.eq("status", s); return (await x).count ?? 0; };
  const [total, ur, ac, rj] = await Promise.all([cnt(), cnt("under_review"), cnt("accepted"), cnt("rejected")]);
  const { data: ids } = await sb.from("applications").select("discord_id").limit(20000);
  const { data: forms } = await sb.from("forms").select("id,name_ar,name_en,is_open");
  let x = sb.from("applications").select("id,code,discord_username,discord_id,status,created_at,form_id").order("created_at", { ascending: false }).limit(100);
  if (q.status) x = x.eq("status", q.status); if (q.form) x = x.eq("form_id", q.form);
  if (q.q) { const s = q.q.replace(/[^\w\-\u0600-\u06FF ]/g, ""); x = x.or(`discord_username.ilike.%${s}%,discord_id.eq.${s},code.ilike.%${s}%`); }
  const { data: apps } = await x;
  const box = (l: string, n: number) => <div className="card p-3"><div className="text-2xl font-bold">{n}</div><div className="text-sm opacity-70">{l}</div></div>;
  return (<main className="p-6 space-y-4"><div className="flex gap-3"><h1 className="text-xl font-bold flex-1">{ar ? "لوحة الإدارة" : "Admin dashboard"}</h1><a href="/admin/forms">Forms</a><a href="/admin/webhooks">Webhooks</a><a href="/admin/settings">{ar ? "الإعدادات" : "Settings"}</a><a href="/admin/account">{ar ? "الحساب" : "Account"}</a></div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">{box(ar ? "الإجمالي" : "Total", total)}{box(ar ? "قيد المراجعة" : "Under review", ur)}{box(ar ? "مقبول" : "Accepted", ac)}{box(ar ? "مرفوض" : "Rejected", rj)}
      {box(ar ? "متقدمون" : "Applicants", new Set(ids?.map((r) => r.discord_id)).size)}{<div className="card p-3"><div className="text-2xl font-bold">{forms?.filter((f) => f.is_open).length}/{forms?.filter((f) => !f.is_open).length}</div><div className="text-sm opacity-70">{ar ? "مفتوح/مغلق" : "Open/closed"}</div></div>}</div>
    <form className="flex flex-wrap gap-2"><input name="q" defaultValue={q.q} placeholder={ar ? "اسم / ID / رقم" : "Name / ID / code"} className="card p-2" />
      <select name="status" defaultValue={q.status ?? ""} className="card p-2"><option value="">{ar ? "كل الحالات" : "All statuses"}</option><option value="under_review">under_review</option><option value="accepted">accepted</option><option value="rejected">rejected</option></select>
      <select name="form" defaultValue={q.form ?? ""} className="card p-2"><option value="">{ar ? "كل النماذج" : "All forms"}</option>{forms?.map((f) => <option key={f.id} value={f.id}>{ar ? f.name_ar : f.name_en}</option>)}</select><button className="btn">{ar ? "بحث" : "Filter"}</button></form>
    <div className="space-y-2">{apps?.map((a) => (<a key={a.id} href={`/admin/applications/${a.id}`} className="card p-3 flex justify-between"><span dir="ltr">{a.code}</span><span>{a.discord_username}</span><span>{a.status}</span><span dir="ltr">{a.created_at.slice(0, 10)}</span></a>))}</div></main>);
}
