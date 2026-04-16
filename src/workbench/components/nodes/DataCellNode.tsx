import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useEffect, useRef, useState } from 'react'
import { useWorkbenchStore } from '../../store/useWorkbenchStore'
import type { DataCellNode as DataCellFlowNode } from '../../domain/types'

export const DataCellNodeView = ({
  id,
  data,
}: NodeProps<DataCellFlowNode>) => {
  const renameNode = useWorkbenchStore((state) => state.renameNode)
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
    <article className="node-card data-cell-node">
      <Handle
        id="stackIn"
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
        <span>数据格</span>
      </header>

      <p>数据条数: {data.stack.length}</p>
      <p>栈顶: {data.stack[data.stack.length - 1]?.content ?? '(空)'}</p>

      <Handle
        id="stackOut"
        type="source"
        position={Position.Right}
        className="port port-output"
      />
    </article>
  )
}
