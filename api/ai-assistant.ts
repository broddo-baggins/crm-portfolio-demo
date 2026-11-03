/**
 * AI Assistant - Vercel serverless function
 *
 * Server-side proxy for the CRM Demo Assistant so API keys never reach the browser.
 * Builds the prompt (system prompt + RAG context) on the server, so this endpoint
 * only answers questions about the demo and can't be used as a generic LLM proxy.
 *
 * Fallback chain:
 * 1. Gemini (GOOGLE_GENERATIVE_AI_API_KEY)
 * 2. Groq (GROQ_API_KEY)
 * 3. 503 -> the client falls back to mock responses
 */

import { CRM_DEMO_ASSISTANT_PROMPT, LANDING_PAGE_CONTEXT } from '../src/config/systemPrompts.js';
import { searchKnowledgeBase, buildRAGContext } from '../src/services/ragKnowledgeBase.js';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_QUESTION_CHARS = 2000;
const MAX_CONTEXT_CHARS = 6000;
const TIMEOUT_MS = 25_000;

type Provider = 'gemini' | 'groq';

interface AssistantRequest {
  question: string;
  context?: string;
  pageContext?: 'landing' | 'dashboard';
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

function parseBody(raw: unknown): AssistantRequest | null {
  if (!raw || typeof raw !== 'object') return null;
  const { question, context, pageContext } = raw as Record<string, unknown>;
  if (typeof question !== 'string' || !question.trim()) return null;
  return {
    question: question.slice(0, MAX_QUESTION_CHARS),
    context: typeof context === 'string' ? context.slice(-MAX_CONTEXT_CHARS) : undefined,
    pageContext: pageContext === 'landing' ? 'landing' : 'dashboard',
  };
}

async function askGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('');
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function askGroq(
  apiKey: string,
  messages: Array<{ role: 'system' | 'user'; content: string }>,
): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_tokens: 2048 }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('Groq returned an empty response');
  return text;
}

export async function POST(request: Request): Promise<Response> {
  let body: AssistantRequest | null = null;
  try {
    body = parseBody(await request.json());
  } catch {
    body = null;
  }
  if (!body) return json(400, { error: 'A non-empty "question" string is required' });

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
    try {
      return json(200, { text: await askGemini(geminiKey, prompt), provider: 'gemini' satisfies Provider });
    } catch (error) {
      console.warn('Gemini failed, trying Groq fallback:', (error as Error).message);
    }
  }

  if (groqKey) {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
      { role: 'system', content: CRM_DEMO_ASSISTANT_PROMPT },
    ];
    if (pageSpecificContext) messages.push({ role: 'system', content: pageSpecificContext });
    if (ragContext) {
      messages.push({ role: 'system', content: `📚 Relevant Documentation from CRM Knowledge Base:\n\n${ragContext}` });
    }
    if (context) messages.push({ role: 'system', content: `💬 Conversation History:\n${context}` });
    messages.push({ role: 'user', content: question });
    try {
      return json(200, { text: await askGroq(groqKey, messages), provider: 'groq' satisfies Provider });
    } catch (error) {
      console.error('Groq failed:', (error as Error).message);
    }
  }

  return json(502, { error: 'AI providers are currently unavailable' });
}
