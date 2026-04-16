import { create } from 'zustand'
import { initialTask } from './helpers'
import { createAgentSlice } from './slices/agentSlice'
import { createDataCellSlice } from './slices/dataCellSlice'
import { createGraphSlice } from './slices/graphSlice'
import { createTaskSlice } from './slices/taskSlice'
import { createUiSlice } from './slices/uiSlice'
import type { WorkbenchState } from './types'

export const useWorkbenchStore = create<WorkbenchState>()((...args) => ({
  tasks: [initialTask],
  activeTaskId: initialTask.id,
  taskSearch: '',
  contextMenu: null,
  stackClipboard: '',
  runningAgentIds: {},
  actionFeedback: null,

  ...createUiSlice(...args),
  ...createTaskSlice(...args),
  ...createGraphSlice(...args),
  ...createAgentSlice(...args),
  ...createDataCellSlice(...args),
}))
