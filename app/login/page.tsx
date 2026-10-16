import { getLang, getTheme, t } from "@/lib/i18n";
import Prefs from "@/components/Prefs";
export default function Login({ searchParams }: { searchParams: { error?: string } }) {
  const lang = getLang(); const s = t[lang];
  const err = searchParams.error === "cancelled" ? s.cancelled : searchParams.error ? s.failed : null;
  return (<main className="flex-1 grid place-items-center p-4">
    <div className="card p-8 max-w-md w-full text-center space-y-4">
      <div className="flex justify-end"><Prefs lang={lang} theme={getTheme()} /></div>
      <div className="text-5xl">🔐</div>
      <h1 className="text-2xl font-bold">{s.signIn}</h1>
      <p className="opacity-80">{s.need}</p>
      {err && <p role="alert" className="text-red-500">{err}</p>}
      <a className="btn block" href="/auth/discord">{s.cont}</a>
      <p className="text-sm opacity-70"><a href="/terms">{s.terms}</a> · <a href="/privacy">{s.privacy}</a></p>
    </div></main>);
}
