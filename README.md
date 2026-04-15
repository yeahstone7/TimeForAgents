# TimeForAgents

一个基于 Bun 的 Agent 编排画布：左侧任务栏，右侧二维空间；支持 `Agent` 与 `数据格(栈)` 组件拖拽、连线和运行。

## 启动

1. 安装依赖

```bash
bun install
```

2. 配置环境变量（服务端读取）

```bash
cp .env.example .env.local
```

`.env.local` 需要包含：

- `MODEL_API_KEY`（推荐）
- `MODEL_BASE_URL`（默认 `https://openrouter.ai/api/`）
- `MODEL_NAME`（默认 `openai/gpt-4o-mini`）
- `MODEL_APP_NAME`（可选，默认 `TimeForAgents`）
- `MODEL_SITE_URL`（可选，默认 `http://localhost:5173`）
- `PORT`（默认 `8787`）

3. 启动（前端 + Bun 服务端）

```bash
bun dev
```

前端固定地址：`http://127.0.0.1:5173/`  
后端健康检查：`http://localhost:8787/health`

## 架构

- 前端：React + Vite + Zustand + React Flow
- 服务端：Bun `server/index.ts`，负责代理调用 Kimi API，避免在浏览器暴露密钥

## 目录

- `src/workbench/domain`：领域模型与工厂
- `src/workbench/store`：状态与业务动作
- `src/workbench/components`：界面与节点
- `src/workbench/runtime`：前端运行时 API 调用
- `server/index.ts`：Bun 服务端 API
