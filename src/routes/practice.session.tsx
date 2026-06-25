import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { AppHeader } from "@/components/AppHeader";
import {
  type Difficulty,
  type Operation,
  type Pattern,
  type Question,
} from "@/lib/math";
import {
  chooseNextQuestion,
  createAdaptiveSession,
  recordResult,
} from "@/lib/adaptive";
import { recordSession, setLastResult, type SessionResult } from "@/lib/progress";

const searchSchema = z.object({
  op: z.enum(["add-sub", "mul-div", "powers", "percent"]).default("add-sub"),
  diff: z.enum(["easy", "medium", "hard"]).default("medium"),
  length: z.coerce.number().int().positive().default(25),
  timer: z.coerce.number().int().default(0),
});

export const Route = createFileRoute("/practice/session")({
  head: () => ({
    meta: [
      { title: "Drill — Mind Math" },
      { name: "description", content: "Active mental math drill session." },
    ],
  }),
  validateSearch: searchSchema,
  component: Session,
});

const PER_Q_MS = 10_000;
const BOT_MS: Record<Difficulty, number> = { easy: 6000, medium: 4000, hard: 3000 };

function Session() {
  const { op, diff, length, timer } = Route.useSearch();
  const navigate = useNavigate();

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [revealAnswer, setRevealAnswer] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const inputRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<number>(Date.now());
  const qStartRef = useRef<number>(Date.now());
  const fastestRef = useRef<number>(Number.POSITIVE_INFINITY);
  const scoreRef = useRef(0);
  const missedRef = useRef<SessionResult["missed"]>([]);
  const adaptiveRef = useRef(createAdaptiveSession());
  const recentMissesRef = useRef<Pattern[]>([]);
  const questionRef = useRef<Question>(
    chooseNextQuestion(op as Operation, diff as Difficulty, adaptiveRef.current),
  );
  const [showHint, setShowHint] = useState(false);
  const [, force] = useState(0);

  // Re-render tick for timer
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(i);
  }, []);

  const botMs = BOT_MS[diff as Difficulty];

  const finish = useCallback(() => {
    const totalMs = Date.now() - startRef.current;
    const botFinishedAt = botMs * length;
    const result: SessionResult = {
      op: op as Operation,
      difficulty: diff as Difficulty,
      total: length,
      correct: scoreRef.current,
      totalMs,
      fastestMs: Number.isFinite(fastestRef.current) ? fastestRef.current : 0,
      missed: missedRef.current,
      finishedAt: Date.now(),
      botMs,
      botFinishedAt,
    };
    recordSession(result);
    setLastResult(result);
    navigate({ to: "/results" });
  }, [op, diff, length, navigate, botMs]);

  const advance = useCallback(
    (wasCorrect: boolean, given: number | null) => {
      const elapsed = Date.now() - qStartRef.current;
      const curPattern = questionRef.current.pattern;
      recordResult(curPattern, wasCorrect);
      if (wasCorrect) {
        scoreRef.current += 1;
        setScore((s) => s + 1);
        setCombo((c) => {
          const next = c + 1;
          setBestCombo((b) => (next > b ? next : b));
          return next;
        });
        if (elapsed < fastestRef.current) fastestRef.current = elapsed;
      } else {
        setCombo(0);
        recentMissesRef.current.push(curPattern);
        if (recentMissesRef.current.length > 6) recentMissesRef.current.shift();
        missedRef.current.push({
          prompt: questionRef.current.prompt,
          answer: questionRef.current.answer,
          given,
        });
      }
      setFeedback(wasCorrect ? "correct" : "wrong");
      if (!wasCorrect) setRevealAnswer(questionRef.current.answer);

      setTimeout(
        () => {
          const next = idx + 1;
          if (next >= length) {
            finish();
            return;
          }
          questionRef.current = chooseNextQuestion(
            op as Operation,
            diff as Difficulty,
            adaptiveRef.current,
          );
          setIdx(next);
          setInput("");
          setFeedback(null);
          setRevealAnswer(null);
          setShowHint(false);
          qStartRef.current = Date.now();
          force((n) => n + 1);
          inputRef.current?.focus();
        },
        wasCorrect ? 350 : 900,
      );
    },
    [idx, length, op, diff, finish],
  );

  const submit = useCallback(() => {
    if (feedback) return;
    if (input.trim() === "") return;
    const given = Number(input);
    if (Number.isNaN(given)) return;
    const correct = given === questionRef.current.answer;
    advance(correct, given);
  }, [input, feedback, advance]);

  // Per-question timer
  useEffect(() => {
    if (!timer) return;
    if (feedback) return;
    const left = PER_Q_MS - (now - qStartRef.current);
    if (left <= 0) advance(false, null);
  }, [timer, now, feedback, advance]);

  // Autofocus the input on mount and whenever the question changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [idx]);

  // Hint trigger: stall (5s with empty input) OR pattern missed in the last 2 attempts
  const hintText = questionRef.current.hint;
  useEffect(() => {
    if (feedback || showHint || !hintText) return;
    const recent = recentMissesRef.current.slice(-2);
    const repeatedMiss = recent.filter((p) => p === questionRef.current.pattern).length >= 1
      && recent.length >= 1
      && recent[recent.length - 1] === questionRef.current.pattern;
    const stalled = input.trim() === "" && now - qStartRef.current >= 5000;
    if (repeatedMiss || stalled) setShowHint(true);
  }, [feedback, showHint, hintText, input, now, idx]);

  const elapsedTotal = Math.floor((now - startRef.current) / 1000);
  const perQLeft = timer ? Math.max(0, PER_Q_MS - (now - qStartRef.current)) : 0;

  const progressPct = useMemo(() => (idx / length) * 100, [idx, length]);

  const botIdxRaw = (now - startRef.current) / botMs;
  const botIdx = Math.min(length, Math.max(0, Math.floor(botIdxRaw)));
  const botPct = Math.min(100, (botIdxRaw / length) * 100);
  const youPct = (idx / length) * 100;
  const lead = idx - botIdx;

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col">
        {/* HUD — sticky so race bars stay visible above the mobile keyboard */}
        <div className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto w-full max-w-2xl px-4 py-2 sm:px-6 sm:py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="numeric">
                Q <span className="font-semibold text-foreground">{idx + 1}</span> / {length}
              </span>
              <span className="numeric">
                Score <span className="font-semibold text-foreground">{score}</span>
              </span>
              <span
                className={`numeric transition-colors ${
                  combo >= 2 ? "text-primary font-semibold" : ""
                }`}
              >
                Combo{" "}
                <span
                  className={`font-semibold ${combo >= 2 ? "text-primary" : "text-foreground"}`}
                >
                  ×{combo}
                </span>
              </span>
              <span className="numeric">
                {Math.floor(elapsedTotal / 60)}:{String(elapsedTotal % 60).padStart(2, "0")}
              </span>
              <button
                onClick={finish}
                className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                End
              </button>

            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {timer ? (
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${perQLeft < 3000 ? "bg-destructive" : "bg-foreground/40"}`}
                  style={{ width: `${(perQLeft / PER_Q_MS) * 100}%` }}
                />
              </div>
            ) : null}

            {/* Race-the-bot pacer (pinned with HUD so it survives the soft keyboard) */}
            <div className="mt-3 space-y-1.5" aria-label="Race the bot">
              <div>
                <div className="mb-0.5 flex items-center justify-between text-[10px] text-muted-foreground sm:text-[11px]">
                  <span className="font-display font-semibold uppercase tracking-[0.14em] text-foreground">
                    You
                  </span>
                  <span className="numeric">
                    {idx} / {length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full bg-primary transition-all duration-300 ${
                      lead > 0 ? "shadow-[0_0_8px_var(--color-primary)]" : ""
                    }`}
                    style={{ width: `${youPct}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-0.5 flex items-center justify-between text-[10px] text-muted-foreground sm:text-[11px]">
                  <span className="font-display font-semibold uppercase tracking-[0.14em]">
                    Bot
                  </span>
                  <span className="numeric">
                    {botIdx} / {length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-muted-foreground/50 transition-all duration-100 ease-linear"
                    style={{ width: `${botPct}%` }}
                  />
                </div>
              </div>
              <p
                className={`text-center text-[10px] font-medium sm:text-[11px] ${
                  lead > 0 ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {lead > 0
                  ? `Ahead by ${lead}`
                  : lead < 0
                    ? `Behind by ${-lead}`
                    : "Tied"}
              </p>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-4 sm:py-10">
          {combo >= 3 ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:mb-4">
              <span>🔥 Combo ×{combo}</span>
              {bestCombo > combo ? (
                <span className="text-primary/60">best ×{bestCombo}</span>
              ) : null}
            </div>
          ) : null}

          <p
            className={`numeric font-display text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl transition-colors ${
              feedback === "correct"
                ? "text-[oklch(0.6_0.18_155)]"
                : feedback === "wrong"
                  ? "text-destructive"
                  : ""
            }`}
          >
            {questionRef.current.prompt}
          </p>

          <form
            className="mt-6 w-full max-w-xs sm:mt-10"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="-?[0-9]*"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              value={input}
              disabled={feedback !== null}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^-?\d{0,8}$/.test(v)) setInput(v);
              }}
              placeholder="—"
              aria-label="Your answer"
              className={`numeric block h-16 w-full rounded-2xl border-2 bg-card text-center text-3xl font-semibold tracking-wide tabular-nums outline-none transition-all placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/30 sm:h-20 sm:text-4xl ${
                feedback === "correct"
                  ? "border-[oklch(0.6_0.18_155)] bg-[oklch(0.95_0.05_155)]"
                  : feedback === "wrong"
                    ? "border-destructive bg-[oklch(0.97_0.03_27)]"
                    : "border-border"
              }`}
            />
            {revealAnswer != null ? (
              <p className="numeric mt-2 text-center text-sm text-muted-foreground">
                Answer: <span className="font-semibold text-foreground">{revealAnswer}</span>
              </p>
            ) : (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Tap Submit or press Enter
              </p>
            )}
            {showHint && hintText && !feedback ? (
              <div
                role="note"
                aria-live="polite"
                className="mt-3 rounded-xl border border-border bg-muted/60 px-3 py-2 text-left text-xs text-muted-foreground animate-in fade-in duration-200"
              >
                <span className="mr-2 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-primary align-middle">
                  Tip
                </span>
                <span className="align-middle leading-relaxed">{hintText}</span>
              </div>
            ) : null}
            <button
              type="submit"
              disabled={feedback !== null || input === "" || input === "-"}
              className="mt-3 block h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

