import { clientReducer } from '@lejv-party/client-core'
import type { RoomEvent, RoomStatePublic } from '@lejv-party/domain'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRoomStore = defineStore('room', () => {
  const state = ref<RoomStatePublic | null>(null)

  function dispatchEvent(event: RoomEvent) {
    state.value = clientReducer(state.value, { type: 'event', event })
  }

  function reset() {
    state.value = null
  }

  return { state, dispatchEvent, reset }
})
