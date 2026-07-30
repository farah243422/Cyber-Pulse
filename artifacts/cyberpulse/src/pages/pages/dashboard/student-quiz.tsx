import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, Award, CheckCircle2, XCircle,
  ChevronRight, AlertTriangle, ClipboardList
} from "lucide-react";
import {
  getPublishedQuizzes, saveSubmission, getStudentSubmission,
  calcAiDetection, newId, type Quiz, type QuizSubmission
} from "@/data/quiz-store";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

/* ─── Quiz Taking Screen ─────────────────────────────────────────────────────── */
function TakeQuiz({ quiz, onDone }: { quiz: Quiz; onDone: () => void }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult]       = useState<QuizSubmission | null>(null);
  const startRef                  = useRef(Date.now());

  // countdown timer
  const [secondsLeft, setSecondsLeft] = useState(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  useEffect(() => {
    if (!secondsLeft) return;
    if (secondsLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setSecondsLeft(s => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const handleSubmit = () => {
    if (!user) return;
    const timeSpent = Math.floor((Date.now() - startRef.current) / 1000);
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score += q.points;
    });
    const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);
    const aiScore     = calcAiDetection(quiz, timeSpent);
    const sub: QuizSubmission = {
      id: newId(), quizId: quiz.id,
      studentId: user.id, studentName: user.name, studentEmail: user.email,
      answers: answers as number[], submittedAt: new Date().toISOString(),
      score, totalPoints, timeSpentSeconds: timeSpent, aiDetectionScore: aiScore,
    };
    saveSubmission(sub);
    setResult(sub);
    setSubmitted(true);
  };

  const answered = answers.filter(a => a !== null).length;
  const pct = result ? Math.round((result.score / result.totalPoints) * 100) : 0;

  /* ── Result screen ── */
  if (submitted && result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-10">
        <div className="mb-6">
          {pct >= 60
            ? <CheckCircle2 size={56} className="text-success mx-auto" />
            : <XCircle size={56} className="text-destructive mx-auto" />}
        </div>
        <h2 className="text-3xl font-bold mb-2">
          {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Job!" : "Keep Practicing"}
        </h2>
        <p className="text-muted-foreground mb-8">Quiz submitted successfully.</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <div className={cn("text-3xl font-bold mb-1", pct >= 80 ? "text-success" : pct >= 60 ? "text-secondary" : "text-destructive")}>
              {pct}%
            </div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <div className="text-3xl font-bold mb-1">{result.score}<span className="text-base text-muted-foreground">/{result.totalPoints}</span></div>
            <div className="text-xs text-muted-foreground">Points</div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <div className="text-3xl font-bold mb-1">{Math.floor(result.timeSpentSeconds / 60)}m</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
        </div>

        {/* Per-question review */}
        <div className="text-left space-y-3 mb-8">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Review</h3>
          {quiz.questions.map((q, i) => {
            const correct = result.answers[i] === q.correctAnswer;
            return (
              <div key={q.id} className={cn("rounded-xl border p-4 text-sm",
                correct ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5")}>
                <div className="flex items-start gap-2 mb-2">
                  {correct
                    ? <CheckCircle2 size={15} className="text-success shrink-0 mt-0.5" />
                    : <XCircle size={15} className="text-destructive shrink-0 mt-0.5" />}
                  <span className="font-medium">{q.text}</span>
                </div>
                {!correct && (
                  <p className="text-xs text-success ml-5 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Correct: {q.options[q.correctAnswer]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={onDone}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors">
          Back to Quizzes
        </button>
      </motion.div>
    );
  }

  /* ── Taking screen ── */
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-background/95 backdrop-blur-sm py-3 z-10 border-b border-border/40">
        <div>
          <h2 className="font-bold text-lg">{quiz.title}</h2>
          <p className="text-xs text-muted-foreground">{answered} / {quiz.questions.length} answered</p>
        </div>
        {secondsLeft !== null && (
          <div className={cn("flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1.5 rounded-lg border",
            secondsLeft < 60 ? "text-destructive bg-destructive/10 border-destructive/30 animate-pulse" : "text-secondary bg-secondary/10 border-secondary/20")}>
            <Clock size={14} />
            {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {quiz.questions.map((q, qi) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qi * 0.04 }}
            className="bg-card/50 border border-border/50 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {qi + 1}
              </span>
              <p className="font-medium leading-relaxed">{q.text}</p>
              <span className="shrink-0 text-xs text-muted-foreground ml-auto">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-2 ml-10">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => {
                  const a = [...answers]; a[qi] = oi; setAnswers(a);
                }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                    answers[qi] === oi
                      ? "border-primary bg-primary/10 text-primary font-medium shadow-[0_0_12px_-4px_hsl(var(--primary)/0.4)]"
                      : "border-border/60 bg-background/50 hover:border-primary/40 hover:bg-primary/5"
                  )}>
                  <span className="inline-flex items-center gap-2">
                    <span className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      answers[qi] === oi ? "border-primary bg-primary" : "border-border")}>
                      {answers[qi] === oi && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submit */}
      {answered < quiz.questions.length && (
        <div className="flex items-center gap-2 mb-4 text-warning text-sm">
          <AlertTriangle size={15} />
          {quiz.questions.length - answered} question{quiz.questions.length - answered !== 1 ? "s" : ""} unanswered
        </div>
      )}
      <button onClick={handleSubmit}
        className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]">
        Submit Quiz
      </button>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function StudentQuiz() {
  const { user } = useAuth();
  const [quizzes, setQuizzes]   = useState<Quiz[]>([]);
  const [active,  setActive]    = useState<Quiz | null>(null);

  const load = () => setQuizzes(getPublishedQuizzes());
  useEffect(load, []);

  if (!user) return null;

  if (active) return <TakeQuiz quiz={active} onDone={() => { setActive(null); load(); }} />;

  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <ClipboardList className="text-secondary" size={24} /> Available Quizzes
        </h2>
        <p className="text-sm text-muted-foreground">Quizzes published by your instructor. Results are sent automatically.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border/60">
          <BookOpen size={40} className="text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-medium text-muted-foreground">No quizzes available yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your instructor hasn't published any quizzes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz, i) => {
            const submission = getStudentSubmission(quiz.id, user.id);
            const totalPts   = quiz.questions.reduce((s, q) => s + q.points, 0);
            const pct        = submission ? Math.round((submission.score / submission.totalPoints) * 100) : null;

            return (
              <motion.div key={quiz.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card/50 border border-border/50 rounded-2xl p-5 hover:bg-card transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold leading-snug">{quiz.title}</h3>
                  {submission ? (
                    <span className={cn("shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border",
                      pct! >= 80 ? "bg-success/10 text-success border-success/20" :
                      pct! >= 60 ? "bg-secondary/10 text-secondary border-secondary/20" :
                                   "bg-destructive/10 text-destructive border-destructive/20")}>
                      {pct}%
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      New
                    </span>
                  )}
                </div>

                {quiz.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{quiz.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><ClipboardList size={12} />{quiz.questions.length} questions</span>
                  <span className="flex items-center gap-1.5"><Award size={12} />{totalPts} pts</span>
                  {quiz.timeLimit && <span className="flex items-center gap-1.5"><Clock size={12} />{quiz.timeLimit} min</span>}
                </div>

                {submission ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium">Submitted</span>
                      <span className="text-muted-foreground ml-2">{submission.score} / {submission.totalPoints} pts</span>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setActive(quiz)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors">
                    Start Quiz <ChevronRight size={15} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
