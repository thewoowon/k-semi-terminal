"use client";

import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { kstTime } from "@/lib/formatDate";
import {
  actionListMemory,
  actionSaveMemory,
  type MemoryRow,
} from "@/app/admin/memory/actions";

const CAT_TONE: Record<string, string> = {
  HBM: "text-hbm border-hbm/30 bg-hbm/10",
  DRAM: "text-memory border-memory/30 bg-memory/10",
  NAND: "text-equip border-equip/30 bg-equip/10",
};

type Draft = { current: string; changePct: string; sessionLow: string; sessionHigh: string };

export function AdminMemoryClient() {
  const [rows, setRows] = useState<MemoryRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [log, setLog] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const refresh = () =>
    actionListMemory().then((r) => {
      setRows(r);
      setDrafts(
        Object.fromEntries(
          r.map((q) => [
            q.id,
            {
              current: String(q.current),
              changePct: String(q.changePct),
              sessionLow: String(q.sessionLow),
              sessionHigh: String(q.sessionHigh),
            },
          ]),
        ),
      );
    });

  useEffect(() => {
    refresh();
  }, []);

  const setField = (id: string, key: keyof Draft, value: string) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [key]: value } }));

  const save = (row: MemoryRow) => {
    const d = drafts[row.id];
    if (!d) return;
    const input = {
      id: row.id,
      current: Number(d.current),
      changePct: Number(d.changePct),
      sessionLow: Number(d.sessionLow),
      sessionHigh: Number(d.sessionHigh),
    };
    if (!Number.isFinite(input.current) || !Number.isFinite(input.changePct)) {
      setLog(`✗ ${row.item}: 숫자 값을 확인하세요.`);
      return;
    }
    start(async () => {
      const res = await actionSaveMemory(input);
      if (res.ok) {
        setLog(`✓ ${row.item} 저장됨 (${kstTime(res.lastUpdated)} KST)`);
        await refresh();
      } else {
        setLog(`✗ ${row.item}: ${res.error}`);
      }
    });
  };

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-ink">Memory Price Board</h1>
          <p className="text-[12px] text-ink-dim">
            DRAM/NAND/HBM 계약·현물가 수동 입력. 저장 즉시 터미널 보드에 반영됩니다.
          </p>
        </div>
        {log && (
          <span className="font-mono text-[11px] text-ink-dim">{log}</span>
        )}
      </header>

      <div className="overflow-x-auto rounded-lg border border-line bg-panel/60">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="label-xs text-left text-ink-faint">
              <th className="px-3 py-2 font-normal">Item</th>
              <th className="px-2 py-2 text-right font-normal">Current</th>
              <th className="px-2 py-2 text-right font-normal">Chg %</th>
              <th className="px-2 py-2 text-right font-normal">Low</th>
              <th className="px-2 py-2 text-right font-normal">High</th>
              <th className="px-2 py-2 text-right font-normal">Updated</th>
              <th className="px-3 py-2 text-right font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const d = drafts[row.id];
              if (!d) return null;
              return (
                <tr key={row.id} className="border-t border-line/60">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded border px-1.5 py-0.5 font-mono text-[9px]",
                          CAT_TONE[row.category] ?? "border-line text-ink-dim",
                        )}
                      >
                        {row.category}
                      </span>
                      <div>
                        <div className="font-medium text-ink">{row.item}</div>
                        <div className="font-mono text-[9px] uppercase text-ink-faint">
                          {row.market} · {row.unit}
                        </div>
                      </div>
                    </div>
                  </td>
                  <NumCell value={d.current} onChange={(v) => setField(row.id, "current", v)} />
                  <NumCell value={d.changePct} onChange={(v) => setField(row.id, "changePct", v)} />
                  <NumCell value={d.sessionLow} onChange={(v) => setField(row.id, "sessionLow", v)} />
                  <NumCell value={d.sessionHigh} onChange={(v) => setField(row.id, "sessionHigh", v)} />
                  <td className="px-2 py-2 text-right font-mono text-[10px] text-ink-faint">
                    {kstTime(row.lastUpdated) || "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => save(row)}
                      disabled={pending}
                      className="rounded-md border border-hot/40 bg-hot/10 px-2.5 py-1 text-[11px] font-semibold text-hot hover:bg-hot/15 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NumCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <td className="px-2 py-2 text-right">
      <input
        value={value}
        inputMode="decimal"
        onChange={(e) => onChange(e.target.value)}
        className="w-20 rounded border border-line bg-base/80 px-2 py-1 text-right font-mono text-[11px] text-ink focus:border-hot/50 focus:outline-none"
      />
    </td>
  );
}
