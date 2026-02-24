#!/usr/bin/env node
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { explainLine, detectLevel } from './explain.js';
import { maybeEnhanceWithLLM } from './llm.js';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('用法: ai-run <你的命令> [参数...]');
  console.log('示例: ai-run npm run dev');
  process.exit(1);
}

const [cmd, ...cmdArgs] = args;
console.log(`\n[ai-run] 启动命令: ${cmd} ${cmdArgs.join(' ')}`);
console.log('[ai-run] 低延迟模式：规则引擎同步解释；可选 LLM 异步增强\n');

const child = spawn(cmd, cmdArgs, {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  env: process.env
});

function printExplain(writer, level, zh, next, tag = '中文解释') {
  const icon = level === 'error' ? '🛑' : '⚠️';
  writer.write(`${icon} [${tag}] ${zh}\n`);
  if (next) writer.write(`👉 [建议动作] ${next}\n`);
  writer.write('\n');
}

function streamWithExplain(stream, writer) {
  const rl = readline.createInterface({ input: stream });

  rl.on('line', (line) => {
    writer.write(line + '\n');

    const exp = explainLine(line);
    if (!exp) return;

    // 1) 同步低延迟解释
    printExplain(writer, exp.level, exp.zh, exp.next);

    // 2) 异步 LLM 增强（可开关，不阻塞主流程）
    const level = detectLevel(line);
    maybeEnhanceWithLLM(line, level)
      .then((enhanced) => {
        if (!enhanced?.zh) return;
        printExplain(writer, level, enhanced.zh, enhanced.next, 'LLM增强');
      })
      .catch(() => {
        // 静默失败，保证低延迟主链路
      });
  });
}

streamWithExplain(child.stdout, process.stdout);
streamWithExplain(child.stderr, process.stderr);

child.on('close', (code) => {
  console.log(`[ai-run] 命令结束，退出码: ${code}`);
  process.exit(code ?? 0);
});
