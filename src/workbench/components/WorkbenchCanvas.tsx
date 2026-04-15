import {
  Background,
  Controls,
  MiniMap,
  PanOnScrollMode,
  ReactFlow,
  type ReactFlowInstance,
  type NodeTypes,
} from '@xyflow/react'
import { useState } from 'react'
import '@xyflow/react/dist/style.css'
import { AgentNodeView } from './nodes/AgentNode'
import { DataCellNodeView } from './nodes/DataCellNode'
import { NodeContextMenu } from './context/NodeContextMenu'
import { useWorkbenchStore } from '../store/useWorkbenchStore'
import type { FlowEdge, FlowNode } from '../domain/types'

const nodeTypes: NodeTypes = {
  agent: AgentNodeView,
  dataCell: DataCellNodeView,
}

export const WorkbenchCanvas = () => {
  const activeTask = useWorkbenchStore((state) =>
    state.tasks.find((task) => task.id === state.activeTaskId),
  )!
  const onNodesChange = useWorkbenchStore((state) => state.onNodesChange)
  const onEdgesChange = useWorkbenchStore((state) => state.onEdgesChange)
  const onConnect = useWorkbenchStore((state) => state.onConnect)
  const isValidConnection = useWorkbenchStore((state) => state.isValidConnection)
  const closeContextMenu = useWorkbenchStore((state) => state.closeContextMenu)
  const addNode = useWorkbenchStore((state) => state.addNode)
  const openContextMenu = useWorkbenchStore((state) => state.openContextMenu)
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<
    FlowNode,
    FlowEdge
  > | null>(null)

  return (
    <section className="canvas-shell">
      <header className="canvas-toolbar">
        <button type="button" onClick={() => addNode('agent')}>
          + Agent
        </button>
        <button type="button" onClick={() => addNode('dataCell')}>
          + 数据格
        </button>
      </header>

      <ReactFlow
        nodes={activeTask.nodes}
        edges={activeTask.edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        zoomOnScroll={false}
        zoomOnPinch
        panOnDrag
        onInit={setFlowInstance}
        onPaneClick={closeContextMenu}
        onPaneContextMenu={(event) => {
          event.preventDefault()
          if (!flowInstance) {
            return
          }

          const flowPosition = flowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          })

          openContextMenu({
            kind: 'canvas',
            x: event.clientX,
            y: event.clientY,
            flowX: flowPosition.x,
            flowY: flowPosition.y,
          })
        }}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={30} size={1.2} color="rgba(10, 19, 29, 0.16)" />
        <MiniMap pannable />
        <Controls />
      </ReactFlow>

      <NodeContextMenu />
    </section>
  )
}
