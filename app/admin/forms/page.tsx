import { requireAdminPage } from "@/lib/admin";
import { getLang } from "@/lib/i18n";
import { db } from "@/lib/db";
import JsonForm from "@/components/JsonForm";
import ActionButton from "@/components/ActionButton";
export const dynamic = "force-dynamic";
export default async function Forms() { await requireAdminPage(); const ar = getLang() === "ar";
  const { data: fs } = await db().from("forms").select("id,slug,prefix,name_ar,name_en,is_open,is_archived,current_version").order("sort_order");
  return (<main className="p-6 space-y-4"><a href="/admin">←</a><h1 className="text-xl font-bold">{ar ? "النماذج" : "Forms"}</h1>
    <div className="space-y-2">{fs?.map((f) => (<div key={f.id} className="card p-3 flex flex-wrap gap-3 justify-between items-center"><a href={`/admin/forms/${f.id}`}>{ar ? f.name_ar : f.name_en} · {f.prefix} · v{f.current_version}{f.is_archived ? " · archived" : ""}</a>
      <span className="flex gap-2"><ActionButton reload method="PATCH" url={`/api/admin/forms/${f.id}`} body={{ is_open: !f.is_open }} label={f.is_open ? (ar ? "إغلاق" : "Close") : (ar ? "فتح" : "Open")} />
        <ActionButton reload method="PATCH" url={`/api/admin/forms/${f.id}`} body={{ is_archived: !f.is_archived, is_open: false }} label={f.is_archived ? (ar ? "استرجاع" : "Unarchive") : (ar ? "أرشفة" : "Archive")} />
        <ActionButton reload method="DELETE" url={`/api/admin/forms/${f.id}`} label={ar ? "حذف" : "Delete"} /></span></div>))}</div>
    <h2 className="font-semibold">{ar ? "نموذج جديد" : "New form"}</h2>
    <JsonForm action="/api/admin/forms" redirect="/admin/forms" submit={ar ? "إنشاء" : "Create"} fields={[{ name: "slug", label: "slug (a-z, 0-9, -)" }, { name: "prefix", label: ar ? "البادئة (حروف كبيرة 2-5)" : "Code prefix (A-Z, 2-5)" }, { name: "name_ar", label: "الاسم بالعربية" }, { name: "name_en", label: "Name (EN)" }]} /></main>); }
