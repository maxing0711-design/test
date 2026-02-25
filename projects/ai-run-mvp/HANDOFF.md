# HANDOFF | ai-run-mvp

## 1) 项目一句话目标
- 目标：做一个终端实时中文解释层 MVP，优先低延迟与可读性。
- 当前阶段：MVP v0.3（CLI + 规则解释 + 脱敏 + 可选LLM增强 + 多语言）
- 关键约束：主链路必须同步、低延迟；LLM 只能异步增强且可关闭。

## 2) 当前状态
- 进行中：规则库扩展、真实日志样本覆盖
- 已完成：CLI 执行、stdout/stderr 监听、同步解释、脱敏器、LLM异步增强开关、中英日西四语支持、测试与基准脚本
- 阻塞点：暂无

## 3) 今日完成
- ✅ 完成 1：实现低延迟同步解释主链路
  - 涉及文件：ai-run/src/cli.js, ai-run/src/explain.js
  - 影响范围：warn/error 解释速度与可读性
- ✅ 完成 2：实现脱敏与可选LLM增强
  - 涉及文件：ai-run/src/redact.js, ai-run/src/llm.js
  - 影响范围：隐私安全与深度解释能力
- ✅ 完成 3：补充测试/基准与文档
  - 涉及文件：ai-run/scripts-test.js, ai-run/scripts-bench.js, ai-run/README.md, ai-run/package.json
  - 影响范围：可验证性与晨间测试体验

## 4) 变更清单
- 改动点：
  1. 新增 `redactSensitive` 脱敏模块
  2. 新增 `maybeEnhanceWithLLM` 异步增强模块（超时保护）
  3. 升级 explain 规则库与输出文案
  4. 新增 test/bench 脚本并通过
- 最短回滚方式：`git revert <commit>`

## 5) 下一步
- ⏭ Step 1：按真实用户日志扩展规则库（Top 50 报错）
- ⏭ Step 2：增加 `--only-error`/`--json` 输出模式（并适配多语言）
- ⏭ Step 3：接入 WebSocket 侧边面板
- 失败优先排查：shell 输出分行兼容、LLM timeout 处理

## 6) 明天从哪继续
- 先读：`ai-run/src/cli.js` 与 `ai-run/src/explain.js`
- 先做：补充规则库和参数开关
- 先验：`npm run test && npm run bench && npm run demo`
- 预计坑：不同系统 shell 对复合命令输出行为不一致


## v0.4 夜间增量
- 新增侧边翻译面板（SSE）：`src/panel.js`
- CLI 新增参数：`--panel`、`--panel-port`、`--no-inline`
- 默认在 panel 模式下不污染主终端输出
- README 增加面板模式说明与 demo_panel
- 已验证：test/bench 通过，panel 本地可访问


## v0.5 桌面化方向增量
- 新增本地常驻 Hub（`src/hub.js`）：固定地址面板、SSE实时流、只读无执行权限
- 新增本地日志保留策略：默认保留 10 天（可配置）
- CLI 新增：`--daemon`、`--session`、`--hub-url`，支持多终端会话流入同一面板
- 新增 `npm run desktop`：一键启动本地后台并打开面板
- 安全边界：默认本地，不需要服务器；仅翻译，不操作用户终端
