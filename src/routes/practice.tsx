import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { DIFFICULTIES, OPERATIONS, type Difficulty, type Operation } from "@/lib/math";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice — Mentis" },
      { name: "description", content: "Pick an operation, difficulty, and session length, then start the drill." },
      { property: "og:title", content: "Practice — Mentis" },
      { property: "og:description", content: "Configure a focused mental math drill." },
    ],
  }),
  component: Practice,
});

const LENGTHS = [10, 25, 50] as const;

function Practice() {
  const navigate = useNavigate();
  const [op, setOp] = useState<Operation>("add-sub");
  const [diff, setDiff] = useState<Difficulty>("medium");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>(25);
  const [perQTimer, setPerQTimer] = useState(false);

  function start() {
    navigate({
      to: "/practice/session",
      search: { op, diff, length, timer: perQTimer ? 1 : 0 },
    });
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Configure your drill</h1>
        <p className="mt-2 text-muted-foreground">
          Four sliders. Three seconds to set up. Then start the clock.
        </p>

        <div className="mt-10 space-y-8">
          <Field label="Operation">
            <div className="grid gap-2 sm:grid-cols-2">
              {OPERATIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOp(o.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    op === o.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display font-semibold">{o.label}</p>
                    <span className="numeric text-primary/70">{o.symbol}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{o.blurb}</p>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Difficulty">
            <Segmented
              options={DIFFICULTIES.map((d) => ({ value: d.id, label: d.label }))}
              value={diff}
              onChange={(v) => setDiff(v as Difficulty)}
            />
          </Field>

          <Field label="Session length">
            <Segmented
              options={LENGTHS.map((n) => ({ value: String(n), label: `${n} questions` }))}
              value={String(length)}
              onChange={(v) => setLength(Number(v) as (typeof LENGTHS)[number])}
            />
          </Field>

          <Field label="Per-question timer">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-medium">Pressure mode</p>
                <p className="text-xs text-muted-foreground">
                  10 seconds per question. Time-out counts as a miss.
                </p>
              </div>
              <input
                type="checkbox"
                checked={perQTimer}
                onChange={(e) => setPerQTimer(e.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
            </label>
          </Field>
        </div>

        <button
          onClick={start}
          className="mt-10 w-full rounded-full bg-primary py-4 font-display text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
        >
          Begin →
        </button>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-xl border border-border bg-card p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            value === o.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
