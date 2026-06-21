import { env, secretEquals } from "./env";

/** Admin guard — `x-admin-secret` header must match ADMIN_SECRET (§7). */
export function isAdmin(req: Request): boolean {
  return secretEquals(req.headers.get("x-admin-secret"), env.adminSecret);
}

/** Cron guard — `Authorization: Bearer <CRON_SECRET>` (Vercel Cron) (§8.2). */
export function isCron(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return (
    secretEquals(bearer, env.cronSecret) ||
    secretEquals(req.headers.get("x-cron-secret"), env.cronSecret)
  );
}

export function unauthorized(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
