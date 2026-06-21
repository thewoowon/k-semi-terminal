/** Persistence record shapes + repository contract (DB-agnostic). */

export type SubscriberStatus = "active" | "unsubscribed" | "bounced";

export type SubscriberRecord = {
  id: string;
  email: string;
  name: string | null;
  status: SubscriberStatus;
  source: string;
  interests: string[];
  unsubscribeTok: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type ReportStatus =
  | "draft"
  | "generated"
  | "approved"
  | "sent"
  | "failed";

export type ReportRecord = {
  id: string;
  type: "daily" | "weekly";
  slug: string;
  title: string;
  subtitle: string | null;
  date: string; // ISO
  status: ReportStatus;
  accessLevel: string;
  cycleScore: number | null;
  contentJson: unknown;
  html: string | null;
  markdown: string | null;
  pdfUrl: string | null;
  sourceSnapshot: unknown | null;
  generatedAt: string | null;
  approvedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryStatus = "pending" | "sent" | "failed" | "skipped";

export type DeliveryRecord = {
  id: string;
  reportId: string;
  subscriberId: string;
  email: string;
  status: DeliveryStatus;
  resendId: string | null;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type NewSubscriber = {
  email: string;
  name?: string | null;
  interests?: string[];
  source?: string;
};

export interface Repository {
  readonly backend: "file" | "prisma";
  subscribers: {
    create(input: NewSubscriber): Promise<SubscriberRecord>;
    findByEmail(email: string): Promise<SubscriberRecord | null>;
    findByToken(token: string): Promise<SubscriberRecord | null>;
    update(
      id: string,
      patch: Partial<Pick<SubscriberRecord, "status" | "name" | "interests">>,
    ): Promise<SubscriberRecord | null>;
    listActive(): Promise<SubscriberRecord[]>;
    all(): Promise<SubscriberRecord[]>;
    count(status?: SubscriberStatus): Promise<number>;
  };
  reports: {
    upsertBySlug(record: ReportRecord): Promise<ReportRecord>;
    findBySlug(slug: string): Promise<ReportRecord | null>;
    latest(type: "daily" | "weekly"): Promise<ReportRecord | null>;
    list(type?: "daily" | "weekly"): Promise<ReportRecord[]>;
    update(
      slug: string,
      patch: Partial<ReportRecord>,
    ): Promise<ReportRecord | null>;
  };
  deliveries: {
    create(record: DeliveryRecord): Promise<DeliveryRecord>;
    update(
      id: string,
      patch: Partial<DeliveryRecord>,
    ): Promise<DeliveryRecord | null>;
    listByReport(reportId: string): Promise<DeliveryRecord[]>;
  };
}
