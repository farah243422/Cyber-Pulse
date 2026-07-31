export type QuestionType = "mcq" | "truefalse";

export interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];        // MCQ: 4 options | T/F: ["True","False"]
  correctAnswer: number;    // index of correct option
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdBy: string;        // instructor email
  createdAt: string;
  published: boolean;
  timeLimit: number | null; // minutes, null = no limit
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  answers: (number | null)[];   // selected option index per question
  submittedAt: string;
  score: number;
  totalPoints: number;
  timeSpentSeconds: number;
  aiDetectionScore: number;     // 0-100
}

const QUIZZES_KEY   = "cyberpulse_quizzes";
const SUBMISSIONS_KEY = "cyberpulse_quiz_submissions";

// ── QUIZZES ──────────────────────────────────────────────────────────────────

export function getQuizzes(): Quiz[] {
  try { return JSON.parse(localStorage.getItem(QUIZZES_KEY) || "[]"); }
  catch { return []; }
}

export function saveQuiz(quiz: Quiz): void {
  const all = getQuizzes();
  const idx = all.findIndex(q => q.id === quiz.id);
  if (idx !== -1) all[idx] = quiz; else all.push(quiz);
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(all));
}

export function deleteQuiz(quizId: string): void {
  const all = getQuizzes().filter(q => q.id !== quizId);
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(all));
  // also delete submissions for this quiz
  const subs = getSubmissions().filter(s => s.quizId !== quizId);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
}

export function getPublishedQuizzes(): Quiz[] {
  return getQuizzes().filter(q => q.published);
}

// ── SUBMISSIONS ───────────────────────────────────────────────────────────────

export function getSubmissions(): QuizSubmission[] {
  try { return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || "[]"); }
  catch { return []; }
}

export function saveSubmission(sub: QuizSubmission): void {
  // Replace existing submission for the same quiz+student (prevent duplicates)
  const all = getSubmissions().filter(
    s => !(s.quizId === sub.quizId && s.studentId === sub.studentId),
  );
  all.push(sub);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
}

export function getSubmissionsForQuiz(quizId: string): QuizSubmission[] {
  return getSubmissions().filter(s => s.quizId === quizId);
}

export function getStudentSubmission(quizId: string, studentId: string): QuizSubmission | null {
  return getSubmissions().find(s => s.quizId === quizId && s.studentId === studentId) ?? null;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

export function newId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/** Calculates an AI detection score based on time spent per question */
export function calcAiDetection(quiz: Quiz, timeSpentSeconds: number): number {
  const expected = quiz.questions.reduce((s, q) => s + (q.type === "mcq" ? 60 : 20), 0);
  if (timeSpentSeconds <= 0 || expected <= 0) return 0;
  const ratio = timeSpentSeconds / expected;
  if (ratio >= 0.8) return Math.round(Math.random() * 10);       // normal speed → clean
  if (ratio >= 0.5) return Math.round(20 + Math.random() * 20);  // a bit fast → low
  if (ratio >= 0.3) return Math.round(50 + Math.random() * 25);  // fast → medium
  return Math.round(75 + Math.random() * 25);                     // very fast → high
}
