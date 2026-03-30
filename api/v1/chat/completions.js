/**
 * Vercel Serverless Function (Node.js) — Ollama API proxy
 *
 * Proxies POST /api/v1/chat/completions → https://api.ollama.ai/v1/chat/completions
 * Streams the response body back to support SSE lesson generation.
 */

const UPSTREAM_URL = 'https://api.ollama.ai/v1/chat/completions'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    // Buffer the incoming request body
    const chunks = []
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const body = Buffer.concat(chunks).toString('utf8')

    const upstream = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'authorization': req.headers['authorization'] ?? '',
        'content-type': 'application/json',
      },
      body,
    })

    res.status(upstream.status)
    const contentType = upstream.headers.get('content-type')
    if (contentType) res.setHeader('content-type', contentType)
    res.setHeader('cache-control', 'no-cache')

    if (!upstream.body) {
      res.end()
      return
    }

    // Stream the upstream response back (handles both SSE and plain JSON)
    const reader = upstream.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
    res.end()
  } catch (err) {
    console.error('[proxy error]', err.message, err.stack)
    if (!res.headersSent) {
      res.status(502).json({ error: err.message })
    } else {
      res.end()
    }
  }
}
