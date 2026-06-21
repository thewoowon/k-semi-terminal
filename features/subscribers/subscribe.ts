import "server-only";
import { z } from "zod";
import { getRepository } from "@/features/reports/persistence";
import { env } from "@/lib/env";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeInput = z.object({
  email: z
    .string()
    .trim()
    .refine((v) => EMAIL_RE.test(v), "올바른 이메일 주소를 입력해 주세요."),
  name: z.string().trim().max(120).optional(),
  interests: z.array(z.string().max(40)).max(20).optional(),
  source: z.string().max(40).optional(),
});

export type SubscribeInput = z.infer<typeof subscribeInput>;

export type SubscribeResult = {
  id: string;
  email: string;
  status: string;
  unsubscribeUrl: string;
};

export function unsubscribeUrl(token: string): string {
  return `${env.appUrl}/unsubscribe?token=${encodeURIComponent(token)}`;
}

/** Founding Reader registration (launch checklist §10). */
export async function subscribe(raw: unknown): Promise<SubscribeResult> {
  const input = subscribeInput.parse(raw);
  const repo = await getRepository();
  const sub = await repo.subscribers.create({
    email: input.email.toLowerCase(),
    name: input.name || null,
    interests: input.interests ?? [],
    source: input.source ?? "founding",
  });
  return {
    id: sub.id,
    email: sub.email,
    status: sub.status,
    unsubscribeUrl: unsubscribeUrl(sub.unsubscribeTok),
  };
}
