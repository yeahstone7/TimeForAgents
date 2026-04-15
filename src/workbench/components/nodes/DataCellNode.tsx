import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useWorkbenchStore } from '../../store/useWorkbenchStore'
import type { DataCellNode as DataCellFlowNode } from '../../domain/types'

export const DataCellNodeView = ({
  id,
  data,
}: NodeProps<DataCellFlowNode>) => {
  const openContextMenu = useWorkbenchStore((state) => state.openContextMenu)

  return (
    <article
      className="node-card data-cell-node"
      onContextMenu={(event) => {
        event.preventDefault()
        openContextMenu({
          kind: 'dataCell',
          nodeId: id,
          x: event.clientX,
          y: event.clientY,
        })
      }}
    >
      <Handle
        id="stackIn"
        type="target"
        position={Position.Left}
        className="port port-input"
      />

      <header>
        <strong>{data.label}</strong>
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
