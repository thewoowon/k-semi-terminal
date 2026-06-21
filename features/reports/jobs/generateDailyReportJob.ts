import "server-only";
import { generateDailyReport } from "@/features/ai/generateDailyReport";
import { createDailyReport } from "../services/createReport";

export type GenerateJobInput = { date: string; mode?: "draft" };
export type GenerateJobResult =
  | {
      ok: true;
      slug: string;
      status: string;
      source: "claude" | "mock";
      model: string;
      cycleScore: number | null;
    }
  | { ok: false; error: string };

/** Generate + persist today's daily report (launch checklist §7, §8). */
export async function generateDailyReportJob(
  input: GenerateJobInput,
): Promise<GenerateJobResult> {
  try {
    const { report, source, model, sourceCount, dataCutoff } =
      await generateDailyReport(input.date);
    const record = await createDailyReport(report, {
      source,
      model,
      sourceCount,
      dataCutoff,
    });
    return {
      ok: true,
      slug: record.slug,
      status: record.status,
      source,
      model,
      cycleScore: record.cycleScore,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
