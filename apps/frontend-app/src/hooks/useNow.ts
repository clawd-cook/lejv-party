import { useEffect, useState } from '@lynx-js/react'

const TICK_MS = 250

/** Background-only timer tick for countdowns. */
export function useNow(active = true): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const timer = setInterval(() => {
      setNow(Date.now())
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [active])

  return now
}
