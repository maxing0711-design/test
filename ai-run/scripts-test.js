import { explainLine } from './src/explain.js';
import { redactSensitive } from './src/redact.js';

const tests = [
  ['module not found zh', /模块|依赖|找不到/, explainLine('Error: Module not found', 'zh')?.zh || ''],
  ['module not found en', /Missing dependency|cannot find/i, explainLine('Error: Module not found', 'en')?.zh || ''],
  ['module not found ja', /依存|見つかりません|モジュール/, explainLine('Error: Module not found', 'ja')?.zh || ''],
  ['module not found es', /Falta|módulo|dependencia/i, explainLine('Error: Module not found', 'es')?.zh || ''],
  ['redact github token', /REDACTED/, redactSensitive('github_pat_11ABCDEF1234567890_abcdEFGHijklmnop')],
  ['redact email', /REDACTED_EMAIL/, redactSensitive('user@example.com')]
];

let fail = 0;
for (const [name, regex, out] of tests) {
  const ok = regex.test(out);
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}`);
  if (!ok) fail++;
}

if (fail > 0) process.exit(1);
console.log('All tests passed.');
