export type Operation = "add-sub" | "mul-div" | "powers" | "percent";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  prompt: string;
  answer: number;
  /** Optional alternate acceptable answers (e.g. fraction decimals). */
  tolerance?: number;
}

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function genAddSub(diff: Difficulty): Question {
  const ranges = { easy: [1, 20], medium: [10, 200], hard: [100, 2000] }[diff];
  const a = rand(ranges[0], ranges[1]);
  const b = rand(ranges[0], ranges[1]);
  const op = pick(["+", "-"]);
  if (op === "+") return { prompt: `${a} + ${b}`, answer: a + b };
  const [x, y] = a >= b ? [a, b] : [b, a];
  return { prompt: `${x} − ${y}`, answer: x - y };
}

function genMulDiv(diff: Difficulty): Question {
  const op = pick(["×", "÷"]);
  let a: number, b: number;
  if (diff === "easy") {
    a = rand(2, 12);
    b = rand(2, 12);
  } else if (diff === "medium") {
    a = rand(2, 25);
    b = rand(2, 12);
  } else {
    a = rand(11, 99);
    b = rand(2, 19);
  }
  if (op === "×") return { prompt: `${a} × ${b}`, answer: a * b };
  // Division: build from product so it's clean
  const product = a * b;
  return { prompt: `${product} ÷ ${b}`, answer: a };
}

function genPowers(diff: Difficulty): Question {
  const kind = pick(
    diff === "easy"
      ? (["square", "square"] as const)
      : diff === "medium"
        ? (["square", "cube", "root"] as const)
        : (["square", "cube", "root", "pow2"] as const),
  );
  if (kind === "square") {
    const n = rand(2, diff === "easy" ? 12 : diff === "medium" ? 20 : 30);
    return { prompt: `${n}²`, answer: n * n };
  }
  if (kind === "cube") {
    const n = rand(2, diff === "medium" ? 8 : 12);
    return { prompt: `${n}³`, answer: n * n * n };
  }
  if (kind === "root") {
    const n = rand(2, diff === "medium" ? 15 : 25);
    return { prompt: `√${n * n}`, answer: n };
  }
  // pow2
  const n = rand(3, 10);
  return { prompt: `2^${n}`, answer: 2 ** n };
}

function genPercent(diff: Difficulty): Question {
  const kind = pick(
    diff === "easy"
      ? (["pct", "pct"] as const)
      : diff === "medium"
        ? (["pct", "frac", "tip"] as const)
        : (["pct", "frac", "tip", "ofwhat"] as const),
  );
  if (kind === "pct") {
    const pct = pick([5, 10, 15, 20, 25, 50, 75]);
    const base = pick([20, 40, 60, 80, 100, 120, 160, 200, 240]);
    return { prompt: `${pct}% of ${base}`, answer: (pct * base) / 100 };
  }
  if (kind === "frac") {
    const denoms = [2, 3, 4, 5, 10];
    const d = pick(denoms);
    const n = rand(1, d - 1);
    const base = d * rand(2, 12);
    return { prompt: `${n}/${d} of ${base}`, answer: (n * base) / d };
  }
  if (kind === "tip") {
    const base = pick([24, 36, 48, 60, 72, 84, 96, 120]);
    const pct = pick([10, 15, 18, 20]);
    return { prompt: `${pct}% tip on $${base}`, answer: (pct * base) / 100 };
  }
  // "ofwhat": x is p% of what?
  const pct = pick([10, 20, 25, 50]);
  const whole = pick([40, 60, 80, 100, 120, 200]);
  const part = (whole * pct) / 100;
  return { prompt: `${part} is ${pct}% of?`, answer: whole };
}

export function generateQuestion(op: Operation, diff: Difficulty): Question {
  switch (op) {
    case "add-sub":
      return genAddSub(diff);
    case "mul-div":
      return genMulDiv(diff);
    case "powers":
      return genPowers(diff);
    case "percent":
      return genPercent(diff);
  }
}

export const OPERATIONS: { id: Operation; label: string; blurb: string; symbol: string }[] = [
  { id: "add-sub", label: "Add & Subtract", blurb: "Build a base. 1–4 digit sums and differences.", symbol: "+ −" },
  { id: "mul-div", label: "Multiply & Divide", blurb: "Times tables through 2-digit work.", symbol: "× ÷" },
  { id: "powers", label: "Squares, Roots & Powers", blurb: "n², n³, √n, and powers of 2.", symbol: "x²" },
  { id: "percent", label: "Percentages & Fractions", blurb: "Tips, parts, and quick conversions.", symbol: "%" },
];

export const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];
