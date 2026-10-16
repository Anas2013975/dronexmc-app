import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setAdminCookie, sameOrigin, audit } from "@/lib/admin";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  const b = await req.json().catch(() => ({})); const sb = db();
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const { count } = await sb.from("admin_audit_log").select("id", { count: "exact", head: true }).eq("action", "login_fail").eq("target", ip)
    .gte("created_at", new Date(Date.now() - 15 * 60e3).toISOString());
  if ((count ?? 0) >= 5) return Response.json({ error: "TOO_MANY_ATTEMPTS" }, { status: 429 });
  const { count: n } = await sb.from("admin_accounts").select("id", { count: "exact", head: true });
  if (!n) await sb.from("admin_accounts").insert({ username: "admin", password_hash: await bcrypt.hash("admin", 12), must_change_password: true });
  const { data: acc } = await sb.from("admin_accounts").select("*").eq("username", String(b.username ?? "")).maybeSingle();
  const ok = await bcrypt.compare(String(b.password ?? ""), acc?.password_hash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu");
  // Default credentials only usable in production together with the one-time setup token.
  const tokenOk = !(acc?.must_change_password && process.env.NODE_ENV === "production") || (!!process.env.ADMIN_SETUP_TOKEN && b.token === process.env.ADMIN_SETUP_TOKEN);
  if (!acc || !ok || !tokenOk) { await audit(null, "login_fail", ip); return Response.json({ error: "INVALID" }, { status: 401 }); }
  await setAdminCookie(acc.id, acc.session_version); await audit(acc.id, "login");
  return Response.json({ ok: true, mustChange: acc.must_change_password });
}
