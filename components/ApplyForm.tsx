"use client";
import { useEffect, useRef, useState } from "react";
import { validate, Question, Answers } from "@/lib/validate";
export default function ApplyForm({ slug, qs, lang, success, preview }: { slug: string; qs: Question[]; lang: "ar" | "en"; success: string; preview?: boolean }) {
  const ar = lang === "ar"; const key = `dx_draft_${slug}`;
  const [a, setA] = useState<Answers>({}); const [errs, setErrs] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false); const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null); const [msg, setMsg] = useState<string | null>(null);
  const lock = useRef(false);
  useEffect(() => { try { const d = localStorage.getItem(key); if (d) setA(JSON.parse(d)); } catch {} }, [key]);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(a)); } catch {} }, [a, key]);
  const L = (q: Question) => (ar ? q.label_ar : q.label_en);
  const set = (id: string, v: string | string[]) => setA((p) => ({ ...p, [id]: v }));
  const next = () => { const e = validate(qs, a, lang); setErrs(e); if (!Object.keys(e).length) setReview(true); };
  const submit = async () => {
    if (preview || lock.current) return; lock.current = true; setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, lang, answers: a }) });
      const j = await r.json();
      if (r.ok) { try { localStorage.removeItem(key); } catch {} setCode(j.code); }
      else if (j.errors) { setErrs(j.errors); setReview(false); }
      else setMsg(j.error === "ALREADY_APPLIED" ? (ar ? "لقد قدّمت على هذا النموذج مسبقًا." : "You already applied to this form.")
        : j.error === "FORM_CLOSED" ? (ar ? "هذا النموذج مغلق." : "This form is closed.") : (ar ? "حدث خطأ، حاول لاحقًا." : "Something went wrong, try again."));
    } catch { setMsg(ar ? "تعذر الاتصال بالخادم." : "Network error."); }
    finally { lock.current = false; setBusy(false); }
  };
  if (code) return (<div className="card p-6 space-y-3 text-center"><p>{success}</p>
    <p className="text-2xl font-mono" dir="ltr">{code}</p>
    <button className="btn" onClick={() => navigator.clipboard.writeText(code)}>{ar ? "نسخ الرقم" : "Copy code"}</button></div>);
  const show = (q: Question) => {
    const v = a[q.id];
    const base = "w-full card p-2"; const o = q.options ?? [];
    switch (q.type) {
      case "heading": return <h2 className="font-bold mt-4">{L(q)}</h2>;
      case "long": return <textarea className={base} rows={4} value={(v as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} />;
      case "single": return <div>{o.map((x) => <label key={x.value} className="flex gap-2"><input type="radio" name={q.id} checked={v === x.value} onChange={() => set(q.id, x.value)} />{ar ? x.ar : x.en}</label>)}</div>;
      case "multi": return <div>{o.map((x) => <label key={x.value} className="flex gap-2"><input type="checkbox" checked={((v as string[]) ?? []).includes(x.value)}
        onChange={(e) => set(q.id, e.target.checked ? [...((v as string[]) ?? []), x.value] : ((v as string[]) ?? []).filter((y) => y !== x.value))} />{ar ? x.ar : x.en}</label>)}</div>;
      case "select": return <select className={base} value={(v as string) ?? ""} onChange={(e) => set(q.id, e.target.value)}><option value="" />{o.map((x) => <option key={x.value} value={x.value}>{ar ? x.ar : x.en}</option>)}</select>;
      case "yesno": return <div className="flex gap-4">{["yes","no"].map((x) => <label key={x} className="flex gap-2"><input type="radio" name={q.id} checked={v === x} onChange={() => set(q.id, x)} />{x === "yes" ? (ar ? "نعم" : "Yes") : (ar ? "لا" : "No")}</label>)}</div>;
      case "consent": return <label className="flex gap-2"><input type="checkbox" checked={v === "yes"} onChange={(e) => set(q.id, e.target.checked ? "yes" : "")} />{ar ? "أوافق" : "I agree"}</label>;
      default: return <input className={base} dir={q.type === "url" || q.type === "number" ? "ltr" : undefined} type={q.type === "number" ? "number" : "text"} value={(v as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} />;
    }
  };
  const vis = qs.filter((q) => q.enabled);
  if (review) return (<div className="space-y-3">{vis.filter((q) => q.type !== "heading").map((q) => (<div key={q.id} className="card p-3"><div className="font-semibold">{L(q)}</div>
    <div className="opacity-80 whitespace-pre-wrap">{Array.isArray(a[q.id]) ? (a[q.id] as string[]).join(", ") : (a[q.id] as string) || "—"}</div></div>))}
    {msg && <p role="alert" className="text-red-500">{msg}</p>}
    <div className="flex gap-2"><button className="card px-4 py-2" disabled={busy} onClick={() => setReview(false)}>{ar ? "رجوع" : "Back"}</button>
      <button className="btn" disabled={busy} onClick={submit}>{busy ? (ar ? "جارٍ الإرسال..." : "Submitting...") : (ar ? "إرسال" : "Submit")}</button></div></div>);
  return (<div className="space-y-4">{vis.map((q) => (<div key={q.id} className="space-y-1"><label className="font-semibold">{L(q)}{q.required && q.type !== "heading" ? " *" : ""}</label>
    {(ar ? q.help_ar : q.help_en) && <p className="text-sm opacity-70">{ar ? q.help_ar : q.help_en}</p>}{show(q)}
    {errs[q.id] && <p role="alert" className="text-sm text-red-500">{errs[q.id]}</p>}</div>))}
    <button className="btn" onClick={next}>{ar ? "مراجعة الإجابات" : "Review answers"}</button></div>);
}
