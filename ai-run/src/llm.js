import { redactSensitive } from './redact.js';

const cache = new Map();

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('llm_timeout')), ms))
  ]);
}

export async function maybeEnhanceWithLLM(line, level) {
  const enabled = process.env.AI_RUN_LLM === '1';
  const apiKey = process.env.OPENAI_API_KEY;
  if (!enabled || !apiKey || level === 'info') return null;

  const sanitized = redactSensitive(line).slice(0, 1200);
  if (cache.has(sanitized)) return cache.get(sanitized);

  const body = {
    model: process.env.AI_RUN_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: '你是终端报错解释助手。请用简体中文输出 JSON，字段: zh(一句话解释), next(一句话建议)。简短易懂。'
      },
      {
        role: 'user',
        content: `级别:${level}\n日志:${sanitized}`
      }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  };

  const res = await withTimeout(fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }), Number(process.env.AI_RUN_LLM_TIMEOUT_MS || 1200));

  if (!res.ok) return null;
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;

  let parsed;
  try { parsed = JSON.parse(raw); } catch { return null; }
  const out = {
    zh: parsed.zh || null,
    next: parsed.next || null
  };
  cache.set(sanitized, out);
  return out;
}
