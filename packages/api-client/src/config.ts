export type ApiClientConfig = {
  baseUrl: string
}

let defaultConfig: ApiClientConfig = { baseUrl: '' }

export function configureApiClient(config: ApiClientConfig): void {
  defaultConfig = { ...config }
}

export function getApiClientConfig(): ApiClientConfig {
  return defaultConfig
}

export function apiUrl(path: string): string {
  const base = defaultConfig.baseUrl.replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
