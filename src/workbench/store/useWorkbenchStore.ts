import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react'
import { create } from 'zustand'
import {
  createAgentNode,
  createAgentState,
  createDataNode,
  createTask,
  makeId,
} from '../domain/factories'
import type {
  AgentChatRecord,
  AgentHistory,
  ContextMenuState,
  DataCellNode,
  FlowEdge,
  FlowNode,
  StackItem,
  TaskModel,
} from '../domain/types'
import { runAgentModel } from '../runtime/runAgentModel'

type RunAgentOptions = {
  skipHistory: boolean
}

type ActionFeedback = {
  id: string
  message: string
}

type WorkbenchState = {
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

const replaceTask = (
  tasks: TaskModel[],
  activeTaskId: string,
  nextTask: TaskModel,
) => tasks.map((task) => (task.id === activeTaskId ? nextTask : task))

const findActiveTask = (state: WorkbenchState) =>
  state.tasks.find((task) => task.id === state.activeTaskId)!

const findDataCell = (task: TaskModel, nodeId: string) =>
  task.nodes.find((node) => node.id === nodeId && node.type === 'dataCell') as DataCellNode

const findHistory = (task: TaskModel, agentId: string): AgentHistory => {
  const runtime = task.agentStates[agentId]
  return runtime.histories.find((history) => history.id === runtime.activeHistoryId)!
}

const makeStackItem = (content: string): StackItem => ({
  id: makeId('stack'),
  content,
  createdAt: Date.now(),
})

const makeRecord = (
  role: AgentChatRecord['role'],
  content: string,
): AgentChatRecord => ({
  id: makeId('record'),
  role,
  content,
  createdAt: Date.now(),
})

const makeFeedback = (message: string): ActionFeedback => ({
  id: makeId('feedback'),
  message,
})

const initialTask = createTask('任务 1')

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  tasks: [initialTask],
  activeTaskId: initialTask.id,
  taskSearch: '',
  contextMenu: null,
  stackClipboard: '',
  runningAgentIds: {},
  actionFeedback: null,

  setTaskSearch: (value) => set({ taskSearch: value }),

  selectTask: (taskId) => set({ activeTaskId: taskId, contextMenu: null }),

  clearActionFeedback: () => set({ actionFeedback: null }),

  addTask: () =>
    set((state) => {
      const nextTask = createTask(`任务 ${state.tasks.length + 1}`)
      return {
        tasks: [...state.tasks, nextTask],
        activeTaskId: nextTask.id,
        contextMenu: null,
        actionFeedback: makeFeedback(`已创建 ${nextTask.name}`),
      }
    }),

  addNode: (type) =>
    get().addNodeAt(type, 320, type === 'agent' ? 120 : 300),

  addNodeAt: (type, x, y) =>
    set((state) => {
      const activeTask = findActiveTask(state)
      const nextNode =
        type === 'agent'
          ? createAgentNode(
              `Agent ${Object.keys(activeTask.agentStates).length + 1}`,
              x,
              y,
            )
          : createDataNode(
              `数据格 ${
                activeTask.nodes.filter((node) => node.type === 'dataCell').length + 1
              }`,
              x,
              y,
            )

      const nextTask: TaskModel = {
        ...activeTask,
        nodes: [...activeTask.nodes, nextNode],
        agentStates:
          type === 'agent'
            ? {
                ...activeTask.agentStates,
                [nextNode.id]: createAgentState(),
              }
            : activeTask.agentStates,
      }

      return {
        tasks: replaceTask(state.tasks, state.activeTaskId, nextTask),
        contextMenu: null,
        actionFeedback: makeFeedback(
          type === 'agent' ? '已添加 Agent' : '已添加数据格',
        ),
      }
    }),

  onNodesChange: (changes) =>
    set((state) => {
      const activeTask = findActiveTask(state)
      const nextTask: TaskModel = {
        ...activeTask,
        nodes: applyNodeChanges(changes, activeTask.nodes),
      }
      return { tasks: replaceTask(state.tasks, state.activeTaskId, nextTask) }
    }),

  onEdgesChange: (changes) =>
    set((state) => {
      const activeTask = findActiveTask(state)
      const nextTask: TaskModel = {
        ...activeTask,
        edges: applyEdgeChanges(changes, activeTask.edges),
      }
      return { tasks: replaceTask(state.tasks, state.activeTaskId, nextTask) }
    }),

  isValidConnection: (connection) => {
    const state = get()
    const task = findActiveTask(state)
    const sourceId = connection.source
    const targetId = connection.target

    if (!sourceId || !targetId) {
      return false
    }

    const sourceNode = task.nodes.find((node) => node.id === sourceId)!
    const targetNode = task.nodes.find((node) => node.id === targetId)!

    const isDataToAgent =
      sourceNode.type === 'dataCell' &&
      targetNode.type === 'agent' &&
      connection.sourceHandle === 'stackOut' &&
      connection.targetHandle === 'input'

    const isAgentToData =
      sourceNode.type === 'agent' &&
      targetNode.type === 'dataCell' &&
      connection.sourceHandle === 'output' &&
      connection.targetHandle === 'stackIn'

    if (!isDataToAgent && !isAgentToData) {
      return false
    }

    if (isDataToAgent) {
      return !task.edges.some(
        (edge) => edge.target === targetId && edge.targetHandle === 'input',
      )
    }

    return !task.edges.some(
      (edge) => edge.source === sourceId && edge.sourceHandle === 'output',
    )
  },

  onConnect: (connection) =>
    set((state) => {
      const activeTask = findActiveTask(state)
      const nextTask: TaskModel = {
        ...activeTask,
        edges: addEdge(
          {
            ...connection,
            id: makeId('edge'),
            animated: true,
          },
          activeTask.edges,
        ),
      }

      return { tasks: replaceTask(state.tasks, state.activeTaskId, nextTask) }
    }),

  openContextMenu: (context) => set({ contextMenu: context }),

  closeContextMenu: () => set({ contextMenu: null }),

  runAgent: async (agentId, options) => {
    set((state) => ({
      runningAgentIds: {
        ...state.runningAgentIds,
        [agentId]: true,
      },
      actionFeedback: makeFeedback(
        options.skipHistory ? '正在运行（不写入历史）...' : '正在运行...',
      ),
    }))

    const state = get()
    const task = findActiveTask(state)
    const inputEdge = task.edges.find(
      (edge) => edge.target === agentId && edge.targetHandle === 'input',
    )!

    const inputCell = findDataCell(task, inputEdge.source)
    const topInput = inputCell.data.stack[inputCell.data.stack.length - 1]
    const activeHistory = findHistory(task, agentId)
    const agentNode = task.nodes.find((node) => node.id === agentId && node.type === 'agent')!

    try {
      const modelOutput = await runAgentModel({
        agentLabel: agentNode.data.label,
        userInput: topInput?.content ?? '',
        history: activeHistory,
      })

      set((nextState) => {
        const latestTask = findActiveTask(nextState)
        const latestOutputEdge = latestTask.edges.find(
          (edge) => edge.source === agentId && edge.sourceHandle === 'output',
        )!
        const outputCell = findDataCell(latestTask, latestOutputEdge.target)

        const nextNodes = latestTask.nodes.map((node) => {
          if (node.id !== outputCell.id || node.type !== 'dataCell') {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              stack: [...node.data.stack, makeStackItem(modelOutput)],
            },
          }
        })

        const latestTopInput = topInput?.content ?? ''
        const nextRuntime = options.skipHistory
          ? latestTask.agentStates[agentId]
          : {
              ...latestTask.agentStates[agentId],
              histories: latestTask.agentStates[agentId].histories.map((history) => {
                if (history.id !== latestTask.agentStates[agentId].activeHistoryId) {
                  return history
                }

                return {
                  ...history,
                  records: [
                    ...history.records,
                    makeRecord('input', latestTopInput),
                    makeRecord('output', modelOutput),
                  ],
                }
              }),
            }

        const nextTask: TaskModel = {
          ...latestTask,
          nodes: nextNodes,
          agentStates: {
            ...latestTask.agentStates,
            [agentId]: nextRuntime,
          },
        }

        return {
          tasks: replaceTask(nextState.tasks, nextState.activeTaskId, nextTask),
          contextMenu: null,
          runningAgentIds: {
            ...nextState.runningAgentIds,
            [agentId]: false,
          },
          actionFeedback: makeFeedback(
            options.skipHistory
              ? '运行完成（未写入历史）'
              : '运行完成，结果已写入数据格',
          ),
        }
      })
    } catch (error) {
      set((nextState) => {
        const latestTask = findActiveTask(nextState)
        const latestOutputEdge = latestTask.edges.find(
          (edge) => edge.source === agentId && edge.sourceHandle === 'output',
        )!
        const outputCell = findDataCell(latestTask, latestOutputEdge.target)
        const failReason = error instanceof Error ? error.message : String(error)
        const failOutput = `[运行失败] ${failReason}`

        const nextNodes = latestTask.nodes.map((node) => {
          if (node.id !== outputCell.id || node.type !== 'dataCell') {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              stack: [...node.data.stack, makeStackItem(failOutput)],
            },
          }
        })

        const nextTask: TaskModel = {
          ...latestTask,
          nodes: nextNodes,
        }

        return {
          tasks: replaceTask(nextState.tasks, nextState.activeTaskId, nextTask),
          runningAgentIds: {
            ...nextState.runningAgentIds,
            [agentId]: false,
          },
          actionFeedback: makeFeedback('运行失败，错误已写入输出数据格'),
        }
      })
    }
  },

  resetAgentMemory: (agentId) =>
    set((state) => {
      const task = findActiveTask(state)
      const runtime = task.agentStates[agentId]

      const nextTask: TaskModel = {
        ...task,
        agentStates: {
          ...task.agentStates,
          [agentId]: {
            ...runtime,
            histories: runtime.histories.map((history) => ({
              ...history,
              records: [],
            })),
          },
        },
      }

      return {
        tasks: replaceTask(state.tasks, state.activeTaskId, nextTask),
        contextMenu: null,
        actionFeedback: makeFeedback('记忆已重置'),
      }
    }),

  switchAgentHistory: (agentId, historyId) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        agentStates: {
          ...task.agentStates,
          [agentId]: {
            ...task.agentStates[agentId],
            activeHistoryId: historyId,
          },
        },
      }

      const historyName =
        task.agentStates[agentId].histories.find((history) => history.id === historyId)
          ?.name ?? '目标历史'

      return {
        tasks: replaceTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback(`已切换到 ${historyName}`),
      }
    }),

  createAgentHistory: (agentId) =>
    set((state) => {
      const task = findActiveTask(state)
      const runtime = task.agentStates[agentId]
      const historyId = makeId('history')

      const nextTask: TaskModel = {
        ...task,
        agentStates: {
          ...task.agentStates,
          [agentId]: {
            activeHistoryId: historyId,
            histories: [
              ...runtime.histories,
              {
                id: historyId,
                name: `历史 ${runtime.histories.length + 1}`,
                records: [],
              },
            ],
          },
        },
      }

      return {
        tasks: replaceTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback(`已新建 历史 ${runtime.histories.length + 1}`),
      }
    }),

  updateStackItem: (dataCellId, itemId, content) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        nodes: task.nodes.map((node) => {
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
        }),
      }

      return {
        tasks: replaceTask(state.tasks, state.activeTaskId, nextTask),
      }
    }),

  addStackItem: (dataCellId) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        nodes: task.nodes.map((node) => {
          if (node.id !== dataCellId || node.type !== 'dataCell') {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              stack: [...node.data.stack, makeStackItem('新数据')],
            },
          }
        }),
      }

      return {
        tasks: replaceTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback('已新增数据'),
      }
    }),

  copyStackItem: (dataCellId, itemId) =>
    set((state) => {
      const task = findActiveTask(state)
      const dataCell = findDataCell(task, dataCellId)
      const item = dataCell.data.stack.find((value) => value.id === itemId)!

      return {
        stackClipboard: item.content,
        actionFeedback: makeFeedback('已复制'),
      }
    }),

  pasteStackItem: (dataCellId, itemId) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        nodes: task.nodes.map((node) => {
          if (node.id !== dataCellId || node.type !== 'dataCell') {
            return node
          }

          const index = node.data.stack.findIndex((item) => item.id === itemId)
          const nextStack = [...node.data.stack]
          nextStack.splice(index + 1, 0, makeStackItem(state.stackClipboard))

          return {
            ...node,
            data: {
              ...node.data,
              stack: nextStack,
            },
          }
        }),
      }

      return {
        tasks: replaceTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback('已粘贴'),
      }
    }),

  deleteStackItem: (dataCellId, itemId) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        nodes: task.nodes.map((node) => {
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
        }),
      }

      return {
        tasks: replaceTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback('已删除'),
      }
    }),

  moveStackItem: (dataCellId, itemId, direction) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        nodes: task.nodes.map((node) => {
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
        }),
      }

      return {
        tasks: replaceTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback(direction === 'up' ? '已上移' : '已下移'),
      }
    }),
}))
