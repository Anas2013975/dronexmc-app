"use client";
import { useState } from "react";
import ApplyForm from "./ApplyForm";
import type { Question } from "@/lib/validate";
const TYPES = ["short", "long", "single", "multi", "select", "yesno", "url", "number", "heading", "consent"];
const uid = () => "q_" + Math.random().toString(36).slice(2, 10);
const toTxt = (q: Question) => (q.options ?? []).map((o) => `${o.value}|${o.ar}|${o.en}`).join("\n");
export default function QuestionEditor({ formId, initial, ar }: { formId: string; initial: Question[]; ar: boolean }) {
  const [qs, setQs] = useState<Question[]>(initial); const [txt, setTxt] = useState<Record<string, string>>(Object.fromEntries(initial.map((q) => [q.id, toTxt(q)])));
  const [msg, setMsg] = useState(""); const [prev, setPrev] = useState(false); const [lang, setLang] = useState<"ar" | "en">(ar ? "ar" : "en");
  const up = (i: number, p: Partial<Question>) => setQs(qs.map((q, j) => (j === i ? { ...q, ...p } : q)));
  const mv = (i: number, d: number) => { const n = [...qs]; const k = i + d; if (k < 0 || k >= n.length) return; [n[i], n[k]] = [n[k], n[i]]; setQs(n); };
  const opts = (i: number, id: string, v: string) => { setTxt({ ...txt, [id]: v }); up(i, { options: v.split("\n").map((l) => l.split("|").map((x) => x.trim())).filter((p) => p.length === 3 && p.every(Boolean)).map(([value, a, e]) => ({ value, ar: a, en: e })) }); };
  const num = (v: string) => (v === "" ? undefined : Number(v));
  const save = async (publish: boolean) => { setMsg("…"); const r = await fetch(`/api/admin/forms/${formId}/questions`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questions: qs, publish }) });
    const j = await r.json().catch(() => ({})); setMsg(r.ok ? (publish ? `✓ published v${j.version}` : "✓ draft saved") : `${j.error}${j.detail ? ": " + j.detail : ""}`); };
  const inp = "card p-1 w-full";
  return (<div className="space-y-3">
    <div className="flex flex-wrap gap-2 items-center"><button className="card px-3 py-1" onClick={() => setPrev(!prev)}>{prev ? (ar ? "تحرير" : "Edit") : (ar ? "معاينة" : "Preview")}</button>
      {prev && <button className="card px-3 py-1" onClick={() => setLang(lang === "ar" ? "en" : "ar")}>{lang}</button>}
      <button className="card px-3 py-1" onClick={() => save(false)}>{ar ? "حفظ مسودة" : "Save draft"}</button><button className="btn" onClick={() => confirm(ar ? "نشر نسخة جديدة؟ الطلبات القديمة لن تتأثر." : "Publish a new version? Old applications are unaffected.") && save(true)}>{ar ? "نشر" : "Publish"}</button><span>{msg}</span></div>
    {prev ? <ApplyForm slug="preview" qs={qs} lang={lang} success="" preview /> : <>
      {qs.map((q, i) => (<div key={q.id} className="card p-3 space-y-2">
        <div className="flex flex-wrap gap-2"><span className="opacity-60">#{i + 1}</span><select className="card p-1" value={q.type} onChange={(e) => up(i, { type: e.target.value as Question["type"] })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <label><input type="checkbox" checked={q.required} onChange={(e) => up(i, { required: e.target.checked })} /> {ar ? "مطلوب" : "required"}</label><label><input type="checkbox" checked={q.enabled} onChange={(e) => up(i, { enabled: e.target.checked })} /> {ar ? "مفعّل" : "enabled"}</label>
          <button onClick={() => mv(i, -1)}>↑</button><button onClick={() => mv(i, 1)}>↓</button>
          <button onClick={() => { const c = { ...q, id: uid() }; setTxt({ ...txt, [c.id]: toTxt(c) }); setQs([...qs.slice(0, i + 1), c, ...qs.slice(i + 1)]); }}>⧉</button>
          <button className="text-red-500" onClick={() => confirm(ar ? "حذف السؤال؟ (الطلبات القديمة لا تتأثر، وللتعطيل بدون حذف ألغِ تفعيله)" : "Delete question? (old applications unaffected; to hide it instead, disable it)") && setQs(qs.filter((_, j) => j !== i))}>✕</button></div>
        <input className={inp} placeholder="العنوان بالعربية" value={q.label_ar} onChange={(e) => up(i, { label_ar: e.target.value })} />
        <input className={inp} dir="ltr" placeholder="Label in English" value={q.label_en} onChange={(e) => up(i, { label_en: e.target.value })} />
        <div className="grid grid-cols-2 gap-2"><input className={inp} placeholder="وصف (ع)" value={q.help_ar ?? ""} onChange={(e) => up(i, { help_ar: e.target.value })} /><input className={inp} dir="ltr" placeholder="Help (EN)" value={q.help_en ?? ""} onChange={(e) => up(i, { help_en: e.target.value })} />
          <input className={inp} placeholder="رسالة خطأ (ع)" value={q.error_ar ?? ""} onChange={(e) => up(i, { error_ar: e.target.value })} /><input className={inp} dir="ltr" placeholder="Error (EN)" value={q.error_en ?? ""} onChange={(e) => up(i, { error_en: e.target.value })} />
          {["short", "long", "url", "number"].includes(q.type) && <><input className={inp} dir="ltr" type="number" placeholder="min length" value={q.min ?? ""} onChange={(e) => up(i, { min: num(e.target.value) })} /><input className={inp} dir="ltr" type="number" placeholder="max length" value={q.max ?? ""} onChange={(e) => up(i, { max: num(e.target.value) })} /></>}</div>
        {["single", "multi", "select"].includes(q.type) && <textarea className={inp} dir="ltr" rows={4} placeholder={"value|عربي|English  (one option per line)"} value={txt[q.id] ?? ""} onChange={(e) => opts(i, q.id, e.target.value)} />}</div>))}
      <button className="card px-3 py-1" onClick={() => { const id = uid(); setQs([...qs, { id, type: "short", required: true, enabled: true, label_ar: "", label_en: "" }]); setTxt({ ...txt, [id]: "" }); }}>+ {ar ? "سؤال" : "Question"}</button></>}</div>);
}
