"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTerminal, COMMAND_SUGGESTIONS } from "@/features/terminal/store";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const open = useTerminal((s) => s.paletteOpen);
  const setPalette = useTerminal((s) => s.setPalette);

  return (
    <AnimatePresence>
      {open && <PaletteBody onClose={() => setPalette(false)} />}
    </AnimatePresence>
  );
}

/**
 * Mounted only while open, so query/cursor start fresh each time — no
 * state-reset effect needed (avoids cascading renders).
 */
function PaletteBody({ onClose }: { onClose: () => void }) {
  const runCommand = useTerminal((s) => s.runCommand);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return COMMAND_SUGGESTIONS;
    return COMMAND_SUGGESTIONS.filter(
      (s) => s.cmd.includes(q) || s.label.toUpperCase().includes(q),
    );
  }, [query]);

  // Focus on mount — DOM synchronization, the legitimate use of an effect.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(results.length - 1, c + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const pick = results[cursor];
        if (pick) runCommand(pick.cmd);
        else if (query.trim()) runCommand(query);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, cursor, query, runCommand, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      <div
        className="absolute inset-0 bg-base/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative w-140 max-w-[92vw] overflow-hidden rounded-xl border border-line-strong bg-panel shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)]"
        initial={{ opacity: 0, y: -8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.985 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2 border-b border-line px-3.5 py-3">
          <span className="font-mono text-[13px] text-hot">›</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Type a command — HBM, DRAM, SOX, 005930 …"
            spellCheck={false}
            className="flex-1 bg-transparent font-mono text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-ink-faint">
            ESC
          </kbd>
        </div>
        <ul className="max-h-[44vh] overflow-y-auto scrollarea p-1.5">
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-[12px] text-ink-faint">
              No match — press Enter to run “{query}”
            </li>
          )}
          {results.map((s, i) => (
            <li key={s.cmd}>
              <button
                onMouseEnter={() => setCursor(i)}
                onClick={() => runCommand(s.cmd)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left",
                  i === cursor ? "bg-elevated" : "hover:bg-elevated/50",
                )}
              >
                <span className="w-16 shrink-0 font-mono text-[12px] font-semibold text-hot">
                  {s.cmd}
                </span>
                <span className="flex-1 truncate text-[12.5px] text-ink">
                  {s.label}
                </span>
                <span className="rounded bg-base px-1.5 py-0.5 font-mono text-[9px] uppercase text-ink-faint">
                  {s.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line px-3.5 py-2 font-mono text-[9px] text-ink-faint">
          <span>↑↓ navigate · ↵ run · esc close</span>
          <span>K-SEMI COMMAND</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
