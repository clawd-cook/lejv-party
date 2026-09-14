import { subscribeRoomEvents } from '@lejv-party/api-client'
import type { RoomEvent } from '@lejv-party/domain'
import { onUnmounted, watch, type Ref } from 'vue'

export function useRoomStream(
  roomId: Ref<string>,
  playerId: Ref<string>,
  onEvent: (event: RoomEvent) => void,
): void {
  let subscription: ReturnType<typeof subscribeRoomEvents> | null = null

  function connect(id: string, pid: string) {
    subscription?.close()
    if (!id || !pid) return
    subscription = subscribeRoomEvents(id, pid, onEvent)
  }

  watch(
    [roomId, playerId],
    ([id, pid]) => connect(id, pid),
    { immediate: true },
  )

  onUnmounted(() => subscription?.close())
}
