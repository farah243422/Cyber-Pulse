/**
 * Mock AI Mentor Responses
 * -------------------------
 * Predefined responses for demo purposes, organized by challenge category
 * and hint level (1 = Concept, 2 = Hint, 3 = Guided questions).
 *
 * TO SWITCH BACK TO OPENAI: set USE_MOCK_AI=false in your environment
 * (or remove it) and ensure OPENAI_API_KEY is set. See ai-provider.ts.
 */

export type HintLevel = 1 | 2 | 3;

interface MockResponseSet {
  level1: string[]; // Concept explanations
  level2: string[]; // Directional hints
  level3: string[]; // Socratic questions only
  keywords: string[]; // Question keywords that trigger this set
}

// ─── Per-category response banks ────────────────────────────────────────────

const WEB_SECURITY: MockResponseSet = {
  keywords: ["sql", "injection", "xss", "cross-site", "csrf", "web", "http", "request", "form", "input", "script", "cookie", "session"],
  level1: [
    `Great question! **SQL Injection** is a vulnerability that occurs when user-supplied input is embedded directly into a SQL query without sanitization. The database then executes attacker-controlled SQL.

Think of it like this: if a login form builds a query like \`SELECT * FROM users WHERE name='<input>'\`, what happens if you enter \`' OR '1'='1\` as the username?

The resulting query would always return true — bypassing authentication entirely.

**Where should you start exploring?** Look for any form field, URL parameter, or cookie value that appears to influence a database query. Which input fields does this app expose?`,

    `**Cross-Site Scripting (XSS)** lets attackers inject malicious scripts into pages viewed by other users. There are three types: Reflected, Stored, and DOM-based.

The core issue is that the browser trusts content served by the page — it can't distinguish between the app's own scripts and injected ones.

For this challenge, try thinking about where user-controlled data gets rendered back into the HTML. Does the app reflect your input anywhere without encoding it?

**Try this**: enter \`<b>hello</b>\` in a text field and see if the browser renders it bold or shows the literal tag. What do you observe?`,

    `Web application vulnerabilities often trace back to one principle: **never trust user input**. Whether it's a URL parameter, form field, HTTP header, or cookie — any of these can be a vector.

For this challenge, start by mapping all the places where the app accepts input and think about how each one is processed on the server side.

**What HTTP methods does this app support?** Have you tried sending unexpected data types or unusually long strings to observe error behavior?`,
  ],
  level2: [
    `You're making progress! Here's a nudge in the right direction:

Try modifying the input to include a **single quote** \`'\` and observe the server's response. Does it throw an error, behave differently, or return unexpected data?

Error messages are gold — they often reveal the database type (MySQL, PostgreSQL, SQLite) and sometimes the query structure itself.

**Next step**: if you see an error, can you use it to infer the number of columns being returned by the query?`,

    `Good instinct! Think about **where the application reflects data back to you**. When you submit something in the search or comment field, does it appear verbatim in the page source?

Open browser DevTools → Elements tab and look at the raw HTML — not the rendered view. Is your input inside an attribute, inside a \`<script>\` tag, or between HTML tags? Each context requires a different payload structure.

**What context is your input landing in?**`,

    `You're close. Consider the **HTTP request headers** — not just the visible form fields. Headers like \`User-Agent\`, \`Referer\`, and \`X-Forwarded-For\` are sometimes logged to a database or reflected in admin panels without sanitization.

Use a proxy tool like Burp Suite or the browser's Network tab to inspect every header the app sends.

**Which headers does this app's server respond to differently?**`,
  ],
  level3: [
    `Let's think through this together with some questions:

1. Have you identified **all** the input vectors — including hidden form fields and URL fragments?
2. What does the server return when you send a syntactically broken payload (like an unmatched quote)?
3. If the app uses a database, what type do you think it is, and why?
4. Have you tried a **boolean-based blind** approach — crafting a query that returns different results for true vs. false conditions?

You have more context than you think. What have you already ruled out?`,

    `Before I guide further, tell me what you've tried so far. Let me ask:

1. Have you checked the **page source** for hidden inputs or JavaScript that constructs requests?
2. Does changing the URL parameters produce different behavior?
3. Have you looked at the **cookies** — are any of them decoded and passed into a query or template?
4. What's the one thing about this challenge that feels most "off" or surprising to you?

Sometimes the vulnerability is hiding where the app seems normal but isn't.`,
  ],
};

