import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, ShieldAlert, ShieldCheck, ChevronRight,
  CheckCircle2, XCircle, Eye, Lock, Database, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  elapsed: number;
  onSubmit: (score: number, steps: string[]) => void;
}

/* ── SQL-injection detection ────────────────────────────────────────────── */
function detectSQLi(username: string): boolean {
  const u = username.toLowerCase().trim();
  if (u.length < 3) return false;
  // OR-bypass patterns
  if (/'\s*or\s+['"\d].*['"\d]/.test(u)) return true;
  if (/'\s*or\s+1\s*=\s*1/.test(u)) return true;
  // Comment-based bypass
  if (/'.*(--)/.test(u)) return true;
  // Common explicit payloads
  const known = ["' or '1'='1", "' or 1=1", "admin'--", "admin' --", "' or 'a'='a"];
  return known.some((p) => u.includes(p));
}

function usesComment(username: string): boolean {
  return /--/.test(username);
}

/* ── Build live SQL preview ─────────────────────────────────────────────── */
function buildSQL(username: string, password: string): string {
  return `SELECT * FROM users\nWHERE username='${username}'\n  AND password='${password}';`;
}

/* ── Vulnerable code listing ────────────────────────────────────────────── */
const CODE_LINES = [
  { n: 1, code: "<?php" },
  { n: 2, code: "function authenticate($user, $pass) {" },
  { n: 3, code: '    $conn = new mysqli("localhost","root","","corp_db");' },
  { n: 4, code: '    $q = "SELECT * FROM users' },
  { n: 5, code: '           WHERE username=\'$user\'' },
  { n: 6, code: '            AND password=\'$pass\'";' },
  { n: 7, code: "    $r = $conn->query($q);" },
  { n: 8, code: "    return $r->num_rows > 0;" },
  { n: 9, code: "}" },
];
const VULNERABLE_LINES = [4, 5, 6];

/* ── Fix options ─────────────────────────────────────────────────────────── */
const FIXES = [
  {
    label: "A — Blacklist quotes",
    code: `$user = str_replace("'", "", $user);\n$q = "SELECT * FROM users WHERE username='$user' AND password='$pass'";`,
    correct: false,
    why: "Blacklisting can be bypassed with encoding tricks and doesn't solve the root cause.",
  },
  {
    label: "B — Parameterized query",
    code: `$stmt = $conn->prepare("SELECT * FROM users\n  WHERE username=? AND password=?");\n$stmt->bind_param("ss", $user, $pass);\n$stmt->execute();`,
    correct: true,
    why: "Parameterized queries separate code from data at the protocol level — injection is impossible.",
  },
  {
    label: "C — Client-side validation only",
    code: `if (!preg_match('/^[a-z0-9]+$/i', $user)) {\n  die("Invalid username");\n}`,
    correct: false,
    why: "Client-side validation is trivially bypassed with browser dev-tools or curl.",
  },
];

type Stage = 0 | 1 | 2;

export default function SQLInjectionLab({ onSubmit }: Props) {
  const [stage, setStage] = useState<Stage>(0);
  const [stageScores, setStageScores] = useState<Record<number, number>>({});
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  /* Stage 0 state */
  const [clickedLine, setClickedLine] = useState<number | null>(null);
  const [reconFeedback, setReconFeedback] = useState<"correct" | "wrong" | null>(null);

  /* Stage 1 state */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loginResult, setLoginResult] = useState<"success" | "fail" | null>(null);
  const [loginHint, setLoginHint] = useState(false);

  /* Stage 2 state */
  const [selectedFix, setSelectedFix] = useState<number | null>(null);
  const [fixSubmitted, setFixSubmitted] = useState(false);

  /* ── Stage helpers ──────────────────────────────────────────────────────── */
  const earnStage = (stageIdx: number, pts: number, step: string) => {
    setStageScores((prev) => ({ ...prev, [stageIdx]: pts }));
    setCompletedSteps((prev) => [...prev, step]);
  };

  const totalScore = () =>
    Math.min(100, Object.values(stageScores).reduce((a, b) => a + b, 0));

  /* Stage 0: identify vulnerable lines */
  const handleReconCheck = () => {
    if (clickedLine !== null && VULNERABLE_LINES.includes(clickedLine)) {
      setReconFeedback("correct");
      earnStage(0, 35, "vulnerability-identified");
      setTimeout(() => setStage(1), 900);
    } else {
      setReconFeedback("wrong");
      setTimeout(() => setReconFeedback(null), 1400);
    }
  };

  /* Stage 1: exploit the login */
  const handleLogin = () => {
    const att = attempts + 1;
    setAttempts(att);
    if (detectSQLi(username)) {
      setLoginResult("success");
      const pts = att === 1 ? 40 : att <= 3 ? 32 : 24;
      earnStage(1, pts, "login-bypassed" + (usesComment(username) ? "+comment" : ""));
    } else {
      setLoginResult("fail");
      if (att >= 2) setLoginHint(true);
    }
  };

  /* Stage 2: pick the fix */
  const handleFixSubmit = () => {
    setFixSubmitted(true);
    const correct = selectedFix !== null && FIXES[selectedFix].correct;
    if (correct) earnStage(2, 25, "fix-identified");
    setTimeout(() => {
      onSubmit(totalScore(), completedSteps);
    }, 1800);
  };

  /* ── Stage 0: Recon ─────────────────────────────────────────────────────── */
  const renderRecon = () => (
    <motion.div key="recon" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="bg-card border border-border/50 rounded-2xl p-6 mb-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Eye size={16} className="text-secondary" />
          <span className="text-xs text-secondary font-semibold uppercase tracking-wider">Stage 1 — Reconnaissance</span>
        </div>
        <h2 className="text-lg font-bold mb-1">Find the Vulnerability</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Inspect the PHP login handler below. Click the line(s) that contain a SQL injection vulnerability, then press Check.
        </p>

        <div className="bg-background/80 rounded-xl border border-border/40 overflow-hidden font-mono text-xs mb-5">
          {CODE_LINES.map(({ n, code }) => {
            const isVuln = VULNERABLE_LINES.includes(n);
            const isSelected = clickedLine === n;
            return (
              <div
                key={n}
                onClick={() => setClickedLine(n)}
                className={cn(
                  "flex gap-3 px-4 py-1.5 cursor-pointer transition-all select-none",
                  isSelected
                    ? "bg-primary/20 border-l-2 border-primary"
                    : isVuln && reconFeedback === "correct"
                    ? "bg-success/10 border-l-2 border-success"
                    : "hover:bg-muted/30 border-l-2 border-transparent",
                )}
              >
                <span className="text-muted-foreground/50 w-4 shrink-0">{n}</span>
                <span className={cn(isVuln && reconFeedback === "correct" ? "text-success" : "text-foreground/80")}>
                  {code}
                </span>
              </div>
            );
          })}
        </div>

        {reconFeedback === "wrong" && (
          <p className="text-destructive text-xs mb-3 flex items-center gap-1.5">
            <XCircle size={13} /> Not quite — look for where user input is embedded directly into the query string.
          </p>
        )}

        <button
          disabled={clickedLine === null}
          onClick={handleReconCheck}
          className={cn(
            "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
            clickedLine !== null
              ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {reconFeedback === "correct" ? (
            <><CheckCircle2 size={15} /> Correct! Proceeding to exploitation…</>
          ) : (
            <><ChevronRight size={15} /> Check Selection</>
          )}
        </button>
      </div>
    </motion.div>
  );

  /* ── Stage 1: Exploit ───────────────────────────────────────────────────── */
  const renderExploit = () => (
    <motion.div key="exploit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="bg-card border border-border/50 rounded-2xl p-6 mb-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert size={16} className="text-warning" />
          <span className="text-xs text-warning font-semibold uppercase tracking-wider">Stage 2 — Exploitation</span>
        </div>
        <h2 className="text-lg font-bold mb-1">Bypass the Login</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Use a SQL injection payload in the username field to log in without knowing the password.
          Watch the live query preview to understand what the database executes.
        </p>

        {/* Simulated login form */}
        <div className="bg-muted/20 border border-border/40 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground font-medium">
            <Lock size={13} /> Acme Corp — Employee Portal
          </div>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Username</label>
              <input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setLoginResult(null); }}
                disabled={loginResult === "success"}
                placeholder="Enter username…"
                className="w-full bg-background/70 border border-border/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Password</label>
              <input
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginResult(null); }}
                disabled={loginResult === "success"}
                type="password"
                placeholder="Enter password…"
                className="w-full bg-background/70 border border-border/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
            </div>
          </div>
          <button
            onClick={handleLogin}
            disabled={loginResult === "success" || username.length === 0}
            className={cn(
              "w-full py-2.5 rounded-lg text-sm font-semibold transition-all",
              loginResult === "success"
                ? "bg-success text-white"
                : username.length === 0
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]",
            )}
          >
            {loginResult === "success" ? "✓ Access Granted" : "Log In"}
          </button>
        </div>

        {/* Live SQL preview */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <Database size={12} /> Live SQL query sent to database:
          </p>
          <pre className={cn(
            "bg-background/80 border rounded-xl px-4 py-3 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap transition-colors",
            loginResult === "success" ? "border-success/40 text-success" : "border-border/40 text-foreground/80",
          )}>
            {buildSQL(username || "?", password || "?")}
          </pre>
        </div>

        {/* Feedback */}
        <AnimatePresence mode="wait">
          {loginResult === "success" && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-success/10 border border-success/30 rounded-xl p-4 mb-4"
            >
              <p className="text-success font-semibold text-sm mb-1 flex items-center gap-2">
                <CheckCircle2 size={15} /> Authentication Bypassed!
              </p>
              <p className="text-xs text-muted-foreground">
                Your payload closed the string quote and injected an OR clause that's always true
                {usesComment(username) ? ", then used -- to comment out the password check" : ""}. 
                The database returned rows regardless of the real credentials.
              </p>
            </motion.div>
          )}
          {loginResult === "fail" && (
            <motion.div
              key="fail"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-4"
            >
              <p className="text-destructive font-semibold text-sm mb-1 flex items-center gap-2">
                <XCircle size={15} /> Access Denied
              </p>
              {loginHint && (
                <p className="text-xs text-muted-foreground">
                  Hint: Try injecting into the username. Classic payloads include{" "}
                  <code className="bg-muted px-1 rounded text-warning">' OR '1'='1' --</code> or{" "}
                  <code className="bg-muted px-1 rounded text-warning">admin'--</code>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {loginResult === "success" && (
          <button
            onClick={() => setStage(2)}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <ChevronRight size={15} /> Continue to Defence
          </button>
        )}
      </div>
    </motion.div>
  );

  /* ── Stage 2: Fix ───────────────────────────────────────────────────────── */
  const renderFix = () => (
    <motion.div key="fix" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="bg-card border border-border/50 rounded-2xl p-6 mb-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-success" />
          <span className="text-xs text-success font-semibold uppercase tracking-wider">Stage 3 — Defence</span>
        </div>
        <h2 className="text-lg font-bold mb-1">Pick the Correct Fix</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Now that you've exploited the vulnerability, select the code change that would prevent this attack.
        </p>

        <div className="space-y-3 mb-5">
          {FIXES.map((fix, i) => {
            const isSelected = selectedFix === i;
            const showResult = fixSubmitted;
            return (
              <button
                key={i}
                disabled={fixSubmitted}
                onClick={() => setSelectedFix(i)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all",
                  showResult && fix.correct
                    ? "bg-success/10 border-success/40"
                    : showResult && isSelected && !fix.correct
                    ? "bg-destructive/10 border-destructive/30"
                    : isSelected
                    ? "bg-primary/10 border-primary/40"
                    : "bg-background/40 border-border/40 hover:border-primary/30",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">{fix.label}</span>
                  {showResult && fix.correct && <CheckCircle2 size={14} className="text-success" />}
                  {showResult && isSelected && !fix.correct && <XCircle size={14} className="text-destructive" />}
                </div>
                <pre className="text-xs font-mono text-foreground/70 whitespace-pre-wrap leading-relaxed">
                  {fix.code}
                </pre>
                {showResult && (fix.correct || isSelected) && (
                  <p className={cn("text-xs mt-2", fix.correct ? "text-success" : "text-muted-foreground")}>
                    {fix.why}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {!fixSubmitted ? (
          <button
            disabled={selectedFix === null}
            onClick={handleFixSubmit}
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
              selectedFix !== null
                ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            <ChevronRight size={15} /> Submit Answer
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "flex items-center gap-2 text-sm font-medium justify-center py-2",
              selectedFix !== null && FIXES[selectedFix].correct ? "text-success" : "text-warning",
            )}
          >
            {selectedFix !== null && FIXES[selectedFix].correct ? (
              <><CheckCircle2 size={15} /> Correct! Saving results…</>
            ) : (
              <><AlertTriangle size={15} /> Parameterized queries were the right answer. Saving results…</>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  /* ── Progress bar ───────────────────────────────────────────────────────── */
  const stageLabels = ["Recon", "Exploit", "Defence"];
  return (
    <div className="max-w-2xl mx-auto">
      {/* Stage progress */}
      <div className="flex gap-1.5 mb-6">
        {stageLabels.map((label, i) => (
          <div key={i} className="flex-1">
            <div className={cn(
              "h-1.5 rounded-full mb-1 transition-all",
              stage > i || (stage === i && stageScores[i] !== undefined) ? "bg-success" :
              stage === i ? "bg-primary" : "bg-muted",
            )} />
            <p className={cn("text-xs text-center", stage === i ? "text-primary font-medium" : "text-muted-foreground")}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {stage === 0 && renderRecon()}
        {stage === 1 && renderExploit()}
        {stage === 2 && renderFix()}
      </AnimatePresence>
    </div>
  );
}
