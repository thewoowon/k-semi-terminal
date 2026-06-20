/** Disclaimer block shown at the foot of every report (spec §12). */
export function ReportDisclaimer({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-line/60 bg-base/30 p-3">
      <div className="label-xs mb-1.5">Disclaimer</div>
      <p className="text-[10.5px] leading-relaxed text-ink-faint">{text}</p>
    </div>
  );
}