const NETWORK_SECURITY: MockResponseSet = {
  keywords: ["network", "packet", "sniff", "wireshark", "tcp", "udp", "port", "scan", "nmap", "firewall", "vpn", "dns", "arp", "mitm", "man-in-the-middle"],
  level1: [
    `**Network security** challenges often revolve around intercepting, analyzing, or manipulating traffic. The OSI model is your mental map here — each layer has its own attack surface.

For packet analysis, tools like **Wireshark** let you filter and inspect traffic at the byte level. The key skill is identifying anomalies — unusual ports, unexpected protocols, or data that looks like it shouldn't be there.

**Start by asking**: what protocol is being used, and what does a *normal* packet in that protocol look like? Anything that deviates from the spec is suspicious.

What traffic have you captured so far, and what stands out to you?`,

    `**Port scanning** is the reconnaissance phase of many network attacks. Tools like \`nmap\` reveal which services are running, what versions they're on, and sometimes whether they have known vulnerabilities.

A typical starting command: \`nmap -sV -sC <target>\` runs a service version scan with default scripts.

But always think: what is the *purpose* of a service on a given port? An HTTP server on port 8080 vs. 80 — is that intentional, or a misconfiguration?

**Which ports are open on your target, and which ones seem unusual?**`,
  ],
  level2: [
    `Here's a directional hint: focus on **unencrypted protocols**. If traffic is going over plain HTTP, Telnet, FTP, or plain SMTP — credentials and data are visible in the packet capture.

In Wireshark, try the filter \`ftp\` or \`http.request.method == "POST"\` to isolate credential submissions.

**What protocol is the sensitive data being transmitted over in this challenge?**`,

    `Think about **ARP poisoning** — in a local network, ARP has no authentication. An attacker can broadcast fake ARP replies, redirecting traffic meant for one host to themselves.

For this challenge: are you on a shared network segment? If so, which host is the "victim" and which is the "gateway"? That relationship is what you need to exploit.

**What does the ARP table look like on the target host before and after your attack?**`,
  ],
  level3: [
    `Let me ask you some guiding questions:

1. Have you mapped out **all the hosts** on the network? (\`nmap -sn <range>\` does a host discovery sweep)
2. Which services are running on non-standard ports, and what does banner-grabbing reveal?
3. Is traffic encrypted? If so, is the certificate trustworthy — or self-signed?
4. What would an attacker positioned **between two hosts** be able to see or modify?

What's your current understanding of the network topology in this challenge?`,
  ],
};

