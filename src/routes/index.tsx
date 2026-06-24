import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { OPERATIONS } from "@/lib/math";
import { loadProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mind Math — Mental Math Trainer" },
      {
        name: "description",
        content:
          "Sharpen mental arithmetic with short, focused drills. Add, subtract, multiply, divide, percentages, squares — all in your browser, no account.",
      },
      { property: "og:title", content: "Mind Math — Mental Math Trainer" },
      {
        property: "og:description",
        content: "Quick daily mental math drills for adults. Local-only progress, no signup.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [streak, setStreak] = useState(0);
  const [totals, setTotals] = useState({ questions: 0, correct: 0 });

  useEffect(() => {
    const p = loadProgress();
    setStreak(p.streak);
    setTotals(p.totals);
  }, []);

  const accuracy = totals.questions ? Math.round((totals.correct / totals.questions) * 100) : 0;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6">
        {/* Hero */}
        <section className="pt-20 pb-16 text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Local-only · No account
          </p>
          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            A quiet gym <br className="hidden sm:block" />
            for your mind.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            Short, focused drills that rebuild fluency with numbers. Pick an operation,
            pick a difficulty, and start the clock.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
            >
              Start training
              <span aria-hidden>→</span>
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              See techniques
            </Link>
          </div>

          {/* Stats chips */}
          <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-3 text-left">
            <Stat label="Streak" value={`${streak}d`} />
            <Stat label="Answered" value={String(totals.questions)} />
            <Stat label="Accuracy" value={`${accuracy}%`} />
          </div>
        </section>

        {/* Modes preview */}
        <section className="pb-24">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Modes
            </h2>
            <Link to="/practice" className="text-sm text-primary hover:underline">
              Choose →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {OPERATIONS.map((o) => (
              <Link
                key={o.id}
                to="/practice"
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-base font-semibold">{o.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{o.blurb}</p>
                  </div>
                  <span className="numeric font-display text-2xl font-semibold text-primary/70 transition-transform group-hover:translate-x-0.5">
                    {o.symbol}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Mind Math · Practice in the browser. Nothing leaves your device.
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="numeric mt-0.5 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
