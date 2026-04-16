export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type RunPayload = {
  agentLabel: string
  userInput: string
  history: ChatMessage[]
}

export type ModelConfig = {
  apiKey: string
  baseUrl: string
  modelName: string
  appName: string
  siteUrl: string
}

export type OpenAICompatibleResponse = {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string
            text?: string
          }>
    }
  }>
  error?: {
    message?: string
    type?: string
  }
}
