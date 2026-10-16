import { requireAdminPage } from "@/lib/admin";
import { getLang } from "@/lib/i18n";
import { db } from "@/lib/db";
import JsonForm from "@/components/JsonForm";
export const dynamic = "force-dynamic";
export default async function Settings() { await requireAdminPage(); const ar = getLang() === "ar";
  const { data } = await db().from("site_settings").select("key,value"); const g = (k: string) => { const v = data?.find((r) => r.key === k)?.value; return typeof v === "string" ? v : ""; };
  const f = (name: string, a: string, e: string) => ({ name, label: ar ? a : e, value: g(name) });
  return (<main className="p-6 space-y-3"><a href="/admin">←</a><h1 className="text-xl font-bold">{ar ? "إعدادات الموقع" : "Site settings"}</h1>
    <JsonForm action="/api/admin/settings" submit={ar ? "حفظ" : "Save"} fields={[f("site_name", "اسم الموقع", "Site name"), f("discord_url", "رابط Discord", "Discord URL"), f("store_url", "رابط المتجر", "Store URL"), f("site_url", "رابط الموقع", "Website URL"), f("terms_url", "رابط الشروط", "Terms URL"), f("privacy_url", "رابط الخصوصية", "Privacy URL")]} /></main>); }
