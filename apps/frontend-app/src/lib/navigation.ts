import * as router from 'sparkling-navigation'

/**
 * Sparkling `open` requires a callback; without it navigation is a no-op
 * (console.error only). Wrap as a Promise for call sites.
 */
export function openScheme(scheme: string): Promise<void> {
  return new Promise((resolve, reject) => {
    router.open({ scheme }, (result) => {
      if (result.code === 1) {
        resolve()
        return
      }
      reject(new Error(result.msg || '页面打开失败'))
    })
  })
}
