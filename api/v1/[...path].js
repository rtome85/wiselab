/**
 * Vercel Edge Function — Ollama API proxy
 *
 * Handles all /api/v1/* requests (served automatically by Vercel from the
 * api/ directory — no vercel.json rewrite needed).
 *
 * Strips the /api prefix and forwards to the upstream Ollama Cloud API,
 * passing the client's Authorization header and streaming the response body.
 */

export const config = { runtime: 'edge' }

const UPSTREAM_BASE = 'https://api.ollama.ai'

export default async function handler(req) {
  const url = new URL(req.url)

  // /api/v1/chat/completions → /v1/chat/completions
  const upstreamPath = url.pathname.replace(/^\/api/, '')
  const upstreamUrl = `${UPSTREAM_BASE}${upstreamPath}${url.search}`

  const forwardedHeaders = new Headers(req.headers)
  forwardedHeaders.delete('host')

  const upstreamResponse = await fetch(upstreamUrl, {
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
