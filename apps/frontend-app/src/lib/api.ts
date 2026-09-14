import { configureApiClient } from '@lejv-party/api-client'

/** NestJS default for local/dev. On device, point at the host machine IP. */
const DEFAULT_BASE_URL = 'http://localhost:3000'

let configured = false

function resolveBaseUrl(): string {
  const props = lynx.__globalProps as Record<string, unknown> | undefined
  const nested =
    (props?.query as Record<string, unknown> | undefined) ??
    (props?.queryItems as Record<string, unknown> | undefined) ??
    (props?.schemeParams as Record<string, unknown> | undefined)

  for (const source of [props, nested]) {
    if (!source) continue
    for (const key of ['apiBaseUrl', 'api_base_url']) {
      const value = source[key]
      if (typeof value === 'string' && value.length > 0) return value
    }
  }

  return DEFAULT_BASE_URL
}

export function ensureApiClientConfigured(): void {
  if (configured) return
  configureApiClient({ baseUrl: resolveBaseUrl() })
  configured = true
}
