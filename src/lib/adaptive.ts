import {
  ELIGIBLE,
  generateForPattern,
  type Difficulty,
  type Operation,
  type Pattern,
  type Question,
} from "./math";

interface PatternStat {
  seen: number;
  correct: number;
  lastWrongAt: number | null;
  recent: boolean[]; // last 8 results, true = correct
}

interface AdaptiveState {
  version: 1;
  byPattern: Partial<Record<Pattern, PatternStat>>;
}

const KEY = "mm.adaptive.v1";
const RECENT_CAP = 8;
const MAX_REPEAT = 3;

function emptyState(): AdaptiveState {
  return { version: 1, byPattern: {} };
}

function load(): AdaptiveState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AdaptiveState;
    if (parsed.version !== 1) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function save(state: AdaptiveState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetAdaptive() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function recordResult(pattern: Pattern, correct: boolean) {
  const state = load();
  const cur: PatternStat = state.byPattern[pattern] ?? {
    seen: 0,
    correct: 0,
    lastWrongAt: null,
    recent: [],
  };
  cur.seen += 1;
  if (correct) cur.correct += 1;
  else cur.lastWrongAt = Date.now();
  cur.recent.push(correct);
  if (cur.recent.length > RECENT_CAP) cur.recent = cur.recent.slice(-RECENT_CAP);
  state.byPattern[pattern] = cur;
  save(state);
}

function weightFor(stat: PatternStat | undefined): number {
  if (!stat || stat.recent.length === 0) return 2; // mild bias toward unseen
  const acc = stat.recent.filter(Boolean).length / stat.recent.length;
  let w = 1 + 4 * (1 - acc);
  if (stat.lastWrongAt && Date.now() - stat.lastWrongAt < 60 * 60 * 1000) w += 1;
  // decay: 5 consecutive corrects → baseline
  const tail = stat.recent.slice(-5);
  if (tail.length === 5 && tail.every(Boolean)) w = Math.min(w, 1);
  return Math.max(0.25, w);
}

interface Session {
  lastPattern: Pattern | null;
  repeatCount: number;
  seenPrompts: Set<string>;
}

export function createAdaptiveSession(): Session {
  return { lastPattern: null, repeatCount: 0, seenPrompts: new Set() };
}

function pickPattern(op: Operation, diff: Difficulty, session: Session): Pattern {
  const eligible = [...ELIGIBLE[op][diff]];
  if (eligible.length === 0) return "add.nocarry";
  const state = load();
  let pool = eligible;
  if (
    session.lastPattern &&
    session.repeatCount >= MAX_REPEAT &&
    eligible.length > 1
  ) {
    pool = eligible.filter((p) => p !== session.lastPattern);
  }
  const weights = pool.map((p) => weightFor(state.byPattern[p]));
  const total = weights.reduce((s, x) => s + x, 0);
  let r = Math.random() * total;
  let chosen: Pattern = pool[0];
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) {
      chosen = pool[i];
      break;
    }
  }
  return chosen;
}

export function chooseNextQuestion(
  op: Operation,
  diff: Difficulty,
  session: Session,
): Question {
  const MAX_ATTEMPTS = 12;
  let question: Question = generateForPattern(pickPattern(op, diff, session), diff);
  let chosen: Pattern = question.pattern;
  for (let i = 0; i < MAX_ATTEMPTS && session.seenPrompts.has(question.prompt); i++) {
    chosen = pickPattern(op, diff, session);
    question = generateForPattern(chosen, diff);
  }
  if (chosen === session.lastPattern) session.repeatCount += 1;
  else {
    session.lastPattern = chosen;
    session.repeatCount = 1;
  }
  session.seenPrompts.add(question.prompt);
  return question;
}

