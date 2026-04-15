import type { AgentHistory } from '../domain/types'

type RunAgentModelInput = {
  agentLabel: string
  userInput: string
  history: AgentHistory
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export const runAgentModel = async ({
  agentLabel,
  userInput,
  history,
}: RunAgentModelInput) => {
  const historyMessages: ChatMessage[] = history.records.map((record) => ({
    role: record.role === 'input' ? 'user' : 'assistant',
    content: record.content,
  }))

  const response = await fetch('/api/agent/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agentLabel,
      userInput,
      history: historyMessages,
    }),
  })

  const payload = (await response.json()) as {
    output: string
  }

  return payload.output
}
