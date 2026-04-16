import type { StateCreator } from 'zustand'
import {
  addDataCellStackItem,
  deleteDataCellStackItem,
  insertDataCellStackItemAfter,
  moveDataCellStackItem,
  updateDataCellStackItemContent,
} from '../../domain/commands'
import { findActiveTask, findDataCell, replaceActiveTask } from '../../domain/selectors'
import type { TaskModel } from '../../domain/types'
import { makeFeedback, makeStackItem } from '../helpers'
import type { WorkbenchState } from '../types'

type DataCellSlice = Pick<
  WorkbenchState,
  | 'updateStackItem'
  | 'addStackItem'
  | 'copyStackItem'
  | 'pasteStackItem'
  | 'deleteStackItem'
  | 'moveStackItem'
>

export const createDataCellSlice: StateCreator<WorkbenchState, [], [], DataCellSlice> = (
  set,
) => ({
  updateStackItem: (dataCellId, itemId, content) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        nodes: updateDataCellStackItemContent(task.nodes, dataCellId, itemId, content),
      }

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
      }
    }),

  addStackItem: (dataCellId) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        nodes: addDataCellStackItem(task.nodes, dataCellId, makeStackItem('新数据')),
      }

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
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
        nodes: insertDataCellStackItemAfter(
          task.nodes,
          dataCellId,
          itemId,
          makeStackItem(state.stackClipboard),
        ),
      }

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback('已粘贴'),
      }
    }),

  deleteStackItem: (dataCellId, itemId) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        nodes: deleteDataCellStackItem(task.nodes, dataCellId, itemId),
      }

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback('已删除'),
      }
    }),

  moveStackItem: (dataCellId, itemId, direction) =>
    set((state) => {
      const task = findActiveTask(state)

      const nextTask: TaskModel = {
        ...task,
        nodes: moveDataCellStackItem(task.nodes, dataCellId, itemId, direction),
      }

      return {
        tasks: replaceActiveTask(state.tasks, state.activeTaskId, nextTask),
        actionFeedback: makeFeedback(direction === 'up' ? '已上移' : '已下移'),
      }
    }),
})