const CRYPTOGRAPHY: MockResponseSet = {
  keywords: ["crypto", "cryptography", "cipher", "encrypt", "decrypt", "hash", "rsa", "aes", "base64", "key", "xor", "rot13", "md5", "sha", "jwt", "token", "encoding"],
  level1: [
    `**Cryptography** challenges typically involve one of three things: breaking a weak cipher, exploiting a flawed implementation of a strong one, or abusing a protocol misuse.

A useful mental model: **encoding ≠ encryption**. Base64, URL encoding, and hex are *encodings* — they're reversible without a key. True encryption requires a secret. If you see "encoded" data, you can decode it without needing to crack anything.

**First question**: is the data actually encrypted, or just encoded? Try running it through a Base64 decoder, hex decoder, or CyberChef and see what comes out.

What does the data in this challenge look like, and does it match any known encoding format?`,

    `When you see a **hash** (MD5, SHA-1, SHA-256), remember: hashes are one-way by design. But weak algorithms like MD5 and SHA-1 have precomputed rainbow tables, and if a hash is unsalted, database lookups (like crackstation.net) often recover the original plaintext in seconds.

For **JWTs (JSON Web Tokens)**: they have three base64-decoded parts — header, payload, signature. If the algorithm is \`none\` or the secret is weak, you may be able to forge your own token.

**What type of cryptographic artifact are you working with, and does it appear to use a known-weak algorithm?**`,
  ],
  level2: [
    `Here's a nudge: look closely at the **cipher's key length and mode of operation**. AES-128 in ECB mode, for example, is deterministic — identical plaintext blocks produce identical ciphertext. This leaks structural information.

If you can control the plaintext (e.g., a username or message), try submitting identical 16-byte blocks and see if the ciphertext has repeating patterns.

**What happens when you encrypt the same value twice? Do you get the same ciphertext?**`,

    `For XOR-based ciphers: XOR has a beautiful property — if you XOR the ciphertext with known plaintext, you recover the key. This is the **known-plaintext attack**.

If you know (or can guess) any part of the plaintext — like a file header, a protocol magic bytes, or a common prefix — you already have the key material for that segment.

**Is there any part of the message format you can predict or control?**`,
  ],
  level3: [
    `Let's think cryptanalytically:

1. Is the encryption symmetric or asymmetric? How do you know?
2. If it's symmetric, do you have access to an **encryption oracle** — a way to encrypt arbitrary data?
3. Does the same key appear to be reused? (If two messages use the same XOR key, XORing them together cancels the key out entirely)
4. Have you looked at the cipher's **initialization vector (IV)**? A predictable or reused IV breaks many stream ciphers.

What's the most exploitable weakness you've identified so far?`,
  ],
};

const FORENSICS: MockResponseSet = {
  keywords: ["forensic", "steganography", "stego", "image", "file", "metadata", "exif", "hidden", "pcap", "memory", "dump", "artifact", "evidence", "carve"],
  level1: [
    `**Digital forensics** is about finding what's hidden, deleted, or disguised. The golden rule: *everything leaves a trace*.

For file-based challenges, start with the basics before getting fancy:
- \`file <filename>\` — checks the actual file type vs. the extension
- \`strings <filename>\` — extracts printable ASCII from any binary
- \`exiftool <filename>\` — dumps all metadata including GPS, author, creation time

Many CTF forensics flags are hidden in metadata, appended after the end of a valid file, or embedded in the least-significant bits of image pixels.

**Have you run \`file\` and \`strings\` on the artifact yet? What do they reveal?**`,

    `**Steganography** hides data inside seemingly normal files. For images, tools like \`steghide\`, \`zsteg\`, and \`binwalk\` can extract hidden content.

\`binwalk\` is especially powerful — it scans for embedded file signatures inside a file. A PNG containing a ZIP inside it, for example, will show up immediately.

Think about the **file's structure**: most formats have a defined header and footer. Anything appended after the footer is suspicious.

**What tool have you used on the file, and what did it show you about the file's internal structure?**`,
  ],
  level2: [
    `A useful technique: look at the file's **hex dump** with \`xxd <file> | head -50\`. The first few bytes (the "magic bytes") identify the true file format — a file claiming to be a PNG but starting with \`PK\` is actually a ZIP.

For PCAP challenges, filter by protocol in Wireshark. Look for file transfers in \`ftp-data\`, \`http\` (export HTTP objects: File → Export Objects → HTTP), or \`smb\` streams.

**What do the first 16 bytes of the file look like in hex? Do they match the expected magic bytes for its extension?**`,
  ],
  level3: [
    `You've got the tools. Let me help you think:

1. Have you verified the **file type** independently of its extension?
2. Is there data after the **end-of-file marker** (IEND for PNG, FFD9 for JPEG)?
3. Have you tried \`binwalk -e\` to extract any embedded archives?
4. If it's a PCAP, have you followed the TCP streams (right-click a packet → Follow → TCP Stream)?
5. What's the **file size** vs. what you'd expect for the visible content?

Sometimes the simplest approach — just running \`strings\` and grepping for the flag format — works. Have you tried that?`,
  ],
};

