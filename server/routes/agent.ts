import { createJsonResponse } from '../http'
import { runOpenAICompatibleModel } from '../providers/openaiCompatible'
import type { ModelConfig, RunPayload } from '../types'

export const createAgentRunRoute = (config: ModelConfig) => ({
  POST: async (request: Request) => {
    const { agentLabel, userInput, history } = (await request.json()) as RunPayload

    const result = await runOpenAICompatibleModel({
      config,
      agentLabel,
      userInput,
      history,
    })

    return createJsonResponse({ output: result.output }, result.status)
  },
})
