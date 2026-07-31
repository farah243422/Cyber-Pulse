import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Activity, BrainCircuit, ShieldAlert, CheckCircle2,
  GraduationCap, Clock, Github, ChevronDown, ChevronUp,
  Download, Search, AlertTriangle, Sparkles, TrendingUp, BookOpen
} from "lucide-react";
import { useRoleRoute } from "@/hooks/use-routes";
import { mockStudents, type StudentRow } from "@/data/mock-dashboard";
import { cn } from "@/lib/utils";
import InstructorQuiz from "./instructor-quiz";

/* ── AI Detection Score badge ─────────────────────────────────────────────── */
function AiScore({ score }: { score: number }) {
  const cfg =
    score < 20 ? { label: "Clean",  color: "text-success    bg-success/10    border-success/20" } :
    score < 50 ? { label: "Low",    color: "text-secondary  bg-secondary/10  border-secondary/20" } :
    score < 75 ? { label: "Medium", color: "text-warning    bg-warning/10    border-warning/20" } :
                 { label: "High",   color: "text-destructive bg-destructive/10 border-destructive/20" };
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cfg.color)}>
      <BrainCircuit size={12} />
      {cfg.label} · {score}%
    </div>
  );
}

/* ── Expandable student detail panel ─────────────────────────────────────── */
function StudentDetailPanel({ student }: { student: StudentRow }) {
  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <td colSpan={7} className="px-6 py-5 bg-background/60 border-b border-border/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Session history */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={12} /> Session History
            </p>
            <div className="space-y-2">
              {student.sessionHistory.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-card rounded-lg px-3 py-2">
                  <span className="text-muted-foreground w-16 shrink-0">{s.date}</span>
                  <span className="font-mono text-xs">{s.loginTime} → {s.logoutTime}</span>
                  <span className={cn("text-xs font-medium", s.duration === "Active" ? "text-success" : "text-muted-foreground")}>
                    {s.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Hint questions */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles size={12} /> AI Questions Asked ({student.aiUsageCount})
            </p>
            {student.aiHintQuestions.length === 0 ? (
              <p className="text-sm text-success flex items-center gap-1.5"><CheckCircle2 size={14} /> No AI hints used</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {student.aiHintQuestions.slice(0, 20).map((q, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex gap-2 bg-card rounded px-2 py-1.5">
                    <span className="text-secondary shrink-0">{i + 1}.</span>{q}
                  </div>
                ))}
                {student.aiHintQuestions.length > 20 && (
                  <p className="text-xs text-muted-foreground text-center">+{student.aiHintQuestions.length - 20} more...</p>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <TrendingUp size={12} /> Performance Stats
            </p>
            <div className="space-y-2">
              {[
                { label: "Avg. Time / Question", value: student.avgTimePerQuestion },
                { label: "Score",                value: `${student.score.toLocaleString('en-US')} pts` },
                { label: "Class Rank",           value: `#${student.rank}` },
                { label: "GitHub Commits",       value: student.githubCommits.toString() },
                { label: "Active Projects",      value: student.githubProjects.toString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm bg-card rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function InstructorDashboard() {
  // Role guard: students are immediately redirected to /dashboard.
  // This is the second line of defence after the conditional render in
  // dashboard/index.tsx — it ensures no code in this component runs for
  // non-Instructor users even if the component is somehow mounted directly.
  const { user, isLoading, hasRole } = useRoleRoute("Instructor");
  const [tab,      setTab]        = useState<"students" | "quizzes">("students");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [search,   setSearch]     = useState("");

  if (isLoading || !user || !hasRole) return null;

  const lastName = user.name.split(" ").pop() || user.name;

  const activeCount   = mockStudents.filter(s => s.logoutTime === "Active now").length;
  const flaggedCount  = mockStudents.filter(s => s.integrityFlag).length;
  const avgAiScore    = Math.round(mockStudents.reduce((a, s) => a + s.aiDetectionScore, 0) / mockStudents.length);
  const totalCommits  = mockStudents.reduce((a, s) => a + s.githubCommits, 0);

  const filtered = mockStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  /* mock CSV export */
  const handleExportCSV = () => {
    const header = "Name,Email,Login,Logout,AI Usage,AI Detection Score,Avg Time/Q,Commits,Score,Integrity\n";
    const rows = mockStudents.map(s =>
      `${s.name},${s.email},${s.loginTime},${s.logoutTime},${s.aiUsageCount},${s.aiDetectionScore}%,${s.avgTimePerQuestion},${s.githubCommits},${s.score},${s.integrityFlag ? "Flagged" : "OK"}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "cyberpulse-students.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-6 max-w-7xl">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
            <GraduationCap className="text-secondary" size={20} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Overview</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Welcome, <span className="font-medium text-foreground">Dr. {lastName}</span>
          <span className="opacity-40 mx-2">|</span>
          <span>{user.university}</span>
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: <Users className="text-primary" size={22} />,      bg: "bg-primary/10",     label: "Total Students",    value: mockStudents.length, sub: "enrolled this term" },
          { icon: <Activity className="text-success" size={22} />,   bg: "bg-success/10",     label: "Active Now",        value: activeCount,         sub: "currently in session", pulse: true },
          { icon: <BrainCircuit className="text-secondary" size={22} />, bg: "bg-secondary/10", label: "Avg AI Detection", value: `${avgAiScore}%`,   sub: "across all students" },
          { icon: <ShieldAlert className="text-destructive" size={22} />, bg: "bg-destructive/10", label: "Integrity Flags", value: flaggedCount, sub: "require review", alert: flaggedCount > 0 },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
            className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className={cn("w-11 h-11 rounded-full flex items-center justify-center mb-3", s.bg)}>
              {s.icon}
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">{s.label}</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-3xl font-bold", s.alert && "text-destructive")}>{s.value}</p>
              {s.pulse && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-2 mb-8 border-b border-border/50">
        <button onClick={() => setTab("students")}
          className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "students" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Users size={15} /> Students
        </button>
        <button onClick={() => setTab("quizzes")}
          className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "quizzes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <BookOpen size={15} /> Quiz Templates
        </button>
      </div>

      {tab === "quizzes" && <InstructorQuiz />}
      {tab === "students" && <>

      {/* GitHub summary strip */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="mb-8 p-4 rounded-2xl bg-card border border-border/50 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Github size={16} className="text-primary" /> GitHub Activity (All Students)
        </div>
        <div className="flex gap-6">
          <div><span className="text-2xl font-bold">{totalCommits}</span> <span className="text-sm text-muted-foreground">total commits</span></div>
          <div><span className="text-2xl font-bold">{mockStudents.reduce((a, s) => a + s.githubProjects, 0)}</span> <span className="text-sm text-muted-foreground">active projects</span></div>
          <div><span className="text-2xl font-bold">{mockStudents.filter(s => s.githubCommits > 20).length}</span> <span className="text-sm text-muted-foreground">students actively coding</span></div>
        </div>
      </motion.div>

      {/* Table section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Student Activity & Integrity</h2>
            <p className="text-sm text-muted-foreground">Click any row to expand session details, AI questions, and full stats.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search students…"
                className="pl-9 pr-4 py-2 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 w-48"
              />
            </div>
            {/* Export CSV */}
            <button onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        <div className="bg-card/40 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-card border-b border-border text-muted-foreground font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Session</th>
                  <th className="px-6 py-4 text-center">AI Hints</th>
                  <th className="px-6 py-4 text-center">Avg Time/Q</th>
                  <th className="px-6 py-4 text-center">AI Detection</th>
                  <th className="px-6 py-4">Integrity</th>
                  <th className="px-6 py-4 text-center">GitHub</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((student, idx) => (
                  <>
                    <motion.tr key={student.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 + idx * 0.04 }}
                      onClick={() => setExpanded(expanded === student.id ? null : student.id)}
                      className={cn(
                        "hover:bg-muted/30 transition-colors cursor-pointer",
                        expanded === student.id && "bg-muted/20"
                      )}>
                      {/* Student */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Session */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-muted-foreground">{student.loginTime}</span>
                          <span className="text-border">→</span>
                          {student.logoutTime === "Active now" ? (
                            <span className="text-success font-medium flex items-center gap-1">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                              </span>
                              Active now
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{student.logoutTime}</span>
                          )}
                        </div>
                      </td>

                      {/* AI Hints */}
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs",
                          student.aiUsageCount > 15 ? "bg-destructive/20 text-destructive" :
                          student.aiUsageCount > 7  ? "bg-warning/20 text-warning" :
                                                      "bg-secondary/10 text-secondary"
                        )}>
                          {student.aiUsageCount}
                        </span>
                      </td>

                      {/* Avg Time */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-mono text-muted-foreground">{student.avgTimePerQuestion}</span>
                      </td>

                      {/* AI Detection */}
                      <td className="px-6 py-4 text-center">
                        <AiScore score={student.aiDetectionScore} />
                      </td>

                      {/* Integrity */}
                      <td className="px-6 py-4">
                        {student.integrityFlag ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium max-w-[160px] truncate" title={student.flagReason}>
                            <AlertTriangle size={13} /> {student.flagReason}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/20 text-success text-xs font-medium">
                            <CheckCircle2 size={13} /> Normal
                          </div>
                        )}
                      </td>

                      {/* GitHub */}
                      <td className="px-6 py-4 text-center">
                        <div className="text-xs">
                          <span className="font-bold">{student.githubCommits}</span>
                          <span className="text-muted-foreground"> commits</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{student.githubProjects} projects</div>
                      </td>
                    </motion.tr>

                    {/* Expanded detail row */}
                    <AnimatePresence>
                      {expanded === student.id && (
                        <StudentDetailPanel key={`detail-${student.id}`} student={student} />
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
      </>}
    </div>
  );
}
