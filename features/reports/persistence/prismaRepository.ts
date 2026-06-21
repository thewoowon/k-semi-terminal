import "server-only";
import type {
  DeliveryRecord,
  NewSubscriber,
  Repository,
  ReportRecord,
  SubscriberRecord,
  SubscriberStatus,
} from "./types";

/**
 * Prisma-backed repository, used only when DATABASE_URL is set. The client is
 * loaded through a build-hidden dynamic import (non-literal specifier +
 * webpackIgnore) so `@prisma/client` never enters the static bundle — this is
 * what lets `next build` pass with no database and no generated client.
 *
 * To enable: provision Postgres, set DATABASE_URL, then
 *   yarn prisma generate && yarn prisma migrate deploy
 */

// Minimal structural typing for the parts of the Prisma client we touch.
type Row = Record<string, unknown>;
interface Delegate {
  create(args: { data: Row }): Promise<Row>;
  findUnique(args: { where: Row }): Promise<Row | null>;
  findFirst(args: { where?: Row; orderBy?: Row }): Promise<Row | null>;
  findMany(args?: { where?: Row; orderBy?: Row }): Promise<Row[]>;
  update(args: { where: Row; data: Row }): Promise<Row>;
  upsert(args: { where: Row; create: Row; update: Row }): Promise<Row>;
  count(args?: { where?: Row }): Promise<number>;
}
interface PrismaClientish {
  subscriber: Delegate;
  report: Delegate;
  reportDelivery: Delegate;
}

let clientPromise: Promise<PrismaClientish> | null = null;
async function client(): Promise<PrismaClientish> {
  if (!clientPromise) {
    clientPromise = (async () => {
      // Load the project-local generated client via a runtime file URL so the
      // path never enters the webpack bundle. Throws if not generated (e.g.
      // under Yarn PnP) — the repository factory catches this and falls back to
      // the file store.
      const path = await import("node:path");
      const { pathToFileURL } = await import("node:url");
      const entry = pathToFileURL(
        path.join(process.cwd(), "lib/generated/prisma/index.js"),
      ).href;
      const mod = await import(/* webpackIgnore: true */ entry);
      const Ctor = (mod as { PrismaClient: new () => PrismaClientish })
        .PrismaClient;
      return new Ctor();
    })();
  }
  return clientPromise;
}

/** Force the client to load (used as a connectivity probe by the factory). */
export async function probePrisma(repo: Repository): Promise<void> {
  await repo.subscribers.count();
}

const iso = (d: unknown): string =>
  d instanceof Date ? d.toISOString() : String(d);
const isoOrNull = (d: unknown): string | null =>
  d == null ? null : iso(d);

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

/** Date-ish fields that must be sent to Prisma as Date objects. */
function reportData(patch: Partial<ReportRecord>): Row {
  const data: Row = { ...patch };
  for (const key of ["date", "generatedAt", "approvedAt", "sentAt"] as const) {
    if (key in patch && patch[key] != null) data[key] = new Date(patch[key]!);
  }
  return data;
}

export function createPrismaRepository(): Repository {
  return {
    backend: "prisma",
    subscribers: {
      async create(input: NewSubscriber) {
        const c = await client();
        const { randomUUID } = await import("node:crypto");
        const row = await c.subscriber.upsert({
          where: { email: input.email },
          create: {
            email: input.email,
            name: input.name ?? null,
            interests: input.interests ?? [],
            source: input.source ?? "founding",
            unsubscribeTok: randomUUID(),
          },
          update: {
            status: "active",
            name: input.name ?? undefined,
            interests: input.interests ?? undefined,
          },
        });
        return toSubscriber(row);
      },
      async findByEmail(email) {
        const c = await client();
        const row = await c.subscriber.findUnique({ where: { email } });
        return row ? toSubscriber(row) : null;
      },
      async findByToken(token) {
        const c = await client();
        const row = await c.subscriber.findUnique({
          where: { unsubscribeTok: token },
        });
        return row ? toSubscriber(row) : null;
      },
      async update(id, patch) {
        const c = await client();
        const row = await c.subscriber.update({ where: { id }, data: patch });
        return row ? toSubscriber(row) : null;
      },
      async listActive() {
        const c = await client();
        const rows = await c.subscriber.findMany({ where: { status: "active" } });
        return rows.map(toSubscriber);
      },
      async all() {
        const c = await client();
        return (await c.subscriber.findMany()).map(toSubscriber);
      },
      async count(status?: SubscriberStatus) {
        const c = await client();
        return c.subscriber.count(status ? { where: { status } } : undefined);
      },
    },
    reports: {
      async upsertBySlug(record: ReportRecord) {
        const c = await client();
        const data = reportData(record);
        const row = await c.report.upsert({
          where: { slug: record.slug },
          create: data,
          update: data,
        });
        return toReport(row);
      },
      async findBySlug(slug) {
        const c = await client();
        const row = await c.report.findUnique({ where: { slug } });
        return row ? toReport(row) : null;
      },
      async latest(type) {
        const c = await client();
        const row = await c.report.findFirst({
          where: { type },
          orderBy: { date: "desc" },
        });
        return row ? toReport(row) : null;
      },
      async list(type) {
        const c = await client();
        const rows = await c.report.findMany({
          where: type ? { type } : undefined,
          orderBy: { date: "desc" },
        });
        return rows.map(toReport);
      },
      async update(slug, patch) {
        const c = await client();
        const row = await c.report.update({
          where: { slug },
          data: reportData(patch),
        });
        return row ? toReport(row) : null;
      },
    },
    deliveries: {
      async create(record: DeliveryRecord) {
        const c = await client();
        const row = await c.reportDelivery.create({
          data: {
            ...record,
            sentAt: record.sentAt ? new Date(record.sentAt) : null,
          },
        });
        return toDelivery(row);
      },
      async update(id, patch) {
        const c = await client();
        const data: Row = { ...patch };
        if (patch.sentAt) data.sentAt = new Date(patch.sentAt);
        const row = await c.reportDelivery.update({ where: { id }, data });
        return row ? toDelivery(row) : null;
      },
      async listByReport(reportId) {
        const c = await client();
        const rows = await c.reportDelivery.findMany({ where: { reportId } });
        return rows.map(toDelivery);
      },
    },
  };
}
