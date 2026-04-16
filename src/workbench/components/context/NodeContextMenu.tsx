import { useEffect, useState } from 'react'
import { useWorkbenchStore } from '../../store/useWorkbenchStore'
import type { DataCellNode, FlowNode } from '../../domain/types'

const RenameNodePanel = ({
  nodeId,
  currentLabel,
}: {
  nodeId: string
  currentLabel: string
}) => {
  const renameNode = useWorkbenchStore((state) => state.renameNode)
  const [draftLabel, setDraftLabel] = useState(currentLabel)

  const commitRename = () => {
    renameNode(nodeId, draftLabel)
  }

  return (
    <section className="rename-panel">
      <h4>重命名组件</h4>
      <div className="rename-row">
        <input
          value={draftLabel}
          onChange={(event) => setDraftLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commitRename()
            }
          }}
        />
        <button type="button" onClick={commitRename}>
          保存名称
        </button>
      </div>
    </section>
  )
}

const AgentContextMenu = ({
  nodeId,
  title = 'Agent 操作',
}: {
  nodeId: string
  title?: string
}) => {
  const task = useWorkbenchStore((state) =>
    state.tasks.find((item) => item.id === state.activeTaskId),
  )!
  const agentNode = task.nodes.find((node) => node.id === nodeId && node.type === 'agent')!

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
      <h3>{title}</h3>
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
      <RenameNodePanel nodeId={nodeId} currentLabel={agentNode.data.label} />

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

const DataCellContextMenu = ({
  nodeId,
  title = '数据格管理',
}: {
  nodeId: string
  title?: string
}) => {
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
        <h3>{title}</h3>
        <button type="button" onClick={() => addStackItem(nodeId)}>
          新增数据
        </button>
      </div>
      <RenameNodePanel nodeId={nodeId} currentLabel={dataCell.data.label} />

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

const MultiNodeContextMenu = ({ nodeIds }: { nodeIds: string[] }) => {
  const task = useWorkbenchStore((state) =>
    state.tasks.find((item) => item.id === state.activeTaskId),
  )!

  const nodes = nodeIds
    .map((nodeId) => task.nodes.find((node) => node.id === nodeId))
    .filter(Boolean) as FlowNode[]

  return (
    <section className="context-content">
      <h3>多选组件菜单</h3>
      <p className="empty-memory">已选中 {nodes.length} 个组件</p>

      <div className="multi-node-menu-list">
        {nodes.map((node) => (
          <div className="multi-node-menu-item" key={node.id}>
            {node.type === 'agent' ? (
              <AgentContextMenu nodeId={node.id} title={`Agent 操作 · ${node.data.label}`} />
            ) : (
              <DataCellContextMenu
                nodeId={node.id}
                title={`数据格管理 · ${node.data.label}`}
              />
            )}
          </div>
        ))}
      </div>
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

const EdgeContextMenu = ({ edgeId }: { edgeId: string }) => {
  const deleteEdge = useWorkbenchStore((state) => state.deleteEdge)

  return (
    <section className="context-content">
      <h3>连线操作</h3>
      <button
        className="primary-action"
        type="button"
        onClick={() => deleteEdge(edgeId)}
      >
        删除这条连线
      </button>
      <p className="empty-memory">提示：拖动组件端口即可新增连线。</p>
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
        {contextMenu.kind === 'edge' ? <EdgeContextMenu edgeId={contextMenu.edgeId} /> : null}
        {contextMenu.kind === 'multiNode' ? (
          <MultiNodeContextMenu nodeIds={contextMenu.nodeIds} />
        ) : null}
      </aside>
    </div>
  )
}
