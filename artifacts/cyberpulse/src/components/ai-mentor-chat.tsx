import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, BrainCircuit, Loader2, ShieldAlert,
  Lightbulb, HelpCircle, BookOpen, AlertTriangle, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";

interface Message {
  role: "user" | "assistant";
  content: string;
  responseLevel?: number;
}

interface AiMentorChatProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
  };
  initialHintsUsed: number;
  onHintUsed: (newCount: number) => void;
}

const MAX_HINTS = 5;

const levelConfig = {
  1: { label: "Concept", icon: BookOpen, color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
  2: { label: "Hint",    icon: Lightbulb, color: "text-warning",   bg: "bg-warning/10 border-warning/20" },
  3: { label: "Guided",  icon: HelpCircle, color: "text-primary",  bg: "bg-primary/10 border-primary/20" },
  4: { label: "Blocked", icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
};

function LevelBadge({ level }: { level: number }) {
  const cfg = levelConfig[level as keyof typeof levelConfig];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", cfg.color, cfg.bg)}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

// Simple markdown-lite renderer: bold, inline code, code blocks
function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const code = part.slice(3, -3).replace(/^\w+\n/, "");
          return (
            <pre key={i} className="bg-background/80 border border-border/50 rounded-lg p-3 my-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {code}
            </pre>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="bg-background/80 border border-border/50 rounded px-1.5 py-0.5 text-xs font-mono text-secondary">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function AiMentorChat({ isOpen, onClose, challenge, initialHintsUsed, onHintUsed }: AiMentorChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(initialHintsUsed);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load history from localStorage
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(`cp_mentor_${challenge.id}`);
      if (stored) {
        try { setMessages(JSON.parse(stored)); } catch {}
      } else {
        setMessages([{
          role: "assistant",
          content: `👋 I'm your AI Mentor for **${challenge.title}**.\n\nI'm here to guide you — not give you the answer. Ask me about concepts, request hints, or tell me where you're stuck.\n\n⚠️ I will never provide flags, exploits, or complete solutions.`,
          responseLevel: 1,
        }]);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, challenge.id]);

  // Persist messages
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(`cp_mentor_${challenge.id}`, JSON.stringify(messages));
    }
  }, [messages, challenge.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || !user) return;

    const userMessage = input.trim();
    setInput("");
    const newHints = hintsUsed + 1;
    setHintsUsed(newHints);
    onHintUsed(newHints);

    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    // Placeholder for streaming response
    setMessages(prev => [...prev, { role: "assistant", content: "", responseLevel: undefined }]);
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/mentor/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          challengeCategory: challenge.category,
          difficulty: challenge.difficulty,
          studentId: user.id,
          studentName: user.name,
          studentLevel: "intermediate",
          hintsUsed: hintsUsed,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let finalLevel: number | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              accumulated += data.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: accumulated,
                  responseLevel: finalLevel,
                };
                return updated;
              });
            }
            if (data.done) {
              finalLevel = data.responseLevel;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: accumulated || prev[prev.length - 1].content,
                  responseLevel: finalLevel,
                };
                return updated;
              });
            }
            if (data.error) {
              accumulated = data.error;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: data.error };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Connection error. Make sure the API server is running and try again.",
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(`cp_mentor_${challenge.id}`);
    setMessages([{
      role: "assistant",
      content: `Session cleared. I'm ready to help with **${challenge.title}** — ask me anything!`,
      responseLevel: 1,
    }]);
  };

  const remaining = Math.max(0, MAX_HINTS - hintsUsed);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] z-50 flex flex-col bg-card border-l border-border/60 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                  <BrainCircuit size={18} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    AI Mentor
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[220px]">{challenge.title}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearHistory} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
                  Clear
                </button>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Hint tracker */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 bg-background/30 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles size={12} className="text-primary" />
                <span>Hints used:</span>
                <span className="font-semibold text-foreground">{hintsUsed}</span>
              </div>
              <div className="flex-1 flex gap-1">
                {Array.from({ length: MAX_HINTS }).map((_, i) => (
                  <div key={i} className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i < hintsUsed ? "bg-primary" : "bg-muted/50"
                  )} />
                ))}
              </div>
              <div className={cn("text-xs font-medium", remaining === 0 ? "text-destructive" : remaining <= 2 ? "text-warning" : "text-muted-foreground")}>
                {remaining === 0 ? "Limit reached" : `${remaining} left`}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 mx-4 mt-3 mb-1 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground shrink-0">
              <ShieldAlert size={13} className="text-primary shrink-0 mt-0.5" />
              AI Mentor guides your learning — it will never provide flags, exploits, or direct solutions.
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                      <BrainCircuit size={14} className="text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-muted/50 border border-border/40 text-foreground rounded-tl-sm"
                  )}>
                    {msg.role === "assistant" && msg.content === "" ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-xs">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap break-words">
                          <MarkdownText text={msg.content} />
                        </div>
                        {msg.role === "assistant" && msg.responseLevel && (
                          <div className="mt-2">
                            <LevelBadge level={msg.responseLevel} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm shrink-0">
              {remaining === 0 ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertTriangle size={14} />
                  You've reached the hint limit for this challenge. Try to solve it independently!
                </div>
              ) : (
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about concepts, request a hint, or describe where you're stuck..."
                    rows={2}
                    disabled={isStreaming}
                    className="flex-1 resize-none rounded-xl bg-background/60 border border-border/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isStreaming}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
