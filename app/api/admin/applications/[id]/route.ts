import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, audit } from "@/lib/admin";
const ID = z.string().uuid();
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const a = await guardApi(req); if (a instanceof Response) return a;
  const s = z.object({ status: z.enum(["under_review", "accepted", "rejected"]) }).safeParse(await req.json().catch(() => ({})));
  if (!s.success || !ID.safeParse(params.id).success) return Response.json({ error: "VALIDATION" }, { status: 422 });
  const { error } = await db().from("applications").update({ status: s.data.status }).eq("id", params.id);
  if (error) return Response.json({ error: "SERVER" }, { status: 500 });
  await audit(a.id, "status_" + s.data.status, params.id); return Response.json({ ok: true });
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const a = await guardApi(req); if (a instanceof Response) return a;
  if (!ID.safeParse(params.id).success) return Response.json({ error: "VALIDATION" }, { status: 422 });
  const { error } = await db().from("applications").delete().eq("id", params.id);
  if (error) return Response.json({ error: "SERVER" }, { status: 500 });
  await audit(a.id, "application_deleted", params.id); return Response.json({ ok: true });
}
