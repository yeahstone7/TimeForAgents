import { modelConfig, port } from './config'
import { createJsonResponse, createTextResponse } from './http'
import { createAgentRunRoute } from './routes/agent'

Bun.serve({
  port,
  routes: {
    '/': () =>
      createTextResponse(
        [
          'TimeForAgents Bun API is running.',
          'Frontend (dev): http://127.0.0.1:5173',
          `Health: http://localhost:${port}/health`,
        ].join('\n'),
      ),

    '/health': () => createJsonResponse({ ok: true }),

    '/api/agent/run': createAgentRunRoute(modelConfig),
  },
})

console.log(`Agent server running on http://localhost:${port}`)