const PRIVILEGE_ESCALATION: MockResponseSet = {
  keywords: ["privilege", "escalation", "root", "sudo", "suid", "setuid", "linux", "permission", "user", "shell", "bash", "cron", "path", "kernel", "exploit"],
  level1: [
    `**Privilege escalation** is about moving from a low-privilege account to a higher one — usually to root/administrator. There are two main categories:

**Vertical** — gaining higher privileges (user → root)
**Horizontal** — accessing another account at the same privilege level

For Linux, the classic checklist includes:
- \`sudo -l\` — what can you run as sudo without a password?
- \`find / -perm -4000 2>/dev/null\` — find SUID binaries (run with the owner's privileges)
- Writable cron jobs or scripts called by root
- Writable \`PATH\` entries that shadow legitimate commands

**Which of these have you checked so far, and what did you find?**`,

    `**SUID binaries** are executables that run with the file owner's privileges rather than the caller's. If a SUID binary owned by root calls another program or allows shell escape, you can leverage it.

The [GTFOBins](https://gtfobins.github.io) database catalogs known shell escapes for common Unix binaries — if you find a SUID binary, it's worth checking there.

**What SUID binaries exist on this system, and are any of them listed in GTFOBins?**`,
  ],
  level2: [
    `Here's a useful hint: check **environment variables** and the \`PATH\`. If a script running as root calls a binary by name (without full path), and you control a \`PATH\` directory that comes first, you can replace that binary with your own.

Try: \`echo $PATH\` — are any of those directories writable by you?

Also, look at \`/etc/cron*\` and \`crontab -l\` — cron jobs running as root with weak file permissions on the scripts they call are a classic vector.

**Who owns the scripts called by cron, and can you modify them?**`,
  ],
  level3: [
    `Let's think methodically. Answer these for yourself:

1. What user are you currently running as, and what groups do you belong to?
2. Have you run \`sudo -l\`? What commands are allowed without a password?
3. Are there any interesting files in \`/opt\`, \`/var\`, \`/tmp\`, or home directories you can read?
4. What services are running as root? (\`ps aux | grep root\`)
5. Are there any SUID binaries that seem unusual for this system?

The answer is on the machine already. What's the most unusual thing you've noticed?`,
  ],
};

const REVERSE_ENGINEERING: MockResponseSet = {
  keywords: ["reverse", "binary", "assembly", "disassemble", "decompile", "ida", "ghidra", "gdb", "debug", "obfuscate", "patch", "crackme", "executable", "elf", "pe"],
  level1: [
    `**Reverse engineering** means recovering the logic of a program without its source code. The workflow usually goes:

1. **Static analysis** — examine the binary without running it (\`strings\`, \`file\`, \`objdump\`, Ghidra)
2. **Dynamic analysis** — run it in a controlled environment and observe behavior (\`ltrace\`, \`strace\`, \`gdb\`)
3. **Patch or exploit** — modify behavior to bypass checks or extract secrets

Start with \`strings ./binary | grep -i flag\` — embarrassingly, this works more often than you'd think.

Then: \`ltrace ./binary\` shows library calls in real time — if the binary calls \`strcmp\` with your input against a secret, you'll see both arguments.

**What does \`strings\` reveal about this binary? Any interesting constants, URLs, or messages?**`,
  ],
  level2: [
    `Here's a directional hint: in most crackme challenges, the validation logic boils down to a **comparison**. The binary compares your input (or a transform of it) against a stored or computed value.

In GDB, set a breakpoint at common comparison functions:
\`\`\`
b strcmp
b memcmp  
b strncmp
run <your_input>
\`\`\`
When the breakpoint hits, examine the arguments: \`x/s $rdi\` and \`x/s $rsi\` show what's being compared.

**Have you identified where in the control flow the "correct/incorrect" branch happens?**`,
  ],
  level3: [
    `Let's guide your thinking:

1. Have you identified the **main validation function** in the decompiler output?
2. What does the program do with your input before comparing it — any XOR, ROT, or byte manipulation?
3. Have you tried running it with \`ltrace\` or \`strace\` to catch system/library calls?
4. Is the check done all at once, or character-by-character? (The latter is vulnerable to timing attacks)
5. Can you find the "success" string and **trace back** from it to find what condition triggers it?

What's the structure of the validation logic as best you can tell?`,
  ],
};

