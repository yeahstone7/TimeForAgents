import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useWorkbenchStore } from '../../store/useWorkbenchStore'
import type { AgentNode as AgentFlowNode } from '../../domain/types'

export const AgentNodeView = ({ id, data }: NodeProps<AgentFlowNode>) => {
  const openContextMenu = useWorkbenchStore((state) => state.openContextMenu)

  const runtime = useWorkbenchStore((state) => {
    const task = state.tasks.find((item) => item.id === state.activeTaskId)!
    return task.agentStates[id]
  })
  const currentHistory = runtime.histories.find(
    (item) => item.id === runtime.activeHistoryId,
  )!

  return (
    <article
      className="node-card agent-node"
      onContextMenu={(event) => {
        event.preventDefault()
        openContextMenu({
          kind: 'agent',
          nodeId: id,
          x: event.clientX,
          y: event.clientY,
        })
      }}
    >
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        className="port port-input"
      />

      <header>
        <strong>{data.label}</strong>
        <span>Agent</span>
      </header>

      <p>当前历史: {currentHistory.name}</p>
      <p>记忆条数: {currentHistory.records.length}</p>

      <Handle
        id="output"
        type="source"
        position={Position.Right}
        className="port port-output"
      />
    </article>
  )
}
