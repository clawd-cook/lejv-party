import { apiUrl } from './config.js'
import type { ApiErrorBody } from './types.js'

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(body.error ?? 'REQUEST_FAILED')
    this.name = 'ApiRequestError'
  }
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (res.status === 204) {
    return undefined as T
  }

  const body = (await res.json()) as T | ApiErrorBody

  if (!res.ok) {
    throw new ApiRequestError(res.status, body as ApiErrorBody)
  }

  return body as T
}
