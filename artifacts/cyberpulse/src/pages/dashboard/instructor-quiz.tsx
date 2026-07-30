import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, Check, X, BookOpen, Users, Eye,
  EyeOff, ClipboardList, ChevronDown, ChevronUp, BrainCircuit,
  Clock, Award, AlertTriangle, CheckCircle2, Save, ToggleLeft, ToggleRight
} from "lucide-react";
import {
  getQuizzes, saveQuiz, deleteQuiz, getSubmissionsForQuiz,
  newId, type Quiz, type QuizQuestion, type QuizSubmission
} from "@/data/quiz-store";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
function AiScore({ score }: { score: number }) {
  const cfg =
    score < 20 ? { label: "Clean",  cls: "text-success   bg-success/10   border-success/20" } :
    score < 50 ? { label: "Low",    cls: "text-secondary bg-secondary/10 border-secondary/20" } :
    score < 75 ? { label: "Medium", cls: "text-warning   bg-warning/10   border-warning/20" } :
                 { label: "High",   cls: "text-destructive bg-destructive/10 border-destructive/20" };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border", cfg.cls)}>
      <BrainCircuit size={11} /> {cfg.label} · {score}%
    </span>
  );
}

/* ─── Question Editor ───────────────────────────────────────────────────────── */
function QuestionEditor({
  question, index, onUpdate, onDelete,
}: { question: QuizQuestion; index: number; onUpdate: (q: QuizQuestion) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(true);

  const setOption = (i: number, val: string) => {
    const opts = [...question.options]; opts[i] = val; onUpdate({ ...question, options: opts });
  };

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden bg-card/40">
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card/60 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <p className="flex-1 text-sm font-medium truncate">{question.text || "New question…"}</p>
        <span className={cn("text-xs px-2 py-0.5 rounded-md border",
          question.type === "mcq" ? "border-secondary/30 text-secondary bg-secondary/10" : "border-primary/30 text-primary bg-primary/10")}>
          {question.type === "mcq" ? "MCQ" : "T/F"}
        </span>
        <span className="text-xs text-muted-foreground">{question.points} pt{question.points !== 1 ? "s" : ""}</span>
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          className="ml-1 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 size={14} />
        </button>
        {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
      </div>

      {open && (
        <div className="p-4 space-y-4">
          {/* Question text */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Question text</label>
            <textarea
              value={question.text}
              onChange={e => onUpdate({ ...question, text: e.target.value })}
              rows={2}
              placeholder="Type your question here…"
              className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Type + Points row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <select value={question.type}
                onChange={e => {
                  const t = e.target.value as "mcq" | "truefalse";
                  onUpdate({ ...question, type: t,
                    options: t === "truefalse" ? ["True", "False"] : ["", "", "", ""],
                    correctAnswer: 0 });
                }}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="truefalse">True / False</option>
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs text-muted-foreground mb-1 block">Points</label>
              <input type="number" min={1} max={100} value={question.points}
                onChange={e => onUpdate({ ...question, points: Number(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              {question.type === "truefalse" ? "Correct Answer" : "Options — click circle to mark correct answer"}
            </label>
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdate({ ...question, correctAnswer: i })}
                    className={cn("shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      question.correctAnswer === i
                        ? "border-success bg-success text-white"
                        : "border-border hover:border-success/50")}>
                    {question.correctAnswer === i && <Check size={12} strokeWidth={3} />}
                  </button>
                  {question.type === "truefalse" ? (
                    <span className="text-sm">{opt}</span>
                  ) : (
                    <input value={opt} onChange={e => setOption(i, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Quiz Editor Modal ─────────────────────────────────────────────────────── */
function QuizEditor({ quiz, onSave, onClose }: { quiz: Quiz; onSave: (q: Quiz) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Quiz>(JSON.parse(JSON.stringify(quiz)));

  const addQuestion = (type: "mcq" | "truefalse") => {
    const q: QuizQuestion = {
      id: newId(), text: "", type,
      options: type === "truefalse" ? ["True", "False"] : ["", "", "", ""],
      correctAnswer: 0, points: type === "mcq" ? 5 : 2,
    };
    setDraft(d => ({ ...d, questions: [...d.questions, q] }));
  };

  const updateQ = (idx: number, q: QuizQuestion) => {
    const qs = [...draft.questions]; qs[idx] = q;
    setDraft(d => ({ ...d, questions: qs }));
  };

  const deleteQ = (idx: number) =>
    setDraft(d => ({ ...d, questions: d.questions.filter((_, i) => i !== idx) }));

  const totalPts = draft.questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Edit3 size={18} className="text-primary" />
            {quiz.id ? "Edit Quiz Template" : "Create New Quiz Template"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Quiz Title *</label>
            <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              placeholder="e.g. Network Security — Week 4 Quiz"
              className="w-full px-3 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              rows={2} placeholder="Instructions or topic overview…"
              className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>

          {/* Time limit */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <label className="text-sm font-medium">Time Limit</label>
            </div>
            <select value={draft.timeLimit ?? ""}
              onChange={e => setDraft(d => ({ ...d, timeLimit: e.target.value ? Number(e.target.value) : null }))}
              className="px-3 py-1.5 rounded-lg border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">No limit</option>
              {[5, 10, 15, 20, 30, 45, 60, 90].map(m => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </select>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">
                Questions <span className="text-muted-foreground">({draft.questions.length} · {totalPts} pts total)</span>
              </label>
              <div className="flex gap-2">
                <button onClick={() => addQuestion("mcq")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                  <Plus size={13} /> MCQ
                </button>
                <button onClick={() => addQuestion("truefalse")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary text-xs font-medium hover:bg-secondary/20 transition-colors">
                  <Plus size={13} /> True/False
                </button>
              </div>
            </div>

            {draft.questions.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-dashed border-border/60 text-muted-foreground text-sm">
                No questions yet. Add an MCQ or True/False question above.
              </div>
            ) : (
              <div className="space-y-3">
                {draft.questions.map((q, i) => (
                  <QuestionEditor key={q.id} question={q} index={i}
                    onUpdate={updated => updateQ(i, updated)}
                    onDelete={() => deleteQ(i)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          <span className="text-sm text-muted-foreground">{draft.questions.length} questions · {totalPts} pts</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { if (!draft.title.trim()) return; onSave(draft); }}
              disabled={!draft.title.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40">
              <Save size={15} /> Save Template
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Submissions Modal ─────────────────────────────────────────────────────── */
function SubmissionsModal({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) {
  const subs = getSubmissionsForQuiz(quiz.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ClipboardList size={18} className="text-secondary" /> Results — {quiz.title}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {subs.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {subs.map(s => {
                const pct = Math.round((s.score / s.totalPoints) * 100);
                return (
                  <div key={s.id} className="bg-card/50 border border-border/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                          {s.studentName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{s.studentName}</p>
                          <p className="text-xs text-muted-foreground">{s.studentEmail}</p>
                        </div>
                      </div>
                      <AiScore score={s.aiDetectionScore} />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Award size={14} className="text-primary" />
                        <span className="font-bold">{s.score}</span>
                        <span className="text-muted-foreground">/ {s.totalPoints} pts</span>
                        <span className={cn("ml-1 font-semibold",
                          pct >= 80 ? "text-success" : pct >= 60 ? "text-secondary" : "text-destructive")}>
                          ({pct}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={13} />
                        {Math.floor(s.timeSpentSeconds / 60)}m {s.timeSpentSeconds % 60}s
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function InstructorQuiz() {
  const { user } = useAuth();
  const [quizzes, setQuizzes]       = useState<Quiz[]>([]);
  const [editing, setEditing]       = useState<Quiz | null>(null);
  const [viewing, setViewing]       = useState<Quiz | null>(null);

  const load = () => setQuizzes(getQuizzes());
  useEffect(load, []);

  if (!user) return null;

  const handleSave = (quiz: Quiz) => {
    saveQuiz(quiz); load(); setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this quiz and all its submissions?")) return;
    deleteQuiz(id); load();
  };

  const togglePublish = (quiz: Quiz) => {
    saveQuiz({ ...quiz, published: !quiz.published }); load();
  };

  const createNew = (): Quiz => ({
    id: newId(), title: "", description: "", createdBy: user.email,
    createdAt: new Date().toISOString(), published: false,
    timeLimit: null, questions: [],
  });

  return (
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <BookOpen className="text-primary" size={24} /> Quiz Templates
          </h2>
          <p className="text-sm text-muted-foreground">Create and manage question templates. Publish when ready for students.</p>
        </div>
        <button onClick={() => setEditing(createNew())}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]">
          <Plus size={16} /> New Quiz Template
        </button>
      </div>

      {quizzes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="py-20 text-center rounded-2xl border border-dashed border-border/60">
          <BookOpen size={40} className="text-muted-foreground/40 mx-auto mb-4" />
          <p className="font-medium text-muted-foreground mb-2">No quiz templates yet</p>
          <p className="text-sm text-muted-foreground mb-6">Create your first quiz template to get started.</p>
          <button onClick={() => setEditing(createNew())}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors">
            <Plus size={15} /> Create First Quiz
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz, i) => {
            const subs = getSubmissionsForQuiz(quiz.id);
            const totalPts = quiz.questions.reduce((s, q) => s + q.points, 0);
            const avgScore = subs.length
              ? Math.round(subs.reduce((s, sub) => s + (sub.score / sub.totalPoints) * 100, 0) / subs.length)
              : null;

            return (
              <motion.div key={quiz.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card/50 border border-border/50 rounded-2xl p-5 hover:bg-card transition-colors">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate mb-1">{quiz.title}</h3>
                    {quiz.description && <p className="text-xs text-muted-foreground line-clamp-1">{quiz.description}</p>}
                  </div>
                  <span className={cn("shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border",
                    quiz.published
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-muted text-muted-foreground border-border")}>
                    {quiz.published ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                  <span className="flex items-center gap-1.5"><ClipboardList size={13} />{quiz.questions.length} questions</span>
                  <span className="flex items-center gap-1.5"><Award size={13} />{totalPts} pts</span>
                  {quiz.timeLimit && <span className="flex items-center gap-1.5"><Clock size={13} />{quiz.timeLimit}m</span>}
                  <span className="flex items-center gap-1.5"><Users size={13} />{subs.length} submitted</span>
                  {avgScore !== null && (
                    <span className={cn("flex items-center gap-1 font-medium",
                      avgScore >= 80 ? "text-success" : avgScore >= 60 ? "text-secondary" : "text-destructive")}>
                      avg {avgScore}%
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setEditing(JSON.parse(JSON.stringify(quiz)))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                    <Edit3 size={13} /> Edit
                  </button>
                  <button onClick={() => togglePublish(quiz)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                      quiz.published
                        ? "bg-muted border-border text-muted-foreground hover:bg-muted/70"
                        : "bg-success/10 border-success/20 text-success hover:bg-success/20")}>
                    {quiz.published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
                  </button>
                  {subs.length > 0 && (
                    <button onClick={() => setViewing(quiz)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium hover:bg-secondary/20 transition-colors">
                      <ClipboardList size={13} /> Results ({subs.length})
                    </button>
                  )}
                  <button onClick={() => handleDelete(quiz.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-transparent hover:border-destructive/20 text-xs font-medium transition-colors ml-auto">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {editing && <QuizEditor quiz={editing} onSave={handleSave} onClose={() => setEditing(null)} />}
        {viewing && <SubmissionsModal quiz={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </div>
  );
}
