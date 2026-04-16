import type { AgentChatRecord, AgentRuntimeState, FlowNode, StackItem } from './types'

export const renameNodeLabel = (
  nodes: FlowNode[],
  nodeId: string,
  label: string,
): FlowNode[] =>
  nodes.map((node) => {
    if (node.id !== nodeId) {
      return node
    }

    if (node.type === 'agent') {
      return {
        ...node,
        data: {
          ...node.data,
          label,
        },
      }
    }

    return {
      ...node,
      data: {
        ...node.data,
        label,
      },
    }
  })

export const appendToDataCellsStack = (
  nodes: FlowNode[],
  dataCellIds: Set<string>,
  createItem: () => StackItem,
): FlowNode[] =>
  nodes.map((node) => {
    if (node.type !== 'dataCell' || !dataCellIds.has(node.id)) {
      return node
    }

    return {
      ...node,
      data: {
        ...node.data,
        stack: [...node.data.stack, createItem()],
      },
    }
  })

export const updateDataCellStackItemContent = (
  nodes: FlowNode[],
  dataCellId: string,
  itemId: string,
  content: string,
): FlowNode[] =>
  nodes.map((node) => {
    if (node.id !== dataCellId || node.type !== 'dataCell') {
      return node
    }

    return {
      ...node,
      data: {
        ...node.data,
        stack: node.data.stack.map((item) =>
          item.id === itemId ? { ...item, content } : item,
        ),
      },
    }
  })

export const addDataCellStackItem = (
  nodes: FlowNode[],
  dataCellId: string,
  item: StackItem,
): FlowNode[] =>
  nodes.map((node) => {
    if (node.id !== dataCellId || node.type !== 'dataCell') {
      return node
    }

    return {
      ...node,
      data: {
        ...node.data,
        stack: [...node.data.stack, item],
      },
    }
  })

export const insertDataCellStackItemAfter = (
  nodes: FlowNode[],
  dataCellId: string,
  itemId: string,
  item: StackItem,
): FlowNode[] =>
  nodes.map((node) => {
    if (node.id !== dataCellId || node.type !== 'dataCell') {
      return node
    }

    const index = node.data.stack.findIndex((stackItem) => stackItem.id === itemId)
    const nextStack = [...node.data.stack]
    nextStack.splice(index + 1, 0, item)

    return {
      ...node,
      data: {
        ...node.data,
        stack: nextStack,
      },
    }
  })

export const deleteDataCellStackItem = (
  nodes: FlowNode[],
  dataCellId: string,
  itemId: string,
): FlowNode[] =>
  nodes.map((node) => {
    if (node.id !== dataCellId || node.type !== 'dataCell') {
      return node
    }

    return {
      ...node,
      data: {
        ...node.data,
        stack: node.data.stack.filter((item) => item.id !== itemId),
      },
    }
  })

export const moveDataCellStackItem = (
  nodes: FlowNode[],
  dataCellId: string,
  itemId: string,
  direction: 'up' | 'down',
): FlowNode[] =>
  nodes.map((node) => {
    if (node.id !== dataCellId || node.type !== 'dataCell') {
      return node
    }

    const index = node.data.stack.findIndex((item) => item.id === itemId)
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const nextStack = [...node.data.stack]
    const current = nextStack[index]
    nextStack[index] = nextStack[swapIndex]
    nextStack[swapIndex] = current

    return {
      ...node,
      data: {
        ...node.data,
        stack: nextStack,
      },
    }
  })

export const clearAgentMemory = (runtime: AgentRuntimeState): AgentRuntimeState => ({
  ...runtime,
  histories: runtime.histories.map((history) => ({
    ...history,
    records: [],
  })),
})

export const switchRuntimeHistory = (
  runtime: AgentRuntimeState,
  historyId: string,
): AgentRuntimeState => ({
  ...runtime,
  activeHistoryId: historyId,
})

export const createRuntimeHistory = (
  runtime: AgentRuntimeState,
  historyId: string,
  historyName: string,
): AgentRuntimeState => ({
  activeHistoryId: historyId,
  histories: [
    ...runtime.histories,
    {
      id: historyId,
      name: historyName,
      records: [],
    },
  ],
})

export const appendActiveHistoryRecords = (
  runtime: AgentRuntimeState,
  records: AgentChatRecord[],
): AgentRuntimeState => ({
  ...runtime,
  histories: runtime.histories.map((history) => {
    if (history.id !== runtime.activeHistoryId) {
      return history
    }

    return {
      ...history,
      records: [...history.records, ...records],
    }
  }),
})
