export const SUPPORTED_LANGS = ['zh', 'en', 'ja', 'es'];

const UI = {
  zh: {
    usage1: '用法: ai-run [--lang zh|en|ja|es] <你的命令> [参数...]',
    usage2: '示例: ai-run --lang zh npm run dev',
    start: '[ai-run] 启动命令',
    mode: '[ai-run] 低延迟模式：规则引擎同步解释；可选 LLM 异步增强',
    explainTag: '中文解释',
    llmTag: 'LLM增强',
    next: '建议动作',
    ended: '[ai-run] 命令结束，退出码',
    unknownLang: '[ai-run] 未知语言，已回退到 zh'
  },
  en: {
    usage1: 'Usage: ai-run [--lang zh|en|ja|es] <command> [args...]',
    usage2: 'Example: ai-run --lang en npm run dev',
    start: '[ai-run] Command',
    mode: '[ai-run] Low-latency mode: sync rule explanations + optional async LLM enhancement',
    explainTag: 'Rule explanation',
    llmTag: 'LLM enhancement',
    next: 'Next action',
    ended: '[ai-run] Process ended with code',
    unknownLang: '[ai-run] Unknown lang, fallback to zh'
  },
  ja: {
    usage1: '使い方: ai-run [--lang zh|en|ja|es] <コマンド> [引数...]',
    usage2: '例: ai-run --lang ja npm run dev',
    start: '[ai-run] コマンド',
    mode: '[ai-run] 低遅延モード: ルール同期解説 + 任意のLLM非同期補強',
    explainTag: 'ルール解説',
    llmTag: 'LLM補強',
    next: '次のアクション',
    ended: '[ai-run] 終了コード',
    unknownLang: '[ai-run] 不明な言語。zh にフォールバックしました'
  },
  es: {
    usage1: 'Uso: ai-run [--lang zh|en|ja|es] <comando> [args...]',
    usage2: 'Ejemplo: ai-run --lang es npm run dev',
    start: '[ai-run] Comando',
    mode: '[ai-run] Modo de baja latencia: explicación síncrona por reglas + mejora asíncrona opcional con LLM',
    explainTag: 'Explicación por reglas',
    llmTag: 'Mejora LLM',
    next: 'Siguiente acción',
    ended: '[ai-run] Proceso finalizado con código',
    unknownLang: '[ai-run] Idioma desconocido, se usa zh por defecto'
  }
};

export function normalizeLang(lang) {
  const l = (lang || '').toLowerCase();
  return SUPPORTED_LANGS.includes(l) ? l : 'zh';
}

export function t(lang) {
  return UI[normalizeLang(lang)];
}
