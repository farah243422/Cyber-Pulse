import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Trophy, ShieldCheck, Target, Play,
  CheckCircle2, XCircle, ChevronRight, RotateCcw, Award,
  AlertTriangle, Zap,
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { getLabDefinition, type LabDefinition, type LabQuestion } from "@/data/lab-content";
import { getLabProgress, saveLabProgress, formatLabTime } from "@/data/lab-store";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Progress } from "@/components/ui/progress";

type Phase = "intro" | "active" | "result";

function DifficultyBadge({ difficulty }: { difficulty: LabDefinition["difficulty"] }) {
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-semibold border",
      difficulty === "Easy"   && "bg-success/10 text-success border-success/20",
      difficulty === "Medium" && "bg-warning/10 text-warning border-warning/20",
      difficulty === "Hard"   && "bg-destructive/10 text-destructive border-destructive/20",
    )}>
      {difficulty}
    </span>
  );
}

/* ─── Timer ─────────────────────────────────────────────────────────────── */
function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  return seconds;
}

/* ─── Intro Phase ────────────────────────────────────────────────────────── */
function IntroPhase({
  lab,
  previousProgress,
  onStart,
}: {
  lab: LabDefinition;
  previousProgress: ReturnType<typeof getLabProgress>;
  onStart: () => void;
}) {
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-2xl mx-auto"
    >
      {/* Hero card */}
      <div className="bg-card border border-border/50 rounded-2xl p-8 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <DifficultyBadge difficulty={lab.difficulty} />
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-medium">
            {lab.category}
          </span>
          {previousProgress?.status === "Completed" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-success/10 text-success border-success/20">
              <CheckCircle2 size={11} /> Completed
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-2">{lab.title}</h1>
        <p className="text-muted-foreground leading-relaxed mb-6">{lab.description}</p>

        {/* Meta row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: <Clock size={16} className="text-secondary" />, label: "Est. Time", value: lab.estimatedTime },
            { icon: <Trophy size={16} className="text-primary" />, label: "Max Score", value: `${lab.maxScore} pts` },
            { icon: <Zap size={16} className="text-warning" />, label: "Questions", value: `${lab.questions.length}` },
            { icon: <ShieldCheck size={16} className="text-success" />, label: "Category", value: lab.category },
          ].map((m) => (
            <div key={m.label} className="bg-background/60 rounded-xl p-3 text-center border border-border/40">
              <div className="flex justify-center mb-1">{m.icon}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="font-semibold text-sm mt-0.5">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Objective */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
          <Target size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Learning Objective</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{lab.objective}</p>
          </div>
        </div>

        {/* Previous attempt info */}
        {previousProgress && previousProgress.status !== "Not Started" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/5 border border-secondary/20 mb-6">
            <RotateCcw size={16} className="text-secondary mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-secondary">Previous attempt: </span>
              <span className="text-muted-foreground">
                {previousProgress.scoreEarned}/{previousProgress.maxScore} pts ·{" "}
                {formatLabTime(previousProgress.timeSeconds)}
              </span>
              {previousProgress.status === "Completed" && (
                <span className="ml-2 text-success font-medium">✓ Completed</span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onStart}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-base flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20"
        >
          <Play size={18} fill="currentColor" />
          {previousProgress?.status === "Completed" ? "Retake Lab" : "Start Lab"}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Active Phase ───────────────────────────────────────────────────────── */
function ActivePhase({
  lab,
  elapsed,
  onSubmit,
}: {
  lab: LabDefinition;
  elapsed: number;
  onSubmit: (answers: (number | null)[]) => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(lab.questions.length).fill(null),
  );

  const answered = answers.filter((a) => a !== null).length;
  const allAnswered = answered === lab.questions.length;

  return (
    <motion.div
      key="active"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-2xl mx-auto"
    >
      {/* Sticky header */}
      <div className="sticky top-4 z-10 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl px-5 py-3 mb-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck size={16} className="text-primary" />
          <span>{lab.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={14} className="text-secondary" />
            <span className="font-mono font-medium">{formatLabTime(elapsed)}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {answered}/{lab.questions.length} answered
          </span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5 mb-8">
        {lab.questions.map((q: LabQuestion, qi: number) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qi * 0.06 }}
            className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold">
                {qi + 1}
              </span>
              <p className="text-sm font-medium leading-relaxed pt-0.5">{q.text}</p>
            </div>

            <div className="space-y-2 pl-10">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => {
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm border transition-all",
                      selected
                        ? "bg-primary/10 border-primary/40 text-foreground font-medium"
                        : "bg-background/40 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-background/70",
                    )}
                  >
                    <span className={cn("mr-2 font-semibold", selected ? "text-primary" : "text-muted-foreground")}>
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="pl-10 mt-2">
              <span className="text-xs text-muted-foreground">{q.points} pts</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submit */}
      {!allAnswered && (
        <p className="text-center text-xs text-muted-foreground mb-3">
          Answer all {lab.questions.length} questions to submit
        </p>
      )}
      <button
        disabled={!allAnswered}
        onClick={() => onSubmit(answers)}
        className={cn(
          "w-full py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all",
          allAnswered
            ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-md shadow-primary/20"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        <ChevronRight size={18} />
        Submit Answers
      </button>
    </motion.div>
  );
}

/* ─── Result Phase ───────────────────────────────────────────────────────── */
function ResultPhase({
  lab,
  answers,
  timeSeconds,
  onBack,
  onRetake,
}: {
  lab: LabDefinition;
  answers: (number | null)[];
  timeSeconds: number;
  onBack: () => void;
  onRetake: () => void;
}) {
  const score = lab.questions.reduce((sum, q, i) => {
    return answers[i] === q.correctAnswer ? sum + q.points : sum;
  }, 0);
  const pct = Math.round((score / lab.maxScore) * 100);
  const passed = pct >= 60;

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Score hero */}
      <div className="bg-card border border-border/50 rounded-2xl p-8 mb-6 text-center shadow-sm">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-primary/30 bg-primary/10">
          {passed
            ? <Award size={36} className="text-primary" />
            : <AlertTriangle size={36} className="text-warning" />
          }
        </div>

        <h2 className="text-2xl font-bold mb-1">
          {pct >= 90 ? "Excellent!" : pct >= 70 ? "Well Done!" : passed ? "Lab Complete" : "Keep Practicing"}
        </h2>
        <p className="text-muted-foreground mb-5 text-sm">
          {pct >= 90
            ? "Outstanding performance — you've mastered this topic."
            : pct >= 70
            ? "Good work! Review the explanations to solidify your knowledge."
            : passed
            ? "You passed! Study the incorrect answers to improve."
            : "Don't give up — review the material and retake the lab."}
        </p>

        <div className="flex items-center justify-center gap-8 mb-5">
          <div>
            <div className="text-3xl font-bold text-primary">{score}</div>
            <div className="text-xs text-muted-foreground">out of {lab.maxScore} pts</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <div className="text-3xl font-bold">{pct}%</div>
            <div className="text-xs text-muted-foreground">score</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <div className="text-3xl font-bold">{formatLabTime(timeSeconds)}</div>
            <div className="text-xs text-muted-foreground">time taken</div>
          </div>
        </div>

        <Progress value={pct} className="h-2.5 mb-6" />

        <div className="flex gap-3">
          <button
            onClick={onRetake}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/60 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} /> Retake Lab
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </div>

      {/* Per-question breakdown */}
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <ShieldCheck size={16} className="text-primary" /> Question Review
      </h3>
      <div className="space-y-4">
        {lab.questions.map((q: LabQuestion, i: number) => {
          const chosen = answers[i];
          const correct = q.correctAnswer;
          const isRight = chosen === correct;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={cn(
                "bg-card border rounded-xl p-5 shadow-sm",
                isRight ? "border-success/30" : "border-destructive/30",
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                {isRight
                  ? <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                  : <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                }
                <p className="text-sm font-medium leading-relaxed">{q.text}</p>
              </div>

              <div className="space-y-1.5 pl-7 mb-3">
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm border",
                      oi === correct
                        ? "bg-success/10 border-success/30 text-success font-medium"
                        : chosen === oi && !isRight
                        ? "bg-destructive/10 border-destructive/30 text-destructive line-through"
                        : "border-transparent text-muted-foreground",
                    )}
                  >
                    <span className="font-semibold mr-1.5">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                    {oi === correct && <span className="ml-2 text-xs opacity-70">✓ Correct</span>}
                    {chosen === oi && !isRight && <span className="ml-2 text-xs opacity-70">✗ Your answer</span>}
                  </div>
                ))}
              </div>

              <div className={cn(
                "px-3 py-2.5 rounded-lg text-xs leading-relaxed border",
                isRight
                  ? "bg-success/5 border-success/20 text-foreground/80"
                  : "bg-muted/50 border-border/40 text-foreground/70",
              )}>
                <span className="font-semibold">Explanation: </span>{q.explanation}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onRetake}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/60 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} /> Retake Lab
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function LabDetailPage() {
  const { labId } = useParams<{ labId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [phase, setPhase] = useState<Phase>("intro");
  const [finalAnswers, setFinalAnswers] = useState<(number | null)[]>([]);
  const [finalTime, setFinalTime] = useState(0);

  const timerRunning = phase === "active";
  const elapsed = useTimer(timerRunning);

  const lab = labId ? getLabDefinition(labId) : null;
  const previousProgress = labId ? getLabProgress(labId) : null;

  // Auth guard
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user || !lab) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {!lab ? "Lab not found." : "Loading…"}
        </div>
      </div>
    );
  }

  const handleStart = () => {
    // Save "In Progress" immediately
    saveLabProgress({
      labId: lab.id,
      status: "In Progress",
      scoreEarned: previousProgress?.scoreEarned ?? 0,
      maxScore: lab.maxScore,
      timeSeconds: 0,
    });
    setPhase("active");
  };

  const handleSubmit = (answers: (number | null)[]) => {
    const score = lab.questions.reduce((sum, q, i) =>
      answers[i] === q.correctAnswer ? sum + q.points : sum, 0);
    const timeNow = elapsed;

    saveLabProgress({
      labId: lab.id,
      status: "Completed",
      scoreEarned: score,
      maxScore: lab.maxScore,
      timeSeconds: timeNow,
      completedAt: new Date().toISOString(),
      answers,
    });

    setFinalAnswers(answers);
    setFinalTime(timeNow);
    setPhase("result");
  };

  const handleRetake = () => {
    setPhase("intro");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl flex-1">
        {/* Back link */}
        {phase !== "active" && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
        )}

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <IntroPhase
              key="intro"
              lab={lab}
              previousProgress={previousProgress}
              onStart={handleStart}
            />
          )}
          {phase === "active" && (
            <ActivePhase
              key="active"
              lab={lab}
              elapsed={elapsed}
              onSubmit={handleSubmit}
            />
          )}
          {phase === "result" && (
            <ResultPhase
              key="result"
              lab={lab}
              answers={finalAnswers}
              timeSeconds={finalTime}
              onBack={handleBack}
              onRetake={handleRetake}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
