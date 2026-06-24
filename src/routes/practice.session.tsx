import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { AppHeader } from "@/components/AppHeader";
import {
  type Difficulty,
  type Operation,
  type Question,
  generateQuestion,
} from "@/lib/math";
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
      { title: "Drill — Mentis" },
      { name: "description", content: "Active mental math drill session." },
    ],
  }),
  validateSearch: searchSchema,
  component: Session,
});

const PER_Q_MS = 10_000;

function Session() {
  const { op, diff, length, timer } = Route.useSearch();
  const navigate = useNavigate();

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [revealAnswer, setRevealAnswer] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const startRef = useRef<number>(Date.now());
  const qStartRef = useRef<number>(Date.now());
  const fastestRef = useRef<number>(Number.POSITIVE_INFINITY);
  const missedRef = useRef<SessionResult["missed"]>([]);
  const questionRef = useRef<Question>(generateQuestion(op as Operation, diff as Difficulty));
  const [, force] = useState(0);

  // Re-render tick for timer
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(i);
  }, []);

  const finish = useCallback(() => {
    const result: SessionResult = {
      op: op as Operation,
      difficulty: diff as Difficulty,
      total: length,
      correct: score,
      totalMs: Date.now() - startRef.current,
      fastestMs: Number.isFinite(fastestRef.current) ? fastestRef.current : 0,
      missed: missedRef.current,
      finishedAt: Date.now(),
    };
    recordSession(result);
    setLastResult(result);
    navigate({ to: "/results" });
  }, [op, diff, length, score, navigate]);

  const advance = useCallback(
    (wasCorrect: boolean, given: number | null) => {
      const elapsed = Date.now() - qStartRef.current;
      if (wasCorrect) {
        setScore((s) => s + 1);
        if (elapsed < fastestRef.current) fastestRef.current = elapsed;
      } else {
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
          questionRef.current = generateQuestion(op as Operation, diff as Difficulty);
          setIdx(next);
          setInput("");
          setFeedback(null);
          setRevealAnswer(null);
          qStartRef.current = Date.now();
          force((n) => n + 1);
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

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      } else if (e.key === "Backspace") {
        setInput((s) => s.slice(0, -1));
      } else if (e.key === "-" && input === "") {
        setInput("-");
      } else if (/^[0-9]$/.test(e.key)) {
        setInput((s) => (s.length < 8 ? s + e.key : s));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit, input]);

  const elapsedTotal = Math.floor((now - startRef.current) / 1000);
  const perQLeft = timer ? Math.max(0, PER_Q_MS - (now - qStartRef.current)) : 0;

  const progressPct = useMemo(() => (idx / length) * 100, [idx, length]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col">
        {/* HUD */}
        <div className="border-b border-border/60 bg-card/50">
          <div className="mx-auto max-w-2xl px-6 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="numeric">
                Q <span className="font-semibold text-foreground">{idx + 1}</span> / {length}
              </span>
              <span className="numeric">
                Score <span className="font-semibold text-foreground">{score}</span>
              </span>
              <span className="numeric">
                {Math.floor(elapsedTotal / 60)}:{String(elapsedTotal % 60).padStart(2, "0")}
              </span>
              <button
                onClick={finish}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-accent"
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
          </div>
        </div>

        {/* Question */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <p
            className={`numeric font-display text-6xl font-semibold tracking-tight md:text-7xl transition-colors ${
              feedback === "correct"
                ? "text-[oklch(0.6_0.18_155)]"
                : feedback === "wrong"
                  ? "text-destructive"
                  : ""
            }`}
          >
            {questionRef.current.prompt}
          </p>

          <div className="mt-10 w-full max-w-xs">
            <div
              className={`numeric flex h-20 items-center justify-center rounded-2xl border-2 bg-card text-4xl font-semibold tracking-wide transition-all ${
                feedback === "correct"
                  ? "border-[oklch(0.6_0.18_155)] bg-[oklch(0.95_0.05_155)]"
                  : feedback === "wrong"
                    ? "border-destructive bg-[oklch(0.97_0.03_27)]"
                    : "border-border"
              }`}
            >
              {input || <span className="text-muted-foreground/40">—</span>}
            </div>
            {revealAnswer != null ? (
              <p className="numeric mt-2 text-center text-sm text-muted-foreground">
                Answer: <span className="font-semibold text-foreground">{revealAnswer}</span>
              </p>
            ) : (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Type the answer · Enter to submit
              </p>
            )}
          </div>

          {/* Keypad (mobile) */}
          <div className="mt-8 grid w-full max-w-xs grid-cols-3 gap-2 md:hidden">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "0", "⌫"].map((k) => (
              <button
                key={k}
                onClick={() => {
                  if (k === "⌫") setInput((s) => s.slice(0, -1));
                  else if (k === "-") setInput((s) => (s === "" ? "-" : s));
                  else setInput((s) => (s.length < 8 ? s + k : s));
                }}
                className="numeric h-14 rounded-xl border border-border bg-card text-xl font-semibold transition-colors hover:bg-accent active:bg-accent"
              >
                {k}
              </button>
            ))}
            <button
              onClick={submit}
              className="col-span-3 h-12 rounded-xl bg-primary font-display font-semibold text-primary-foreground"
            >
              Enter
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
