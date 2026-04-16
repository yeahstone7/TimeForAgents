import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react'
import type { StateCreator } from 'zustand'
import { makeId } from '../../domain/factories'
import { findActiveTask, replaceActiveTask } from '../../domain/selectors'
import type { TaskModel } from '../../domain/types'
import { makeFeedback } from '../helpers'
import type { WorkbenchState } from '../types'

type GraphSlice = Pick<
  WorkbenchState,
  'deleteEdge' | 'onNodesChange' | 'onEdgesChange' | 'isValidConnection' | 'onConnect'
>

export const createGraphSlice: StateCreator<WorkbenchState, [], [], GraphSlice> = (
  set,
  get,
) => ({
  deleteEdge: (edgeId) =>
    set((state) => {
      const activeTask = findActiveTask(state)
      const nextTask: TaskModel = {
        ...activeTask,
        edges: activeTask.edges.filter((edge) => edge.id !== edgeId),
      }

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
        contextMenu: null,
        actionFeedback: makeFeedback('连线已删除'),
      }
    }),

  onNodesChange: (changes) =>
    set((state) => {
      const activeTask = findActiveTask(state)
      const nextTask: TaskModel = {
        ...activeTask,
        nodes: applyNodeChanges(changes, activeTask.nodes),
      }
      return { tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask) }
    }),

  onEdgesChange: (changes) =>
    set((state) => {
      const activeTask = findActiveTask(state)
      const nextTask: TaskModel = {
        ...activeTask,
        edges: applyEdgeChanges(changes, activeTask.edges),
      }
      return { tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask) }
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

    return true
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
          },
          activeTask.edges,
        ),
      }

      return { tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask) }
    }),
})
