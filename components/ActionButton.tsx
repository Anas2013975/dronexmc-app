"use client";
import { useState } from "react";
export default function ActionButton({ url, body, label, method = "POST", reload }: { url: string; body?: object; label: string; method?: string; reload?: boolean }) {
  const [m, setM] = useState(""); const [b, setB] = useState(false);
  return (<span><button className="card px-3 py-1" disabled={b} onClick={async () => { setB(true); const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) }); const j = await r.json().catch(() => ({})); setB(false);
    if (r.ok && reload) return location.reload(); setM(j.result ?? j.error ?? (r.ok ? "ok" : "error")); }}>{label}</button> <small>{m}</small></span>);
}
