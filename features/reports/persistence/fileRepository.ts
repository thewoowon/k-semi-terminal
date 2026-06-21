import "server-only";
import { randomUUID } from "node:crypto";
import { mutate, readAll } from "./fileStore";
import type {
  DeliveryRecord,
  NewSubscriber,
  Repository,
  ReportRecord,
  SubscriberRecord,
  SubscriberStatus,
} from "./types";

const SUBS = "subscribers";
const REPORTS = "reports";
const DELIV = "deliveries";

const now = () => new Date().toISOString();

/** File-backed repository — the Phase 0 default (no database required). */
export function createFileRepository(): Repository {
  return {
    backend: "file",

    subscribers: {
      async create(input: NewSubscriber) {
        return mutate<SubscriberRecord, SubscriberRecord>(SUBS, (rows) => {
          const existing = rows.find(
            (r) => r.email.toLowerCase() === input.email.toLowerCase(),
          );
          if (existing) {
            // Re-subscribe / update interests; reactivate if previously off.
            existing.status = "active";
            existing.name = input.name ?? existing.name;
            existing.interests = input.interests ?? existing.interests;
            existing.updatedAt = now();
            return { rows, result: existing };
          }
          const rec: SubscriberRecord = {
            id: randomUUID(),
            email: input.email,
            name: input.name ?? null,
            status: "active",
            source: input.source ?? "founding",
            interests: input.interests ?? [],
            unsubscribeTok: randomUUID(),
            createdAt: now(),
            updatedAt: now(),
          };
          return { rows: [...rows, rec], result: rec };
        });
      },
      async findByEmail(email) {
        const rows = await readAll<SubscriberRecord>(SUBS);
        return (
          rows.find((r) => r.email.toLowerCase() === email.toLowerCase()) ?? null
        );
      },
      async findByToken(token) {
        const rows = await readAll<SubscriberRecord>(SUBS);
        return rows.find((r) => r.unsubscribeTok === token) ?? null;
      },
      async update(id, patch) {
        return mutate<SubscriberRecord, SubscriberRecord | null>(SUBS, (rows) => {
          const rec = rows.find((r) => r.id === id);
          if (!rec) return { rows, result: null };
          Object.assign(rec, patch, { updatedAt: now() });
          return { rows, result: rec };
        });
      },
      async listActive() {
        const rows = await readAll<SubscriberRecord>(SUBS);
        return rows.filter((r) => r.status === "active");
      },
      async all() {
        return readAll<SubscriberRecord>(SUBS);
      },
      async count(status?: SubscriberStatus) {
        const rows = await readAll<SubscriberRecord>(SUBS);
        return status ? rows.filter((r) => r.status === status).length : rows.length;
      },
    },

    reports: {
      async upsertBySlug(record: ReportRecord) {
        return mutate<ReportRecord, ReportRecord>(REPORTS, (rows) => {
          const idx = rows.findIndex((r) => r.slug === record.slug);
          if (idx >= 0) {
            const merged = { ...rows[idx], ...record, updatedAt: now() };
            rows[idx] = merged;
            return { rows, result: merged };
          }
          return { rows: [...rows, record], result: record };
        });
      },
      async findBySlug(slug) {
        const rows = await readAll<ReportRecord>(REPORTS);
        return rows.find((r) => r.slug === slug) ?? null;
      },
      async latest(type) {
        const rows = (await readAll<ReportRecord>(REPORTS))
          .filter((r) => r.type === type)
          .sort((a, b) => b.date.localeCompare(a.date));
        return rows[0] ?? null;
      },
      async list(type) {
        const rows = await readAll<ReportRecord>(REPORTS);
        return (type ? rows.filter((r) => r.type === type) : rows).sort((a, b) =>
          b.date.localeCompare(a.date),
        );
      },
      async update(slug, patch) {
        return mutate<ReportRecord, ReportRecord | null>(REPORTS, (rows) => {
          const rec = rows.find((r) => r.slug === slug);
          if (!rec) return { rows, result: null };
          Object.assign(rec, patch, { updatedAt: now() });
          return { rows, result: rec };
        });
      },
    },

    deliveries: {
      async create(record: DeliveryRecord) {
        return mutate<DeliveryRecord, DeliveryRecord>(DELIV, (rows) => ({
          rows: [...rows, record],
          result: record,
        }));
      },
      async update(id, patch) {
        return mutate<DeliveryRecord, DeliveryRecord | null>(DELIV, (rows) => {
          const rec = rows.find((r) => r.id === id);
          if (!rec) return { rows, result: null };
          Object.assign(rec, patch);
          return { rows, result: rec };
        });
      },
      async listByReport(reportId) {
        const rows = await readAll<DeliveryRecord>(DELIV);
        return rows.filter((r) => r.reportId === reportId);
      },
    },
  };
}
