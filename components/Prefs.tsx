"use client";
export default function Prefs({ lang, theme }: { lang: string; theme: string }) {
  const set = async (b: object) => { await fetch("/api/lang", { method: "POST", body: JSON.stringify(b) }); location.reload(); };
  return (<div className="flex gap-2">
    <button className="card px-3 py-1" onClick={() => set({ lang: lang === "ar" ? "en" : "ar" })}>{lang === "ar" ? "EN" : "عربي"}</button>
    <button className="card px-3 py-1" aria-label="theme" onClick={() => set({ theme: theme === "dark" ? "light" : "dark" })}>{theme === "dark" ? "☀" : "☾"}</button>
  </div>);
}