// ─── Fallback responses for unrecognized categories ─────────────────────────

const GENERIC: MockResponseSet = {
  keywords: [],
  level1: [
    `Great question! Cybersecurity challenges are most effectively approached with a systematic methodology:

1. **Reconnaissance** — understand what you're working with before attempting anything
2. **Enumeration** — map out all the pieces (inputs, services, files, users)
3. **Exploitation** — apply targeted techniques based on what you find
4. **Documentation** — note what works and what doesn't

For this challenge, start by listing everything you *know* for certain. What does the challenge description tell you? What's explicitly given?

Then ask: **what assumptions am I making that I haven't verified yet?** False assumptions are the #1 reason solvers get stuck.`,

    `The key to this type of challenge is **systematic enumeration** before exploitation. Resist the urge to jump straight to attacking — spend the first few minutes mapping everything out.

Think in layers: what's the outermost surface? What's the next layer in? Each layer might have its own vulnerabilities, and some vulnerabilities require chaining multiple weaknesses.

**What's the entry point you've identified so far, and what do you know about how the system processes input?**`,
  ],
  level2: [
    `Here's a nudge: consider what's **unexpected or irregular** about this challenge. CTF creators almost always put a hint in the challenge description, the filename, or the first thing you see.

Re-read the description carefully. Is there an emphasis on a particular word? A technology mentioned? A number that seems oddly specific?

Also consider the **difficulty level** of this challenge. Easy challenges rarely require complex exploit chains — the solution is probably more straightforward than you think.

**What's the most "unusual" element of this challenge that you haven't fully investigated yet?**`,
  ],
  level3: [
    `Let me push you toward independent thinking with some questions:

1. What have you **definitely ruled out** as an attack vector, and why?
2. What would you try next if you had **unlimited time** and no risk of breaking anything?
3. Is there anything in the challenge you've been **avoiding** because it seems too obvious or too complex?
4. What does your gut say the vulnerability is — even if you can't prove it yet?

Trust your instincts and test them. What one thing are you least sure about?`,
  ],
};

// ─── Response bank map ───────────────────────────────────────────────────────

const RESPONSE_BANKS: MockResponseSet[] = [
  WEB_SECURITY,
  NETWORK_SECURITY,
  CRYPTOGRAPHY,
  FORENSICS,
  PRIVILEGE_ESCALATION,
  REVERSE_ENGINEERING,
];

// ─── Selector logic ──────────────────────────────────────────────────────────

function detectCategory(question: string, challengeCategory: string): MockResponseSet {
  const haystack = (question + " " + challengeCategory).toLowerCase();

  let best: MockResponseSet = GENERIC;
  let bestScore = 0;

  for (const bank of RESPONSE_BANKS) {
    const score = bank.keywords.filter(k => haystack.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = bank;
    }
  }

  return best;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Select an appropriate mock response based on context.
 * Returns the full response string.
 */
export function getMockResponse(
  question: string,
  challengeCategory: string,
  challengeTitle: string,
  studentName: string,
  hintsUsed: number
): string {
  const bank = detectCategory(question, challengeCategory);

  let pool: string[];
  if (hintsUsed >= 4) {
    pool = bank.level3.length > 0 ? bank.level3 : GENERIC.level3;
  } else if (hintsUsed >= 2) {
    pool = bank.level2.length > 0 ? bank.level2 : GENERIC.level2;
  } else {
    pool = bank.level1.length > 0 ? bank.level1 : GENERIC.level1;
  }

  const base = pickRandom(pool);

  // Personalize with student name on first hint
  if (hintsUsed === 0) {
    return `Hey ${studentName}! ${base}`;
  }
  return base;
}
