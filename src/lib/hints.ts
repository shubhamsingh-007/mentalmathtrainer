import type { Pattern } from "./math";

/**
 * Derive a one-line, technique-grounded hint from a question's pattern
 * and operands. Returns undefined when no clean hint applies — better to
 * show nothing than something generic.
 */
export function hintFor(pattern: Pattern, prompt: string, answer: number): string | undefined {
  switch (pattern) {
    case "add.nocarry": {
      const m = prompt.match(/^(\d+)\s*\+\s*(\d+)$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      const b = Number(m[2]);
      return `Stack columns: tens (${Math.floor(a / 10) + Math.floor(b / 10)}_) + ones (${(a % 10) + (b % 10)}).`;
    }
    case "sub.nobutton": {
      const m = prompt.match(/^(\d+)\s*−\s*(\d+)$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      const b = Number(m[2]);
      return `Count up from ${b} to ${a} — no borrow needed.`;
    }
    case "mul.table": {
      const m = prompt.match(/^(\d+)\s*×\s*(\d+)$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      const b = Number(m[2]);
      const [big, small] = a >= b ? [a, b] : [b, a];
      if (small === 5) return `× 5 = half of × 10: ${big} × 10 = ${big * 10}, halve it.`;
      if (small === 4) return `Double twice: ${big} → ${big * 2} → ${big * 4}.`;
      if (small === 6) return `× 6 = × 5 + itself: ${big * 5} + ${big}.`;
      return `Anchor a known fact near ${big}×${small}, then adjust by ${big}.`;
    }
    case "div.clean": {
      const m = prompt.match(/^(\d+)\s*÷\s*(\d+)$/);
      if (!m) return undefined;
      const b = Number(m[2]);
      return `Flip it: what × ${b} = ${answer * b}?`;
    }
    case "square.small": {
      const m = prompt.match(/^(\d+)²$/);
      if (!m) return undefined;
      const n = Number(m[1]);
      const base = n < 10 ? n : Math.round(n / 10) * 10;
      const d = n - base;
      if (d === 0) return `Known fact: ${n} × ${n}.`;
      return `(${base} + ${d})² = ${base}² + 2·${base}·${d} + ${d}².`;
    }
    case "cube": {
      const m = prompt.match(/^(\d+)³$/);
      if (!m) return undefined;
      const n = Number(m[1]);
      return `${n}² = ${n * n}, then × ${n}.`;
    }
    case "pow2": {
      const m = prompt.match(/^2\^(\d+)$/);
      if (!m) return undefined;
      const k = Number(m[1]);
      return `Double ${k} times — every 10 powers is ~1024.`;
    }
    case "pct.simple": {
      const m = prompt.match(/^(\d+)%\s*of\s*(\d+)$/);
      if (!m) return undefined;
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (a === 10) return `Shift the decimal: ${b / 10}.`;
      if (a === 50) return `Half of ${b}.`;
      if (a === 25) return `Quarter of ${b} — halve twice.`;
      if (a === 5) return `10% (${b / 10}) halved.`;
      return `${a}% = ${a / 100}; multiply by ${b}.`;
    }

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
