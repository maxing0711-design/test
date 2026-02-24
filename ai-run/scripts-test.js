import { explainLine } from './src/explain.js';
import { redactSensitive } from './src/redact.js';

const tests = [
  ['module not found', /找不到|缺少|模块/, 'Error: Module not found'],
  ['permission denied', /权限/, 'EACCES: permission denied'],
  ['redact github token', /REDACTED/, 'github_pat_11ABCDEF1234567890_abcdEFGHijklmnop'],
  ['redact email', /REDACTED_EMAIL/, 'user@example.com']
];

let fail = 0;
for (const [name, regex, input] of tests) {
  const out = name.startsWith('redact') ? redactSensitive(input) : (explainLine(input)?.zh || '');
  const ok = regex.test(out);
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}`);
  if (!ok) fail++;
}

if (fail > 0) process.exit(1);
console.log('All tests passed.');
