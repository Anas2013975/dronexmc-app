import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
// Starts Discord OAuth2 with the minimal `identify` scope and a random state cookie.
export async function GET() {
  const state = randomBytes(24).toString("hex");
  const u = new URL("https://discord.com/oauth2/authorize");
  u.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID!);
  u.searchParams.set("redirect_uri", process.env.DISCORD_REDIRECT_URI!);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "identify");
  u.searchParams.set("state", state);
  const res = NextResponse.redirect(u);
  res.cookies.set("dx_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
