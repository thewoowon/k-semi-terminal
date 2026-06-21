import "server-only";
import { randomUUID } from "node:crypto";
import { sql, ensureSchema } from "./pgClient";
import type {
  DeliveryRecord,
  NewSubscriber,
  Repository,
  ReportRecord,
  SubscriberRecord,
  SubscriberStatus,
} from "./types";

/**
 * Postgres-backed repository (porsager/postgres). Used when DATABASE_URL is set.
 * Durable across serverless invocations, unlike the file store. Column names are
 * snake_case in SQL but surface as camelCase via `transform: postgres.camel`.
 */

const iso = (d: unknown): string =>
  d instanceof Date ? d.toISOString() : String(d);
const isoOrNull = (d: unknown): string | null => (d == null ? null : iso(d));

type Row = Record<string, unknown>;
/** The value type porsager's `sql.json()` accepts. */
type JsonVal = Parameters<ReturnType<typeof sql>["json"]>[0];

function toSubscriber(r: Row): SubscriberRecord {
  return {
    id: String(r.id),
    email: String(r.email),
    name: (r.name as string | null) ?? null,
    status: r.status as SubscriberStatus,
    source: String(r.source),
    interests: (r.interests as string[]) ?? [],
    unsubscribeTok: String(r.unsubscribeTok),
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  };
}

function toReport(r: Row): ReportRecord {
  return {
    id: String(r.id),
    type: r.type as "daily" | "weekly",
    slug: String(r.slug),
    title: String(r.title),
    subtitle: (r.subtitle as string | null) ?? null,
    date: iso(r.date),
    status: r.status as ReportRecord["status"],
    accessLevel: String(r.accessLevel),
    cycleScore: (r.cycleScore as number | null) ?? null,
    contentJson: r.contentJson,
    html: (r.html as string | null) ?? null,
    markdown: (r.markdown as string | null) ?? null,
    pdfUrl: (r.pdfUrl as string | null) ?? null,
    sourceSnapshot: r.sourceSnapshot ?? null,
    generatedAt: isoOrNull(r.generatedAt),
    approvedAt: isoOrNull(r.approvedAt),
    sentAt: isoOrNull(r.sentAt),
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  };
}

function toDelivery(r: Row): DeliveryRecord {
  return {
    id: String(r.id),
    reportId: String(r.reportId),
    subscriberId: String(r.subscriberId),
    email: String(r.email),
    status: r.status as DeliveryRecord["status"],
    resendId: (r.resendId as string | null) ?? null,
    error: (r.error as string | null) ?? null,
    sentAt: isoOrNull(r.sentAt),
    createdAt: iso(r.createdAt),
  };
}

