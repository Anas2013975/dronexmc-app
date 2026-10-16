import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!);
export type Admin = { id: string; username: string; must_change_password: boolean };
export async function setAdminCookie(id: string, sv: number) {
  const t = await new SignJWT({ kind: "admin", id, sv }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("8h").sign(key());
  cookies().set("dx_admin", t, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 28800 });
}
// Verifies signature AND that the account's session_version still matches (password change kills old sessions).
export async function getAdmin(): Promise<Admin | null> {
  const t = cookies().get("dx_admin")?.value; if (!t) return null;
  try {
    const { payload: p } = await jwtVerify(t, key()); if (p.kind !== "admin") return null;
    const { data } = await db().from("admin_accounts").select("id,username,must_change_password,session_version").eq("id", p.id as string).maybeSingle();
    return data && data.session_version === p.sv ? { id: data.id, username: data.username, must_change_password: data.must_change_password } : null;
  } catch { return null; }
}
export async function requireAdminPage(allowPwdChange = false): Promise<Admin> {
  const a = await getAdmin(); if (!a) redirect("/admin/login");
  if (a.must_change_password && !allowPwdChange) redirect("/admin/account");
  return a;
}
export const sameOrigin = (req: Request) => { const o = req.headers.get("origin"); try { return !!o && new URL(o).host === req.headers.get("host"); } catch { return false; } };
export const audit = (admin_id: string | null, action: string, target?: string) => db().from("admin_audit_log").insert({ admin_id, action, target });
// API guard: returns admin or a ready-made error response.
export async function guardApi(req: Request, allowPwdChange = false): Promise<Admin | Response> {
  if (!sameOrigin(req)) return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  const a = await getAdmin(); if (!a) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (a.must_change_password && !allowPwdChange) return Response.json({ error: "PASSWORD_CHANGE_REQUIRED" }, { status: 403 });
  return a;
}
