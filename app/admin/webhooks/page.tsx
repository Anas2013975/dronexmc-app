import { requireAdminPage } from "@/lib/admin";
import { getLang } from "@/lib/i18n";
import { db } from "@/lib/db";
import JsonForm from "@/components/JsonForm";
import ActionButton from "@/components/ActionButton";
export const dynamic = "force-dynamic";
export default async function Webhooks() {
  await requireAdminPage(); const ar = getLang() === "ar"; const sb = db();
  const { data: forms } = await sb.from("forms").select("slug,name_ar,name_en,webhook_url");   // URL used only as a boolean below, never rendered
  const { data: ds } = await sb.from("webhook_deliveries").select("id,status,attempts,last_error,created_at,applications(code)").order("created_at", { ascending: false }).limit(50);
  return (<main className="p-6 space-y-4"><a href="/admin">←</a><h1 className="text-xl font-bold">Webhooks</h1>
    <div className="space-y-2">{forms?.map((f) => (<div key={f.slug} className="card p-3 flex justify-between"><span>{ar ? f.name_ar : f.name_en} ({f.slug})</span><span>{f.webhook_url ? (ar ? "مُعدّ ✓" : "configured ✓") : (ar ? "غير مُعدّ" : "not set")}</span>
      {f.webhook_url && <ActionButton url="/api/admin/webhooks/test" body={{ slug: f.slug }} label={ar ? "اختبار" : "Test"} />}</div>))}</div>
    <h2 className="font-semibold">{ar ? "تعيين/تغيير Webhook (اتركه فارغًا للإزالة)" : "Set/replace webhook (empty to remove)"}</h2>
    <JsonForm action="/api/admin/webhooks/config" submit={ar ? "حفظ" : "Save"} fields={[{ name: "slug", label: "Form slug" }, { name: "url", label: "Discord webhook URL", type: "password" }]} />
    <h2 className="font-semibold">{ar ? "سجل الإرسال" : "Delivery log"}</h2>
    <div className="space-y-2">{ds?.map((d: any) => (<div key={d.id} className="card p-3 flex flex-wrap gap-3 justify-between"><span dir="ltr">{d.applications?.code}</span><span>{d.status}</span><span>#{d.attempts}</span><span className="opacity-70">{d.last_error}</span>
      {d.status !== "sent" && <ActionButton url="/api/admin/webhooks/retry" body={{ id: d.id }} label={ar ? "إعادة" : "Retry"} />}</div>))}</div></main>);
}
