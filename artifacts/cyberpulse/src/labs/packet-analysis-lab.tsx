import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network, Filter, ChevronRight, CheckCircle2, XCircle,
  AlertTriangle, Search, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  elapsed: number;
  onSubmit: (score: number, steps: string[]) => void;
}

/* ── Packet data ─────────────────────────────────────────────────────────── */
interface Packet {
  no: number;
  time: string;
  src: string;
  dst: string;
  proto: string;
  len: number;
  info: string;
  suspicious?: boolean;
}

const ATTACKER_IP = "10.0.0.99";
const TARGET_IP = "192.168.1.100";

const PACKETS: Packet[] = [
  { no: 1,  time: "0.000000", src: "192.168.1.100", dst: "8.8.8.8",       proto: "DNS",  len: 74,  info: "Standard query A api.acmecorp.com" },
  { no: 2,  time: "0.012543", src: "8.8.8.8",       dst: "192.168.1.100", proto: "DNS",  len: 90,  info: "Standard query response 93.184.216.34" },
  { no: 3,  time: "0.013201", src: "192.168.1.100", dst: "93.184.216.34", proto: "TCP",  len: 74,  info: "49821 → 443 [SYN] Seq=0 Win=64240" },
  { no: 4,  time: "0.045678", src: "93.184.216.34", dst: "192.168.1.100", proto: "TCP",  len: 74,  info: "443 → 49821 [SYN, ACK] Seq=0 Ack=1 Win=65535" },
  { no: 5,  time: "0.045901", src: "192.168.1.100", dst: "93.184.216.34", proto: "TCP",  len: 66,  info: "49821 → 443 [ACK] Seq=1 Ack=1 Win=502" },
  { no: 6,  time: "0.046120", src: "192.168.1.100", dst: "93.184.216.34", proto: "TLS",  len: 583, info: "Client Hello" },
  { no: 7,  time: "1.102300", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52000 → 21 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 8,  time: "1.102401", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52001 → 22 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 9,  time: "1.102502", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52002 → 23 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 10, time: "1.102603", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52003 → 25 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 11, time: "1.102700", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52004 → 53 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 12, time: "1.102801", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52005 → 80 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 13, time: "1.102902", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52006 → 110 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 14, time: "1.103003", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52007 → 135 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 15, time: "1.103104", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52008 → 139 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 16, time: "1.103200", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52009 → 443 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 17, time: "1.103301", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52010 → 445 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 18, time: "1.103402", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52011 → 3306 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 19, time: "1.103503", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52012 → 3389 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 20, time: "1.103604", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52013 → 5432 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 21, time: "1.103700", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52014 → 8080 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 22, time: "1.103801", src: ATTACKER_IP,     dst: TARGET_IP,       proto: "TCP",  len: 60,  info: "52015 → 8443 [SYN] Seq=0 Win=1024", suspicious: true },
  { no: 23, time: "1.900000", src: "192.168.1.100", dst: "8.8.8.8",       proto: "DNS",  len: 74,  info: "Standard query A cdn.acmecorp.com" },
  { no: 24, time: "1.912543", src: "8.8.8.8",       dst: "192.168.1.100", proto: "DNS",  len: 88,  info: "Standard query response 151.101.1.44" },
];

const ATTACK_TYPES = [
  { id: "arp",    label: "ARP Poisoning" },
  { id: "dns",    label: "DNS Amplification" },
  { id: "portscan", label: "TCP SYN Port Scan", correct: true },
  { id: "ddos",   label: "ICMP Flood (DDoS)" },
];

/* ── Wireshark filter validation ─────────────────────────────────────────── */
function scoreFilter(filter: string): { pts: number; feedback: string } {
  const f = filter.trim().toLowerCase().replace(/\s+/g, " ");
  if (!f) return { pts: 0, feedback: "Enter a Wireshark display filter." };

  const hasCorrectIP =
    f.includes(`ip.addr == ${ATTACKER_IP}`) ||
    f.includes(`ip.src == ${ATTACKER_IP}`);
  const hasSYNFlag =
    f.includes("tcp.flags.syn == 1") ||
    f.includes("tcp.flags == 0x002") ||
    f.includes("tcp.flags.syn==1");
  const hasCorrectSrcOnly = f.includes(`ip.src == ${ATTACKER_IP}`);

  if (hasCorrectIP && hasSYNFlag) {
    return { pts: 30, feedback: "Perfect filter — isolates SYN packets from the attacker." };
  }
  if (hasCorrectSrcOnly) {
    return { pts: 25, feedback: "Good — filters attacker traffic. Adding && tcp.flags.syn == 1 would be more precise." };
  }
  if (hasCorrectIP) {
    return { pts: 20, feedback: "Correct IP. Use ip.src for source-only filtering, or add a SYN flag condition." };
  }
  if (f.includes("tcp.flags.syn == 1") || f.includes("tcp.flags.syn==1")) {
    return { pts: 10, feedback: "Shows all SYN packets, but doesn't isolate the attacker's IP. Add ip.src == 10.0.0.99." };
  }
  return { pts: 0, feedback: "Filter doesn't match the attacker's traffic. Try: ip.src == 10.0.0.99 && tcp.flags.syn == 1" };
}

