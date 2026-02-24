export const RULES = [
  {
    pattern: /(module not found|cannot find module)/i,
    level: 'error',
    i18n: {
      zh: { zh: '缺少依赖模块，程序找不到要加载的包或文件。', next: '先安装依赖（npm i / pnpm i），再检查 import 路径和大小写。' },
      en: { zh: 'Missing dependency module. The program cannot find the package or file to load.', next: 'Install dependencies first (npm i / pnpm i), then check import paths and case sensitivity.' },
      ja: { zh: '依存モジュールが見つかりません。読み込むパッケージ/ファイルを解決できません。', next: 'まず依存関係をインストール（npm i / pnpm i）し、import パスと大文字小文字を確認してください。' },
      es: { zh: 'Falta un módulo de dependencia. El programa no puede encontrar el paquete o archivo.', next: 'Instala dependencias primero (npm i / pnpm i) y revisa rutas de importación y mayúsculas/minúsculas.' }
    }
  },
  {
    pattern: /(eacces|permission denied)/i,
    level: 'error',
    i18n: {
      zh: { zh: '权限不足，当前账号没有访问或写入该文件/目录的权限。', next: '检查文件权限与属主，尽量不要直接用 sudo 硬跑。' },
      en: { zh: 'Permission denied. Current user cannot access or write this file/directory.', next: 'Check file permissions/ownership; avoid forcing with sudo when possible.' },
      ja: { zh: '権限不足です。現在のユーザーはこのファイル/ディレクトリへアクセスまたは書き込みできません。', next: '権限と所有者を確認し、可能な限り sudo での強行実行を避けてください。' },
      es: { zh: 'Permiso denegado. El usuario actual no puede acceder o escribir en este archivo/directorio.', next: 'Revisa permisos/propietario y evita usar sudo a la fuerza.' }
    }
  },
  {
    pattern: /(eaddrinuse|address already in use|port\s*\d+\s*is already in use)/i,
    level: 'error',
    i18n: {
      zh: { zh: '端口被占用，服务无法启动。', next: '换端口或结束占用进程，再重新启动。' },
      en: { zh: 'Port already in use, service cannot start.', next: 'Use another port or stop the process occupying it, then restart.' },
      ja: { zh: 'ポートが使用中のため、サービスを起動できません。', next: '別ポートを使うか占有プロセスを終了して再起動してください。' },
      es: { zh: 'El puerto está en uso y el servicio no puede iniciarse.', next: 'Usa otro puerto o finaliza el proceso que lo ocupa y reinicia.' }
    }
  },
  {
    pattern: /(syntaxerror|unexpected token)/i,
    level: 'error',
    i18n: {
      zh: { zh: '代码语法有问题，解释器无法正确解析。', next: '检查报错行附近的括号、逗号、引号和关键字拼写。' },
      en: { zh: 'Syntax issue in code; parser cannot interpret it correctly.', next: 'Check nearby brackets, commas, quotes, and keyword spelling around the error line.' },
      ja: { zh: 'コードの構文エラーです。パーサーが正しく解釈できません。', next: 'エラー行付近の括弧・カンマ・引用符・キーワードの綴りを確認してください。' },
      es: { zh: 'Hay un error de sintaxis; el intérprete no puede analizarlo correctamente.', next: 'Revisa paréntesis, comas, comillas y palabras clave cerca de la línea del error.' }
    }
  },
  {
    pattern: /(network error|fetch failed|enotfound|getaddrinfo)/i,
    level: 'warn',
    i18n: {
      zh: { zh: '网络连接失败，可能是 DNS/代理/网络波动。', next: '先确认网络与代理设置，再重试。' },
      en: { zh: 'Network connection failed (DNS/proxy/unstable network).', next: 'Check network and proxy settings, then retry.' },
      ja: { zh: 'ネットワーク接続に失敗しました（DNS/プロキシ/回線不安定の可能性）。', next: 'ネットワークとプロキシ設定を確認して再試行してください。' },
      es: { zh: 'Fallo de conexión de red (DNS/proxy/inestabilidad).', next: 'Verifica red y proxy, luego reintenta.' }
    }
  },
  {
    pattern: /(timeout|timed out)/i,
    level: 'warn',
    i18n: {
      zh: { zh: '请求超时，响应时间超过限制。', next: '先重试；若持续超时，检查网络、服务负载或增大超时。' },
      en: { zh: 'Request timed out; response exceeded limit.', next: 'Retry first; if persistent, check network/service load or increase timeout.' },
      ja: { zh: 'リクエストがタイムアウトしました。応答時間が上限を超えています。', next: 'まず再試行し、継続する場合はネットワーク/負荷/タイムアウト設定を確認してください。' },
      es: { zh: 'La solicitud agotó el tiempo de espera.', next: 'Reintenta; si persiste, revisa red/carga del servicio o aumenta el timeout.' }
    }
  },
  {
    pattern: /(deprecated)/i,
    level: 'warn',
    i18n: {
      zh: { zh: '检测到废弃用法，短期可运行，但后续可能出问题。', next: '记录依赖版本，安排升级替代。' },
      en: { zh: 'Deprecated usage detected; works now but may break later.', next: 'Record current versions and plan an upgrade/replacement.' },
      ja: { zh: '非推奨の使い方が検出されました。今は動いても将来問題化する可能性があります。', next: '依存バージョンを記録し、置き換え/アップグレードを計画してください。' },
      es: { zh: 'Uso obsoleto detectado; hoy funciona, pero puede fallar después.', next: 'Registra versiones y planifica actualización/reemplazo.' }
    }
  }
];

export function detectLevel(line) {
  const l = line.toLowerCase();
  if (/\b(error|err|failed|exception|fatal|traceback)\b/.test(l)) return 'error';
  if (/\b(warn|warning|deprecated)\b/.test(l)) return 'warn';
  return 'info';
}

export function explainLine(line, lang = 'zh') {
  for (const rule of RULES) {
    if (rule.pattern.test(line)) {
      const text = rule.i18n[lang] || rule.i18n.zh;
      return { matched: true, level: rule.level, zh: text.zh, next: text.next };
    }
  }

  const level = detectLevel(line);
  const fallback = {
    zh: {
      error: { zh: '检测到错误，但未命中规则库。', next: '优先看第一条 Error 与其上一条上下文，再排查最近改动。' },
      warn: { zh: '检测到警告信息。', next: '可继续执行，但建议收敛警告避免积累。' }
    },
    en: {
      error: { zh: 'Error detected but no rule matched.', next: 'Check the first Error line and nearby context, then inspect recent changes.' },
      warn: { zh: 'Warning detected.', next: 'You can continue, but clean up warnings to avoid future issues.' }
    },
    ja: {
      error: { zh: 'エラーを検出しましたが、ルールに一致しませんでした。', next: '最初の Error 行と前後文脈を確認し、直近の変更を点検してください。' },
      warn: { zh: '警告を検出しました。', next: '実行は可能ですが、後で警告を整理しておくことを推奨します。' }
    },
    es: {
      error: { zh: 'Se detectó un error, pero no coincidió ninguna regla.', next: 'Revisa la primera línea de Error y su contexto, luego los cambios recientes.' },
      warn: { zh: 'Se detectó una advertencia.', next: 'Puedes continuar, pero conviene limpiar advertencias para evitar problemas futuros.' }
    }
  };

  if (level === 'error') return { matched: false, level, ...(fallback[lang] || fallback.zh).error };
  if (level === 'warn') return { matched: false, level, ...(fallback[lang] || fallback.zh).warn };
  return null;
}
