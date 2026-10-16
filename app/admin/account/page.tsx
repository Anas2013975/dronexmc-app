import { requireAdminPage } from "@/lib/admin";
import { getLang } from "@/lib/i18n";
import JsonForm from "@/components/JsonForm";
export default async function Account() { const a = await requireAdminPage(true); const ar = getLang() === "ar";
  return (<main className="p-6 space-y-3"><h1 className="text-xl font-bold">{ar ? "تغيير بيانات الدخول" : "Change credentials"}</h1>
    {a.must_change_password && <p className="text-amber-500">{ar ? "يجب تغيير كلمة المرور الافتراضية قبل استخدام اللوحة." : "You must change the default password before using the panel."}</p>}
    <JsonForm action="/api/admin/password" redirect="/admin" submit={ar ? "حفظ" : "Save"} fields={[{ name: "current", label: ar ? "كلمة المرور الحالية" : "Current password", type: "password" }, { name: "username", label: ar ? "اسم المستخدم الجديد" : "New username", value: a.username }, { name: "password", label: ar ? "كلمة المرور الجديدة (10 أحرف فأكثر)" : "New password (min 10 chars)", type: "password" }]} /></main>); }
