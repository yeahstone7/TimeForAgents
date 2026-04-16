import { createTask, makeId } from '../domain/factories'
import type { AgentChatRecord, StackItem } from '../domain/types'
import type { ActionFeedback } from './types'

export const makeStackItem = (content: string): StackItem => ({
  id: makeId('stack'),
  content,
  createdAt: Date.now(),
})

export const makeRecord = (
  role: AgentChatRecord['role'],
  content: string,
): AgentChatRecord => ({
  id: makeId('record'),
  role,
  content,
  createdAt: Date.now(),
})

export const makeFeedback = (message: string): ActionFeedback => ({
  id: makeId('feedback'),
  message,
})

export const initialTask = createTask('任务 1')
