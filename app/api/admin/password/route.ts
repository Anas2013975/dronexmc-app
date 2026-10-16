import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, setAdminCookie, audit } from "@/lib/admin";
const S = z.object({ current: z.string(), username: z.string().min(3).max(32).regex(/^[\w.-]+$/), password: z.string().min(10).max(128).refine((p) => p.toLowerCase() !== "admin") });
export async function POST(req: Request) {
  const a = await guardApi(req, true); if (a instanceof Response) return a;
  const p = S.safeParse(await req.json().catch(() => ({}))); if (!p.success) return Response.json({ error: "VALIDATION" }, { status: 422 });
  const sb = db(); const { data: acc } = await sb.from("admin_accounts").select("*").eq("id", a.id).single();
  if (!acc || !(await bcrypt.compare(p.data.current, acc.password_hash))) return Response.json({ error: "INVALID" }, { status: 401 });
  const sv = acc.session_version + 1;   // invalidates every other session
  const { error } = await sb.from("admin_accounts").update({ username: p.data.username, password_hash: await bcrypt.hash(p.data.password, 12), must_change_password: false, session_version: sv }).eq("id", a.id);
  if (error) return Response.json({ error: "SERVER" }, { status: 500 });
  await setAdminCookie(a.id, sv); await audit(a.id, "password_changed");
  return Response.json({ ok: true });
}
