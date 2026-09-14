<script setup lang="ts">
import { loadPlayerId, savePlayerId } from '@lejv-party/client-core'
import { computed, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import EndedPanel from '@/components/room/EndedPanel.vue'
import LobbyPanel from '@/components/room/LobbyPanel.vue'
import QuestionPanel from '@/components/room/QuestionPanel.vue'
import RevealPanel from '@/components/room/RevealPanel.vue'
import { useRoomStream } from '@/composables/useRoomStream'
import { useRoomStore } from '@/stores/room'

const route = useRoute()
const roomStore = useRoomStore()

const roomId = computed(() => String(route.params.id ?? '').toUpperCase())
const playerId = computed(() => {
  const fromQuery = route.query.p
  if (typeof fromQuery === 'string' && fromQuery.length > 0) return fromQuery
  return loadPlayerId(roomId.value) ?? ''
})

watch(
  [roomId, playerId],
  ([id, pid]) => {
    if (id && pid) savePlayerId(id, pid)
  },
  { immediate: true },
)

useRoomStream(roomId, playerId, (event) => {
  roomStore.dispatchEvent(event)
})

onUnmounted(() => {
  roomStore.reset()
})

const state = computed(() => roomStore.state)
</script>

<template>
  <div class="min-h-svh w-full bg-zinc-50 dark:bg-zinc-950">
    <main class="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header class="flex items-center justify-between">
        <p class="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span aria-hidden>🎵</span> 歌词猜猜猜
        </p>
      </header>

      <div
        v-if="!state"
        class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          正在连接房间 <span class="font-mono">{{ roomId }}</span> …
        </p>
      </div>

      <template v-else>
        <LobbyPanel
          v-if="state.phase === 'lobby'"
          :room-id="state.id"
          :player-id="playerId"
          :host-id="state.hostId"
          :players="state.players"
          :config="state.config"
        />
        <QuestionPanel
          v-else-if="state.phase === 'question' && state.game"
          :room-id="state.id"
          :player-id="playerId"
          :host-id="state.hostId"
          :players="state.players"
          :game="state.game"
        />
        <RevealPanel
          v-else-if="state.phase === 'reveal' && state.game"
          :players="state.players"
          :host-id="state.hostId"
          :player-id="playerId"
          :game="state.game"
        />
        <EndedPanel
          v-else-if="state.phase === 'ended' && state.game"
          :players="state.players"
          :host-id="state.hostId"
          :player-id="playerId"
          :game="state.game"
        />
      </template>
    </main>
  </div>
</template>
