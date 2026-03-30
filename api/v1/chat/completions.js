/**
 * Vercel Edge Function — Ollama API proxy
 *
 * Proxies POST /api/v1/chat/completions → https://api.ollama.ai/v1/chat/completions
 * Forwards the client's Authorization header and streams the response body
 * back unchanged (SSE for streaming completions, JSON for non-streaming).
 */

export const config = { runtime: 'edge' }

const UPSTREAM_URL = 'https://api.ollama.ai/v1/chat/completions'

export default async function handler(req) {
  const forwardedHeaders = new Headers(req.headers)
  forwardedHeaders.delete('host')

  const upstreamResponse = await fetch(UPSTREAM_URL, {
    method: req.method,
    headers: forwardedHeaders,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    duplex: 'half',
  })

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: upstreamResponse.headers,
  })
}
