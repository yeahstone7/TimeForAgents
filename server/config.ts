import type { ModelConfig } from './types'

export const port = Number(process.env.PORT ?? 8787)

export const modelConfig: ModelConfig = {
  apiKey: process.env.MODEL_API_KEY ?? process.env.KIMI_API_KEY ?? '',
  baseUrl:
    process.env.MODEL_BASE_URL ?? process.env.KIMI_BASE_URL ?? 'https://openrouter.ai/api/',
  modelName: process.env.MODEL_NAME ?? process.env.KIMI_MODEL ?? 'openai/gpt-4o-mini',
  appName: process.env.MODEL_APP_NAME ?? 'TimeForAgents',
  siteUrl: process.env.MODEL_SITE_URL ?? 'http://localhost:5173',
}
