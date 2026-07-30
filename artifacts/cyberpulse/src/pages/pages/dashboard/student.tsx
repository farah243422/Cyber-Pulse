import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, TrendingUp, AlertTriangle, ShieldCheck,
  Clock, Award, Terminal, BrainCircuit, Sparkles, ChevronDown, ChevronUp,
  ClipboardList
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { useAuth } from "@/context/auth";
import { mockChallenges } from "@/data/mock-dashboard";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import StudentQuiz from "./student-quiz";

function AiScoreBadge({ score }: { score: number }) {
  const color =
    score === 0 ? "text-success bg-success/10 border-success/20" :
    score < 30  ? "text-secondary bg-secondary/10 border-secondary/20" :
    score < 60  ? "text-warning bg-warning/10 border-warning/20" :
                  "text-destructive bg-destructive/10 border-destructive/20";
  const label =
    score === 0 ? "Clean" :
    score < 30  ? "Low" :
    score < 60  ? "Medium" : "High";
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", color)}>
      <BrainCircuit size={11} /> AI Risk: {label} ({score}%)
    </span>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"labs" | "quizzes">("labs");
  const [expandedHints, setExpandedHints] = useState<string | null>(null);

  if (!user) return null;

  const totalScore = mockChallenges.reduce((s, c) => s + c.scoreEarned, 0);
  const totalTime  = mockChallenges.filter(c => c.timeSeconds).reduce((s, c) => s + (c.timeSeconds || 0), 0);
  const totalHints = mockChallenges.reduce((s, c) => s + c.aiHintCount, 0);
  const completed  = mockChallenges.filter(c => c.status === "Completed").length;
  const hours      = Math.floor(totalTime / 3600);
  const mins       = Math.floor((totalTime % 3600) / 60);

  return (
    <div className="container mx-auto px-6 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Terminal className="text-primary" size={20} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-lg flex flex-wrap items-center gap-2">
          Welcome back, <span className="font-medium text-foreground">{user.name}</span>
          <span className="opacity-40">|</span>
          <span>{user.university}</span>
          <span className="opacity-40">|</span>
          <span className="text-secondary">{user.major}</span>
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Score",    value: totalScore.toLocaleString('en-US'), icon: <Trophy size={20} className="text-primary" />,   sub: `+120 this week`, subColor: "text-success" },
          { label: "Global Rank",    value: "Top 15%",                   icon: <Award size={20} className="text-secondary" />,   sub: "of 10k+ students", subColor: "text-muted-foreground" },
          { label: "Labs Completed", value: `${completed} / ${mockChallenges.length}`, icon: <ShieldCheck size={20} className="text-success" />, sub: `${Math.round(completed/mockChallenges.length*100)}% done`, subColor: "text-muted-foreground" },
          { label: "Total Lab Time", value: `${hours}h ${mins}m`,        icon: <Clock size={20} className="text-secondary" />,   sub: "across all labs",  subColor: "text-muted-foreground" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
            className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm font-medium">
              {s.icon} {s.label}
            </div>
            <div className="text-2xl font-bold mb-1">{s.value}</div>
            <div className={cn("text-xs", s.subColor)}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* GitHub + AI Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* GitHub */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/40 transition-colors cursor-pointer group"
          onClick={() => user.githubUsername && window.open(`https://github.com/${user.githubUsername}`, "_blank")}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <SiGithub size={16} /> GitHub Portfolio
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
            </span>
          </div>
          <div className="font-mono text-sm text-primary mb-3">github.com/{user.githubUsername || "—"}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">47</div>
              <div className="text-xs text-muted-foreground mt-1">Commits</div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">3</div>
              <div className="text-xs text-muted-foreground mt-1">Projects</div>
            </div>
          </div>
        </motion.div>

        {/* AI Usage Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
            <BrainCircuit size={16} className="text-secondary" /> AI Hints Summary
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">{totalHints}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Hints Used</div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 text-center">
              <div className={cn("text-xl font-bold",
                totalHints > 15 ? "text-destructive" : totalHints > 7 ? "text-warning" : "text-success")}>
                {totalHints > 15 ? "High" : totalHints > 7 ? "Medium" : "Low"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Dependency Level</div>
            </div>
          </div>
          {totalHints > 7 && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20 text-warning text-xs">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              Consider reviewing flagged topics without AI assistance to strengthen independent skills.
            </div>
          )}
        </motion.div>
      </div>

      {/* Challenges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShieldCheck className="text-primary" /> Labs & Challenges
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {mockChallenges.map((challenge, idx) => (
            <motion.div key={challenge.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + idx * 0.05 }}
              className="bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:bg-card transition-colors">
              {/* Main row */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border",
                      challenge.difficulty === "Easy"   && "bg-success/10 text-success border-success/20",
                      challenge.difficulty === "Medium" && "bg-warning/10 text-warning border-warning/20",
                      challenge.difficulty === "Hard"   && "bg-destructive/10 text-destructive border-destructive/20"
                    )}>{challenge.difficulty}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{challenge.category}</span>
                    {challenge.status === "Completed" && <AiScoreBadge score={challenge.aiDetectionScore} />}
                  </div>

                  {challenge.aiHintCount >= 5 && (
                    <button onClick={() => setExpandedHints(expandedHints === challenge.id ? null : challenge.id)}
                      className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-md bg-warning/10 border border-warning/30 text-warning text-xs hover:bg-warning/20 transition-colors">
                      <AlertTriangle size={12} />
                      AI used {challenge.aiHintCount}x — view questions
                      {expandedHints === challenge.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-5 md:min-w-[280px] justify-between md:justify-end shrink-0">
                  {challenge.timeTaken && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
                      <Clock size={13} /> {challenge.timeTaken}
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-1 min-w-[110px]">
                    <div className="text-sm font-medium">
                      {challenge.scoreEarned} <span className="text-muted-foreground">/ {challenge.maxScore} pts</span>
                    </div>
                    <Progress value={(challenge.scoreEarned / challenge.maxScore) * 100} className="h-1.5 w-full" />
                  </div>
                  <span className={cn("text-sm font-medium whitespace-nowrap",
                    challenge.status === "Completed"  && "text-success",
                    challenge.status === "In Progress" && "text-secondary",
                    challenge.status === "Not Started" && "text-muted-foreground"
                  )}>{challenge.status}</span>
                </div>
              </div>

              {/* Expanded AI hint questions */}
              {expandedHints === challenge.id && challenge.aiHintQuestions && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  className="border-t border-border/50 bg-warning/5 px-5 py-4">
                  <p className="text-xs text-warning font-medium mb-2 flex items-center gap-1">
                    <Sparkles size={12} /> Questions asked to AI:
                  </p>
                  <ul className="space-y-1">
                    {challenge.aiHintQuestions.map((q, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-warning shrink-0">{i + 1}.</span> {q}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Career/Portfolio CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
        className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-primary" />
              <h3 className="font-semibold">Public Portfolio for Employers</h3>
            </div>
            <p className="text-sm text-muted-foreground">Your completed labs and scores are synced to your GitHub and visible to recruiters.</p>
          </div>
          <button onClick={() => user.githubUsername && window.open(`https://github.com/${user.githubUsername}`, "_blank")}
            className="shrink-0 px-5 py-2 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors">
            View Public Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
}
