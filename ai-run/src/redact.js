const PATTERNS = [
  { name: 'github_pat', re: /github_pat_[A-Za-z0-9_]{20,}/g, to: '[REDACTED_GITHUB_PAT]' },
  { name: 'api_key', re: /\b(?:sk|rk|pk)_[A-Za-z0-9\-_]{16,}\b/g, to: '[REDACTED_API_KEY]' },
  { name: 'bearer', re: /(Bearer\s+)[A-Za-z0-9\-\._~\+\/]+=*/gi, to: '$1[REDACTED_TOKEN]' },
  { name: 'email', re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, to: '[REDACTED_EMAIL]' },
  { name: 'ip', re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, to: '[REDACTED_IP]' },
  { name: 'abs_path', re: /\/(?:Users|home|var|etc|opt)\/[A-Za-z0-9._\-/]+/g, to: '[REDACTED_PATH]' }
];

export function redactSensitive(input) {
  let out = String(input ?? '');
  for (const p of PATTERNS) out = out.replace(p.re, p.to);
  return out;
}
