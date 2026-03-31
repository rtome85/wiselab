/**
 * Vercel Serverless Function — Ollama API proxy
 *
 * Needed because api.ollama.ai does not send CORS headers, so browsers
 * cannot call it directly. This function proxies the request server-side
 * and streams the response back (SSE for lesson generation).
 *
 * The user's API key is forwarded as-is from their Authorization header —
 * it is never stored or logged here.
 */

const UPSTREAM_URL = 'https://ollama.com/v1/chat/completions'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
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

    const reader = upstream.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
    res.end()
  } catch (err) {
    console.error('[proxy error]', err.message)
    if (!res.headersSent) {
      res.status(502).json({ error: err.message })
    } else {
      res.end()
    }
  }
}
