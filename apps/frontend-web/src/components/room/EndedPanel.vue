<script setup lang="ts">
import type { GameStatePublic, PlayerState } from '@lejv-party/domain'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import RoomLeaderboard from './RoomLeaderboard.vue'

const props = defineProps<{
  players: PlayerState[]
  hostId: string
  playerId: string
  game: GameStatePublic
}>()

const router = useRouter()

const winnerName = computed(() => {
  const winnerId = props.game.winner ?? null
  if (!winnerId) return null
  return props.players.find((p) => p.id === winnerId)?.nickname ?? '匿名'
})

const lastTitle = computed(() => props.game.current?.title)
const lastArtist = computed(() => props.game.current?.artist)
</script>

<template>
  <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
    <section
      class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2"
    >
      <p class="mb-2 text-sm text-zinc-500 dark:text-zinc-400">比赛结束</p>
      <p v-if="winnerName" class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        <span aria-hidden>🏆</span> {{ winnerName }} 获胜！
      </p>
      <p v-else class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">比赛提前结束</p>

      <div v-if="lastTitle" class="mt-6 rounded-md bg-zinc-50 p-4 dark:bg-zinc-800">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">最后一题</p>
        <p class="mt-1 text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {{ lastTitle }}
        </p>
        <p v-if="lastArtist" class="text-sm text-zinc-600 dark:text-zinc-400">
          {{ lastArtist }}
        </p>
      </div>

      <button
        type="button"
        class="mt-6 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        @click="router.push('/')"
      >
        回大厅
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
        :highlight-scorer="game.winner ?? null"
      />
    </section>
  </div>
</template>
