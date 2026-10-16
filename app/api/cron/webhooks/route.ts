import { db } from "@/lib/db";
import { deliver, MAX_ATTEMPTS } from "@/lib/webhook";
// Vercel Cron calls this with "Authorization: Bearer $CRON_SECRET".
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { data } = await db().from("webhook_deliveries").select("id").in("status", ["pending", "failed"]).lt("attempts", MAX_ATTEMPTS)
    .lte("next_attempt_at", new Date().toISOString()).limit(20);
  const out: string[] = []; for (const r of data ?? []) out.push(await deliver(r.id));
  return Response.json({ processed: out.length, results: out });
}
