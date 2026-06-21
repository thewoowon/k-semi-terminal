import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

let client: Resend | null = null;

/** Server-only Resend client. Instantiated only when the API key is present. */
export function resend(): Resend {
  if (!env.resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!client) client = new Resend(env.resendApiKey);
  return client;
}
