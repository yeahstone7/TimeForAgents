import type { AgentRuntimeState, DataCellNode, FlowNode, TaskModel } from './types'

let sequence = 0

export const makeId = (prefix: string) => `${prefix}_${Date.now()}_${sequence++}`

const createDefaultAgentState = (): AgentRuntimeState => {
  const historyId = makeId('history')

  return {
    activeHistoryId: historyId,
    histories: [
      {
        id: historyId,
        name: '默认历史',
        records: [],
      },
    ],
  }
}

const createDataCellNode = (
  label: string,
  x: number,
  y: number,
  stackSeed?: string,
): DataCellNode => ({
  id: makeId('dataCell'),
  type: 'dataCell',
  position: { x, y },
  data: {
    label,
    stack: stackSeed
      ? [
          {
            id: makeId('stack'),
            content: stackSeed,
            createdAt: Date.now(),
          },
        ]
      : [],
  },
})

export const createTask = (name: string): TaskModel => {
  const inputCell = createDataCellNode('输入数据格', 80, 160, '请解释这个任务的目标')
  const outputCell = createDataCellNode('输出数据格', 740, 160)

  const agentId = makeId('agent')
  const agentNode: FlowNode = {
    id: agentId,
    type: 'agent',
    position: { x: 420, y: 180 },
    data: { label: 'Agent A' },
  }

  return {
    id: makeId('task'),
    name,
    nodes: [inputCell, agentNode, outputCell],
    edges: [
      {
        id: makeId('edge'),
        source: inputCell.id,
        target: agentNode.id,
        sourceHandle: 'stackOut',
        targetHandle: 'input',
      },
      {
        id: makeId('edge'),
        source: agentNode.id,
        target: outputCell.id,
        sourceHandle: 'output',
        targetHandle: 'stackIn',
      },
    ],
    agentStates: {
      [agentId]: createDefaultAgentState(),
    },
  }
}

export const createAgentNode = (label: string, x: number, y: number): FlowNode => ({
  id: makeId('agent'),
  type: 'agent',
  position: { x, y },
  data: { label },
})

export const createDataNode = (label: string, x: number, y: number): FlowNode =>
  createDataCellNode(label, x, y)

export const createAgentState = () => createDefaultAgentState()
