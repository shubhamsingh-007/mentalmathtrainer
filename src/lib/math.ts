import { hintFor } from "./hints";

export type Operation = "add-sub" | "mul-div" | "powers" | "percent";
export type Difficulty = "easy" | "medium" | "hard";

export type Pattern =
  // add-sub
  | "add.nocarry"
  | "add.carry"
  | "add.crosses10"
  | "sub.nobutton"
  | "sub.borrow"
  // mul-div
  | "mul.table"
  | "mul.x11"
  | "mul.x9"
  | "mul.2digit"
  | "div.clean"
  // powers
  | "square.small"
  | "square.ends5"
  | "cube"
  | "root.perfect"
  | "pow2"
  // percent
  | "pct.simple"
  | "pct.swap"
  | "frac.of"
  | "tip"
  | "ofwhat";

export interface Question {
  prompt: string;
  answer: number;
  pattern: Pattern;
  hint?: string;
  /** Optional alternate acceptable answers (e.g. fraction decimals). */
  tolerance?: number;
}

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

/** Which patterns are eligible for each op × difficulty. */
export const ELIGIBLE: Record<Operation, Record<Difficulty, Pattern[]>> = {
  "add-sub": {
    easy: ["add.nocarry", "add.crosses10", "sub.nobutton"],
    medium: ["add.nocarry", "add.carry", "add.crosses10", "sub.nobutton", "sub.borrow"],
    hard: ["add.carry", "sub.borrow"],
  },
  "mul-div": {
    easy: ["mul.table"],
    medium: ["mul.table", "mul.x11", "mul.x9", "div.clean"],
    hard: ["mul.x11", "mul.x9", "mul.2digit", "div.clean"],
  },
  powers: {
    easy: ["square.small"],
    medium: ["square.small", "square.ends5", "cube", "root.perfect"],
    hard: ["square.small", "square.ends5", "cube", "root.perfect", "pow2"],
  },
  percent: {
    easy: ["pct.simple"],
    medium: ["pct.simple", "pct.swap", "frac.of", "tip"],
    hard: ["pct.simple", "pct.swap", "frac.of", "tip", "ofwhat"],
  },
};

function build(prompt: string, answer: number, pattern: Pattern): Question {
  return { prompt, answer, pattern, hint: hintFor(pattern, prompt, answer) };
}

