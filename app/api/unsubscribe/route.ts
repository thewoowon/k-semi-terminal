import { unsubscribe } from "@/features/subscribers/unsubscribe";
import { captureError } from "@/lib/observability";

async function handle(token: string) {
  try {
    const res = await unsubscribe(token);
    return Response.json(res, { status: res.ok ? 200 : 404 });
  } catch (e) {
    await captureError(e, { route: "unsubscribe" });
    return Response.json({ ok: false, error: "failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  return handle(token);
}

// RFC 8058 one-click unsubscribe (POST from List-Unsubscribe-Post).
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  return handle(token);
}
