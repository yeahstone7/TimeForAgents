import type { StateCreator } from 'zustand'
import {
  appendActiveHistoryRecords,
  appendToDataCellsStack,
  clearAgentMemory,
  createRuntimeHistory,
  switchRuntimeHistory,
} from '../../domain/commands'
import { makeId } from '../../domain/factories'
import {
  findActiveTask,
  findAgentNode,
  findDataCell,
  findHistory,
  replaceActiveTask,
} from '../../domain/selectors'
import type { TaskModel } from '../../domain/types'
import { runAgentModel } from '../../runtime/runAgentModel'
import { makeFeedback, makeRecord, makeStackItem } from '../helpers'
import type { WorkbenchState } from '../types'

type AgentSlice = Pick<
  WorkbenchState,
  'runAgent' | 'resetAgentMemory' | 'switchAgentHistory' | 'createAgentHistory'
>

export const createAgentSlice: StateCreator<WorkbenchState, [], [], AgentSlice> = (
  set,
  get,
) => ({
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
    const agentNode = findAgentNode(task, agentId)

    try {
      const modelOutput = await runAgentModel({
        agentLabel: agentNode.data.label,
        userInput: topInput?.content ?? '',
        history: activeHistory,
      })

      set((nextState) => {
        const latestTask = findActiveTask(nextState)
        const outputCellIds = new Set(
          latestTask.edges
            .filter((edge) => edge.source === agentId && edge.sourceHandle === 'output')
            .map((edge) => edge.target),
        )

        const nextNodes = appendToDataCellsStack(
          latestTask.nodes,
          outputCellIds,
          () => makeStackItem(modelOutput),
        )

        const latestTopInput = topInput?.content ?? ''
        const nextRuntime = options.skipHistory
          ? latestTask.agentStates[agentId]
          : appendActiveHistoryRecords(latestTask.agentStates[agentId], [
              makeRecord('input', latestTopInput),
              makeRecord('output', modelOutput),
            ])

        const nextTask: TaskModel = {
          ...latestTask,
          nodes: nextNodes,
          agentStates: {
            ...latestTask.agentStates,
            [agentId]: nextRuntime,
          },
        }

        return {
          tasks: replaceActiveTask(nextState.tasks, nextState.activeTaskId, nextTask),
          contextMenu: null,
          runningAgentIds: {
            ...nextState.runningAgentIds,
            [agentId]: false,
          },
          actionFeedback: makeFeedback(
            options.skipHistory
              ? '运行完成（未写入历史）'
              : '运行完成，结果已写入所有输出数据格',
          ),
        }
      })
    } catch (error) {
      set((nextState) => {
        const latestTask = findActiveTask(nextState)
        const outputCellIds = new Set(
          latestTask.edges
            .filter((edge) => edge.source === agentId && edge.sourceHandle === 'output')
            .map((edge) => edge.target),
        )
        const failReason = error instanceof Error ? error.message : String(error)
        const failOutput = `[运行失败] ${failReason}`

        const nextNodes = appendToDataCellsStack(
          latestTask.nodes,
          outputCellIds,
          () => makeStackItem(failOutput),
        )

        const nextTask: TaskModel = {
          ...latestTask,
          nodes: nextNodes,
        }

        return {
          tasks: replaceActiveTask(nextState.tasks, nextState.activeTaskId, nextTask),
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
          [agentId]: clearAgentMemory(runtime),
        },
      }

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
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
          [agentId]: switchRuntimeHistory(task.agentStates[agentId], historyId),
        },
      }

      const historyName =
        task.agentStates[agentId].histories.find((history) => history.id === historyId)
          ?.name ?? '目标历史'

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
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
          [agentId]: createRuntimeHistory(
            runtime,
            historyId,
            `历史 ${runtime.histories.length + 1}`,
          ),
        },
      }

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback(`已新建 历史 ${runtime.histories.length + 1}`),
      }
    }),
})
