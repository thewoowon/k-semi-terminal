import type { Metadata } from "next";
import { TerminalShell } from "@/components/terminal/TerminalShell";

export const metadata: Metadata = {
  title: "K-Semi Terminal",
};

export default function TerminalPage() {
  return <TerminalShell />;
}
