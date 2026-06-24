import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AccuracyTrend, AvgTimePerOp } from "@/components/ProgressCharts";
import { OPERATIONS, type Operation } from "@/lib/math";
import { loadProgress, resetProgress } from "@/lib/progress";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Stats — Mind Math" },
      { name: "description", content: "Streaks, totals, accuracy, and personal bests for your mental math practice." },
      { property: "og:title", content: "Stats — Mind Math" },
      { property: "og:description", content: "Track your mental math progress." },
    ],
  }),
  component: Stats,
});

function Stats() {
  const [p, setP] = useState(() => loadProgress());
  useEffect(() => setP(loadProgress()), []);

  const acc = p.totals.questions ? Math.round((p.totals.correct / p.totals.questions) * 100) : 0;
  const recent = p.history.slice(0, 10);

  function onReset() {
    if (confirm("Erase all local progress? This cannot be undone.")) {
      resetProgress();
      setP(loadProgress());
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Your progress</h1>
        <p className="mt-2 text-muted-foreground">Stored locally in this browser only.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Tile label="Day streak" value={`${p.streak}`} />
          <Tile label="Questions answered" value={`${p.totals.questions}`} />
          <Tile label="Lifetime accuracy" value={`${acc}%`} />
        </div>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Accuracy trend
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Last {Math.min(p.history.length, 20)} sessions, oldest to newest.
            </p>
            <div className="mt-4">
              <AccuracyTrend history={p.history} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Avg time per question
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Lower is faster. Across all sessions.</p>
            <div className="mt-4">
              <AvgTimePerOp history={p.history} />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            By operation
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {OPERATIONS.map((o) => {
              const b = p.bestByOp[o.id as Operation];
              return (
                <div key={o.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-semibold">{o.label}</p>
                    <span className="numeric text-sm text-primary/70">{o.symbol}</span>
                  </div>
                  {b ? (
                    <dl className="numeric mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <dt>Best score</dt>
                        <dd className="font-display text-base font-semibold text-foreground">
                          {b.bestScore}
                        </dd>
                      </div>
                      <div>
                        <dt>Accuracy</dt>
                        <dd className="font-display text-base font-semibold text-foreground">
                          {Math.round(b.bestAccuracy * 100)}%
                        </dd>
                      </div>
                      <div>
                        <dt>Avg time</dt>
                        <dd className="font-display text-base font-semibold text-foreground">
                          {Number.isFinite(b.fastestAvgMs)
                            ? `${(b.fastestAvgMs / 1000).toFixed(1)}s`
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">No sessions yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Recent sessions
          </h2>
          {recent.length === 0 ? (
            <p className="mt-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              No sessions yet. Start your first drill.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {recent.map((s, i) => {
                const a = Math.round((s.correct / s.total) * 100);
                const opL = OPERATIONS.find((o) => o.id === s.op)?.label;
                const d = new Date(s.finishedAt);
                return (
                  <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{opL}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.difficulty} · {d.toLocaleDateString()}{" "}
                        {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="numeric text-right">
                      <p className="font-display font-semibold">
                        {s.correct}/{s.total}
                      </p>
                      <p className="text-xs text-muted-foreground">{a}%</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-12 border-t border-border pt-6">
          <button
            onClick={onReset}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
          >
            Reset all progress
          </button>
        </div>
      </main>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="numeric mt-1 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
