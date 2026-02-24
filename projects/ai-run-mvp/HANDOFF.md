# HANDOFF | ai-run-mvp

## 1) 项目一句话目标
- 目标：做一个终端实时中文解释层 MVP，先能运行并解释常见 warn/error。
- 当前阶段：MVP v0.1（CLI + 规则解释）
- 关键约束：先保证可运行与可验证，不引入复杂依赖。

## 2) 当前状态
- 进行中：规则库扩展、真实报错样本验证
- 已完成：CLI 执行、stdout/stderr 监听、中文解释输出、README
- 阻塞点：暂无

## 3) 今日完成
- ✅ 完成 1：创建 ai-run CLI 原型并可执行命令
  - 涉及文件：ai-run/src/cli.js
  - 影响范围：命令执行与输出监听
- ✅ 完成 2：实现规则引擎解释层
  - 涉及文件：ai-run/src/explain.js
  - 影响范围：warn/error 中文解释与建议
- ✅ 完成 3：补充使用文档
  - 涉及文件：ai-run/README.md, ai-run/package.json
  - 影响范围：安装与演示路径

## 4) 变更清单
- 改动点：
  1. 新增 `ai-run/` 项目目录与CLI
  2. 新增规则解释模块
  3. 新增 README 与 demo 命令
- 最短回滚方式：`git revert <commit>`

## 5) 下一步
- ⏭ Step 1：增加敏感信息脱敏层（token/email/path）
- ⏭ Step 2：接入可选 LLM 深度解释（仅 error）
- 失败优先排查：child_process 输出流读取与 shell 兼容

## 6) 明天从哪继续
- 先读：`ai-run/src/cli.js` 与 `ai-run/src/explain.js`
- 先做：脱敏器（pre-LLM）
- 先验：demo 输出中敏感信息被替换
- 预计坑：不同 shell 输出格式差异
