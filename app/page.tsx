import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/session";
import { getLang, getTheme, t } from "@/lib/i18n";
import { db } from "@/lib/db";
import Prefs from "@/components/Prefs";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getUserSession(); if (!user) redirect("/login");
  const lang = getLang(); const s = t[lang];
  const { data: forms } = await db().from("forms")
    .select("id,slug,name_ar,name_en,description_ar,description_en,icon,color,is_open")
    .eq("is_archived", false).order("sort_order");
  const { data: st } = await db().from("site_settings").select("key,value").in("key", ["discord_url", "store_url"]);
  const link = (k: string) => { const v = st?.find((r) => r.key === k)?.value; return typeof v === "string" ? v : null; };
  const avatar = user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=64` : null;
  return (<>
    <header className="flex flex-wrap items-center justify-between gap-3 p-4 border-b" style={{ borderColor: "var(--border)" }}>
      <details className="relative"><summary className="cursor-pointer flex items-center gap-2">
        {avatar && <img src={avatar} alt="" width={32} height={32} className="rounded-full" />}<span>{user.username}</span></summary>
        <div className="card absolute mt-2 p-3 text-sm z-10"><div>{user.username}</div><div dir="ltr" className="opacity-70">{user.discordId}</div></div></details>
      <nav className="flex items-center gap-3">
        {link("discord_url") && <a href={link("discord_url")!}>{s.server}</a>}
        {link("store_url") && <a href={link("store_url")!}>{s.store}</a>}
        <Prefs lang={lang} theme={getTheme()} />
        <form action="/logout" method="post"><button className="card px-3 py-1">{s.logout}</button></form>
      </nav></header>
    <main className="flex-1 max-w-5xl mx-auto w-full p-4 space-y-4">
      <h1 className="text-2xl font-bold">{s.apps}</h1>
      {!forms?.length && <p className="opacity-70">{s.empty}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {forms?.map((f) => (<div key={f.id} className="card p-4 space-y-2" style={{ borderColor: f.color }}>
          <div className="font-bold">{lang === "ar" ? f.name_ar : f.name_en}</div>
          <p className="text-sm opacity-80">{lang === "ar" ? f.description_ar : f.description_en}</p>
          <div className="flex items-center justify-between"><span className="text-xs">{f.is_open ? s.open : s.closed}</span>
            {f.is_open && <a className="btn text-sm" href={`/apply/${f.slug}`}>{s.apply}</a>}</div></div>))}
      </div></main>
    <footer className="p-4 text-center text-sm opacity-80">© 2026 All Rights Reserved to <a href="/admin/login">DronexMC</a></footer>
  </>);
}
