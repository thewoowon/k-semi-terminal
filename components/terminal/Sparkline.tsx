import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  /** stroke color (hex/css). Defaults to currentColor. */
  color?: string;
  /** fill a faint area under the line */
  area?: boolean;
  /** draw a dot on the last point */
  dot?: boolean;
  strokeWidth?: number;
  className?: string;
};

/**
 * Hand-rolled SVG sparkline — sharper and lighter than a chart lib for this
 * dense terminal aesthetic. Pure/presentational, safe in Server Components.
 */
export function Sparkline({
  data,
  width = 96,
  height = 28,
  color = "currentColor",
  area = false,
  dot = false,
  strokeWidth = 1.5,
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = strokeWidth + 1;
  const usableH = height - pad * 2;

  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + (1 - (v - min) / span) * usableH;
    return [x, y] as const;
  });

  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1];
  const gradId = `sl-${Math.abs(hash(data))}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      style={{ color }}
      aria-hidden
    >
      {area && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path
            d={`${line} L${last[0].toFixed(1)},${height} L0,${height} Z`}
            fill={`url(#${gradId})`}
            stroke="none"
          />
        </>
      )}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dot && (
        <circle cx={last[0]} cy={last[1]} r={strokeWidth + 0.6} fill={color} />
      )}
    </svg>
  );
}

function hash(data: number[]): number {
  let h = 0;
  for (const v of data) h = (h * 31 + Math.round(v * 100)) | 0;
  return h;
}
