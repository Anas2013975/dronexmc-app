import { NextRequest, NextResponse } from "next/server";
import { createUserSession } from "@/lib/session";
// Single OAuth callback: https://<site>/callback  (must equal DISCORD_REDIRECT_URI and the Discord portal setting)
export async function GET(req: NextRequest) {
  const url = req.nextUrl; const back = (e: string) => NextResponse.redirect(new URL(`/login?error=${e}`, url));
  if (url.searchParams.get("error")) return back("cancelled");
  const code = url.searchParams.get("code"); const state = url.searchParams.get("state");
  const saved = req.cookies.get("dx_state")?.value;
  if (!code || !state || !saved || state !== saved) return back("state");
  try {
    const tok = await fetch("https://discord.com/api/oauth2/token", { method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID!, client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code", code, redirect_uri: process.env.DISCORD_REDIRECT_URI! }) });
    if (!tok.ok) return back("token");
    const { access_token } = await tok.json();
    const me = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${access_token}` } });
    if (!me.ok) return back("profile");
    const u = await me.json();
    await createUserSession({ discordId: String(u.id), username: String(u.global_name ?? u.username), avatar: u.avatar ?? null });
    const res = NextResponse.redirect(new URL("/", url)); res.cookies.delete("dx_state"); return res;
  } catch { return back("failed"); }
}
