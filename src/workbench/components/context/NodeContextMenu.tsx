import { useEffect } from 'react'
import { useWorkbenchStore } from '../../store/useWorkbenchStore'
import type { DataCellNode } from '../../domain/types'

const AgentContextMenu = ({ nodeId }: { nodeId: string }) => {
  const task = useWorkbenchStore((state) =>
    state.tasks.find((item) => item.id === state.activeTaskId),
  )!

  const runtime = task.agentStates[nodeId]
  const currentHistory = runtime.histories.find(
    (history) => history.id === runtime.activeHistoryId,
  )!
  const isRunning = useWorkbenchStore(
    (state) => state.runningAgentIds[nodeId] ?? false,
  )
  const runAgent = useWorkbenchStore((state) => state.runAgent)
  const resetAgentMemory = useWorkbenchStore((state) => state.resetAgentMemory)
  const switchAgentHistory = useWorkbenchStore((state) => state.switchAgentHistory)
  const createAgentHistory = useWorkbenchStore((state) => state.createAgentHistory)

  return (
    <section className="context-content">
      <h3>Agent 操作</h3>
      <button
        className="primary-action"
        type="button"
        disabled={isRunning}
        onClick={() => runAgent(nodeId, { skipHistory: false })}
      >
        {isRunning ? '运行中...' : '运行'}
      </button>
      <button
        className="secondary-action"
        type="button"
        disabled={isRunning}
        onClick={() => runAgent(nodeId, { skipHistory: true })}
      >
        {isRunning ? '运行中...' : '不增加对话历史运行'}
      </button>
      <button type="button" onClick={() => resetAgentMemory(nodeId)}>
        重置记忆
      </button>

      <div className="history-panel">
        <header>
          <span>选择对话历史</span>
          <button type="button" onClick={() => createAgentHistory(nodeId)}>
            新建历史
          </button>
        </header>

        <ul>
          {runtime.histories.map((history) => (
            <li key={history.id}>
              <button
                className={history.id === runtime.activeHistoryId ? 'active' : ''}
                type="button"
                onClick={() => switchAgentHistory(nodeId, history.id)}
              >
                <span>{history.name}</span>
                <small>{history.records.length} 条</small>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="memory-panel">
        <header>
          <span>当前历史记忆</span>
          <small>{currentHistory.records.length} 条</small>
        </header>

        {currentHistory.records.length === 0 ? (
          <p className="empty-memory">当前历史还没有记录。</p>
        ) : (
          <ul>
            {currentHistory.records.map((record) => (
              <li key={record.id}>
                <span className={record.role === 'input' ? 'role-in' : 'role-out'}>
                  {record.role === 'input' ? '输入' : '输出'}
                </span>
                <p>{record.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

const DataCellContextMenu = ({ nodeId }: { nodeId: string }) => {
  const task = useWorkbenchStore((state) =>
    state.tasks.find((item) => item.id === state.activeTaskId),
  )!
  const dataCell = task.nodes.find((node) => node.id === nodeId) as DataCellNode

  const addStackItem = useWorkbenchStore((state) => state.addStackItem)
  const updateStackItem = useWorkbenchStore((state) => state.updateStackItem)
  const copyStackItem = useWorkbenchStore((state) => state.copyStackItem)
  const pasteStackItem = useWorkbenchStore((state) => state.pasteStackItem)
  const deleteStackItem = useWorkbenchStore((state) => state.deleteStackItem)
  const moveStackItem = useWorkbenchStore((state) => state.moveStackItem)

  return (
    <section className="context-content">
      <div className="data-header">
        <h3>数据格管理</h3>
        <button type="button" onClick={() => addStackItem(nodeId)}>
          新增数据
        </button>
      </div>

      <ul className="stack-editor-list">
        {dataCell.data.stack.map((item, index) => (
          <li key={item.id}>
            <label>
              <span>#{index + 1}</span>
              <textarea
                value={item.content}
                onChange={(event) =>
                  updateStackItem(nodeId, item.id, event.target.value)
                }
              />
            </label>
            <div className="row-actions">
              <button type="button" onClick={() => copyStackItem(nodeId, item.id)}>
                复制
              </button>
              <button type="button" onClick={() => pasteStackItem(nodeId, item.id)}>
                粘贴
              </button>
              <button type="button" onClick={() => deleteStackItem(nodeId, item.id)}>
                删除
              </button>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveStackItem(nodeId, item.id, 'up')}
              >
                上移
              </button>
              <button
                type="button"
                disabled={index === dataCell.data.stack.length - 1}
                onClick={() => moveStackItem(nodeId, item.id, 'down')}
              >
                下移
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

const CanvasContextMenu = ({
  flowX,
  flowY,
}: {
  flowX: number
  flowY: number
}) => {
  const addNodeAt = useWorkbenchStore((state) => state.addNodeAt)

  return (
    <section className="context-content">
      <h3>新增组件</h3>
      <button
        className="primary-action"
        type="button"
        onClick={() => addNodeAt('agent', flowX, flowY)}
      >
        在此处新增 Agent
      </button>
      <button
        className="secondary-action"
        type="button"
        onClick={() => addNodeAt('dataCell', flowX, flowY)}
      >
        在此处新增 数据格
      </button>
    </section>
  )
}

export const NodeContextMenu = () => {
  const contextMenu = useWorkbenchStore((state) => state.contextMenu)
  const closeContextMenu = useWorkbenchStore((state) => state.closeContextMenu)
  const actionFeedback = useWorkbenchStore((state) => state.actionFeedback)
  const clearActionFeedback = useWorkbenchStore((state) => state.clearActionFeedback)

  useEffect(() => {
    if (!actionFeedback) {
      return
    }

    const timer = window.setTimeout(() => {
      clearActionFeedback()
    }, 1400)

    return () => {
      window.clearTimeout(timer)
    }
  }, [actionFeedback, clearActionFeedback])

  if (!contextMenu) {
    return null
  }

  return (
    <div className="context-overlay" onClick={closeContextMenu}>
      <aside
        className="context-menu"
        style={{ left: contextMenu.x, top: contextMenu.y }}
        onClick={(event) => event.stopPropagation()}
      >
        {actionFeedback ? (
          <p key={actionFeedback.id} className="action-feedback">
            {actionFeedback.message}
          </p>
        ) : null}

        {contextMenu.kind === 'agent' ? <AgentContextMenu nodeId={contextMenu.nodeId} /> : null}
        {contextMenu.kind === 'dataCell' ? (
          <DataCellContextMenu nodeId={contextMenu.nodeId} />
        ) : null}
        {contextMenu.kind === 'canvas' ? (
          <CanvasContextMenu flowX={contextMenu.flowX} flowY={contextMenu.flowY} />
        ) : null}
      </aside>
    </div>
  )
}
