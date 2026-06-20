import { Panel } from "./Panel";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { LeftRail } from "@/features/terminal/components/LeftRail";
import { RightInspector } from "@/features/terminal/components/RightInspector";
import { BottomDock } from "@/features/terminal/components/BottomDock";
import { SignalChainGraph } from "@/features/terminal/components/SignalChainGraph";

/**
 * Top-level terminal layout (spec §7, §9.1). Desktop-first: fits a 1440px
 * viewport without page scroll (UI AC §20). Center canvas is the hero.
 */
export function TerminalShell() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-grid">
      <TopBar />

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        {/* upper region: rail · canvas · inspector */}
        <div className="flex min-h-0 flex-1 gap-2">
          <LeftRail />

          <Panel flush className="relative min-w-0 flex-1 overflow-hidden">
            {/* canvas caption */}
            <div className="pointer-events-none absolute right-3 top-3 z-10 hidden md:block">
              <span className="label-xs">Signal Chain · Korea Semiconductor</span>
            </div>
            <div className="absolute inset-0">
              <SignalChainGraph />
            </div>
          </Panel>

          <RightInspector />
        </div>

        {/* bottom dock */}
        <div className="h-58 shrink-0">
          <BottomDock />
        </div>
      </div>

      <CommandPalette />
    </div>
  );
}
