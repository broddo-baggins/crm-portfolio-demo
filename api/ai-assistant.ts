/**
 * AI Assistant - Vercel serverless function
 *
 * Server-side proxy for the CRM Demo Assistant so API keys never reach the browser.
 * Builds the prompt (system prompt + RAG context) on the server, so this endpoint
 * only answers questions about the demo and can't be used as a generic LLM proxy.
 *
 * Fallback chain (each step only if the previous one fails):
 * 1. Gemini, GEMINI_MODEL then GEMINI_FALLBACK_MODEL (GOOGLE_GENERATIVE_AI_API_KEY)
 * 2. Groq, GROQ_MODEL then GROQ_FALLBACK_MODEL (GROQ_API_KEY)
 * 3. 503/502 -> the client falls back to mock responses
 */

import { CRM_DEMO_ASSISTANT_PROMPT, LANDING_PAGE_CONTEXT } from '../src/config/systemPrompts.js';
import { searchKnowledgeBase, buildRAGContext } from '../src/services/ragKnowledgeBase.js';

// Newest generally-available models as of 2026-11 (ai.google.dev/gemini-api/docs/models,
// console.groq.com/docs/models). Override per deployment without a code change.
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
export const DEFAULT_GEMINI_FALLBACK_MODEL = 'gemini-3.5-flash-lite';
export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
export const DEFAULT_GROQ_FALLBACK_MODEL = 'openai/gpt-oss-20b';

const MAX_BODY_BYTES = 16_384;
const MAX_QUESTION_CHARS = 2000;
const MAX_CONTEXT_CHARS = 6000;
const TIMEOUT_MS = 25_000;
const MODEL_ID = /^[a-z0-9][a-z0-9._/-]{1,79}$/i;

type Provider = 'gemini' | 'groq';
type ChatMessage = { role: 'system' | 'user'; content: string };

interface AssistantRequest {
  question: string;
  context?: string;
  pageContext: 'landing' | 'dashboard';
}

class ProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// Control characters other than tab/newline have no place in a chat question
// eslint-disable-next-line no-control-regex
const stripControlChars = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

export function parseBody(raw: unknown): AssistantRequest | string {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 'Body must be a JSON object';
  const { question, context, pageContext } = raw as Record<string, unknown>;
  if (typeof question !== 'string' || !question.trim()) return 'A non-empty "question" string is required';
  if (context !== undefined && typeof context !== 'string') return '"context" must be a string';
  if (pageContext !== undefined && pageContext !== 'landing' && pageContext !== 'dashboard') {
    return '"pageContext" must be "landing" or "dashboard"';
  }
  return {
    question: stripControlChars(question).trim().slice(0, MAX_QUESTION_CHARS),
    context: context ? stripControlChars(context).slice(-MAX_CONTEXT_CHARS) : undefined,
    pageContext: pageContext === 'landing' ? 'landing' : 'dashboard',
  };
}

/** The configured model, then the fallback, skipping blanks, duplicates and malformed ids. */
export function modelChain(configured: string | undefined, fallback: string | undefined, defaults: [string, string]): string[] {
  const chain = [configured?.trim() || defaults[0], fallback?.trim() || defaults[1]];
  return [...new Set(chain.filter((m) => MODEL_ID.test(m)))];
}

async function askGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          // Gemini 3+ think by default; a chat answer doesn't need much of it
          ...(/^gemini-[3-9]/.test(model) ? { thinkingConfig: { thinkingLevel: 'low' } } : {}),
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!res.ok) throw new ProviderError(`Gemini ${model} HTTP ${res.status}`, res.status);
  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? '')
    .join('');
  if (!text) throw new ProviderError(`Gemini ${model} returned an empty response`);
  return text;
}

async function askGroq(apiKey: string, model: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_completion_tokens: 2048,
      // gpt-oss models reason first; keep it short and out of the answer
      ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low', include_reasoning: false } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new ProviderError(`Groq ${model} HTTP ${res.status}`, res.status);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new ProviderError(`Groq ${model} returned an empty response`);
  return text;
}

/** Try each model in turn; a 401/403 means the key is bad, so the other model won't help. */
async function firstAnswer(models: string[], ask: (model: string) => Promise<string>, provider: Provider) {
  for (const model of models) {
    try {
      return await ask(model);
    } catch (error) {
      console.warn(`[ai-assistant] ${provider} failed:`, (error as Error).message);
      const status = (error as ProviderError).status;
      if (status === 401 || status === 403) break;
    }
  }
  return null;
}

export async function POST(request: Request): Promise<Response> {
  if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    return json(415, { error: 'Content-Type must be application/json' });
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json(413, { error: 'Request body too large' });
  }

  let body: AssistantRequest | string;
  try {
    body = parseBody(JSON.parse(raw));
  } catch {
    body = 'Body must be valid JSON';
  }
  if (typeof body === 'string') return json(400, { error: body });

  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!geminiKey && !groqKey) return json(503, { error: 'AI assistant is not configured' });

  const { question, context, pageContext } = body;
  const ragContext = buildRAGContext(searchKnowledgeBase(question, 3));
  const pageSpecificContext = pageContext === 'landing' ? LANDING_PAGE_CONTEXT : '';

  if (geminiKey) {
    let prompt = CRM_DEMO_ASSISTANT_PROMPT;
    if (pageSpecificContext) prompt += `\n\n${pageSpecificContext}\n\n`;
    if (ragContext) prompt += `\n\n## 📚 Relevant Documentation from CRM Knowledge Base:\n\n${ragContext}`;
    if (context) prompt += `\n\n## 💬 Conversation History:\n${context}`;
    prompt += `\n\n---\n\n## ❓ User Question:\n${question}`;
    if (ragContext) {
      prompt += `\n\n**Instructions:** Use the documentation provided above to give accurate, specific answers about this CRM system. Reference the exact features, architecture, and capabilities described in the docs. If the documentation covers the question, prioritize that information over general knowledge.`;
    }
    const models = modelChain(process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODEL, [
      DEFAULT_GEMINI_MODEL,
      DEFAULT_GEMINI_FALLBACK_MODEL,
    ]);
    const text = await firstAnswer(models, (model) => askGemini(geminiKey, model, prompt), 'gemini');
    if (text) return json(200, { text, provider: 'gemini' satisfies Provider });
  }

  if (groqKey) {
    const messages: ChatMessage[] = [{ role: 'system', content: CRM_DEMO_ASSISTANT_PROMPT }];
    if (pageSpecificContext) messages.push({ role: 'system', content: pageSpecificContext });
    if (ragContext) {
      messages.push({ role: 'system', content: `📚 Relevant Documentation from CRM Knowledge Base:\n\n${ragContext}` });
    }
    if (context) messages.push({ role: 'system', content: `💬 Conversation History:\n${context}` });
    messages.push({ role: 'user', content: question });
    const models = modelChain(process.env.GROQ_MODEL, process.env.GROQ_FALLBACK_MODEL, [
      DEFAULT_GROQ_MODEL,
      DEFAULT_GROQ_FALLBACK_MODEL,
    ]);
    const text = await firstAnswer(models, (model) => askGroq(groqKey, model, messages), 'groq');
    if (text) return json(200, { text, provider: 'groq' satisfies Provider });
  }

  return json(502, { error: 'AI providers are currently unavailable' });
}
