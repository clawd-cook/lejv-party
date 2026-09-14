<script setup lang="ts">
import {
  startGame,
  updateRoomConfig,
} from '@lejv-party/api-client'
import type {
  CEFRLevel,
  Era,
  Genre,
  PlayerState,
  RoomConfig,
} from '@lejv-party/domain'
import { computed, ref } from 'vue'

import ConfigRow from './ConfigRow.vue'

const LEVELS: readonly CEFRLevel[] = ['A2', 'B1', 'B2', 'C1']
const ERAS: readonly Era[] = ['80s', '90s', '00s', '10s', '20s']
const GENRES: readonly Genre[] = ['流行', '摇滚', '民谣', '说唱', '影视 OST']
const VICTORY_SCORES = [3, 5, 10] as const

const props = defineProps<{
  roomId: string
  playerId: string
  hostId: string
  players: PlayerState[]
  config: RoomConfig
}>()

const isHost = computed(() => props.playerId === props.hostId)
const copied = ref(false)
const starting = ref(false)
const error = ref<string | null>(null)

const canStart = computed(
  () =>
    isHost.value &&
    props.config.eras.length > 0 &&
    props.config.genres.length > 0,
)

async function copyRoomId() {
  try {
    await navigator.clipboard.writeText(props.roomId)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // clipboard blocked
  }
}

async function patchConfig(patch: Partial<RoomConfig>) {
  error.value = null
  try {
    await updateRoomConfig(props.roomId, {
      actorId: props.playerId,
      patch,
    })
  } catch {
    error.value = '配置更新失败'
  }
}

function mapStartError(code: string | undefined): string {
  switch (code) {
    case 'NOT_HOST':
      return '仅房主可以开始游戏'
    case 'ALREADY_STARTED':
      return '游戏已经开始'
    case 'NOT_ENOUGH_PLAYERS':
      return '至少需要 1 名玩家'
    default:
      return '开始游戏失败'
  }
}

async function start() {
  if (!isHost.value) return
  starting.value = true
  error.value = null
  try {
    await startGame(props.roomId, props.playerId)
  } catch (e: unknown) {
    const code =
      e && typeof e === 'object' && 'body' in e
        ? (e as { body?: { error?: string } }).body?.error
        : undefined
    error.value = mapStartError(code)
  } finally {
    starting.value = false
  }
}

function toggleEra(era: Era) {
  if (!isHost.value) return
  const set = new Set(props.config.eras)
  if (set.has(era)) {
    if (set.size <= 1) return
    set.delete(era)
  } else {
    set.add(era)
  }
  void patchConfig({ eras: Array.from(set) as Era[] })
}

function toggleGenre(genre: Genre) {
  if (!isHost.value) return
  const set = new Set(props.config.genres)
  if (set.has(genre)) {
    if (set.size <= 1) return
    set.delete(genre)
  } else {
    set.add(genre)
  }
  void patchConfig({ genres: Array.from(set) as Genre[] })
}
</script>

<template>
  <div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
    <section
      class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-1"
    >
      <div class="mb-4">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">房间号</p>
        <div class="mt-1 flex items-center gap-3">
          <p
            class="font-mono text-3xl font-bold tracking-widest text-zinc-900 dark:text-zinc-50"
          >
            {{ roomId }}
          </p>
          <button
            type="button"
            class="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            @click="copyRoomId"
          >
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
      </div>

      <div>
        <p class="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          玩家（{{ players.length }}）
        </p>
        <ul class="flex flex-col gap-1">
          <li
            v-for="p in players"
            :key="p.id"
            class="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800"
          >
            <span class="text-zinc-900 dark:text-zinc-100">
              {{ p.nickname }}
              <span v-if="p.id === hostId" class="ml-2" aria-label="房主">👑</span>
              <span v-if="p.id === playerId" class="ml-1 text-xs text-zinc-500">（你）</span>
            </span>
            <span v-if="!p.connected" class="text-xs text-zinc-500">离线</span>
          </li>
        </ul>
      </div>
    </section>

    <section
      class="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2"
    >
      <h2 class="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        出题设置
        <span v-if="!isHost" class="ml-2 text-xs font-normal text-zinc-500">
          （仅房主可修改）
        </span>
      </h2>

      <div class="flex flex-col gap-5">
        <ConfigRow label="词汇量水平（CEFR）">
          <div class="flex flex-wrap gap-2">
            <label
              v-for="level in LEVELS"
              :key="level"
              class="cursor-pointer select-none rounded-md border px-3 py-1.5 text-sm"
              :class="[
                config.level === level
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
                !isHost ? 'cursor-not-allowed opacity-50' : '',
              ]"
            >
              <input
                type="radio"
                name="level"
                class="sr-only"
                :checked="config.level === level"
                :disabled="!isHost"
                @change="patchConfig({ level })"
              />
              {{ level }}
            </label>
          </div>
        </ConfigRow>

        <ConfigRow label="歌曲年代（至少选 1 项）">
          <div class="flex flex-wrap gap-2">
            <label
              v-for="era in ERAS"
              :key="era"
              class="cursor-pointer select-none rounded-md border px-3 py-1.5 text-sm"
              :class="[
                config.eras.includes(era)
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
                !isHost ? 'cursor-not-allowed opacity-50' : '',
              ]"
            >
              <input
                type="checkbox"
                class="sr-only"
                :checked="config.eras.includes(era)"
                :disabled="!isHost"
                @change="toggleEra(era)"
              />
              {{ era }}
            </label>
          </div>
        </ConfigRow>

        <ConfigRow label="曲风（至少选 1 项）">
          <div class="flex flex-wrap gap-2">
            <label
              v-for="genre in GENRES"
              :key="genre"
              class="cursor-pointer select-none rounded-md border px-3 py-1.5 text-sm"
              :class="[
                config.genres.includes(genre)
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
                !isHost ? 'cursor-not-allowed opacity-50' : '',
              ]"
            >
              <input
                type="checkbox"
                class="sr-only"
                :checked="config.genres.includes(genre)"
                :disabled="!isHost"
                @change="toggleGenre(genre)"
              />
              {{ genre }}
            </label>
          </div>
        </ConfigRow>

        <ConfigRow label="胜利分数">
          <div class="flex flex-wrap gap-2">
            <label
              v-for="score in VICTORY_SCORES"
              :key="score"
              class="cursor-pointer select-none rounded-md border px-3 py-1.5 text-sm"
              :class="[
                config.victoryScore === score
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
                !isHost ? 'cursor-not-allowed opacity-50' : '',
              ]"
            >
              <input
                type="radio"
                name="victoryScore"
                class="sr-only"
                :checked="config.victoryScore === score"
                :disabled="!isHost"
                @change="patchConfig({ victoryScore: score })"
              />
              {{ score }} 分
            </label>
          </div>
        </ConfigRow>
      </div>

      <button
        v-if="isHost"
        type="button"
        class="mt-6 w-full rounded-md bg-black px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        :disabled="!canStart || starting"
        @click="start"
      >
        {{ starting ? '准备中…' : '开始游戏' }}
      </button>
      <p v-else class="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        等待房主开始…
      </p>

      <p v-if="error" class="mt-3 text-center text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </p>
    </section>
  </div>
</template>
