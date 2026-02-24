#!/usr/bin/env node
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { explainLine } from './explain.js';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('用法: ai-run <你的命令> [参数...]');
  console.log('示例: ai-run npm run dev');
  process.exit(1);
}

const [cmd, ...cmdArgs] = args;
console.log(`\n[ai-run] 启动命令: ${cmd} ${cmdArgs.join(' ')}`);
console.log('[ai-run] 实时解释已开启（仅对 warn/error 输出中文说明）\n');

const child = spawn(cmd, cmdArgs, {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  env: process.env
});

function streamWithExplain(stream, writer) {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    writer.write(line + '\n');

    const exp = explainLine(line);
    if (exp) {
      const icon = exp.level === 'error' ? '🛑' : '⚠️';
      writer.write(`${icon} [中文解释] ${exp.zh}\n`);
      writer.write(`👉 [建议动作] ${exp.next}\n\n`);
    }
  });
}

streamWithExplain(child.stdout, process.stdout);
streamWithExplain(child.stderr, process.stderr);

child.on('close', (code) => {
  console.log(`[ai-run] 命令结束，退出码: ${code}`);
  process.exit(code ?? 0);
});