export function createPgRepository(): Repository {
  return {
    backend: "prisma", // surfaced as a durable DB backend in admin stats
    subscribers: {
      async create(input: NewSubscriber) {
        const db = sql();
        const [row] = await db`
          INSERT INTO subscriber ${db({
            id: randomUUID(),
            email: input.email,
            name: input.name ?? null,
            status: "active",
            source: input.source ?? "founding",
            interests: input.interests ?? [],
            unsubscribeTok: randomUUID(),
          })}
          ON CONFLICT (email) DO UPDATE SET
            status = 'active',
            name = COALESCE(EXCLUDED.name, subscriber.name),
            interests = EXCLUDED.interests,
            updated_at = now()
          RETURNING *`;
        return toSubscriber(row);
      },
      async findByEmail(email) {
        const db = sql();
        const [row] = await db`SELECT * FROM subscriber WHERE email = ${email}`;
        return row ? toSubscriber(row) : null;
      },
      async findByToken(token) {
        const db = sql();
        const [row] =
          await db`SELECT * FROM subscriber WHERE unsubscribe_tok = ${token}`;
        return row ? toSubscriber(row) : null;
      },
      async update(id, patch) {
        const db = sql();
        const [row] = await db`
          UPDATE subscriber SET ${db({ ...patch, updatedAt: new Date() })}
          WHERE id = ${id} RETURNING *`;
        return row ? toSubscriber(row) : null;
      },
      async listActive() {
        const db = sql();
        const rows =
          await db`SELECT * FROM subscriber WHERE status = 'active' ORDER BY created_at DESC`;
        return rows.map(toSubscriber);
      },
      async all() {
        const db = sql();
        const rows = await db`SELECT * FROM subscriber ORDER BY created_at DESC`;
        return rows.map(toSubscriber);
      },
      async count(status?: SubscriberStatus) {
        const db = sql();
        const rows = status
          ? await db`SELECT count(*)::int AS n FROM subscriber WHERE status = ${status}`
          : await db`SELECT count(*)::int AS n FROM subscriber`;
        return Number(rows[0].n);
      },
    },
    reports: {
      async upsertBySlug(record: ReportRecord) {
        const db = sql();
        const data = {
          ...record,
          date: new Date(record.date),
          contentJson: db.json(record.contentJson as JsonVal),
          sourceSnapshot: db.json((record.sourceSnapshot ?? null) as JsonVal),
          generatedAt: record.generatedAt ? new Date(record.generatedAt) : null,
          approvedAt: record.approvedAt ? new Date(record.approvedAt) : null,
          sentAt: record.sentAt ? new Date(record.sentAt) : null,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(),
        };
        const [row] = await db`
          INSERT INTO report ${db(data)}
          ON CONFLICT (slug) DO UPDATE SET ${db(data, "title", "subtitle", "status", "cycleScore", "contentJson", "html", "markdown", "pdfUrl", "sourceSnapshot", "generatedAt", "approvedAt", "sentAt", "updatedAt")}
          RETURNING *`;
        return toReport(row);
      },
      async findBySlug(slug) {
        const db = sql();
        const [row] = await db`SELECT * FROM report WHERE slug = ${slug}`;
        return row ? toReport(row) : null;
      },
      async latest(type) {
        const db = sql();
        const [row] =
          await db`SELECT * FROM report WHERE type = ${type} ORDER BY date DESC LIMIT 1`;
        return row ? toReport(row) : null;
      },
      async list(type) {
        const db = sql();
        const rows = type
          ? await db`SELECT * FROM report WHERE type = ${type} ORDER BY date DESC`
          : await db`SELECT * FROM report ORDER BY date DESC`;
        return rows.map(toReport);
      },
      async update(slug, patch) {
        const db = sql();
        const data: Row = { ...patch, updatedAt: new Date() };
        for (const k of ["date", "generatedAt", "approvedAt", "sentAt"] as const) {
          if (k in patch && patch[k] != null) data[k] = new Date(patch[k]!);
        }
        if ("contentJson" in patch) data.contentJson = db.json(patch.contentJson as JsonVal);
        if ("sourceSnapshot" in patch)
          data.sourceSnapshot = db.json((patch.sourceSnapshot ?? null) as JsonVal);
        const [row] = await db`
          UPDATE report SET ${db(data)} WHERE slug = ${slug} RETURNING *`;
        return row ? toReport(row) : null;
      },
    },
    deliveries: {
      async create(record: DeliveryRecord) {
        const db = sql();
        const [row] = await db`
          INSERT INTO report_delivery ${db({
            ...record,
            sentAt: record.sentAt ? new Date(record.sentAt) : null,
            createdAt: new Date(record.createdAt),
          })} RETURNING *`;
        return toDelivery(row);
      },
      async update(id, patch) {
        const db = sql();
        const data: Row = { ...patch };
        if (patch.sentAt) data.sentAt = new Date(patch.sentAt);
        const [row] = await db`
          UPDATE report_delivery SET ${db(data)} WHERE id = ${id} RETURNING *`;
        return row ? toDelivery(row) : null;
      },
      async listByReport(reportId) {
        const db = sql();
        const rows =
          await db`SELECT * FROM report_delivery WHERE report_id = ${reportId} ORDER BY created_at DESC`;
        return rows.map(toDelivery);
      },
    },
  };
}

/** Probe: ensure schema exists and the connection works. */
export async function probePg(repo: Repository): Promise<void> {
  await ensureSchema();
  await repo.subscribers.count();
}