function digitsAddCarry(a: number, b: number): boolean {
  let x = a,
    y = b;
  while (x > 0 || y > 0) {
    if ((x % 10) + (y % 10) >= 10) return true;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return false;
}

function genByPattern(pattern: Pattern, diff: Difficulty): Question {
  switch (pattern) {
    case "add.nocarry": {
      // construct so no column carries
      const digits = diff === "easy" ? 1 : diff === "medium" ? 2 : 3;
      let a = 0,
        b = 0,
        mult = 1;
      for (let i = 0; i < digits; i++) {
        const da = rand(0, 4);
        const db = rand(0, 9 - da);
        a += da * mult;
        b += db * mult;
        mult *= 10;
      }
      a = Math.max(a, 1);
      b = Math.max(b, 1);
      return build(`${a} + ${b}`, a + b, "add.nocarry");
    }
    case "add.carry": {
      const range =
        diff === "easy" ? [10, 50] : diff === "medium" ? [25, 250] : [100, 2000];
      let a = 0,
        b = 0,
        tries = 0;
      do {
        a = rand(range[0], range[1]);
        b = rand(range[0], range[1]);
        tries++;
      } while (!digitsAddCarry(a, b) && tries < 8);
      return build(`${a} + ${b}`, a + b, "add.carry");
    }
    case "add.crosses10": {
      // small single-digit pairs that cross a ten
      const a = rand(2, 9);
      const b = rand(11 - a, 9); // ensures a+b >= 11
      // sometimes shift up: "19 + 6" style
      if (diff !== "easy" && Math.random() < 0.5) {
        const tens = rand(1, diff === "hard" ? 8 : 4) * 10;
        const A = tens + a;
        return build(`${A} + ${b}`, A + b, "add.crosses10");
      }
      return build(`${a} + ${b}`, a + b, "add.crosses10");
    }
    case "sub.nobutton": {
      const range =
        diff === "easy" ? [2, 20] : diff === "medium" ? [20, 200] : [200, 2000];
      // build so no borrow: choose b digit-wise <= a digit-wise
      const a = rand(range[0], range[1]);
      const digits = String(a).split("").map(Number);
      const bDigits = digits.map((d) => rand(0, d));
      let b = Number(bDigits.join("")) || 1;
      if (b > a) b = Math.floor(a / 2) || 1;
      return build(`${a} − ${b}`, a - b, "sub.nobutton");
    }
    case "sub.borrow": {
      const range =
        diff === "easy" ? [11, 30] : diff === "medium" ? [30, 300] : [300, 3000];
      let a = rand(range[0], range[1]);
      let b = rand(range[0], range[1]);
      if (b > a) [a, b] = [b, a];
      // ensure at least one column needs to borrow
      let tries = 0;
      while (!digitsAddCarry(a - b, b) && tries < 6) {
        b = rand(range[0], a);
        tries++;
      }
      return build(`${a} − ${b}`, a - b, "sub.borrow");
    }
    case "mul.table": {
      const a = rand(2, 12);
      const b = rand(2, 12);
      return build(`${a} × ${b}`, a * b, "mul.table");
    }
    case "mul.x11": {
      const a = rand(diff === "easy" ? 11 : 12, diff === "hard" ? 99 : 49);
      return build(`${a} × 11`, a * 11, "mul.x11");
    }
    case "mul.x9": {
      const a = rand(diff === "easy" ? 2 : 11, diff === "hard" ? 99 : 39);
      return build(`${a} × 9`, a * 9, "mul.x9");
    }
    case "mul.2digit": {
      const a = rand(11, 99);
      const b = rand(11, 19);
      return build(`${a} × ${b}`, a * b, "mul.2digit");
    }
    case "div.clean": {
      const b = rand(2, diff === "hard" ? 19 : 12);
      const q = rand(2, diff === "easy" ? 12 : 25);
      return build(`${b * q} ÷ ${b}`, q, "div.clean");
    }
    case "square.small": {
      const n = rand(2, diff === "easy" ? 12 : diff === "medium" ? 20 : 30);
      return build(`${n}²`, n * n, "square.small");
    }
    case "square.ends5": {
      const tens = rand(1, diff === "hard" ? 9 : 7);
      const n = tens * 10 + 5;
      return build(`${n}²`, n * n, "square.ends5");
    }
    case "cube": {
      const n = rand(2, diff === "medium" ? 8 : 12);
      return build(`${n}³`, n * n * n, "cube");
    }
    case "root.perfect": {
      const n = rand(2, diff === "medium" ? 15 : 25);
      return build(`√${n * n}`, n, "root.perfect");
    }
    case "pow2": {
      const n = rand(3, 10);
      return build(`2^${n}`, 2 ** n, "pow2");
    }
    case "pct.simple": {
      const pct = pick([5, 10, 15, 20, 25, 50, 75]);
      const base = pick([20, 40, 60, 80, 100, 120, 160, 200, 240]);
      return build(`${pct}% of ${base}`, (pct * base) / 100, "pct.simple");
    }
    case "pct.swap": {
      // build cases where swapping is friendlier
      const pairs: [number, number][] = [
        [16, 25],
        [12, 50],
        [4, 75],
        [8, 25],
        [24, 50],
        [36, 25],
        [18, 50],
        [4, 125],
      ];
      const [a, b] = pick(pairs);
      return build(`${a}% of ${b}`, (a * b) / 100, "pct.swap");
    }
    case "frac.of": {
      const denoms = [2, 3, 4, 5, 10];
      const d = pick(denoms);
      const n = rand(1, d - 1);
      const base = d * rand(2, 12);
      return build(`${n}/${d} of ${base}`, (n * base) / d, "frac.of");
    }
    case "tip": {
      const base = pick([24, 36, 48, 60, 72, 84, 96, 120]);
      const pct = pick([10, 15, 18, 20]);
      return build(`${pct}% tip on $${base}`, (pct * base) / 100, "tip");
    }
    case "ofwhat": {
      const pct = pick([10, 20, 25, 50]);
      const whole = pick([40, 60, 80, 100, 120, 200]);
      const part = (whole * pct) / 100;
      return build(`${part} is ${pct}% of?`, whole, "ofwhat");
    }
  }
}

export function generateForPattern(pattern: Pattern, diff: Difficulty): Question {
  return genByPattern(pattern, diff);
}

/** Legacy: pick a random eligible pattern uniformly. */
export function generateQuestion(op: Operation, diff: Difficulty): Question {
  const patterns = ELIGIBLE[op][diff];
  return genByPattern(pick(patterns), diff);
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
