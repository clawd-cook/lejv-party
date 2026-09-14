<script setup lang="ts">
import type { GameStatePublic, PlayerState } from '@lejv-party/domain'
import { computed } from 'vue'

import { useNow } from '@/composables/useNow'

import RoomLeaderboard from './RoomLeaderboard.vue'

const props = defineProps<{
  players: PlayerState[]
  hostId: string
  playerId: string
  game: GameStatePublic
}>()

const now = useNow(true)
const current = computed(() => props.game.current)

const scorerName = computed(() => {
  const scorer = current.value?.scorer
  if (!scorer) return null
  return props.players.find((p) => p.id === scorer)?.nickname ?? '匿名'
})

const nextInSec = computed(() => {
  const nextAt = current.value?.revealAt
  if (nextAt === undefined) return null
  return Math.max(0, Math.ceil((nextAt - now.value) / 1000))
})
</script>

<template>
  <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
    <section
      class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2"
    >
      <p class="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
        第 {{ game.questionIndex }} 题 · 答案揭晓
      </p>
      <p class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {{ current?.title ?? '—' }}
      </p>
      <p class="mt-1 text-base text-zinc-600 dark:text-zinc-400">
        {{ current?.artist ?? '' }}
      </p>

      <div class="mt-6 rounded-md bg-zinc-50 p-4 dark:bg-zinc-800">
        <p
          v-if="scorerName"
          class="text-base text-emerald-700 dark:text-emerald-400"
        >
          <span aria-hidden>🎉</span> {{ scorerName }} 抢答正确，+1 分
        </p>
        <p v-else class="text-base text-zinc-600 dark:text-zinc-300">本题无人答对</p>
      </div>

      <p
        v-if="nextInSec !== null"
        class="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
      >
        {{ nextInSec }} 秒后进入下一题…
      </p>
    </section>

    <section
      class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <RoomLeaderboard
        :players="players"
        :scores="game.scores"
        :host-id="hostId"
        :self-id="playerId"
        :highlight-scorer="current?.scorer ?? null"
      />
    </section>
  </div>
</template>
