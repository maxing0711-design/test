#!/usr/bin/env node
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { randomUUID } from 'node:crypto';
import { explainLine, detectLevel } from './explain.js';
import { maybeEnhanceWithLLM } from './llm.js';
import { normalizeLang, t } from './i18n.js';
import { startHub } from './hub.js';

const raw = process.argv.slice(2);
let lang = process.env.AI_RUN_LANG || 'zh';
let panel = false;
let panelPort = Number(process.env.AI_RUN_HUB_PORT || 18777);
let inlineExplain = true;
let daemonMode = false;
let sessionId = process.env.AI_RUN_SESSION || `s-${randomUUID().slice(0, 8)}`;
let hubUrl = process.env.AI_RUN_HUB_URL || `http://127.0.0.1:${panelPort}`;
const args = [];

for (let i = 0; i < raw.length; i++) {
  const it = raw[i];
  if (it === '--lang' && raw[i + 1]) { lang = raw[++i]; continue; }
  if (it === '--panel') { panel = true; continue; }
  if (it === '--panel-port' && raw[i + 1]) { panelPort = Number(raw[++i]) || panelPort; hubUrl = `http://127.0.0.1:${panelPort}`; continue; }
  if (it === '--hub-url' && raw[i + 1]) { hubUrl = raw[++i]; continue; }
  if (it === '--session' && raw[i + 1]) { sessionId = raw[++i]; continue; }
  if (it === '--no-inline') { inlineExplain = false; continue; }
  if (it === '--daemon') { daemonMode = true; continue; }
  args.push(it);
}
if (panel) inlineExplain = false;

const normalized = normalizeLang(lang);
const ui = t(normalized);
if (normalized !== lang) console.log(ui.unknownLang);

if (daemonMode) {
  const hub = await startHub(panelPort);
  console.log(`[ai-run] desktop hub started: ${hub.url}`);
  console.log('[ai-run] read-only mode: translation only, no terminal execution');
  process.stdin.resume();
  process.on('SIGINT', () => { hub.close(); process.exit(0); });
  process.on('SIGTERM', () => { hub.close(); process.exit(0); });
  await new Promise(() => {});
}

if (args.length === 0) {
  console.log(ui.usage1);
  console.log(ui.usage2);
  console.log('附加参数: --panel --panel-port 18777 --no-inline --session myterm --daemon');
  process.exit(1);
}

const [cmd, ...cmdArgs] = args;
console.log(`\n${ui.start}: ${cmd} ${cmdArgs.join(' ')}`);
console.log(`${ui.mode}`);
if (panel) console.log(`[ai-run] panel: ${hubUrl}`);
console.log(`[ai-run] session: ${sessionId}\n`);

if (panel) {
  try {
    await fetch(`${hubUrl}/health`, { method: 'GET' });
  } catch {
    try {
      await startHub(panelPort);
      console.log(`[ai-run] panel hub auto-started: ${hubUrl}`);
    } catch (e) {
      console.log(`[ai-run] panel hub start failed: ${e.message}`);
    }
  }
}

async function publish(evt) {
  if (!panel) return;
  try {
    await fetch(`${hubUrl}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...evt, sessionId, ts: Date.now() })
    });
  } catch {}
}

const child = spawn(cmd, cmdArgs, {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: false,
  env: { ...process.env, AI_RUN_LANG: normalized, AI_RUN_SESSION: sessionId }
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
    publish({ level: exp.level || level, raw: line, zh: exp.zh, next: exp.next, source: 'rule' });

    maybeEnhanceWithLLM(line, level, normalized)
      .then((enhanced) => {
        if (!enhanced?.zh) return;
        if (inlineExplain) printExplain(writer, level, enhanced.zh, enhanced.next, ui.llmTag);
        publish({ level, raw: line, zh: enhanced.zh, next: enhanced.next, source: 'llm' });
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
