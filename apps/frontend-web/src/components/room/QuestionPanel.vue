<script setup lang="ts">
import { skipQuestion } from '@lejv-party/api-client'
import type { GameStatePublic, PlayerState } from '@lejv-party/domain'
import { computed } from 'vue'

import { useNow } from '@/composables/useNow'

import BuzzerForm from './BuzzerForm.vue'
import RoomLeaderboard from './RoomLeaderboard.vue'

const props = defineProps<{
  roomId: string
  playerId: string
  hostId: string
  players: PlayerState[]
  game: GameStatePublic
}>()

const isHost = computed(() => props.playerId === props.hostId)
const now = useNow(true)

const current = computed(() => props.game.current)
const remainingSec = computed(() => {
  const deadlineAt = current.value?.deadlineAt ?? now.value
  return Math.max(0, Math.ceil((deadlineAt - now.value) / 1000))
})

async function onSkip() {
  if (!isHost.value) return
  try {
    await skipQuestion(props.roomId, props.playerId)
  } catch {
    // best-effort
  }
}
</script>

<template>
  <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
    <section
      class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2"
    >
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">第 {{ game.questionIndex }} 题</p>
        <p
          class="font-mono text-4xl font-bold"
          :class="
            remainingSec <= 10
              ? 'text-red-600 dark:text-red-400'
              : 'text-zinc-900 dark:text-zinc-50'
          "
          aria-live="polite"
        >
          {{ remainingSec }}s
        </p>
      </div>

      <blockquote class="mb-6 rounded-md bg-zinc-50 p-6 dark:bg-zinc-800">
        <p class="text-2xl font-medium italic leading-relaxed text-zinc-900 dark:text-zinc-50">
          &ldquo;{{ current?.translation ?? '…' }}&rdquo;
        </p>
      </blockquote>

      <BuzzerForm
        :key="game.questionIndex"
        :room-id="roomId"
        :player-id="playerId"
      />

      <p class="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        已作答：{{ current?.answeredCount ?? 0 }} / {{ players.length }}
      </p>

      <button
        v-if="isHost"
        type="button"
        class="mt-4 rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        @click="onSkip"
      >
        下一题（跳过）
      </button>
    </section>

    <section
      class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <RoomLeaderboard
        :players="players"
        :scores="game.scores"
        :host-id="hostId"
        :self-id="playerId"
      />
    </section>
  </div>
</template>
