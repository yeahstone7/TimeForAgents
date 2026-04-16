import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useEffect, useRef, useState } from 'react'
import { useWorkbenchStore } from '../../store/useWorkbenchStore'
import type { AgentNode as AgentFlowNode } from '../../domain/types'

export const AgentNodeView = ({ id, data }: NodeProps<AgentFlowNode>) => {
  const renameNode = useWorkbenchStore((state) => state.renameNode)
  const runtime = useWorkbenchStore((state) => {
    const task = state.tasks.find((item) => item.id === state.activeTaskId)!
    return task.agentStates[id]
  })
  const currentHistory = runtime.histories.find(
    (item) => item.id === runtime.activeHistoryId,
  )!
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data.label)

  useEffect(() => {
    if (!isEditingLabel) {
      return
    }

    titleInputRef.current?.focus()
    titleInputRef.current?.select()
  }, [isEditingLabel])

  const commitRename = () => {
    renameNode(id, draftLabel)
    setIsEditingLabel(false)
  }

  return (
    <article className="node-card agent-node">
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        className="port port-input"
      />

      <header>
        {isEditingLabel ? (
          <input
            ref={titleInputRef}
            className="node-title-input nodrag"
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitRename()
              }
              if (event.key === 'Escape') {
                setDraftLabel(data.label)
                setIsEditingLabel(false)
              }
            }}
          />
        ) : (
          <strong
            className="node-title"
            onDoubleClick={(event) => {
              event.stopPropagation()
              setDraftLabel(data.label)
              setIsEditingLabel(true)
            }}
            title="双击重命名"
          >
            {data.label}
          </strong>
        )}
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
