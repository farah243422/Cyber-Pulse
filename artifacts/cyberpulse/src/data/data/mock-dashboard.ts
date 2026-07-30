export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "Completed" | "In Progress" | "Not Started";

/* ─── Challenges ─────────────────────────────────────────────────────────── */
export interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  scoreEarned: number;
  maxScore: number;
  timeTaken?: string;
  timeSeconds?: number;
  status: Status;
  aiHintCount: number;
  aiHintQuestions?: string[];
  aiDetectionScore: number; // 0-100, higher = more suspicious
}

export const mockChallenges: Challenge[] = [
  {
    id: "c1", title: "SQL Injection Basics", category: "Web Security", difficulty: "Easy",
    scoreEarned: 100, maxScore: 100, timeTaken: "14m 32s", timeSeconds: 872,
    status: "Completed", aiHintCount: 0, aiDetectionScore: 2,
  },
  {
    id: "c2", title: "Network Packet Analysis", category: "Network Security", difficulty: "Medium",
    scoreEarned: 85, maxScore: 100, timeTaken: "45m 12s", timeSeconds: 2712,
    status: "Completed", aiHintCount: 2, aiDetectionScore: 18,
    aiHintQuestions: ["What is the TCP handshake process?", "How to filter Wireshark by IP?"],
  },
  {
    id: "c5", title: "Cross-Site Scripting (XSS)", category: "Web Security", difficulty: "Medium",
    scoreEarned: 90, maxScore: 100, timeTaken: "32m 18s", timeSeconds: 1938,
    status: "Completed", aiHintCount: 7, aiDetectionScore: 61,
    aiHintQuestions: [
      "How does XSS bypass input sanitization?", "What is reflected vs stored XSS?",
      "Show me a basic XSS payload", "How to test XSS in forms?",
      "What is DOM-based XSS?", "How to use Burp Suite for XSS?",
      "What is CSP and how does it prevent XSS?",
    ],
  },
  {
    id: "c4", title: "Phishing Simulation Defense", category: "Social Engineering", difficulty: "Easy",
    scoreEarned: 100, maxScore: 100, timeTaken: "8m 45s", timeSeconds: 525,
    status: "Completed", aiHintCount: 0, aiDetectionScore: 0,
  },
  {
    id: "c6", title: "Linux Privilege Escalation", category: "System Security", difficulty: "Hard",
    scoreEarned: 150, maxScore: 150, timeTaken: "1h 12m", timeSeconds: 4320,
    status: "Completed", aiHintCount: 9, aiDetectionScore: 78,
    aiHintQuestions: [
      "What is SUID bit exploitation?", "How to enumerate Linux permissions?",
      "What is sudo -l used for?", "How to exploit writable /etc/passwd?",
      "What are common Linux privesc vectors?", "How to use linpeas?",
      "What is kernel exploit?", "Explain PATH hijacking", "How to check cron jobs?",
    ],
  },
  {
    id: "c7", title: "Cryptography Fundamentals", category: "Cryptography", difficulty: "Medium",
    scoreEarned: 50, maxScore: 100, timeTaken: "20m 00s", timeSeconds: 1200,
    status: "In Progress", aiHintCount: 1, aiDetectionScore: 12,
    aiHintQuestions: ["What is the difference between symmetric and asymmetric encryption?"],
  },
  {
    id: "c3", title: "Buffer Overflow 101", category: "Binary Exploitation", difficulty: "Hard",
    scoreEarned: 0, maxScore: 200, status: "Not Started", aiHintCount: 0, aiDetectionScore: 0,
  },
  {
    id: "c8", title: "Firewall & IDS Configuration", category: "Network Defense", difficulty: "Medium",
    scoreEarned: 0, maxScore: 150, status: "Not Started", aiHintCount: 0, aiDetectionScore: 0,
  },
];

/* ─── Students (Instructor view) ─────────────────────────────────────────── */
export interface SessionEntry {
  date: string;
  loginTime: string;
  logoutTime: string;
  duration: string;
}

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  loginTime: string;
  logoutTime: string;
  sessionHistory: SessionEntry[];
  aiUsageCount: number;
  aiHintQuestions: string[];
  avgTimePerQuestion: string;
  aiDetectionScore: number;
  integrityFlag: boolean;
  flagReason?: string;
  githubUsername: string;
  githubCommits: number;
  githubProjects: number;
  score: number;
  rank: number;
}

