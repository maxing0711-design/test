const RULES = [
  {
    pattern: /(module not found|cannot find module)/i,
    level: 'error',
    zh: '找不到模块依赖。通常是还没安装依赖，或 import 路径写错。',
    next: '先执行 npm install，再检查 import 路径与文件名大小写。'
  },
  {
    pattern: /(eacces|permission denied)/i,
    level: 'error',
    zh: '权限不足，当前用户没有操作该文件/目录的权限。',
    next: '检查目录权限，避免随意 sudo；必要时修正文件属主或权限。'
  },
  {
    pattern: /(eaddrinuse|address already in use)/i,
    level: 'error',
    zh: '端口已被占用。',
    next: '换一个端口，或先结束占用端口的进程。'
  },
  {
    pattern: /(timeout|timed out)/i,
    level: 'warn',
    zh: '请求超时，可能是网络不稳定或服务响应太慢。',
    next: '重试一次；若持续超时，检查网络、代理、服务状态。'
  },
  {
    pattern: /(deprecated)/i,
    level: 'warn',
    zh: '使用了即将废弃的 API/依赖。',
    next: '先记录风险，安排升级版本或替代实现。'
  }
];

export function detectLevel(line) {
  const l = line.toLowerCase();
  if (/\b(error|err|failed|exception|fatal)\b/.test(l)) return 'error';
  if (/\b(warn|warning|deprecated)\b/.test(l)) return 'warn';
  return 'info';
}

export function explainLine(line) {
  for (const rule of RULES) {
    if (rule.pattern.test(line)) {
      return {
        matched: true,
        level: rule.level,
        zh: rule.zh,
        next: rule.next
      };
    }
  }

  const level = detectLevel(line);
  if (level === 'error') {
    return {
      matched: false,
      level,
      zh: '检测到错误信息，但未命中规则库。',
      next: '复制这行错误上下文，优先检查最近改动与依赖安装状态。'
    };
  }

  if (level === 'warn') {
    return {
      matched: false,
      level,
      zh: '检测到警告信息。',
      next: '可先继续执行；之后统一处理警告，避免累积成故障。'
    };
  }

  return null;
}
