import { DAILY_REPORT_SYSTEM_PROMPT } from "@/features/reports/lib/reportPromptTemplates";
import { DAILY_REPORT_JSON_SHAPE } from "../report.schema";

/** System prompt: the grounded, non-advisory analyst persona + output contract. */
export function buildDailySystemPrompt(): string {
  return `${DAILY_REPORT_SYSTEM_PROMPT}

Output format:
- Return ONLY a single JSON object. No prose, no markdown code fences, no commentary before or after.
- The JSON must conform exactly to the schema below (field names and enums verbatim).
- Write all human-readable text fields in Korean — dense, cold, institutional research tone.
- Never use 매수/매도/목표가/급등주/수익 보장 language. Use probability-based framing.
- Always include risks and at least one counterpoint somewhere in the rationale.

Schema:
${DAILY_REPORT_JSON_SHAPE}`;
}

/** User prompt: the date + the source-grounded data snapshot. */
export function buildDailyUserPrompt(date: string, snapshot: unknown): string {
  return `Generate the K-Semi Morning Brief for ${date}.

Use ONLY the following grounding snapshot as your source data, and reflect it in the "sources" field:

${JSON.stringify(snapshot, null, 2)}

Return the JSON object now.`;
}
