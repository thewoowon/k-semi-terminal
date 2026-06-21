import { events as mockEvents } from "@/features/terminal/data/mockEvents";
import { fetchDartDisclosures } from "@/features/terminal/lib/dart";
import { features } from "@/lib/env";
import type { SemiEvent } from "@/features/terminal/types";

/**
 * Event feed. DART supplies live `disclosure` events for our Korean universe;
 * other event types (news / earnings / export / price) have no live feed yet
 * and stay mock. When DART is configured we replace the mock disclosures with
 * the live ones and keep the rest; otherwise the feed is fully mock.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const dart = features.dart ? await fetchDartDisclosures() : null;

  let events: SemiEvent[];
  if (dart) {
    const nonDisclosure = mockEvents.filter((e) => e.type !== "disclosure");
    events = [...dart, ...nonDisclosure].sort((a, b) =>
      b.occurredAt.localeCompare(a.occurredAt),
    );
  } else {
    events = mockEvents;
  }

  return Response.json(
    { events, now: new Date().toISOString(), dartLive: Boolean(dart) },
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    },
  );
}
