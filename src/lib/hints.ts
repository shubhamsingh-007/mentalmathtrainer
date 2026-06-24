import type { Pattern } from "./math";

/**
 * Derive a one-line, technique-grounded hint from a question's pattern
 * and operands. Returns undefined when no clean hint applies — better to
 * show nothing than something generic.
 */
export function hintFor(pattern: Pattern, prompt: string, answer: number): string | undefined {
  switch (pattern) {
    case "add.crosses10": {
      const m = prompt.match(/^(\d+)\s*\+\s*(\d+)$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      const b = Number(m[2]);
      const need = 10 - (a % 10);
      if (need <= 0 || need > b) return undefined;
      return `Make a 10: ${a} + ${need} = ${a + need}, then + ${b - need}.`;
    }
    case "add.carry": {
      const m = prompt.match(/^(\d+)\s*\+\s*(\d+)$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      const b = Number(m[2]);
      // round the smaller toward a clean number
      const [big, small] = a >= b ? [a, b] : [b, a];
      const round = Math.round(small / 10) * 10;
      if (round === small || round === 0) return "Add left-to-right: hundreds, then tens, then ones.";
      const diff = round - small;
      return diff > 0
        ? `Round up: ${big} + ${round} − ${diff}.`
        : `Round down: ${big} + ${round} + ${-diff}.`;
    }
    case "sub.borrow": {
      const m = prompt.match(/^(\d+)\s*−\s*(\d+)$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      const b = Number(m[2]);
      const round = Math.round(b / 10) * 10;
      if (round === b) return undefined;
      const adj = round - b;
      return adj > 0
        ? `Round up: ${a} − ${round} + ${adj}.`
        : `Round down: ${a} − ${round} − ${-adj}.`;
    }
    case "mul.x9": {
      const m = prompt.match(/^(\d+)\s*×\s*9$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      return `Try (${a} × 10) − ${a}.`;
    }
    case "mul.x11": {
      const m = prompt.match(/^(\d+)\s*×\s*11$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      if (a < 100 && a >= 10) {
        const t = Math.floor(a / 10);
        const u = a % 10;
        return `Split the digits: ${t} _ (${t}+${u}) _ ${u}.`;
      }
      return `Try (${a} × 10) + ${a}.`;
    }
    case "mul.2digit": {
      const m = prompt.match(/^(\d+)\s*×\s*(\d+)$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      const b = Number(m[2]);
      // difference-of-squares when close and same parity
      if (Math.abs(a - b) <= 6 && (a + b) % 2 === 0) {
        const mid = (a + b) / 2;
        const half = Math.abs(a - b) / 2;
        return `((${mid})² − ${half}²) works: ${a} and ${b} bracket ${mid}.`;
      }
      // round the smaller factor
      const [big, small] = a >= b ? [a, b] : [b, a];
      const round = Math.round(small / 10) * 10;
      if (round !== small && round !== 0) {
        const adj = small - round;
        return adj >= 0
          ? `(${big} × ${round}) + (${big} × ${adj}).`
          : `(${big} × ${round}) − (${big} × ${-adj}).`;
      }
      return undefined;
    }
    case "square.ends5": {
      const m = prompt.match(/^(\d+)²$/);
      if (!m) return undefined;
      const n = Number(m[1]);
      const t = (n - 5) / 10;
      return `n × (n+1), then tack 25: ${t}×${t + 1} → ${t * (t + 1)}25.`;
    }
    case "root.perfect": {
      // √k where k is a perfect square
      return `Locate between perfect squares — the answer is the one that squares to ${answer * answer}.`;
    }
    case "pct.swap": {
      const m = prompt.match(/^(\d+)%\s*of\s*(\d+)$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      const b = Number(m[2]);
      return `Swap it: ${b}% of ${a}.`;
    }
    case "frac.of": {
      const m = prompt.match(/^(\d+)\/(\d+)\s*of\s*(\d+)$/);
      if (!m) return undefined;
      const n = Number(m[1]);
      const d = Number(m[2]);
      const base = Number(m[3]);
      return `${base} ÷ ${d} = ${base / d}, then × ${n}.`;
    }
    case "tip": {
      const m = prompt.match(/^(\d+)%\s*tip on \$(\d+)$/);
      if (!m) return undefined;
      const pct = Number(m[1]);
      const base = Number(m[2]);
      const ten = base / 10;
      if (pct === 15) return `10% is ${ten}, half of that is ${ten / 2} — add them.`;
      if (pct === 20) return `10% is ${ten}, double it.`;
      if (pct === 10) return `Just shift the decimal: ${ten}.`;
      if (pct === 18) return `20% (${ten * 2}) minus 2% (${ten / 5}).`;
      return undefined;
    }
    case "ofwhat": {
      const m = prompt.match(/^(\d+) is (\d+)% of\?$/);
      if (!m) return undefined;
      const part = Number(m[1]);
      const pct = Number(m[2]);
      return `${part} ÷ ${pct} × 100 — or ${part} × ${100 / pct}.`;
    }
    default:
      return undefined;
  }
}
