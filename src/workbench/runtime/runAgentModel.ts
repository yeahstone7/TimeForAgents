import { httpAgentGateway } from './httpAgentGateway'
import type { RunAgentModelInput } from './types'

export const runAgentModel = async (input: RunAgentModelInput) =>
  httpAgentGateway.run(input)
