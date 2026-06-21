import { z } from "zod";
import { subscribe } from "@/features/subscribers/subscribe";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { captureError } from "@/lib/observability";

export async function POST(req: Request) {
  const rl = rateLimit(`subscribe:${clientIp(req)}`, 5, 60_000);
  if (!rl.ok) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await subscribe(body);
    return Response.json({ ok: true, status: result.status });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return Response.json(
        { error: e.issues[0]?.message ?? "입력값을 확인해 주세요." },
        { status: 400 },
      );
    }
    await captureError(e, { route: "subscribe" });
    return Response.json({ error: "구독 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
