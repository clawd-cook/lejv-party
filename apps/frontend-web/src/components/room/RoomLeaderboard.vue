<script setup lang="ts">
import type { PlayerState } from '@lejv-party/domain'
import { computed } from 'vue'

const props = defineProps<{
  players: PlayerState[]
  scores: Record<string, number>
  hostId: string
  selfId: string
  highlightScorer?: string | null
}>()

const ordered = computed(() =>
  props.players
    .slice()
    .sort((a, b) => {
      const da = props.scores[a.id] ?? 0
      const db = props.scores[b.id] ?? 0
      if (db !== da) return db - da
      return a.joinedAt - b.joinedAt
    }),
)
</script>

<template>
  <div>
    <h3 class="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">排行榜</h3>
    <ol class="flex flex-col gap-1">
      <li
        v-for="(p, idx) in ordered"
        :key="p.id"
        class="flex items-center justify-between rounded-md px-3 py-2 text-sm"
        :class="
          p.id === highlightScorer
            ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
            : 'bg-zinc-50 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
        "
      >
        <span class="flex min-w-0 items-center gap-2">
          <span class="w-5 text-xs text-zinc-500">{{ idx + 1 }}.</span>
          <span class="truncate">{{ p.nickname }}</span>
          <span v-if="p.id === hostId" aria-label="房主" title="房主">👑</span>
          <span v-if="p.id === selfId" class="text-xs text-zinc-500">（你）</span>
          <span v-if="!p.connected" class="text-xs text-zinc-500">离线</span>
        </span>
        <span class="font-mono font-medium">{{ scores[p.id] ?? 0 }}</span>
      </li>
    </ol>
  </div>
</template>
