import { Router } from "express";
import OpenAI from "openai";
import { db } from "@workspace/db";
import { mentorInteractions } from "@workspace/db";
import { logger } from "../lib/logger";

const mentorRouter = Router();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_HINTS = 5;

// Detect if the student is trying to cheat (asking for direct answers/flags)
function detectCheating(question: string): boolean {
  const cheatingPatterns = [
    /give me the (flag|answer|solution|exploit|payload)/i,
    /what('s| is) the (flag|answer|solution)/i,
    /solve (this|the) (challenge|lab|task)/i,
    /show me (the |)exploit/i,
    /give me (the |)root/i,
    /how do i (get|obtain) the flag/i,
    /complete (this|the) (challenge|lab)/i,
    /do (it|this) for me/i,
    /just tell me/i,
    /what is the (password|hash|key|token)/i,
  ];
  return cheatingPatterns.some((p) => p.test(question));
}

function buildSystemPrompt(
  challengeTitle: string,
  challengeCategory: string,
  difficulty: string,
  studentName: string,
  studentLevel: string,
  hintsUsed: number
): string {
  const levelGuidance =
    studentLevel === "beginner"
      ? "The student is a BEGINNER — provide thorough concept explanations with analogies. Be encouraging and patient."
      : studentLevel === "advanced"
        ? "The student is ADVANCED — be concise. Skip basics. Focus on guiding questions that make them think deeper."
        : "The student is at INTERMEDIATE level — balance explanation with exploration.";

  const hintPressure =
    hintsUsed >= 4
      ? "The student has used many hints already. Push them more toward independent discovery. Ask more questions than you explain."
      : hintsUsed >= 2
        ? "The student has used a few hints. Transition from explaining concepts to asking guiding questions."
        : "This is an early hint — start with foundational concepts related to the challenge.";

  return `You are a cybersecurity instructor and AI Mentor embedded in CyberPulse, a cybersecurity training platform.

You are helping a student named ${studentName} with the lab: "${challengeTitle}" (Category: ${challengeCategory}, Difficulty: ${difficulty}).

${levelGuidance}
${hintPressure}

CRITICAL RULES — you MUST follow these without exception:
1. NEVER provide the final flag, answer, exploit payload, or complete solution.
2. NEVER write complete working exploit code.
3. NEVER reveal specific vulnerability parameters (exact CVE exploitation steps, exact credentials, exact file paths that lead to the flag).
4. DO guide the student with:
   - Relevant cybersecurity concepts
   - Small, incremental hints about WHERE to look (not what to find)
   - Socratic questions that help them discover the solution themselves
5. ALWAYS encourage critical thinking.
6. If the student asks you to cheat or give direct answers, firmly refuse and redirect to learning.

Response format:
- Keep responses concise (3-6 sentences max unless explaining a concept).
- Use markdown formatting for code snippets or commands (but never complete exploits).
- End with a guiding question when appropriate to prompt deeper thinking.
- Tone: professional, encouraging, like a knowledgeable mentor who wants the student to succeed through their own effort.`;
}

mentorRouter.post("/mentor/ask", async (req, res) => {
  const {
    question,
    challengeId,
    challengeTitle,
    challengeCategory,
    difficulty,
    studentId,
    studentName,
    studentLevel = "intermediate",
    hintsUsed = 0,
  } = req.body as {
    question: string;
    challengeId: string;
    challengeTitle: string;
    challengeCategory: string;
    difficulty: string;
    studentId: string;
    studentName: string;
    studentLevel?: "beginner" | "intermediate" | "advanced";
    hintsUsed?: number;
  };

  if (!question || !challengeId || !challengeTitle || !studentId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // Determine response level
  let responseLevel = 1;
  const isCheating = detectCheating(question);

  if (isCheating) {
    responseLevel = 4;
  } else if (hintsUsed >= 4) {
    responseLevel = 3; // Guided questions only
  } else if (hintsUsed >= 2) {
    responseLevel = 2; // Hints
  } else {
    responseLevel = 1; // Concept explanation
  }

  // Set up SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // For blocked (cheating) requests, send refusal without calling AI
  if (isCheating) {
    const refusal =
      "I can't provide the answer, flag, or solution directly — that would defeat the purpose of this challenge and undermine your learning. 🛡️\n\nMy role is to help you **discover** the solution through your own effort.\n\nTry breaking the problem into smaller parts: What do you already know about this type of vulnerability? What tools have you tried so far? Let's work through this step by step.";

    res.write(`data: ${JSON.stringify({ content: refusal, done: false })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, responseLevel: 4 })}\n\n`);

    // Log to DB
    try {
      await db.insert(mentorInteractions).values({
        studentId,
        studentName,
        labId: challengeId,
        labTitle: challengeTitle,
        question,
        aiResponse: refusal,
        responseLevel: 4,
        hintsUsed,
      });
    } catch (err) {
      logger.error({ err }, "Failed to log mentor interaction");
    }

    res.end();
    return;
  }

  const systemPrompt = buildSystemPrompt(
    challengeTitle,
    challengeCategory,
    difficulty,
    studentName,
    studentLevel,
    hintsUsed
  );

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, responseLevel })}\n\n`);

    // Log interaction to DB
    try {
      await db.insert(mentorInteractions).values({
        studentId,
        studentName,
        labId: challengeId,
        labTitle: challengeTitle,
        question,
        aiResponse: fullResponse,
        responseLevel,
        hintsUsed,
      });
    } catch (err) {
      logger.error({ err }, "Failed to log mentor interaction");
    }
  } catch (err) {
    logger.error({ err }, "OpenAI streaming error");
    res.write(`data: ${JSON.stringify({ error: "AI Mentor is temporarily unavailable. Please try again.", done: true })}\n\n`);
  }

  res.end();
});

// Get interactions for a student (for dashboard)
mentorRouter.get("/mentor/interactions/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const interactions = await db.query.mentorInteractions.findMany({
      where: (t, { eq }) => eq(t.studentId, studentId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: 50,
    });
    res.json(interactions);
  } catch (err) {
    logger.error({ err }, "Failed to fetch mentor interactions");
    res.status(500).json({ error: "Failed to fetch interactions" });
  }
});

export default mentorRouter;
