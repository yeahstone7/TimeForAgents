import type { AgentGateway } from './AgentGateway'
import type { ChatMessage, RunAgentModelInput } from './types'

const toHistoryMessages = (input: RunAgentModelInput): ChatMessage[] =>
  input.history.records.map((record) => ({
    role: record.role === 'input' ? 'user' : 'assistant',
    content: record.content,
  }))

export const httpAgentGateway: AgentGateway = {
  run: async ({ agentLabel, userInput, history }) => {
    const response = await fetch('/api/agent/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentLabel,
        userInput,
        history: toHistoryMessages({ agentLabel, userInput, history }),
      }),
    })

    const payload = (await response.json()) as {
      output: string
    }

    return payload.output
  },
}
