import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { OPERATIONS } from "@/lib/math";
import { getLastResult, type SessionResult } from "@/lib/progress";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — Mentis" },
      { name: "description", content: "Drill session summary: accuracy, speed, and missed questions." },
    ],
  }),
  component: Results,
});

function Results() {
  const [r, setR] = useState<SessionResult | null>(null);
  useEffect(() => setR(getLastResult()), []);

  if (!r) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">No recent session</h1>
          <p className="mt-2 text-muted-foreground">Run a drill to see your results here.</p>
          <Link
            to="/practice"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Start a drill
          </Link>
        </main>
      </div>
    );
  }

  const accuracy = Math.round((r.correct / r.total) * 100);
  const avgMs = Math.round(r.totalMs / r.total);
  const opLabel = OPERATIONS.find((o) => o.id === r.op)?.label ?? r.op;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-14">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Session complete
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          {r.correct}/{r.total} correct
        </h1>
        <p className="mt-1 text-muted-foreground">
          {opLabel} · {r.difficulty}
        </p>

        {r.botMs && r.botFinishedAt ? (() => {
          const userFinished = r.correct + r.missed.length >= r.total
            ? true
            : false;
          // How many questions the user actually attempted (correct + missed)
          const userAttempted = r.correct + r.missed.length;
          const completedAll = userAttempted >= r.total;
          // Bot's question count at the moment the user stopped
          const botIdxAtEnd = Math.min(r.total, Math.floor(r.totalMs / r.botMs));
          const youWon = completedAll && r.totalMs < r.botFinishedAt;

          function fmt(ms: number) {
            const sec = ms / 1000;
            if (sec < 60) return `${sec.toFixed(1)}s`;
            const m = Math.floor(sec / 60);
            const s = Math.round(sec - m * 60);
            return `${m}m ${String(s).padStart(2, "0")}s`;
          }

          let label: string;
          if (youWon) {
            label = `🏁 Beat the bot by ${fmt(r.botFinishedAt - r.totalMs)}`;
          } else if (!completedAll) {
            const gap = botIdxAtEnd - userAttempted;
            label =
              gap > 0
                ? `Bot won — ${gap} question${gap === 1 ? "" : "s"} ahead when you stopped`
                : `Ended early at ${userAttempted}/${r.total}`;
          } else {
            label = `Bot won by ${fmt(r.totalMs - r.botFinishedAt)}`;
          }

          return (
            <div
              className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
                youWon
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </div>
          );
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          void userFinished;
        })() : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Tile label="Accuracy" value={`${accuracy}%`} />
          <Tile label="Avg time" value={`${(avgMs / 1000).toFixed(1)}s`} />
          <Tile label="Fastest" value={`${(r.fastestMs / 1000).toFixed(1)}s`} />
        </div>

        {r.missed.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Review · {r.missed.length} missed
            </h2>
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {r.missed.map((m, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="numeric font-display font-semibold">{m.prompt}</span>
                  <span className="numeric text-muted-foreground">
                    you: <span className="text-destructive">{m.given ?? "—"}</span>
                    {" · "}
                    answer: <span className="font-semibold text-foreground">{m.answer}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="mt-8 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Clean run. No missed questions.
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/practice"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Train again
          </Link>
          <Link
            to="/stats"
            className="rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-accent"
          >
            View stats
          </Link>
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
