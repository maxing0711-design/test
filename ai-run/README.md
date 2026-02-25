# ai-run MVP (v0.4)

终端“实时解释层”最小可用版本（支持中/英/日/西，低延迟优先）。

## 核心特性

- 实时执行并透传原命令输出
- **多语言支持**：zh / en / ja / es
- **同步低延迟解释**：规则引擎即时解释 warn/error
- **异步增强解释（可选）**：LLM 在后台补充更通俗说明
- 脱敏模块（供 LLM 路径使用）：token/email/ip/path 自动打码
- **侧边翻译面板（新）**：原终端不插入翻译，翻译在独立面板实时显示

## 快速使用

```bash
cd ai-run
npm link
ai-run --lang zh npm run dev
```

## 侧边面板模式（推荐）

```bash
ai-run --panel --lang zh npm run dev
# 打开输出里的 panel 地址（默认 http://127.0.0.1:18777）
```

可选参数：

- `--panel-port 18888` 自定义面板端口
- `--no-inline` 不在终端内打印翻译（`--panel` 默认即关闭 inline）

## 演示

```bash
cd ai-run
npm run demo
npm run demo_panel
```

## 开启 LLM 异步增强（可选）

```bash
export AI_RUN_LLM=1
export OPENAI_API_KEY=你的key
# 可选：export AI_RUN_LLM_TIMEOUT_MS=1200
ai-run --panel --lang zh npm run dev
```

说明：LLM 失败或超时不会阻塞主流程，主流程始终由规则引擎同步输出。

## 测试与基准

```bash
cd ai-run
npm run test
npm run bench
```

## 语言参数

- 命令行：`--lang zh|en|ja|es`
- 环境变量：`AI_RUN_LANG=zh|en|ja|es`

## 延迟策略

1. 主链路：规则引擎本地匹配（毫秒级）
2. 增强链路：LLM 异步补充（可开关）
3. 只处理 warn/error，降低噪音和开销

## 下一步（v0.5）

- 增加 `--mode all` 全日志翻译与节流策略
- 增加 `--only-error` / `--json` 输出模式
- 面板增加会话总结与导出
