import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "Techniques — Mind Math" },
      {
        name: "description",
        content:
          "Mental math techniques: left-to-right addition, round-and-adjust, the ×11 trick, percentage swap, squaring numbers ending in 5, and more.",
      },
      { property: "og:title", content: "Mental Math Techniques — Mind Math" },
      {
        property: "og:description",
        content: "Practical shortcuts for fast mental arithmetic.",
      },
    ],
  }),
  component: HowItWorks,
});

const TIPS = [
  {
    title: "Add left-to-right",
    body: "Add the big places first. 458 + 327 → 700, 70, 15 → 785. You hold fewer digits in your head than the schoolbook method.",
  },
  {
    title: "Round and adjust",
    body: "Subtract by rounding the smaller number up. 813 − 296 → 813 − 300 + 4 = 517. Always cleaner than borrowing.",
  },
  {
    title: "The ×11 trick (2-digit)",
    body: "Split the digits and add them in the middle. 36 × 11 → 3_(3+6)_6 = 396. If the sum is 10+, carry it.",
  },
  {
    title: "Doubling and halving",
    body: "To multiply, double one factor and halve the other. 14 × 25 → 7 × 50 = 350. Repeat as needed.",
  },
  {
    title: "Percentage swap",
    body: "x% of y equals y% of x. 16% of 25 is hard; 25% of 16 is 4. Always check if the swap is friendlier.",
  },
  {
    title: "Squaring numbers ending in 5",
    body: "Take the tens digit n, compute n × (n+1), tack on 25. 75² → 7 × 8 = 56 → 5625.",
  },
  {
    title: "Estimating square roots",
    body: "Locate between perfect squares. √54 sits between 7 (49) and 8 (64), closer to 7. About 7.35.",
  },
  {
    title: "Difference of squares",
    body: "a × b = ((a+b)/2)² − ((a−b)/2)². 18 × 22 → 20² − 2² = 396. Best when a and b are close.",
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Techniques</h1>
        <p className="mt-2 text-muted-foreground">
          A short library of moves to lean on during drills. Practice with them in mind and they
          become reflexes.
        </p>
        <ul className="mt-10 space-y-4">
          {TIPS.map((t, i) => (
            <li key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-baseline gap-3">
                <span className="numeric font-display text-xs font-semibold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-lg font-semibold">{t.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
