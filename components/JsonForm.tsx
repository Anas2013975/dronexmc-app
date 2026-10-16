"use client";
import { useState } from "react";
type F = { name: string; label: string; type?: string; value?: string };
export default function JsonForm({ action, fields, submit, redirect }: { action: string; fields: F[]; submit: string; redirect?: string }) {
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(fields.map((f) => [f.name, f.value ?? ""])));
  const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => { e.preventDefault(); if (busy) return; setBusy(true); setMsg(null);
    const r = await fetch(action, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) { if (redirect) location.href = j.mustChange ? "/admin/account" : redirect; else setMsg("✓"); } else setMsg(j.error ?? "ERROR"); };
  return (<form onSubmit={go} className="space-y-3 max-w-md">{fields.map((f) => (<label key={f.name} className="block text-sm">{f.label}
    <input className="w-full card p-2" type={f.type ?? "text"} value={v[f.name]} autoComplete="off" onChange={(e) => setV({ ...v, [f.name]: e.target.value })} /></label>))}
    {msg && <p role="alert" className="text-sm">{msg}</p>}<button className="btn" disabled={busy}>{submit}</button></form>);
}
