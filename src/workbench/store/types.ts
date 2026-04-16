import type { Connection, EdgeChange, NodeChange } from '@xyflow/react'
import type {
  ContextMenuState,
  FlowEdge,
  FlowNode,
  TaskModel,
} from '../domain/types'

export type RunAgentOptions = {
  skipHistory: boolean
}

export type ActionFeedback = {
  id: string
  message: string
}

export type WorkbenchState = {
  tasks: TaskModel[]
  activeTaskId: string
  taskSearch: string
  contextMenu: ContextMenuState | null
  stackClipboard: string
  runningAgentIds: Record<string, boolean>
  actionFeedback: ActionFeedback | null
  setTaskSearch: (value: string) => void
  selectTask: (taskId: string) => void
  clearActionFeedback: () => void
  addTask: () => void
  addNode: (type: 'agent' | 'dataCell') => void
  addNodeAt: (type: 'agent' | 'dataCell', x: number, y: number) => void
  renameNode: (nodeId: string, label: string) => void
  deleteEdge: (edgeId: string) => void
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  isValidConnection: (connection: Connection | FlowEdge) => boolean
  onConnect: (connection: Connection) => void
  openContextMenu: (context: ContextMenuState) => void
  closeContextMenu: () => void
  runAgent: (agentId: string, options: RunAgentOptions) => Promise<void>
  resetAgentMemory: (agentId: string) => void
  switchAgentHistory: (agentId: string, historyId: string) => void
  createAgentHistory: (agentId: string) => void
  updateStackItem: (dataCellId: string, itemId: string, content: string) => void
  addStackItem: (dataCellId: string) => void
  copyStackItem: (dataCellId: string, itemId: string) => void
  pasteStackItem: (dataCellId: string, itemId: string) => void
  deleteStackItem: (dataCellId: string, itemId: string) => void
  moveStackItem: (
    dataCellId: string,
    itemId: string,
    direction: 'up' | 'down',
  ) => void
}
