import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!);
export type UserSession = { kind: "user"; discordId: string; username: string; avatar: string | null };

export async function createUserSession(s: Omit<UserSession, "kind">) {
  const token = await new SignJWT({ ...s, kind: "user" }).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d").sign(key());
  cookies().set("dx_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 604800 });
}
export async function getUserSession(): Promise<UserSession | null> {
  const t = cookies().get("dx_session")?.value; if (!t) return null;
  try { const { payload } = await jwtVerify(t, key()); return payload.kind === "user" ? (payload as unknown as UserSession) : null; }
  catch { return null; }
}
