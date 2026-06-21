import "server-only";
import { features } from "@/lib/env";
import { createFileRepository } from "./fileRepository";
import { createPrismaRepository, probePrisma } from "./prismaRepository";
import type { Repository } from "./types";

let singleton: Repository | null = null;
let resolving: Promise<Repository> | null = null;

/**
 * Returns the active repository. Prefers Prisma/Postgres when DATABASE_URL is
 * set, but probes connectivity once and gracefully falls back to the file store
 * if the Prisma client can't load (e.g. not generated under Yarn PnP) or the
 * database is unreachable. Result is cached for the process lifetime.
 *
 * To run on real Postgres: switch the project to the node-modules linker
 * (`nodeLinker: node-modules` in .yarnrc.yml), `yarn prisma generate`, and
 * `yarn prisma migrate deploy`. Prisma cannot generate its client under PnP.
 */
export async function getRepository(): Promise<Repository> {
  if (singleton) return singleton;
  if (resolving) return resolving;

  resolving = (async () => {
    if (features.db) {
      try {
        const repo = createPrismaRepository();
        await probePrisma(repo);
        singleton = repo;
        return repo;
      } catch (e) {
        console.warn(
          "[persistence] Prisma unavailable, using file store. Reason:",
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
