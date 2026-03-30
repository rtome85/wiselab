/**
 * Vercel Edge Function — Ollama API proxy
 *
 * Proxies POST /api/v1/chat/completions → https://api.ollama.ai/v1/chat/completions
 * Forwards Authorization and Content-Type, streams the response body back.
 */

export const config = { runtime: 'edge' }

const UPSTREAM_URL = 'https://api.ollama.ai/v1/chat/completions'

export default async function handler(req) {
  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD'
      ? await req.text()
      : undefined

    const upstreamResponse = await fetch(UPSTREAM_URL, {
      method: req.method,
      headers: {
        'authorization': req.headers.get('authorization') ?? '',
        'content-type': req.headers.get('content-type') ?? 'application/json',
      },
      body,
    })

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        'content-type': upstreamResponse.headers.get('content-type') ?? 'application/json',
      },
    })
  } catch (err) {
    console.error('[proxy error]', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
