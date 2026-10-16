import { NextResponse } from "next/server";
// POST {lang?: "ar"|"en", theme?: "dark"|"light"} - non-sensitive preferences only.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const res = NextResponse.json({ ok: true });
  const opts = { path: "/", maxAge: 31536000, sameSite: "lax" as const };
  if (b.lang === "ar" || b.lang === "en") res.cookies.set("dx_lang", b.lang, opts);
  if (b.theme === "dark" || b.theme === "light") res.cookies.set("dx_theme", b.theme, opts);
  return res;
}
