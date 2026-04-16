import type { AgentHistory } from '../domain/types'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type RunAgentModelInput = {
  agentLabel: string
  userInput: string
  history: AgentHistory
}
