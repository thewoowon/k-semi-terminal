import "server-only";
import postgres from "postgres";
import { env } from "@/lib/env";

/**
 * Shared Postgres client (porsager/postgres) — PnP-friendly, no codegen, works
 * on serverless. Cached on globalThis so warm invocations reuse one small pool
 * instead of opening a connection per module graph / request.
 *
 * Column naming: tables are snake_case; `transform: postgres.camel` maps them to
 * the camelCase record fields used across the repository.
 */

export type Sql = ReturnType<typeof postgres>;

const g = globalThis as typeof globalThis & {
  __pgSql?: Sql;
  __pgSchemaReady?: Promise<void>;
};

export function sql(): Sql {
  if (!env.databaseUrl) throw new Error("DATABASE_URL is not set");
  if (!g.__pgSql) {
    g.__pgSql = postgres(env.databaseUrl, {
      ssl: "require",
      max: 1, // one connection per instance — friendly to serverless + Railway
      idle_timeout: 20,
      connect_timeout: 10,
      transform: postgres.camel,
    });
  }
  return g.__pgSql;
}

/** Create tables if absent (idempotent). Mirrors prisma/schema.prisma. */
export function ensureSchema(): Promise<void> {
  if (!g.__pgSchemaReady) {
    const db = sql();
    g.__pgSchemaReady = (async () => {
      await db`
        CREATE TABLE IF NOT EXISTS subscriber (
          id              TEXT PRIMARY KEY,
          email           TEXT UNIQUE NOT NULL,
          name            TEXT,
          status          TEXT NOT NULL DEFAULT 'active',
          source          TEXT NOT NULL DEFAULT 'founding',
          interests       TEXT[] NOT NULL DEFAULT '{}',
          unsubscribe_tok TEXT UNIQUE NOT NULL,
          created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await db`
        CREATE TABLE IF NOT EXISTS report (
          id              TEXT PRIMARY KEY,
          type            TEXT NOT NULL,
          slug            TEXT UNIQUE NOT NULL,
          title           TEXT NOT NULL,
          subtitle        TEXT,
          date            TIMESTAMPTZ NOT NULL,
          status          TEXT NOT NULL DEFAULT 'draft',
          access_level    TEXT NOT NULL DEFAULT 'founding',
          cycle_score     INTEGER,
          content_json    JSONB NOT NULL,
          html            TEXT,
          markdown        TEXT,
          pdf_url         TEXT,
          source_snapshot JSONB,
          generated_at    TIMESTAMPTZ,
          approved_at     TIMESTAMPTZ,
          sent_at         TIMESTAMPTZ,
          created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await db`
        CREATE TABLE IF NOT EXISTS report_delivery (
          id            TEXT PRIMARY KEY,
          report_id     TEXT NOT NULL REFERENCES report(id),
          subscriber_id TEXT NOT NULL,
          email         TEXT NOT NULL,
          status        TEXT NOT NULL DEFAULT 'pending',
          resend_id     TEXT,
          error         TEXT,
          sent_at       TIMESTAMPTZ,
          created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
    })().catch((e) => {
      // Let the next call retry rather than caching a rejected promise.
      g.__pgSchemaReady = undefined;
      throw e;
    });
  }
  return g.__pgSchemaReady;
}
