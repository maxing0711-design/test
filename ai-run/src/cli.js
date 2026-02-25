#!/usr/bin/env node
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { explainLine, detectLevel } from './explain.js';
import { maybeEnhanceWithLLM } from './llm.js';
import { normalizeLang, t } from './i18n.js';
import { startPanelServer } from './panel.js';

const raw = process.argv.slice(2);
let lang = process.env.AI_RUN_LANG || 'zh';
let panel = false;
let panelPort = Number(process.env.AI_RUN_PANEL_PORT || 18777);
let inlineExplain = true;
const args = [];

for (let i = 0; i < raw.length; i++) {
  const it = raw[i];
  if (it === '--lang' && raw[i + 1]) {
    lang = raw[++i];
    continue;
  }
  if (it === '--panel') {
    panel = true;
    continue;
  }
  if (it === '--panel-port' && raw[i + 1]) {
    panelPort = Number(raw[++i]) || panelPort;
    continue;
  }
  if (it === '--no-inline') {
    inlineExplain = false;
    continue;
  }
  args.push(it);
}

if (panel) inlineExplain = false;

const normalized = normalizeLang(lang);
const ui = t(normalized);
if (normalized !== lang) console.log(ui.unknownLang);

if (args.length === 0) {
  console.log(ui.usage1);
  console.log(ui.usage2);
  console.log('附加参数: --panel --panel-port 18777 --no-inline');
  process.exit(1);
}

const [cmd, ...cmdArgs] = args;
console.log(`\n${ui.start}: ${cmd} ${cmdArgs.join(' ')}`);
console.log(`${ui.mode}`);

let panelServer = null;
if (panel) {
  try {
    panelServer = await startPanelServer(panelPort);
    console.log(`[ai-run] panel: ${panelServer.url}`);
  } catch (e) {
    console.log(`[ai-run] panel 启动失败: ${e.message}`);
  }
}
console.log('');

const child = spawn(cmd, cmdArgs, {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: false,
  env: { ...process.env, AI_RUN_LANG: normalized }
});

function printExplain(writer, level, zh, next, tag = ui.explainTag) {
  const icon = level === 'error' ? '🛑' : level === 'warn' ? '⚠️' : 'ℹ️';
  writer.write(`${icon} [${tag}] ${zh}\n`);
  if (next) writer.write(`👉 [${ui.next}] ${next}\n`);
  writer.write('\n');
}

function streamWithExplain(stream, writer) {
  const rl = readline.createInterface({ input: stream });

  rl.on('line', (line) => {
    writer.write(line + '\n');

    const level = detectLevel(line);
    const exp = explainLine(line, normalized);
    if (!exp) return;

    if (inlineExplain) printExplain(writer, exp.level, exp.zh, exp.next);
    panelServer?.publish({ level: exp.level || level, raw: line, zh: exp.zh, next: exp.next, source: 'rule' });

    maybeEnhanceWithLLM(line, level, normalized)
      .then((enhanced) => {
        if (!enhanced?.zh) return;
        if (inlineExplain) printExplain(writer, level, enhanced.zh, enhanced.next, ui.llmTag);
        panelServer?.publish({ level, raw: line, zh: enhanced.zh, next: enhanced.next, source: 'llm' });
      })
      .catch(() => {});
  });
}

streamWithExplain(child.stdout, process.stdout);
streamWithExplain(child.stderr, process.stderr);

child.on('close', (code) => {
  console.log(`${ui.ended}: ${code}`);
  panelServer?.close();
  process.exit(code ?? 0);
});
