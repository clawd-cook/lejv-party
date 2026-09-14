import { onUnmounted, ref, watch, type Ref } from 'vue'

const TICK_MS = 100

export function useNow(active: Ref<boolean> | boolean = true): Ref<number> {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | null = null

  function start() {
    stop()
    timer = setInterval(() => {
      now.value = Date.now()
    }, TICK_MS)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  if (typeof active === 'boolean') {
    if (active) start()
    onUnmounted(stop)
  } else {
    watch(
      active,
      (v) => {
        if (v) start()
        else stop()
      },
      { immediate: true },
    )
    onUnmounted(stop)
  }

  return now
}
