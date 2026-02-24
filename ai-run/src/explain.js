export const RULES = [
  {
    pattern: /(module not found|cannot find module)/i,
    level: 'error',
    zh: '缺少依赖模块，程序找不到要加载的包或文件。',
    next: '先安装依赖（npm i / pnpm i），再检查 import 路径和大小写。'
  },
  {
    pattern: /(eacces|permission denied)/i,
    level: 'error',
    zh: '权限不足，当前账号没有访问或写入该文件/目录的权限。',
    next: '检查文件权限与属主，尽量不要直接用 sudo 硬跑。'
  },
  {
    pattern: /(eaddrinuse|address already in use|port\s*\d+\s*is already in use)/i,
    level: 'error',
    zh: '端口被占用，服务无法启动。',
    next: '换端口或结束占用进程，再重新启动。'
  },
  {
    pattern: /(syntaxerror|unexpected token)/i,
    level: 'error',
    zh: '代码语法有问题，解释器无法正确解析。',
    next: '检查报错行附近的括号、逗号、引号和关键字拼写。'
  },
  {
    pattern: /(network error|fetch failed|enotfound|getaddrinfo)/i,
    level: 'warn',
    zh: '网络连接失败，可能是 DNS/代理/网络波动。',
    next: '先确认网络与代理设置，再重试。'
  },
  {
    pattern: /(timeout|timed out)/i,
    level: 'warn',
    zh: '请求超时，响应时间超过限制。',
    next: '先重试；若持续超时，检查网络、服务负载或增大超时。'
  },
  {
    pattern: /(deprecated)/i,
    level: 'warn',
    zh: '检测到废弃用法，短期可运行，但后续可能出问题。',
    next: '记录依赖版本，安排升级替代。'
  }
];

export function detectLevel(line) {
  const l = line.toLowerCase();
  if (/\b(error|err|failed|exception|fatal|traceback)\b/.test(l)) return 'error';
  if (/\b(warn|warning|deprecated)\b/.test(l)) return 'warn';
  return 'info';
}

export function explainLine(line) {
  for (const rule of RULES) {
    if (rule.pattern.test(line)) {
      return { matched: true, level: rule.level, zh: rule.zh, next: rule.next };
    }
  }

  const level = detectLevel(line);
  if (level === 'error') {
    return {
      matched: false,
      level,
      zh: '检测到错误，但未命中规则库。',
      next: '优先看第一条 Error 与其上一条上下文，再排查最近改动。'
    };
  }
  if (level === 'warn') {
    return {
      matched: false,
      level,
      zh: '检测到警告信息。',
      next: '可继续执行，但建议收敛警告避免积累。'
    };
  }
  return null;
}
