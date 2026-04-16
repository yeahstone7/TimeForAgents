import type { StateCreator } from 'zustand'
import type { WorkbenchState } from '../types'

type UiSlice = Pick<
  WorkbenchState,
  'setTaskSearch' | 'clearActionFeedback' | 'openContextMenu' | 'closeContextMenu'
>

export const createUiSlice: StateCreator<WorkbenchState, [], [], UiSlice> = (set) => ({
  setTaskSearch: (value) => set({ taskSearch: value }),

  clearActionFeedback: () => set({ actionFeedback: null }),

  openContextMenu: (context) => set({ contextMenu: context }),

  closeContextMenu: () => set({ contextMenu: null }),
})
