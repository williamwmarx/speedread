import type {
  StoredContent,
  ContentSubmitRequest,
  ContentSubmitResponse,
  ContentRetrieveResponse,
} from '@speedread/shared'

interface Env {
  CONTENT_KV: KVNamespace
  RATE_LIMIT_KV: KVNamespace
  ALLOWED_ORIGIN: string
  MAX_CONTENT_SIZE: string
  CONTENT_TTL_SECONDS: string
  RATE_LIMIT_MAX: string
  RATE_LIMIT_WINDOW_SECONDS: string
}

const corsHeaders = (origin: string, allowedOrigin: string) => {
  const isAllowed = origin === allowedOrigin || allowedOrigin === '*'
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

const jsonResponse = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })

const errorResponse = (message: string, status: number, headers: Record<string, string> = {}) =>
  jsonResponse({ error: message }, status, headers)

const generateUUID = () => crypto.randomUUID()

async function checkRateLimit(
  ip: string,
  kv: KVNamespace,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const key = `rate:${ip}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - windowSeconds

  const data = await kv.get<{ requests: number[] }>(key, 'json')
  const requests = data?.requests?.filter((t) => t > windowStart) ?? []

  if (requests.length >= maxRequests) return false

  requests.push(now)
  await kv.put(key, JSON.stringify({ requests }), { expirationTtl: windowSeconds })
  return true
}

async function handlePost(request: Request, env: Env, cors: Record<string, string>) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const maxRequests = parseInt(env.RATE_LIMIT_MAX)
  const windowSeconds = parseInt(env.RATE_LIMIT_WINDOW_SECONDS)

  const allowed = await checkRateLimit(ip, env.RATE_LIMIT_KV, maxRequests, windowSeconds)
  if (!allowed) {
    return errorResponse('Rate limit exceeded. Max 10 requests per minute.', 429, cors)
  }

  const maxSize = parseInt(env.MAX_CONTENT_SIZE)
  const contentLength = parseInt(request.headers.get('Content-Length') || '0')
  if (contentLength > maxSize) {
    return errorResponse(`Content too large. Max ${maxSize} bytes.`, 413, cors)
  }

  let body: ContentSubmitRequest
  try {
    body = await request.json()
  } catch {
    return errorResponse('Invalid JSON body', 400, cors)
  }

  if (!body.text || typeof body.text !== 'string') {
    return errorResponse('Missing or invalid "text" field', 400, cors)
  }

  if (body.text.length > maxSize) {
    return errorResponse(`Content too large. Max ${maxSize} bytes.`, 413, cors)
  }

  const uuid = generateUUID()
  const ttl = parseInt(env.CONTENT_TTL_SECONDS)
  const now = Date.now()

  const stored: StoredContent = {
    text: body.text,
    createdAt: now,
    source: body.source,
  }

  await env.CONTENT_KV.put(`content:${uuid}`, JSON.stringify(stored), { expirationTtl: ttl })

  const response: ContentSubmitResponse = {
    uuid,
    expiresAt: now + ttl * 1000,
  }

  return jsonResponse(response, 201, cors)
}

async function handleGet(uuid: string, env: Env, cors: Record<string, string>) {
  const data = await env.CONTENT_KV.get<StoredContent>(`content:${uuid}`, 'json')

  if (!data) {
    return errorResponse('Content not found or expired', 404, cors)
  }

  const ttl = parseInt(env.CONTENT_TTL_SECONDS)
  const response: ContentRetrieveResponse = {
    text: data.text,
    createdAt: data.createdAt,
    expiresAt: data.createdAt + ttl * 1000,
  }

  return jsonResponse(response, 200, cors)
}

async function handleDelete(uuid: string, env: Env, cors: Record<string, string>) {
  await env.CONTENT_KV.delete(`content:${uuid}`)
  return jsonResponse({ deleted: true }, 200, cors)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN)

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    // Route: POST /api/content
    if (url.pathname === '/api/content' && request.method === 'POST') {
      return handlePost(request, env, cors)
    }

    // Route: GET /api/content/:uuid
    const getMatch = url.pathname.match(/^\/api\/content\/([a-f0-9-]{36})$/)
    if (getMatch && request.method === 'GET') {
      return handleGet(getMatch[1], env, cors)
    }

    // Route: DELETE /api/content/:uuid
    if (getMatch && request.method === 'DELETE') {
      return handleDelete(getMatch[1], env, cors)
    }

    return errorResponse('Not found', 404, cors)
  },
}
