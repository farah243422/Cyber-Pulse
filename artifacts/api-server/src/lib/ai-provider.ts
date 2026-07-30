/**
 * AI Provider Abstraction
 * -----------------------
 * Controls whether the mentor uses mock responses or live OpenAI.
 *
 * HOW TO SWITCH BACK TO OPENAI:
 *   1. Set USE_MOCK_AI=false  (or remove it) in your environment secrets.
 *   2. Ensure OPENAI_API_KEY is set.
 *   That's it — no code changes required.
 *
 * HOW TO FORCE MOCK (even if OPENAI_API_KEY is present):
 *   Set USE_MOCK_AI=true in your environment secrets.
 */

import OpenAI from "openai";
import { getMockResponse } from "./mock-mentor-responses";

// ─── Config ──────────────────────────────────────────────────────────────────

/** Returns true when mock mode is active. */
export function isMockMode(): boolean {
  if (process.env.USE_MOCK_AI === "false") return false;
  if (process.env.USE_MOCK_AI === "true") return true;
  // Default: use mock if no valid OpenAI key is present
  return !process.env.OPENAI_API_KEY;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface MentorContext {
  question: string;
  challengeTitle: string;
  challengeCategory: string;
  difficulty: string;
  studentName: string;
  studentLevel: "beginner" | "intermediate" | "advanced";
  hintsUsed: number;
  systemPrompt: string;
}

/** Async generator yielding text chunks, mirroring the OpenAI stream shape. */
export type ResponseStream = AsyncGenerator<string, void, unknown>;

// ─── Mock stream ──────────────────────────────────────────────────────────────

async function* mockStream(ctx: MentorContext): ResponseStream {
  const fullText = getMockResponse(
    ctx.question,
    ctx.challengeCategory,
    ctx.challengeTitle,
    ctx.studentName,
    ctx.hintsUsed,
  );

  // Simulate realistic word-by-word streaming with slight variance
  const tokens = fullText.split(/(\s+)/); // split on whitespace, preserving it
  for (const token of tokens) {
    yield token;
    // Vary delay: longer pause at sentence endings, shorter mid-sentence
    const delay = /[.!?]$/.test(token.trim())
      ? 60 + Math.random() * 40
      : 18 + Math.random() * 20;
    await new Promise((r) => setTimeout(r, delay));
  }
}

// ─── OpenAI stream ────────────────────────────────────────────────────────────

async function* openAIStream(ctx: MentorContext): ResponseStream {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 512,
    stream: true,
    messages: [
      { role: "system", content: ctx.systemPrompt },
      { role: "user", content: ctx.question },
    ],
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the appropriate response stream for the current mode.
 * Callers iterate with `for await (const chunk of streamMentorResponse(...))`.
 */
export function streamMentorResponse(ctx: MentorContext): ResponseStream {
  return isMockMode() ? mockStream(ctx) : openAIStream(ctx);
}