export const mockStudents: StudentRow[] = [
  {
    id: "s1", name: "Ahmad Khalil", email: "ahmad.k@gmail.com",
    loginTime: "09:15 AM", logoutTime: "Active now",
    sessionHistory: [
      { date: "Today",     loginTime: "09:15 AM", logoutTime: "—",        duration: "Active" },
      { date: "Yesterday", loginTime: "10:00 AM", logoutTime: "12:30 PM", duration: "2h 30m" },
      { date: "Mon",       loginTime: "08:45 AM", logoutTime: "11:00 AM", duration: "2h 15m" },
    ],
    aiUsageCount: 4,
    aiHintQuestions: ["How does ARP poisoning work?", "What is a MITM attack?", "How to use tcpdump?", "What is Wireshark?"],
    avgTimePerQuestion: "18m 20s", aiDetectionScore: 14,
    integrityFlag: false, githubUsername: "ahmadkhalil", githubCommits: 47, githubProjects: 3,
    score: 1840, rank: 12,
  },
  {
    id: "s2", name: "Sara Mahmoud", email: "sara.m@gmail.com",
    loginTime: "08:30 AM", logoutTime: "11:45 AM",
    sessionHistory: [
      { date: "Today",     loginTime: "08:30 AM", logoutTime: "11:45 AM", duration: "3h 15m" },
      { date: "Yesterday", loginTime: "09:00 AM", logoutTime: "01:00 PM", duration: "4h" },
    ],
    aiUsageCount: 12,
    aiHintQuestions: ["What is XSS?", "Give me an XSS payload", "How to bypass WAF?", "Explain SQL injection", "Show me SQLi payload", "What is CSRF?", "How to exploit SSRF?", "What is IDOR?", "Explain broken access control", "How to use Burp Suite?", "What is a reverse shell?", "How to encode payloads?"],
    avgTimePerQuestion: "6m 10s", aiDetectionScore: 83,
    integrityFlag: true, flagReason: "High AI dependency + unusual completion speed",
    githubUsername: "saradev", githubCommits: 8, githubProjects: 1, score: 2100, rank: 7,
  },
  {
    id: "s3", name: "Omar Nasser", email: "omar.n@gmail.com",
    loginTime: "10:00 AM", logoutTime: "Active now",
    sessionHistory: [
      { date: "Today", loginTime: "10:00 AM", logoutTime: "—",        duration: "Active" },
      { date: "Mon",   loginTime: "11:00 AM", logoutTime: "02:00 PM", duration: "3h" },
    ],
    aiUsageCount: 2,
    aiHintQuestions: ["What is the OSI model?", "How does TCP/IP work?"],
    avgTimePerQuestion: "22m 45s", aiDetectionScore: 7,
    integrityFlag: false, githubUsername: "omarnasser", githubCommits: 63, githubProjects: 5,
    score: 3200, rank: 3,
  },
  {
    id: "s4", name: "Lina Haddad", email: "lina.h@gmail.com",
    loginTime: "07:45 AM", logoutTime: "09:30 AM",
    sessionHistory: [
      { date: "Today",     loginTime: "07:45 AM", logoutTime: "09:30 AM", duration: "1h 45m" },
      { date: "Yesterday", loginTime: "08:00 AM", logoutTime: "10:00 AM", duration: "2h" },
    ],
    aiUsageCount: 0, aiHintQuestions: [],
    avgTimePerQuestion: "28m 05s", aiDetectionScore: 0,
    integrityFlag: false, githubUsername: "linahaddad", githubCommits: 92, githubProjects: 7,
    score: 3850, rank: 1,
  },
  {
    id: "s5", name: "Youssef Awad", email: "youssef.a@gmail.com",
    loginTime: "11:20 AM", logoutTime: "Active now",
    sessionHistory: [
      { date: "Today",     loginTime: "11:20 AM", logoutTime: "—",        duration: "Active" },
      { date: "Yesterday", loginTime: "12:00 PM", logoutTime: "03:00 PM", duration: "3h" },
    ],
    aiUsageCount: 25,
    aiHintQuestions: Array.from({ length: 25 }, (_, i) => `AI question ${i + 1}`),
    avgTimePerQuestion: "3m 40s", aiDetectionScore: 96,
    integrityFlag: true, flagReason: "Copy-paste detected + max AI usage",
    githubUsername: "youssefawad", githubCommits: 4, githubProjects: 0, score: 950, rank: 38,
  },
  {
    id: "s6", name: "Rima Saleh", email: "rima.s@gmail.com",
    loginTime: "09:00 AM", logoutTime: "12:00 PM",
    sessionHistory: [
      { date: "Today", loginTime: "09:00 AM", logoutTime: "12:00 PM", duration: "3h" },
    ],
    aiUsageCount: 5,
    aiHintQuestions: ["What is a firewall?", "How does IDS work?", "What is DMZ?", "Explain zero trust", "How to harden Linux?"],
    avgTimePerQuestion: "15m 22s", aiDetectionScore: 31,
    integrityFlag: false, githubUsername: "rimasaleh", githubCommits: 29, githubProjects: 2,
    score: 2650, rank: 5,
  },
  {
    id: "s7", name: "Kareem Bishara", email: "kareem.b@gmail.com",
    loginTime: "10:30 AM", logoutTime: "Active now",
    sessionHistory: [
      { date: "Today", loginTime: "10:30 AM", logoutTime: "—", duration: "Active" },
    ],
    aiUsageCount: 1, aiHintQuestions: ["What is Metasploit?"],
    avgTimePerQuestion: "25m 10s", aiDetectionScore: 5,
    integrityFlag: false, githubUsername: "kareemb", githubCommits: 55, githubProjects: 4,
    score: 3100, rank: 4,
  },
  {
    id: "s8", name: "Dana Ayyash", email: "dana.a@gmail.com",
    loginTime: "08:00 AM", logoutTime: "10:15 AM",
    sessionHistory: [
      { date: "Today",     loginTime: "08:00 AM", logoutTime: "10:15 AM", duration: "2h 15m" },
      { date: "Yesterday", loginTime: "07:30 AM", logoutTime: "09:30 AM", duration: "2h" },
    ],
    aiUsageCount: 8,
    aiHintQuestions: ["What is port scanning?", "How does Nmap work?", "What is OS fingerprinting?", "How to detect open ports?", "What is service enumeration?", "How to use Nessus?", "What is vulnerability scanning?", "Explain CVE database"],
    avgTimePerQuestion: "12m 30s", aiDetectionScore: 44,
    integrityFlag: false, githubUsername: "danaayyash", githubCommits: 38, githubProjects: 3,
    score: 2300, rank: 6,
  },
  {
    id: "s9", name: "Fadi Mansour", email: "fadi.m@gmail.com",
    loginTime: "12:15 PM", logoutTime: "Active now",
    sessionHistory: [
      { date: "Today", loginTime: "12:15 PM", logoutTime: "—", duration: "Active" },
    ],
    aiUsageCount: 3,
    aiHintQuestions: ["What is steganography?", "How to decode base64?", "What is RSA encryption?"],
    avgTimePerQuestion: "20m 55s", aiDetectionScore: 19,
    integrityFlag: false, githubUsername: "fadimansour", githubCommits: 21, githubProjects: 2,
    score: 1950, rank: 10,
  },
  {
    id: "s10", name: "Maya Tawfiq", email: "maya.t@gmail.com",
    loginTime: "09:45 AM", logoutTime: "11:30 AM",
    sessionHistory: [
      { date: "Today", loginTime: "09:45 AM", logoutTime: "11:30 AM", duration: "1h 45m" },
      { date: "Mon",   loginTime: "10:00 AM", logoutTime: "12:00 PM", duration: "2h" },
    ],
    aiUsageCount: 18,
    aiHintQuestions: Array.from({ length: 18 }, (_, i) => `AI question ${i + 1}`),
    avgTimePerQuestion: "4m 50s", aiDetectionScore: 91,
    integrityFlag: true, flagReason: "Unusual completion speed + high AI usage",
    githubUsername: "mayatawfiq", githubCommits: 6, githubProjects: 1, score: 1600, rank: 18,
  },
];
