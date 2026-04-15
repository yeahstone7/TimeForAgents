type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type RunPayload = {
  agentLabel: string
  userInput: string
  history: ChatMessage[]
}

const port = Number(process.env.PORT ?? 8787)
const modelApiKey = process.env.MODEL_API_KEY ?? process.env.KIMI_API_KEY ?? ''
const modelBaseUrl =
  process.env.MODEL_BASE_URL ??
  process.env.KIMI_BASE_URL ??
  'https://openrouter.ai/api/'
const modelName =
  process.env.MODEL_NAME ?? process.env.KIMI_MODEL ?? 'openai/gpt-4o-mini'
const modelAppName = process.env.MODEL_APP_NAME ?? 'TimeForAgents'
const modelSiteUrl = process.env.MODEL_SITE_URL ?? 'http://localhost:5173'

const createJsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })

const extractTextFromContent = (
  content:
    | string
    | Array<{
        type?: string
        text?: string
      }>
    | undefined,
) => {
  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (part.type === 'text' ? part.text ?? '' : ''))
      .join('')
      .trim()
  }

  return ''
}

Bun.serve({
  port,
  routes: {
    '/': () =>
      new Response(
        [
          'TimeForAgents Bun API is running.',
          `Frontend (dev): http://127.0.0.1:5173`,
          `Health: http://localhost:${port}/health`,
        ].join('\n'),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        },
      ),

    '/health': () => createJsonResponse({ ok: true }),

    '/api/agent/run': {
      POST: async (request) => {
        const { agentLabel, userInput, history } = (await request.json()) as RunPayload

        if (!modelApiKey) {
          return createJsonResponse({
            output:
              '[配置缺失] 未检测到 API Key。请在项目根目录创建 .env.local，并填写 MODEL_API_KEY（或 KIMI_API_KEY）。',
          })
        }

        const endpoint = new URL('v1/chat/completions', modelBaseUrl).toString()

        const modelResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${modelApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': modelSiteUrl,
            'X-Title': modelAppName,
          },
          body: JSON.stringify({
            model: modelName,
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

        const payload = (await modelResponse.json()) as {
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

        if (!modelResponse.ok) {
          if (payload.error?.type === 'access_terminated_error') {
            return createJsonResponse({
              output:
                '[权限受限] 当前 key 仅支持 Coding Agent 客户端，不支持网页服务端直连。请改用可服务端调用的通用 API Key（MODEL_API_KEY）。',
            })
          }

          return createJsonResponse(
            {
              output: `[模型调用失败] ${payload.error?.message ?? modelResponse.statusText}`,
            },
            modelResponse.status,
          )
        }

        return createJsonResponse({
          output: extractTextFromContent(payload.choices?.[0]?.message?.content),
        })
      },
    },
  },
})

console.log(`Agent server running on http://localhost:${port}`)
