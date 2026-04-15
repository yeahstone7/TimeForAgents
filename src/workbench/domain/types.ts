import type { Edge, Node } from '@xyflow/react'

export type StackItem = {
  id: string
  content: string
  createdAt: number
}

export type AgentChatRecord = {
  id: string
  role: 'input' | 'output'
  content: string
  createdAt: number
}

export type AgentHistory = {
  id: string
  name: string
  records: AgentChatRecord[]
}

export type AgentRuntimeState = {
  activeHistoryId: string
  histories: AgentHistory[]
}

export type AgentNodeData = {
  label: string
}

export type DataCellNodeData = {
  label: string
  stack: StackItem[]
}

export type AgentNode = Node<AgentNodeData, 'agent'>
export type DataCellNode = Node<DataCellNodeData, 'dataCell'>

export type FlowNode = AgentNode | DataCellNode
export type FlowEdge = Edge

export type TaskModel = {
  id: string
  name: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  agentStates: Record<string, AgentRuntimeState>
}

export type ContextMenuState =
  | {
      kind: 'agent'
      nodeId: string
      x: number
      y: number
    }
  | {
      kind: 'dataCell'
      nodeId: string
      x: number
      y: number
    }
  | {
      kind: 'canvas'
      x: number
      y: number
      flowX: number
      flowY: number
    }
