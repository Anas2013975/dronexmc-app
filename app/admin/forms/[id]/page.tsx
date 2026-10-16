import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { getLang } from "@/lib/i18n";
import { db } from "@/lib/db";
import JsonForm from "@/components/JsonForm";
import QuestionEditor from "@/components/QuestionEditor";
import type { Question } from "@/lib/validate";
export const dynamic = "force-dynamic";
export default async function EditForm({ params }: { params: { id: string } }) { await requireAdminPage(); const ar = getLang() === "ar";
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound(); const sb = db();
  const { data: f } = await sb.from("forms").select("*").eq("id", params.id).maybeSingle(); if (!f) notFound();
  const { data: v } = await sb.from("form_versions").select("questions").eq("form_id", f.id).eq("version", f.current_version).single();
  const qs = ((f.draft_questions ?? v?.questions) ?? []) as Question[]; const x = (k: string, l: string) => ({ name: k, label: l, value: String(f[k] ?? "") });
  return (<main className="p-6 space-y-5 max-w-3xl mx-auto"><a href="/admin/forms">←</a><h1 className="text-xl font-bold">{f.name_en} <small>v{f.current_version}{f.draft_questions ? " (draft)" : ""}</small></h1>
    <JsonForm action={`/api/admin/forms/${f.id}`} submit={ar ? "حفظ بيانات النموذج" : "Save form details"} fields={[x("name_ar", "الاسم (ع)"), x("name_en", "Name (EN)"), x("description_ar", "الوصف (ع)"), x("description_en", "Description (EN)"), x("icon", "Icon"), x("color", "Color #RRGGBB"), x("sort_order", "Order"), x("prefix", "Code prefix"), x("success_ar", "رسالة النجاح (ع)"), x("success_en", "Success message (EN)"), x("closed_ar", "رسالة الإغلاق (ع)"), x("closed_en", "Closed message (EN)")]} />
    <h2 className="font-semibold">{ar ? "الأسئلة" : "Questions"}</h2><QuestionEditor formId={f.id} initial={qs} ar={ar} /></main>); }
