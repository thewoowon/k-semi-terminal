import { MemoryPriceBoard } from "./MemoryPriceBoard";
import { GlobalBellwetherStrip } from "./GlobalBellwetherStrip";
import { KoreaHeatMatrix } from "./KoreaHeatMatrix";
import { EventFeed } from "./EventFeed";

/** 4-column bottom grid (spec §18.4). */
export function BottomDock() {
  return (
    <div className="grid h-full grid-cols-[1fr_1fr_1.25fr_1.1fr] gap-2">
      <MemoryPriceBoard />
      <GlobalBellwetherStrip />
      <KoreaHeatMatrix />
      <EventFeed />
    </div>
  );
}
