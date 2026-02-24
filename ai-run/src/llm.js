import { redactSensitive } from './redact.js';

const cache = new Map();

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('llm_timeout')), ms))
  ]);
}

const LANG_HINT = {
  zh: '请使用简体中文',
  en: 'Please answer in English',
  ja: '日本語で回答してください',
  es: 'Responde en español'
};

export async function maybeEnhanceWithLLM(line, level, lang = 'zh') {
  const enabled = process.env.AI_RUN_LLM === '1';
  const apiKey = process.env.OPENAI_API_KEY;
  if (!enabled || !apiKey || level === 'info') return null;

  const sanitized = redactSensitive(line).slice(0, 1200);
  const cacheKey = `${lang}:${sanitized}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const body = {
    model: process.env.AI_RUN_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a terminal error explainer. ${LANG_HINT[lang] || LANG_HINT.zh}. Return JSON with fields: zh, next. Keep concise and practical.`
      },
      {
        role: 'user',
        content: `level:${level}\nlog:${sanitized}`
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
  const out = { zh: parsed.zh || null, next: parsed.next || null };
  cache.set(cacheKey, out);
  return out;
}
