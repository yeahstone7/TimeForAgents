import { extractTextFromContent } from '../http'
import type { ChatMessage, ModelConfig, OpenAICompatibleResponse } from '../types'

type RunModelInput = {
  config: ModelConfig
  agentLabel: string
  userInput: string
  history: ChatMessage[]
}

type RunModelResult = {
  output: string
  status?: number
}

export const runOpenAICompatibleModel = async ({
  config,
  agentLabel,
  userInput,
  history,
}: RunModelInput): Promise<RunModelResult> => {
  if (!config.apiKey) {
    return {
      output:
        '[配置缺失] 未检测到 API Key。请在项目根目录创建 .env.local，并填写 MODEL_API_KEY（或 KIMI_API_KEY）。',
    }
  }

  const endpoint = new URL('v1/chat/completions', config.baseUrl).toString()

  const modelResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.siteUrl,
      'X-Title': config.appName,
    },
    body: JSON.stringify({
      model: config.modelName,
      messages: [
        {
          role: 'system',
          content: `你是画布工作台中的 ${agentLabel}。请基于历史与当前输入给出清晰、可执行的中文输出。`,
        },
        ...history,
        {
          role: 'user',
          content: userInput,
        },
      ],
    }),
  })

  const payload = (await modelResponse.json()) as OpenAICompatibleResponse

  if (!modelResponse.ok) {
    if (payload.error?.type === 'access_terminated_error') {
      return {
        output:
          '[权限受限] 当前 key 仅支持 Coding Agent 客户端，不支持网页服务端直连。请改用可服务端调用的通用 API Key（MODEL_API_KEY）。',
      }
    }

    return {
      output: `[模型调用失败] ${payload.error?.message ?? modelResponse.statusText}`,
      status: modelResponse.status,
    }
  }

  return {
    output: extractTextFromContent(payload.choices?.[0]?.message?.content),
  }
}
