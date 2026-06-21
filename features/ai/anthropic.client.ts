import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

let client: Anthropic | null = null;

/**
 * Server-only Claude client. Instantiated lazily and only when the API key is
 * present (callers gate on `features.ai`). The key never reaches the browser.
 */
export function anthropic(): Anthropic {
  if (!env.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!client) {
    client = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return client;
}

export const REPORT_MODEL = env.anthropicModel;
