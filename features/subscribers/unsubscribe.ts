import "server-only";
import { getRepository } from "@/features/reports/persistence";

export type UnsubscribeResult =
  | { ok: true; email: string }
  | { ok: false; reason: "not_found" };

/** Token-based unsubscribe (launch checklist §10). Idempotent. */
export async function unsubscribe(token: string): Promise<UnsubscribeResult> {
  if (!token) return { ok: false, reason: "not_found" };
  const repo = await getRepository();
  const sub = await repo.subscribers.findByToken(token);
  if (!sub) return { ok: false, reason: "not_found" };
  if (sub.status !== "unsubscribed") {
    await repo.subscribers.update(sub.id, { status: "unsubscribed" });
  }
  return { ok: true, email: sub.email };
}
