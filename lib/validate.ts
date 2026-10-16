// Pure validation shared by browser and server (server result is the authority).
export type Opt = { value: string; ar: string; en: string };
export type Question = { id: string; type: "short"|"long"|"single"|"multi"|"select"|"yesno"|"url"|"number"|"heading"|"consent";
  required: boolean; enabled: boolean; label_ar: string; label_en: string; help_ar?: string; help_en?: string;
  options?: Opt[]; min?: number; max?: number; error_ar?: string; error_en?: string };
export type Answers = Record<string, string | string[]>;
export const MAX_LEN = 4000;
export function validate(qs: Question[], a: Answers, lang: "ar" | "en"): Record<string, string> {
  const err: Record<string, string> = {};
  const m = (q: Question, ar: string, en: string) => (lang === "ar" ? q.error_ar ?? ar : q.error_en ?? en);
  for (const q of qs) {
    if (!q.enabled || q.type === "heading") continue;
    const v = a[q.id]; const empty = v === undefined || v === "" || (Array.isArray(v) && !v.length);
    if (empty) { if (q.required) err[q.id] = m(q, "هذا الحقل مطلوب", "This field is required"); continue; }
    const vals = Array.isArray(v) ? v : [v];
    if (q.options && ["single","select","multi"].includes(q.type) && !vals.every((x) => q.options!.some((o) => o.value === x)))
      { err[q.id] = m(q, "اختيار غير صالح", "Invalid choice"); continue; }
    if (["single","select","yesno"].includes(q.type) && Array.isArray(v)) { err[q.id] = m(q, "قيمة غير صالحة", "Invalid value"); continue; }
    if (q.type === "yesno" && v !== "yes" && v !== "no") err[q.id] = m(q, "قيمة غير صالحة", "Invalid value");
    if (q.type === "consent" && v !== "yes") err[q.id] = m(q, "يجب الموافقة", "You must agree");
    if (["short","long","url","number"].includes(q.type)) {
      const s = String(v);
      if (s.length > (q.max ?? (q.type === "long" ? MAX_LEN : 500))) err[q.id] = m(q, "الإجابة طويلة جدًا", "Answer is too long");
      else if (q.min && s.length < q.min) err[q.id] = m(q, `الحد الأدنى ${q.min} حرفًا`, `Minimum ${q.min} characters`);
      else if (q.type === "number" && !Number.isFinite(Number(s))) err[q.id] = m(q, "أدخل رقمًا صحيحًا", "Enter a valid number");
      else if (q.type === "url") { try { if (!/^https?:$/.test(new URL(s).protocol)) throw 0; } catch { err[q.id] = m(q, "رابط غير صالح", "Invalid URL"); } }
    }
  }
  return err;
}
