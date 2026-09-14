<script setup lang="ts">
import { createRoom, joinRoom, ApiRequestError } from '@lejv-party/api-client'
import { mapApiErrorBody, savePlayerId } from '@lejv-party/client-core'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const createNickname = ref('')
const joinNickname = ref('')
const joinRoomId = ref('')

const createError = ref<string | null>(null)
const joinError = ref<string | null>(null)
const creating = ref(false)
const joining = ref(false)

function validateNickname(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0 || trimmed.length > 16) return null
  return trimmed
}

async function onCreate(e: Event) {
  e.preventDefault()
  createError.value = null
  const nickname = validateNickname(createNickname.value)
  if (!nickname) {
    createError.value = '昵称需 1-16 个字符'
    return
  }

  creating.value = true
  try {
    const result = await createRoom(nickname)
    savePlayerId(result.roomId, result.playerId)
    await router.push({
      path: `/room/${result.roomId}`,
      query: { p: result.playerId },
    })
  } catch (err) {
    if (err instanceof ApiRequestError) {
      createError.value = mapApiErrorBody(err.body)
    } else {
      createError.value = '创建房间失败，请重试'
    }
  } finally {
    creating.value = false
  }
}

async function onJoin(e: Event) {
  e.preventDefault()
  joinError.value = null
  const nickname = validateNickname(joinNickname.value)
  if (!nickname) {
    joinError.value = '昵称需 1-16 个字符'
    return
  }

  const roomId = joinRoomId.value.trim().toUpperCase()
  if (!/^[A-Z0-9]{6}$/.test(roomId)) {
    joinError.value = '房间号需为 6 位字母/数字'
    return
  }

  joining.value = true
  try {
    const result = await joinRoom(roomId, nickname)
    savePlayerId(roomId, result.playerId)
    await router.push({
      path: `/room/${roomId}`,
      query: { p: result.playerId },
    })
  } catch (err) {
    if (err instanceof ApiRequestError) {
      joinError.value = mapApiErrorBody(err.body)
    } else {
      joinError.value = '加入房间失败，请重试'
    }
  } finally {
    joining.value = false
  }
}

const cardCls =
  'rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'
const inputCls =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500'
const buttonCls =
  'w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
const labelCls = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300'
</script>

<template>
  <div class="min-h-svh w-full bg-zinc-50 dark:bg-zinc-950">
    <main
      class="mx-auto flex min-h-svh w-full max-w-4xl flex-col items-center justify-center px-4 py-16"
    >
      <header class="mb-12 flex flex-col items-center gap-3 text-center">
        <h1 class="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          <span aria-hidden>🎵</span> 歌词猜猜猜
        </h1>
        <p class="max-w-md text-base text-zinc-600 dark:text-zinc-400">
          英译中，抢答歌名，派对小游戏
        </p>
      </header>

      <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <section :class="cardCls">
          <h2 class="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">创建房间</h2>
          <form class="flex flex-col gap-3" @submit="onCreate">
            <div class="flex flex-col gap-1">
              <label for="create-nickname" :class="labelCls">昵称</label>
              <input
                id="create-nickname"
                v-model="createNickname"
                type="text"
                required
                maxlength="16"
                placeholder="1-16 字符"
                :class="inputCls"
              />
            </div>
            <button type="submit" :disabled="creating" :class="buttonCls">
              {{ creating ? '创建中…' : '创建' }}
            </button>
            <p v-if="createError" class="text-sm text-red-600 dark:text-red-400">
              {{ createError }}
            </p>
          </form>
        </section>

        <section :class="cardCls">
          <h2 class="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">加入房间</h2>
          <form class="flex flex-col gap-3" @submit="onJoin">
            <div class="flex flex-col gap-1">
              <label for="join-nickname" :class="labelCls">昵称</label>
              <input
                id="join-nickname"
                v-model="joinNickname"
                type="text"
                required
                maxlength="16"
                placeholder="1-16 字符"
                :class="inputCls"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label for="join-room-id" :class="labelCls">房间号</label>
              <input
                id="join-room-id"
                v-model="joinRoomId"
                type="text"
                required
                maxlength="6"
                placeholder="6 位字母/数字"
                :class="inputCls"
              />
            </div>
            <button type="submit" :disabled="joining" :class="buttonCls">
              {{ joining ? '加入中…' : '加入' }}
            </button>
            <p v-if="joinError" class="text-sm text-red-600 dark:text-red-400">
              {{ joinError }}
            </p>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>
