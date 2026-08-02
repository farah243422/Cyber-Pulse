import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Trophy, ShieldCheck, Target, Play,
  CheckCircle2, ChevronRight, RotateCcw, Award, AlertTriangle, Zap,
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { getLabDefinition, type LabDefinition } from "@/data/lab-content";
import { getLabProgress, saveLabProgress, formatLabTime } from "@/data/lab-store";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Progress } from "@/components/ui/progress";

// Interactive lab components
import SQLInjectionLab from "@/labs/sql-injection-lab";
import XSSLab from "@/labs/xss-lab";
import PacketAnalysisLab from "@/labs/packet-analysis-lab";

type Phase = "intro" | "active" | "result";

interface InteractiveResult {
  score: number;
  steps: string[];
}

/* ── Difficulty Badge ────────────────────────────────────────────────────── */
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

/* ── Timer ──────────────────────────────────────────────────────────────── */
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

/* ── Intro Phase ─────────────────────────────────────────────────────────── */
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
      <div className="bg-card border border-border/50 rounded-2xl p-8 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <DifficultyBadge difficulty={lab.difficulty} />
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-medium">
            {lab.category}
          </span>
          <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md font-medium">
            Interactive Lab
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
            { icon: <Zap size={16} className="text-warning" />, label: "Stages", value: "3 challenges" },
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

/* ── Interactive Lab Router ──────────────────────────────────────────────── */
function InteractiveLabRunner({
  labId,
  elapsed,
  onSubmit,
}: {
  labId: string;
  elapsed: number;
  onSubmit: (score: number, steps: string[]) => void;
}) {
  /* Sticky header */
  const lab = getLabDefinition(labId);
  if (!lab) return null;

  return (
    <motion.div
      key="active"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
    >
      {/* Sticky timer header */}
      <div className="sticky top-4 z-10 bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl px-5 py-3 mb-6 shadow-sm flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck size={16} className="text-primary" />
          <span>{lab.title}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock size={14} className="text-secondary" />
          <span className="font-mono font-medium">{formatLabTime(elapsed)}</span>
        </div>
      </div>

      {labId === "c1" && <SQLInjectionLab elapsed={elapsed} onSubmit={onSubmit} />}
      {labId === "c5" && <XSSLab elapsed={elapsed} onSubmit={onSubmit} />}
      {labId === "c2" && <PacketAnalysisLab elapsed={elapsed} onSubmit={onSubmit} />}
    </motion.div>
  );
}

/* ── Result Phase ────────────────────────────────────────────────────────── */
function ResultPhase({
  lab,
  result,
  timeSeconds,
  onBack,
  onRetake,
}: {
  lab: LabDefinition;
  result: InteractiveResult;
  timeSeconds: number;
  onBack: () => void;
  onRetake: () => void;
}) {
  const { score, steps } = result;
  const pct = Math.round((score / lab.maxScore) * 100);
  const passed = pct >= 60;

  const stepLabels: Record<string, string> = {
    // SQL Injection
    "vulnerability-identified": "Identified the vulnerable SQL line",
    "login-bypassed":           "Bypassed login with a SQL injection payload",
    "login-bypassed+comment":   "Bypassed login using OR + comment injection",
    "fix-identified":           "Selected the correct defence (parameterized queries)",
    // XSS
    "reflected-xss-script":     "Triggered Reflected XSS with a script tag payload",
    "reflected-xss-event":      "Triggered Reflected XSS with an event handler payload",
    "reflected-xss-cookie":     "Triggered Reflected XSS with a cookie-theft payload",
    "stored-xss-basic":         "Demonstrated Stored XSS affecting all visitors",
    "stored-xss-cookie":        "Demonstrated Stored XSS cookie theft attack",
    "fix-correct":              "Selected the correct defence (output encoding + CSP)",
    // Packet analysis
    "attacker-ip-identified":   "Identified the attacker's IP address (10.0.0.99)",
    "attack-type-correct":      "Correctly classified as a TCP SYN Port Scan",
    "filter-score-30":          "Wrote a perfect Wireshark display filter",
    "filter-score-25":          "Wrote a good Wireshark display filter",
    "filter-score-20":          "Wrote a basic Wireshark display filter",
    "filter-score-10":          "Partially correct Wireshark filter",
  };

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
            ? "Good work! Review the steps you missed to solidify your knowledge."
            : passed
            ? "You passed! Try again to complete all challenges."
            : "Don't give up — review the lab and retake it to improve."}
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

      {/* Completed challenges breakdown */}
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <ShieldCheck size={16} className="text-primary" /> Challenge Breakdown
      </h3>
      <div className="space-y-3">
        {steps.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            No challenges completed. Retake the lab to earn points.
          </div>
        ) : (
          steps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-success/30 rounded-xl p-4 shadow-sm flex items-start gap-3"
            >
              <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
              <p className="text-sm font-medium">
                {stepLabels[step] ?? step}
              </p>
            </motion.div>
          ))
        )}
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

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function LabDetailPage() {
  const { labId } = useParams<{ labId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [phase, setPhase] = useState<Phase>("intro");
  const [labResult, setLabResult] = useState<InteractiveResult | null>(null);
  const [finalTime, setFinalTime] = useState(0);

  const timerRunning = phase === "active";
  const elapsed = useTimer(timerRunning);

  const lab = labId ? getLabDefinition(labId) : null;
  const previousProgress = labId ? getLabProgress(labId) : null;

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
    saveLabProgress({
      labId: lab.id,
      status: "In Progress",
      scoreEarned: previousProgress?.scoreEarned ?? 0,
      maxScore: lab.maxScore,
      timeSeconds: 0,
    });
    setLabResult(null);
    setPhase("active");
  };

  const handleInteractiveSubmit = (score: number, steps: string[]) => {
    const timeNow = elapsed;
    saveLabProgress({
      labId: lab.id,
      status: "Completed",
      scoreEarned: score,
      maxScore: lab.maxScore,
      timeSeconds: timeNow,
      completedAt: new Date().toISOString(),
      answers: [],
    });
    setLabResult({ score, steps });
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
          {phase === "active" && labId && (
            <InteractiveLabRunner
              key="active"
              labId={labId}
              elapsed={elapsed}
              onSubmit={handleInteractiveSubmit}
            />
          )}
          {phase === "result" && labResult && (
            <ResultPhase
              key="result"
              lab={lab}
              result={labResult}
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
