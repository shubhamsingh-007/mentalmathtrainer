import type { SessionResult } from "@/lib/progress";
import { OPERATIONS, type Operation } from "@/lib/math";

/** Compact line chart of accuracy across the most recent N sessions (oldest→newest). */
export function AccuracyTrend({ history }: { history: SessionResult[] }) {
  const data = [...history]
    .slice(0, 20)
    .reverse()
    .map((s) => (s.total ? s.correct / s.total : 0));

  const W = 600;
  const H = 160;
  const PAD_L = 28;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 22;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  if (data.length < 2) {
    return (
      <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
        Play at least 2 sessions to see your accuracy trend.
      </div>
    );
  }

  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;
  const points = data.map((y, i) => {
    const px = PAD_L + i * step;
    const py = PAD_T + (1 - y) * innerH;
    return [px, py] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${path} L${points[points.length - 1][0].toFixed(1)} ${PAD_T + innerH} L${PAD_L} ${PAD_T + innerH} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const last = data[data.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" role="img" aria-label="Accuracy across recent sessions">
      <defs>
        <linearGradient id="accFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const y = PAD_T + (1 - t) * innerH;
        return (
          <g key={t}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y}
              y2={y}
              stroke="var(--color-border)"
              strokeDasharray={t === 0 || t === 1 ? "" : "3 4"}
              strokeWidth={1}
            />
            <text
              x={PAD_L - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="var(--color-muted-foreground)"
            >
              {Math.round(t * 100)}%
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#accFill)" />
      <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === points.length - 1 ? 3.5 : 2.2}
          fill={i === points.length - 1 ? "var(--color-primary)" : "var(--color-background)"}
          stroke="var(--color-primary)"
          strokeWidth={1.5}
        />
      ))}
      <text
        x={W - PAD_R}
        y={PAD_T + (1 - last) * innerH - 8}
        textAnchor="end"
        fontSize={10}
        fontWeight={600}
        fill="var(--color-primary)"
      >
        {Math.round(last * 100)}%
      </text>
      <text x={PAD_L} y={H - 6} fontSize={9} fill="var(--color-muted-foreground)">
        Oldest
      </text>
      <text x={W - PAD_R} y={H - 6} textAnchor="end" fontSize={9} fill="var(--color-muted-foreground)">
        Latest
      </text>
    </svg>
  );
}

/** Horizontal bars: average response time per operation (lower is better). */
export function AvgTimePerOp({ history }: { history: SessionResult[] }) {
  const byOp = new Map<Operation, { ms: number; q: number }>();
  for (const s of history) {
    if (!s.total) continue;
    const cur = byOp.get(s.op) ?? { ms: 0, q: 0 };
    cur.ms += s.totalMs;
    cur.q += s.total;
    byOp.set(s.op, cur);
  }

  const rows = OPERATIONS.map((o) => {
    const v = byOp.get(o.id as Operation);
    return {
      id: o.id,
      label: o.label,
      avgSec: v && v.q ? v.ms / v.q / 1000 : null,
    };
  });

  const maxSec = Math.max(1, ...rows.map((r) => r.avgSec ?? 0));

  const hasData = rows.some((r) => r.avgSec != null);
  if (!hasData) {
    return (
      <div className="flex h-[160px] items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
        No timing data yet. Finish a session to populate this.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = r.avgSec != null ? (r.avgSec / maxSec) * 100 : 0;
        return (
          <li key={r.id}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium">{r.label}</span>
              <span className="numeric text-muted-foreground">
                {r.avgSec != null ? `${r.avgSec.toFixed(1)}s / q` : "—"}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
