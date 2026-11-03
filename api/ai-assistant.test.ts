// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  POST,
  parseBody,
  modelChain,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GEMINI_FALLBACK_MODEL,
  DEFAULT_GROQ_MODEL,
  DEFAULT_GROQ_FALLBACK_MODEL,
} from './ai-assistant';

const ENV_KEYS = [
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'GROQ_API_KEY',
  'GEMINI_MODEL',
  'GEMINI_FALLBACK_MODEL',
  'GROQ_MODEL',
  'GROQ_FALLBACK_MODEL',
] as const;

const post = (body: unknown, headers: Record<string, string> = { 'content-type': 'application/json' }) =>
  POST(
    new Request('http://localhost/api/ai-assistant', {
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const geminiOk = (text: string) =>
  new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'thinking', thought: true }, { text }] } }] }), {
    status: 200,
  });
const groqOk = (text: string) => new Response(JSON.stringify({ choices: [{ message: { content: text } }] }), { status: 200 });

/** URL + parsed body of every outgoing provider call */
function calls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.map(([url, init]) => ({ url: String(url), body: JSON.parse((init as RequestInit).body as string) }));
}

describe('ai-assistant function', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    for (const k of ENV_KEYS) vi.stubEnv(k, '');
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('input validation', () => {
    it.each([
      [{}, 'question'],
      [{ question: '   ' }, 'question'],
      [{ question: 42 }, 'question'],
      [['question'], 'object'],
      [{ question: 'hi', context: { a: 1 } }, 'context'],
      [{ question: 'hi', pageContext: 'admin' }, 'pageContext'],
    ])('rejects %j with 400', async (body, field) => {
      vi.stubEnv('GROQ_API_KEY', 'test-key');
      const res = await post(body);
      expect(res.status).toBe(400);
      expect((await res.json()).error).toContain(field);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects malformed JSON with 400', async () => {
      const res = await post('{"question":');
      expect(res.status).toBe(400);
    });

    it('rejects a non-JSON content type with 415', async () => {
      const res = await post({ question: 'hi' }, { 'content-type': 'text/plain' });
      expect(res.status).toBe(415);
    });

    it('rejects an oversized body with 413', async () => {
      const res = await post({ question: 'x'.repeat(20_000) });
      expect(res.status).toBe(413);
    });

    it('trims, strips control characters and caps the question', () => {
      const parsed = parseBody({ question: `  hi\u0000\u0007 there  ${'y'.repeat(3000)}` });
      expect(typeof parsed).toBe('object');
      const { question, pageContext } = parsed as Exclude<typeof parsed, string>;
      expect(question.startsWith('hi there')).toBe(true);
      expect(question.length).toBe(2000);
      expect(pageContext).toBe('dashboard');
    });
  });

  it('returns 503 when no provider key is configured', async () => {
    const res = await post({ question: 'What is BANT?' });
    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers with the default Gemini model and drops thought parts', async () => {
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'test-key');
    fetchMock.mockResolvedValueOnce(geminiOk('BANT is Budget, Authority, Need, Timeline.'));

    const res = await post({ question: 'What is BANT?', pageContext: 'landing' });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ text: 'BANT is Budget, Authority, Need, Timeline.', provider: 'gemini' });
    const [call] = calls(fetchMock);
    expect(call.url).toContain(`/models/${DEFAULT_GEMINI_MODEL}:generateContent`);
    expect(call.body.generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'low' });
    expect(call.body.contents[0].parts[0].text).toContain('What is BANT?');
  });

  it('falls back to the Gemini fallback model, then to Groq', async () => {
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'test-key');
    vi.stubEnv('GROQ_API_KEY', 'test-key');
    fetchMock
      .mockResolvedValueOnce(new Response('{}', { status: 404 }))
      .mockResolvedValueOnce(new Response('{}', { status: 429 }))
      .mockResolvedValueOnce(groqOk('From Groq'));

    const res = await post({ question: 'Tech stack?' });

    expect(await res.json()).toEqual({ text: 'From Groq', provider: 'groq' });
    const [first, second, third] = calls(fetchMock);
    expect(first.url).toContain(`/models/${DEFAULT_GEMINI_MODEL}:`);
    expect(second.url).toContain(`/models/${DEFAULT_GEMINI_FALLBACK_MODEL}:`);
    expect(third.url).toBe('https://api.groq.com/openai/v1/chat/completions');
    expect(third.body.model).toBe(DEFAULT_GROQ_MODEL);
    expect(third.body.reasoning_effort).toBe('low');
    expect(third.body.messages.at(-1)).toEqual({ role: 'user', content: 'Tech stack?' });
  });

  it('skips the fallback model when the key is rejected', async () => {
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'bad-key');
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 403 }));

    const res = await post({ question: 'hi' });

    expect(res.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses the Groq fallback model when the primary one fails', async () => {
    vi.stubEnv('GROQ_API_KEY', 'test-key');
    fetchMock.mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce(groqOk('ok'));

    const res = await post({ question: 'hi' });

    expect(res.status).toBe(200);
    expect(calls(fetchMock).map((c) => c.body.model)).toEqual([DEFAULT_GROQ_MODEL, DEFAULT_GROQ_FALLBACK_MODEL]);
  });

  it('honours model overrides from the environment', async () => {
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_MODEL', 'gemini-4-argon');
    fetchMock.mockResolvedValueOnce(geminiOk('ok'));

    await post({ question: 'hi' });

    expect(calls(fetchMock)[0].url).toContain('/models/gemini-4-argon:generateContent');
  });

  it('returns 502 when every provider fails', async () => {
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'test-key');
    vi.stubEnv('GROQ_API_KEY', 'test-key');
    fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));

    const res = await post({ question: 'hi' });

    expect(res.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  describe('modelChain', () => {
    it('ignores malformed and duplicate ids', () => {
      expect(modelChain('../../etc/passwd?x=1', '', ['a-model', 'b-model'])).toEqual(['b-model']);
      expect(modelChain('a-model', 'a-model', ['a-model', 'b-model'])).toEqual(['a-model']);
    });
  });
});