type Stage = 0 | 1 | 2;

export default function PacketAnalysisLab({ onSubmit }: Props) {
  const [stage, setStage] = useState<Stage>(0);
  const [stageScores, setStageScores] = useState<Record<number, number>>({});
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  /* Stage 0 */
  const [filterText, setFilterText] = useState("");
  const [ipInput, setIpInput] = useState("");
  const [ipSubmitted, setIpSubmitted] = useState(false);
  const [ipResult, setIpResult] = useState<"correct" | "wrong" | null>(null);

  /* Stage 1 */
  const [selectedAttack, setSelectedAttack] = useState<string | null>(null);
  const [attackSubmitted, setAttackSubmitted] = useState(false);

  /* Stage 2 */
  const [wiresharkFilter, setWiresharkFilter] = useState("");
  const [filterSubmitted, setFilterSubmitted] = useState(false);
  const [filterResult, setFilterResult] = useState<{ pts: number; feedback: string } | null>(null);

  const earnStage = (idx: number, pts: number, step: string) => {
    setStageScores((prev) => ({ ...prev, [idx]: pts }));
    setCompletedSteps((prev) => [...prev, step]);
  };

  const totalScore = () =>
    Math.min(100, Object.values(stageScores).reduce((a, b) => a + b, 0));

  /* Filtered packets for display */
  const displayedPackets = useMemo(() => {
    const f = filterText.trim().toLowerCase();
    if (!f) return PACKETS;
    return PACKETS.filter((p) => {
      if (f.includes("ip.addr")) {
        const ip = f.match(/ip\.addr\s*==\s*([\d.]+)/)?.[1];
        if (ip) return p.src.includes(ip) || p.dst.includes(ip);
      }
      if (f.includes("ip.src")) {
        const ip = f.match(/ip\.src\s*==\s*([\d.]+)/)?.[1];
        if (ip) return p.src.includes(ip);
      }
      if (f.includes("ip.dst")) {
        const ip = f.match(/ip\.dst\s*==\s*([\d.]+)/)?.[1];
        if (ip) return p.dst.includes(ip);
      }
      if (f.includes("tcp.flags.syn == 1")) return p.info.includes("[SYN]") && !p.info.includes("[SYN, ACK]");
      return p.src.toLowerCase().includes(f) || p.dst.toLowerCase().includes(f) || p.proto.toLowerCase().includes(f);
    });
  }, [filterText]);

  /* Stage 0: identify IP */
  const handleIPSubmit = () => {
    if (ipInput.trim() === ATTACKER_IP) {
      setIpResult("correct");
      setIpSubmitted(true);
      earnStage(0, 35, "attacker-ip-identified");
    } else {
      setIpResult("wrong");
      setTimeout(() => setIpResult(null), 1500);
    }
  };

  /* Stage 1: classify attack */
  const handleAttackSubmit = () => {
    setAttackSubmitted(true);
    const correct = selectedAttack === "portscan";
    if (correct) earnStage(1, 35, "attack-type-correct");
    setTimeout(() => setStage(2), 1200);
  };

  /* Stage 2: filter */
  const handleFilterSubmit = () => {
    const result = scoreFilter(wiresharkFilter);
    setFilterResult(result);
    setFilterSubmitted(true);
    if (result.pts > 0) earnStage(2, result.pts, `filter-score-${result.pts}`);
    setTimeout(() => {
      onSubmit(totalScore(), completedSteps);
    }, 2000);
  };

  const stageLabels = ["Identify Threat", "Classify Attack", "Write Filter"];

  return (
    <div className="max-w-3xl mx-auto">
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
        {/* ── STAGE 0: IDENTIFY ─────────────────────────────────────────── */}
        {stage === 0 && (
          <motion.div key="identify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Network size={16} className="text-secondary" />
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider">Stage 1 — Identify the Threat</span>
              </div>
              <h2 className="text-lg font-bold mb-1">Analyse the Packet Capture</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Inspect the captured packets below. Use the filter box (Wireshark syntax) to isolate traffic.
                Find the attacker's IP address and enter it to proceed.
              </p>

              {/* Filter bar */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder='Filter (e.g. ip.src == 10.0.0.99 or tcp.flags.syn == 1)'
                    className="w-full pl-8 pr-3 py-2 bg-background/70 border border-border/50 rounded-lg text-xs font-mono focus:outline-none focus:border-primary/50"
                  />
                </div>
                <button
                  onClick={() => setFilterText("")}
                  className="px-3 py-2 rounded-lg border border-border/50 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Packet table */}
              <div className="rounded-xl border border-border/40 overflow-hidden mb-5">
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-muted/40 sticky top-0">
                      <tr>
                        {["No.", "Time", "Source", "Destination", "Proto", "Len", "Info"].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedPackets.map((p) => (
                        <tr
                          key={p.no}
                          className={cn(
                            "border-t border-border/20 transition-colors",
                            p.suspicious ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/20",
                          )}
                        >
                          <td className="px-2 py-1.5 text-muted-foreground">{p.no}</td>
                          <td className="px-2 py-1.5 text-muted-foreground">{p.time}</td>
                          <td className={cn("px-2 py-1.5", p.suspicious ? "text-destructive font-semibold" : "text-foreground/80")}>
                            {p.src}
                          </td>
                          <td className="px-2 py-1.5 text-foreground/80">{p.dst}</td>
                          <td className={cn(
                            "px-2 py-1.5 font-semibold",
                            p.proto === "DNS" ? "text-secondary" :
                            p.proto === "TLS" ? "text-success" : "text-primary",
                          )}>
                            {p.proto}
                          </td>
                          <td className="px-2 py-1.5 text-muted-foreground">{p.len}</td>
                          <td className="px-2 py-1.5 text-foreground/70 max-w-xs truncate">{p.info}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-muted/20 px-3 py-1.5 border-t border-border/30 text-xs text-muted-foreground">
                  {displayedPackets.length} / {PACKETS.length} packets displayed
                </div>
              </div>

              {/* IP Answer */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={ipInput}
                    onChange={(e) => { setIpInput(e.target.value); setIpResult(null); }}
                    disabled={ipSubmitted}
                    onKeyDown={(e) => e.key === "Enter" && handleIPSubmit()}
                    placeholder="Enter attacker's IP address…"
                    className={cn(
                      "w-full pl-8 pr-3 py-2 bg-background/70 border rounded-lg text-sm font-mono focus:outline-none transition-colors disabled:opacity-50",
                      ipResult === "correct" ? "border-success/50" :
                      ipResult === "wrong" ? "border-destructive/50" :
                      "border-border/50 focus:border-primary/50",
                    )}
                  />
                </div>
                <button
                  onClick={handleIPSubmit}
                  disabled={ipSubmitted || !ipInput.trim()}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    !ipSubmitted && ipInput.trim()
                      ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  Submit IP
                </button>
              </div>

              <AnimatePresence>
                {ipResult === "wrong" && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-destructive text-xs mt-2 flex items-center gap-1.5"
                  >
                    <XCircle size={12} /> Not the right IP. Look for the source sending many SYN packets in quick succession.
                  </motion.p>
                )}
                {ipResult === "correct" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-success/10 border border-success/30 rounded-xl p-4 mt-3"
                  >
                    <p className="text-success font-semibold text-sm mb-1 flex items-center gap-2">
                      <CheckCircle2 size={15} /> Correct! {ATTACKER_IP} is the attacker.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This host sent 16 SYN packets to {TARGET_IP} on sequential ports within milliseconds — a clear port scan signature.
                    </p>
                    <button
                      onClick={() => setStage(1)}
                      className="mt-3 w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
                    >
                      <ChevronRight size={15} /> Classify the Attack
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── STAGE 1: CLASSIFY ─────────────────────────────────────────── */}
        {stage === 1 && (
          <motion.div key="classify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert size={16} className="text-warning" />
                <span className="text-xs text-warning font-semibold uppercase tracking-wider">Stage 2 — Classify the Attack</span>
              </div>
              <h2 className="text-lg font-bold mb-1">What Type of Attack Is This?</h2>
              <p className="text-sm text-muted-foreground mb-2">
                Based on the traffic pattern — multiple SYN packets from one source to many ports with no completed handshakes — identify the attack type.
              </p>

              {/* Mini evidence recap */}
              <div className="bg-muted/20 border border-border/40 rounded-xl p-3 mb-5 font-mono text-xs space-y-1 text-muted-foreground">
                <div className="text-foreground/60 mb-1 font-sans text-xs font-medium">Evidence recap:</div>
                <div>• Source: <span className="text-destructive">{ATTACKER_IP}</span> → Destination: {TARGET_IP}</div>
                <div>• 16 TCP SYN packets to ports 21, 22, 23, 25 … 8080, 8443 in &lt;1ms each</div>
                <div>• No SYN-ACK responses completed → no full handshakes established</div>
                <div>• TTL = 64 (Linux/Unix source)</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {ATTACK_TYPES.map((a) => {
                  const isSelected = selectedAttack === a.id;
                  const showResult = attackSubmitted;
                  return (
                    <button
                      key={a.id}
                      disabled={attackSubmitted}
                      onClick={() => setSelectedAttack(a.id)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium text-left transition-all",
                        showResult && a.correct
                          ? "bg-success/10 border-success/40 text-success"
                          : showResult && isSelected && !a.correct
                          ? "bg-destructive/10 border-destructive/30 text-destructive"
                          : isSelected
                          ? "bg-primary/10 border-primary/40 text-foreground"
                          : "bg-background/40 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        {a.label}
                        {showResult && a.correct && <CheckCircle2 size={14} />}
                        {showResult && isSelected && !a.correct && <XCircle size={14} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!attackSubmitted ? (
                <button
                  disabled={!selectedAttack}
                  onClick={handleAttackSubmit}
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                    selectedAttack
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
                    "text-sm font-medium flex items-center gap-2 justify-center py-2",
                    selectedAttack === "portscan" ? "text-success" : "text-warning",
                  )}
                >
                  {selectedAttack === "portscan"
                    ? <><CheckCircle2 size={15} /> Correct! Moving to the filter challenge…</>
                    : <><AlertTriangle size={15} /> TCP SYN Port Scan was correct. Moving on…</>
                  }
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STAGE 2: FILTER ───────────────────────────────────────────── */}
        {stage === 2 && (
          <motion.div key="filter-stage" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Filter size={16} className="text-success" />
                <span className="text-xs text-success font-semibold uppercase tracking-wider">Stage 3 — Write the Filter</span>
              </div>
              <h2 className="text-lg font-bold mb-1">Write a Wireshark Display Filter</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Write a Wireshark display filter that isolates the port scan traffic from the attacker.
                Partial credit is awarded — aim for the most precise filter.
              </p>

              <div className="bg-muted/20 border border-border/40 rounded-xl p-3 mb-4 text-xs">
                <p className="text-muted-foreground font-medium mb-2">Quick Reference:</p>
                <div className="font-mono space-y-1 text-foreground/70">
                  <div><span className="text-secondary">ip.addr</span> == x.x.x.x — source OR dest</div>
                  <div><span className="text-secondary">ip.src</span> == x.x.x.x — source only</div>
                  <div><span className="text-secondary">tcp.flags.syn</span> == 1 — SYN packets</div>
                  <div><span className="text-secondary">&&</span> — logical AND</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-1.5 block">Wireshark Display Filter:</label>
                <input
                  value={wiresharkFilter}
                  onChange={(e) => setWiresharkFilter(e.target.value)}
                  disabled={filterSubmitted}
                  onKeyDown={(e) => e.key === "Enter" && !filterSubmitted && handleFilterSubmit()}
                  placeholder="ip.src == 10.0.0.99 && tcp.flags.syn == 1"
                  className="w-full bg-background/70 border border-border/50 rounded-lg px-3 py-3 text-sm font-mono focus:outline-none focus:border-primary/50 disabled:opacity-50"
                />
              </div>

              {!filterSubmitted ? (
                <button
                  disabled={!wiresharkFilter.trim()}
                  onClick={handleFilterSubmit}
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                    wiresharkFilter.trim()
                      ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  <ChevronRight size={15} /> Submit Filter
                </button>
              ) : filterResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "border rounded-xl p-4",
                    filterResult.pts === 30
                      ? "bg-success/10 border-success/30"
                      : filterResult.pts > 0
                      ? "bg-warning/10 border-warning/30"
                      : "bg-destructive/10 border-destructive/30",
                  )}
                >
                  <p className={cn("font-semibold text-sm mb-1 flex items-center gap-2",
                    filterResult.pts === 30 ? "text-success" :
                    filterResult.pts > 0 ? "text-warning" : "text-destructive",
                  )}>
                    {filterResult.pts === 30
                      ? <><CheckCircle2 size={15} /> Perfect filter! ({filterResult.pts}/30 pts)</>
                      : filterResult.pts > 0
                      ? <><AlertTriangle size={15} /> Partial credit ({filterResult.pts}/30 pts)</>
                      : <><XCircle size={15} /> No match (0/30 pts)</>
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">{filterResult.feedback}</p>
                  {filterResult.pts < 30 && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Ideal: <span className="text-success">ip.src == {ATTACKER_IP} && tcp.flags.syn == 1</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Saving results…</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
