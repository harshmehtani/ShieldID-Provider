export interface ApiErrorPayload {
  detail?: string | Array<{ msg?: string }>
  message?: string
  code?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit
  accessToken?: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

function errorMessage(payload: unknown, fallback: string): { message: string; code?: string } {
  if (!payload || typeof payload !== 'object') return { message: fallback }

  const body = payload as ApiErrorPayload
  const detail = Array.isArray(body.detail)
    ? body.detail.map((item) => item.msg).filter(Boolean).join(', ')
    : body.detail

  return {
    message: body.message || detail || fallback,
    code: body.code,
  }
}

/** Shared JSON/multipart request helper for the FastAPI service. */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { accessToken, headers: inputHeaders, ...requestOptions } = options
  const headers = new Headers(inputHeaders)
  const isFormData = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData

  if (requestOptions.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...requestOptions,
      headers,
    })
  } catch {
    throw new ApiError('Unable to reach the ShieldID service. Check your connection and try again.', 0)
  }

  if (response.status === 204) return undefined as T

  const contentType = response.headers.get('content-type') || ''
  let payload: unknown
  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null)
  } else {
    payload = await response.text().catch(() => '')
  }

  if (!response.ok) {
    const result = errorMessage(payload, `The request failed (${response.status}).`)
    throw new ApiError(result.message, response.status, result.code)
  }

  return payload as T
}
