# TimeForAgents 重构执行计划

## 目标
- 保持现有功能不变
- 降低 `useWorkbenchStore.ts` 复杂度
- 形成可持续扩展结构（后续新增组件和运行策略更容易）

## 阶段 1（已完成）Store 模块化拆分
- [x] 抽离 store 类型定义到 `src/workbench/store/types.ts`
- [x] 抽离通用 helper 到 `src/workbench/store/helpers.ts`
- [x] 将单一大 store 拆为多个 slice：
  - [x] `taskSlice`（任务与组件新增/重命名）
  - [x] `graphSlice`（连线与画布结构变更）
  - [x] `agentSlice`（Agent 运行与历史）
  - [x] `dataCellSlice`（数据格栈操作）
  - [x] `uiSlice`（菜单、搜索、反馈）
- [x] 在 `useWorkbenchStore.ts` 组合 slice
- [x] 保持现有组件调用 API 不变

## 阶段 2（已完成）领域查询抽离
- [x] 将领域查询 helper 抽离到 `src/workbench/domain/selectors.ts`
- [x] store/slice 统一调用 selectors，减少重复查找逻辑

## 阶段 3（已完成）纯函数命令层
- [x] 新增 `src/workbench/domain/commands.ts`
- [x] 将重命名、数据栈操作迁移为纯函数命令
- [x] 将 Agent 输出写入、历史切换/新建/清空迁移为纯函数命令
- [x] 将运行成功后 history record 拼装迁移为纯函数命令

## 阶段 4（已完成）运行时与服务端边界优化
- [x] 前端 runtime 抽象 `AgentGateway`
- [x] 服务端拆分 `config/provider/routes`

## 验收记录
- [x] `bun run build` 通过
- [x] `bun run lint` 通过
- [x] Store 结构已从单文件拆分为模块化 slices
- [x] 领域 selectors / commands 已落地并接入核心流程
- [x] 服务端与前端 runtime 边界已模块化
