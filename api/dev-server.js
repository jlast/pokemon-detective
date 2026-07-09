import { createRequire } from 'module'
import { createServer } from 'http'

const require = createRequire(import.meta.url)
const { handler } = require('./dist/handler.js')

const PORT = 3001

const server = createServer(async (req, res) => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = Buffer.concat(chunks).toString('utf-8')

  const event = {
    path: req.url ?? '/',
    httpMethod: req.method ?? 'GET',
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v ?? '']),
    ),
    body: body || null,
    requestContext: {
      httpMethod: req.method ?? 'GET',
      authorizer: { sub: '' },
    },
  }

  try {
    const result = await handler(event, null)
    res.writeHead(result.statusCode, result.headers)
    res.end(result.body)
  } catch (err) {
    console.error('Handler error:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Internal server error' }))
  }
})

server.listen(PORT, () => {
  console.log(`API dev server running on http://localhost:${PORT}`)
})
