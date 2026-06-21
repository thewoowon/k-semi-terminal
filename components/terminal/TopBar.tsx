"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTerminal } from "@/features/terminal/store";
import { terminalSnapshot } from "@/features/terminal/data/mockTerminalData";
import { pct } from "@/features/terminal/lib/format";
import { cn } from "@/lib/utils";
import Image from "next/image";

const KRX_TONE: Record<string, string> = {
  OPEN: "text-up",
  PRE: "text-warm",
  CLOSED: "text-flat",
};

export function TopBar() {
  const runCommand = useTerminal((s) => s.runCommand);
  const setPalette = useTerminal((s) => s.setPalette);
  const commandEcho = useTerminal((s) => s.commandEcho);
  const [value, setValue] = useState("");
  const [clock, setClock] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { marketStatus } = terminalSnapshot;

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPalette]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    runCommand(value);
    setValue("");
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-panel/90 px-3 backdrop-blur">
      {/* brand */}
      <div className="flex items-center gap-2 pr-1">
        <div className=" relative grid h-7 w-7 place-items-center bg-hot/10">
          <Image
            src="/k-semi-logo.png"
            alt="Picture of the author"
            fill
            className="object-contain"
            sizes="28px"
          />
        </div>

        <div className="leading-tight">
          <div className="text-[13px] font-bold tracking-tight text-ink">
            K-Semi
            <span className="ml-1 rounded bg-elevated px-1 py-0.5 text-[9px] font-mono font-semibold text-ink-dim">
              GO
            </span>
          </div>
        </div>
      </div>

      {/* command line */}
      <form onSubmit={submit} className="relative flex-1 max-w-2xl">
        <div className="group flex h-8 items-center gap-2 rounded-md border border-line bg-base/80 px-2.5 focus-within:border-hot/50 focus-within:bg-base">
          <span className="font-mono text-[11px] text-hot">›</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search ticker / company / signal — e.g.  HBM ‹GO›   005930   SOX"
            spellCheck={false}
            autoComplete="off"
            className="h-full flex-1 bg-transparent font-mono text-[12px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          {commandEcho && (
            <span className="hidden rounded bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-ink-dim sm:inline">
              {commandEcho}
            </span>
          )}
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="hidden items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-faint hover:text-ink-dim sm:flex"
          >
            ⌘K
          </button>
        </div>
      </form>

      {/* reports link */}
      <Link
        href="/reports"
        className="ml-auto hidden items-center gap-1.5 rounded-md border border-hot/40 bg-hot/10 px-2.5 py-1.5 text-[11px] font-semibold text-hot hover:bg-hot/15 lg:flex"
      >
        <span className="text-[9px]">★</span>
        K-Semi Signal
      </Link>

      {/* market status */}
      <div className="flex items-center gap-3 font-mono text-[11px] max-lg:ml-auto">
        <Stat
          label="KOSPI"
          value={marketStatus.kospi.toFixed(1)}
          delta={marketStatus.kospiChange}
        />
        <span className="h-4 w-px bg-line" />
        <Stat label="USD/KRW" value={marketStatus.usdkrw.toFixed(1)} />
        <span className="h-4 w-px bg-line" />
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              marketStatus.krx === "OPEN" ? "bg-up" : "bg-flat"
            )}
            style={{
              animation:
                marketStatus.krx === "OPEN" ? "k-pulse 2s infinite" : undefined,
            }}
          />
          <span className={cn("font-semibold", KRX_TONE[marketStatus.krx])}>
            KRX {marketStatus.krx}
          </span>
        </div>
        <span className="hidden tabular-nums text-ink-dim md:inline">
          {clock} KST
        </span>
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-ink-faint">{label}</span>
      <span className="font-semibold tabular-nums text-ink">{value}</span>
      {delta !== undefined && (
        <span
          className={cn(
            "tabular-nums",
            delta > 0 ? "text-up" : delta < 0 ? "text-down" : "text-flat"
          )}
        >
          {pct(delta)}
        </span>
      )}
    </div>
  );
}
