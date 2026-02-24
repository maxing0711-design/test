#!/usr/bin/env node
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { explainLine, detectLevel } from './explain.js';
import { maybeEnhanceWithLLM } from './llm.js';
import { normalizeLang, t } from './i18n.js';

const raw = process.argv.slice(2);
let lang = process.env.AI_RUN_LANG || 'zh';
const args = [];
for (let i = 0; i < raw.length; i++) {
  if (raw[i] === '--lang' && raw[i + 1]) {
    lang = raw[i + 1];
    i++;
    continue;
  }
  args.push(raw[i]);
}

const normalized = normalizeLang(lang);
const ui = t(normalized);
if (normalized !== lang) console.log(ui.unknownLang);

if (args.length === 0) {
  console.log(ui.usage1);
  console.log(ui.usage2);
  process.exit(1);
}

const [cmd, ...cmdArgs] = args;
console.log(`\n${ui.start}: ${cmd} ${cmdArgs.join(' ')}`);
console.log(`${ui.mode}\n`);

const child = spawn(cmd, cmdArgs, {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: false,
  env: { ...process.env, AI_RUN_LANG: normalized }
});

function printExplain(writer, level, zh, next, tag = ui.explainTag) {
  const icon = level === 'error' ? '🛑' : '⚠️';
  writer.write(`${icon} [${tag}] ${zh}\n`);
  if (next) writer.write(`👉 [${ui.next}] ${next}\n`);
  writer.write('\n');
}

function streamWithExplain(stream, writer) {
  const rl = readline.createInterface({ input: stream });

  rl.on('line', (line) => {
    writer.write(line + '\n');

    const exp = explainLine(line, normalized);
    if (!exp) return;

    printExplain(writer, exp.level, exp.zh, exp.next);

    const level = detectLevel(line);
    maybeEnhanceWithLLM(line, level, normalized)
      .then((enhanced) => {
        if (!enhanced?.zh) return;
        printExplain(writer, level, enhanced.zh, enhanced.next, ui.llmTag);
      })
      .catch(() => {});
  });
}

streamWithExplain(child.stdout, process.stdout);
streamWithExplain(child.stderr, process.stderr);

child.on('close', (code) => {
  console.log(`${ui.ended}: ${code}`);
  process.exit(code ?? 0);
});
