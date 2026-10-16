import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/lib/session";
import { getLang } from "@/lib/i18n";
import { db } from "@/lib/db";
import ApplyForm from "@/components/ApplyForm";
import type { Question } from "@/lib/validate";
export const dynamic = "force-dynamic";
const S = {
  under_review: { ar: "طلبك ما زال قيد المراجعة.", en: "Your application is still under review." },
  accepted: { ar: "مبروك! تم قبولك في هذا التقديم ضمن DronexMC Network.", en: "Congratulations! You have been accepted in this application at DronexMC Network." },
  rejected: { ar: "نعتذر، تم رفض طلبك. إذا كنت ترغب في الحصول على فرصة أخرى، يُرجى التواصل مع الدعم في سيرفرنا على ديسكورد.", en: "Sorry, your application was rejected. If you would like another chance, please contact support on our Discord server." },
} as const;
export default async function Apply({ params }: { params: { slug: string } }) {
  const user = await getUserSession(); if (!user) redirect("/login");
  const lang = getLang(); const sb = db();
  const { data: f } = await sb.from("forms").select("*").eq("slug", params.slug).eq("is_archived", false).maybeSingle();
  if (!f) notFound();
  const { data: app } = await sb.from("applications").select("code,status").eq("form_id", f.id).eq("discord_id", user.discordId).maybeSingle();
  const title = lang === "ar" ? f.name_ar : f.name_en;
  const wrap = (c: React.ReactNode) => (<main className="max-w-2xl mx-auto w-full p-4 space-y-4"><a href="/">←</a><h1 className="text-2xl font-bold">{title}</h1>{c}</main>);
  if (app) return wrap(<div className="card p-4 space-y-2"><p>{S[app.status as keyof typeof S][lang]}</p><p dir="ltr" className="font-mono">{app.code}</p></div>);
  if (!f.is_open) return wrap(<p className="card p-4">{(lang === "ar" ? f.closed_ar : f.closed_en) ?? (lang === "ar" ? "هذا النموذج مغلق." : "This form is closed.")}</p>);
  const { data: v } = await sb.from("form_versions").select("questions").eq("form_id", f.id).eq("version", f.current_version).single();
  const ok = lang === "ar" ? "تم إرسال طلبك بنجاح! احفظ رقم التقديم الخاص بك، ثم افتح تذكرة في سيرفر Discord لمتابعة طلبك."
    : "Your application has been submitted successfully! Save your application code and open a ticket on our Discord server to track your request.";
  return wrap(<ApplyForm slug={f.slug} qs={(v?.questions ?? []) as Question[]} lang={lang} success={(lang === "ar" ? f.success_ar : f.success_en) ?? ok} />);
}
