import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Tiny JSON-array file store under .data/. Phase 0 persistence with no DB.
 * Per-file write serialization avoids intra-process read-modify-write races.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const locks = new Map<string, Promise<unknown>>();

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function fileFor(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

export async function readAll<T>(name: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(fileFor(name), "utf8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

/** Serialize a read-modify-write against one collection. */
export async function mutate<T, R>(
  name: string,
  fn: (rows: T[]) => { rows: T[]; result: R } | Promise<{ rows: T[]; result: R }>,
): Promise<R> {
  const prev = locks.get(name) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((r) => (release = r));
  locks.set(
    name,
    prev.then(() => next),
  );
  await prev;
  try {
    await ensureDir();
    const rows = await readAll<T>(name);
    const { rows: updated, result } = await fn(rows);
    await fs.writeFile(fileFor(name), JSON.stringify(updated, null, 2), "utf8");
    return result;
  } finally {
    release();
  }
}
