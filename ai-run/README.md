# ai-run MVP (v0.2)

终端“实时中文解释层”最小可用版本（低延迟优先）。

## 核心特性

- 实时执行并透传原命令输出
- **同步低延迟解释**：规则引擎即时解释 warn/error
- **异步增强解释（可选）**：LLM 在后台补充更通俗说明
- 脱敏模块（供 LLM 路径使用）：token/email/ip/path 自动打码

## 快速使用

```bash
cd ai-run
npm link
ai-run npm run dev
```

## 演示

```bash
cd ai-run
npm run demo
```

## 开启 LLM 异步增强（可选）

```bash
export AI_RUN_LLM=1
export OPENAI_API_KEY=你的key
# 可选：export AI_RUN_LLM_TIMEOUT_MS=1200
ai-run npm run dev
```

说明：LLM 失败或超时不会阻塞主流程，主流程始终由规则引擎同步输出。

## 测试与基准

```bash
cd ai-run
npm run test
npm run bench
```

## 延迟策略

1. 主链路：规则引擎本地匹配（毫秒级）
2. 增强链路：LLM 异步补充（可开关）
3. 只处理 warn/error，降低噪音和开销

## 下一步（v0.3）

- 增加 WebSocket 侧边面板
- 增加“只看错误上下文”折叠视图
- 增加更丰富的语言和框架专属规则包
