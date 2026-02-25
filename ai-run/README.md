# ai-run MVP (v0.5)

终端实时翻译工具（本地运行、低延迟、支持中英日西）。

## 你关心的安全边界

- ✅ **只读模式**：只读取终端输出做翻译，不执行终端命令
- ✅ **本地运行**：默认不需要服务器
- ✅ **本地存储**：翻译日志只保存在本机，默认保留 10 天
- ✅ **可选云增强**：LLM 增强默认关闭，可手动开启

## 快速开始

```bash
cd ai-run
npm link
```

### 1) 桌面面板（推荐）

先启动本地常驻面板（后台）：

```bash
npm run desktop
# 会自动打开 http://127.0.0.1:18777
```

然后在任意终端会话里运行：

```bash
ai-run --panel --session term-a --lang zh npm run dev
```

你会在固定面板里看到该会话实时翻译，不污染原终端。

### 2) 仅命令行模式

```bash
ai-run --lang zh npm run dev
```

## 多语言

```bash
ai-run --lang zh npm run dev
ai-run --lang en npm run dev
ai-run --lang ja npm run dev
ai-run --lang es npm run dev
```

## 常用参数

- `--panel` 把翻译发送到本地面板
- `--session <id>` 设置会话名（多终端并行时很有用）
- `--no-inline` 不在终端内显示翻译
- `--daemon` 启动本地常驻翻译面板服务
- `--panel-port 18777` 自定义面板端口

## 测试

```bash
npm run test
npm run bench
npm run demo_panel
```

## 可选：开启 LLM 增强解释

```bash
export AI_RUN_LLM=1
export OPENAI_API_KEY=你的key
ai-run --panel --lang zh --session term-a npm run dev
```

> LLM 失败/超时不会阻塞主流程。

