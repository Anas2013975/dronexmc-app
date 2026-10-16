"use client";
import { useState } from "react";
export default function AdminActions({ id, status, ar }: { id: string; status: string; ar: boolean }) {
  const [busy, setBusy] = useState(false);
  const call = async (method: string, body?: object) => { setBusy(true);
    const r = await fetch(`/api/admin/applications/${id}`, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
    setBusy(false); if (!r.ok) return alert("Error"); method === "DELETE" ? (location.href = "/admin") : location.reload(); };
  const L: [string, string, string][] = [["under_review", "قيد المراجعة", "Under review"], ["accepted", "مقبول", "Accepted"], ["rejected", "مرفوض", "Rejected"]];
  return (<div className="flex flex-wrap gap-2">{L.map(([s, a, e]) => (<button key={s} disabled={busy || s === status} className={s === status ? "btn" : "card px-3 py-1"} onClick={() => call("PATCH", { status: s })}>{ar ? a : e}</button>))}
    <button disabled={busy} className="card px-3 py-1 text-red-500" onClick={() => confirm(ar ? "سيُحذف الطلب نهائيًا، وسيتمكن المستخدم من التقديم مجددًا في هذا النموذج. متابعة؟" : "This permanently deletes the application and lets the user apply again on this form. Continue?") && call("DELETE")}>{ar ? "حذف" : "Delete"}</button></div>);
}
