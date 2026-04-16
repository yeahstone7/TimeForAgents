import type { StateCreator } from 'zustand'
import { renameNodeLabel } from '../../domain/commands'
import { createAgentNode, createAgentState, createDataNode, createTask } from '../../domain/factories'
import { findActiveTask, replaceActiveTask } from '../../domain/selectors'
import type { TaskModel } from '../../domain/types'
import { makeFeedback } from '../helpers'
import type { WorkbenchState } from '../types'

type TaskSlice = Pick<
  WorkbenchState,
  'selectTask' | 'addTask' | 'addNode' | 'addNodeAt' | 'renameNode'
>

export const createTaskSlice: StateCreator<WorkbenchState, [], [], TaskSlice> = (
  set,
  get,
) => ({
  selectTask: (taskId) => set({ activeTaskId: taskId, contextMenu: null }),

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

  addNode: (type) => get().addNodeAt(type, 320, type === 'agent' ? 120 : 300),

  addNodeAt: (type, x, y) =>
    set((state) => {
      const activeTask = findActiveTask(state)
      const nextNode =
        type === 'agent'
          ? createAgentNode(`Agent ${Object.keys(activeTask.agentStates).length + 1}`, x, y)
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
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
        contextMenu: null,
        actionFeedback: makeFeedback(type === 'agent' ? '已添加 Agent' : '已添加数据格'),
      }
    }),

  renameNode: (nodeId, label) =>
    set((state) => {
      const task = findActiveTask(state)
      const nextTask: TaskModel = {
        ...task,
        nodes: renameNodeLabel(task.nodes, nodeId, label),
      }

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback(`已重命名为 ${label}`),
      }
    }),
})
