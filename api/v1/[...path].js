/**
 * Vercel Edge Function — Ollama API proxy
 *
 * Rewrites /v1/* requests (configured in vercel.json) to the upstream
 * Ollama Cloud API, forwarding the client's Authorization header and
 * streaming the response body back unchanged.
 *
 * Route file:  api/v1/[...path].js
 * Rewrite:     /v1/:path* → /api/v1/:path*  (see vercel.json)
 */

export const config = { runtime: 'edge' }

const UPSTREAM_BASE = 'https://ollama.com'

export default async function handler(req) {
  const url = new URL(req.url)

  // Strip the /api prefix that Vercel adds when routing to this file,
  // then forward to the real upstream path (e.g. /v1/chat/completions).
  const upstreamPath = url.pathname.replace(/^\/api/, '')
  const upstreamUrl = `${UPSTREAM_BASE}${upstreamPath}${url.search}`

  // Forward all original headers except `host`, which must reflect the
  // upstream server and not the Vercel deployment origin.
  const forwardedHeaders = new Headers(req.headers)
  forwardedHeaders.delete('host')

  const upstreamResponse = await fetch(upstreamUrl, {
    method: req.method,
    headers: forwardedHeaders,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    // Required to forward a streaming request body in the Edge runtime.
    duplex: 'half',
  })

  // Return the upstream response as-is, preserving status, headers, and the
  // streamed body (SSE for chat completions).
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: upstreamResponse.headers,
  })
}
