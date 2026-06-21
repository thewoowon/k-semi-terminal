import "server-only";
import { features } from "@/lib/env";
import { createFileRepository } from "./fileRepository";
import { createPgRepository, probePg } from "./pgRepository";
import type { Repository } from "./types";

let singleton: Repository | null = null;
let resolving: Promise<Repository> | null = null;

/**
 * Returns the active repository. Prefers Postgres (porsager/postgres — no
 * codegen, PnP-friendly, durable on serverless) when DATABASE_URL is set,
 * probing connectivity + ensuring schema once. Falls back to the file store if
 * the database is unreachable. Result is cached for the process lifetime.
 *
 * The file store is process-local and ephemeral on serverless, so a real
 * DATABASE_URL is required for durable subscribers/reports in production.
 */
export async function getRepository(): Promise<Repository> {
  if (singleton) return singleton;
  if (resolving) return resolving;

  resolving = (async () => {
    if (features.db) {
      try {
        const repo = createPgRepository();
        await probePg(repo);
        singleton = repo;
        return repo;
      } catch (e) {
        console.warn(
          "[persistence] Postgres unavailable, using file store. Reason:",
          e instanceof Error ? e.message : e,
        );
      }
    }
    singleton = createFileRepository();
    return singleton;
  })();

  return resolving;
}

export type { Repository } from "./types";
export * from "./types";
