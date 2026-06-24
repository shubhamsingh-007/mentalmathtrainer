import type { Difficulty, Operation } from "./math";

export interface SessionResult {
  op: Operation;
  difficulty: Difficulty;
  total: number;
  correct: number;
  totalMs: number;
  fastestMs: number;
  missed: { prompt: string; answer: number; given: number | null }[];
  finishedAt: number;
  /** ms-per-question pace used by the bot during this session */
  botMs?: number;
  /** ms (from session start) when the bot completed all questions */
  botFinishedAt?: number;
}

interface ProgressState {
  version: 1;
  lastPlayedDay: string | null; // YYYY-MM-DD
  streak: number;
  totals: { questions: number; correct: number };
  bestByOp: Partial<
    Record<Operation, { bestScore: number; bestAccuracy: number; fastestAvgMs: number }>
  >;
  history: SessionResult[]; // most recent first, capped 30
}

const KEY = "mm.progress.v1";
const RESULT_KEY = "mm.lastResult";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyState(): ProgressState {
  return {
    version: 1,
    lastPlayedDay: null,
    streak: 0,
    totals: { questions: 0, correct: 0 },
    bestByOp: {},
    history: [],
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed.version !== 1) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function saveProgress(state: ProgressState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetProgress() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(RESULT_KEY);
  localStorage.removeItem("mm.adaptive.v1");
}

export function recordSession(result: SessionResult) {
  const state = loadProgress();
  const today = todayStr();
  // Streak
  if (state.lastPlayedDay !== today) {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, "0")}-${String(yest.getDate()).padStart(2, "0")}`;
    if (state.lastPlayedDay === yStr) state.streak += 1;
    else state.streak = 1;
    state.lastPlayedDay = today;
  } else if (state.streak === 0) {
    state.streak = 1;
  }

  state.totals.questions += result.total;
  state.totals.correct += result.correct;

  const accuracy = result.total ? result.correct / result.total : 0;
  const avgMs = result.total ? result.totalMs / result.total : 0;
  const prev = state.bestByOp[result.op] ?? {
    bestScore: 0,
    bestAccuracy: 0,
    fastestAvgMs: Number.POSITIVE_INFINITY,
  };
  state.bestByOp[result.op] = {
    bestScore: Math.max(prev.bestScore, result.correct),
    bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
    fastestAvgMs: avgMs > 0 ? Math.min(prev.fastestAvgMs, avgMs) : prev.fastestAvgMs,
  };

  state.history.unshift(result);
  state.history = state.history.slice(0, 30);
  saveProgress(state);
}

export function setLastResult(result: SessionResult) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}
export function getLastResult(): SessionResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as SessionResult) : null;
  } catch {
    return null;
  }
}
