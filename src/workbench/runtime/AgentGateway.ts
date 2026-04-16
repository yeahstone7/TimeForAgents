import type { RunAgentModelInput } from './types'

export type AgentGateway = {
  run: (input: RunAgentModelInput) => Promise<string>
}
