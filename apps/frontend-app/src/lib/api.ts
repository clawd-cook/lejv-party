import { configureApiClient } from '@lejv-party/api-client'

/** Production Nest origin. Override with `apiBaseUrl` / `api_base_url` on `__globalProps` for LAN/local. */
const DEFAULT_BASE_URL = 'https://www.lejv-party-backend.casa'

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
