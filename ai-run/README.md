# ai-run MVP (v0.1)

终端“实时中文解释层”最小可用版本。

## 已实现

- 执行原命令（不改变原始输出）
- 实时读取 stdout/stderr
- 对 `warn/error` 做中文解释
- 输出“下一步建议动作”

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

## 当前限制

- 规则库解释（未接入 LLM）
- 暂无网页面板
- 未做敏感信息脱敏

## 下一步（v0.2）

1. 增加脱敏器（token/email/ip/path）
2. 增加 LLM 深度解释开关
3. 支持 WebSocket 面板实时展示
