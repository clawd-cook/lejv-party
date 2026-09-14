<script setup lang="ts">
import { ApiRequestError, submitAnswer } from '@lejv-party/api-client'
import { ref } from 'vue'

const props = defineProps<{
  roomId: string
  playerId: string
}>()

const answer = ref('')
const submitting = ref(false)
const selfAnswered = ref(false)
const selfCorrect = ref<boolean | null>(null)
const feedback = ref<string | null>(null)

async function onSubmit(e: Event) {
  e.preventDefault()
  const trimmed = answer.value.trim()
  if (!trimmed || submitting.value || selfAnswered.value) return

  submitting.value = true
  feedback.value = null
  try {
    const body = await submitAnswer(props.roomId, props.playerId, trimmed)
    selfAnswered.value = true
    selfCorrect.value = body.correct
    feedback.value = body.correct ? '答对了！' : '答错了'
  } catch (err) {
    if (err instanceof ApiRequestError) {
      if (err.body.error === 'ALREADY_ANSWERED') {
        selfAnswered.value = true
        feedback.value = '你已作答'
      } else if (err.body.error === 'NOT_IN_QUESTION') {
        feedback.value = '本题已结束'
      } else {
        feedback.value = '提交失败'
      }
    } else {
      feedback.value = '提交失败'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-2" @submit="onSubmit">
    <div class="flex gap-2">
      <input
        v-model="answer"
        type="text"
        class="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        :placeholder="selfAnswered ? '你已作答' : '输入歌名'"
        :disabled="selfAnswered || submitting"
        maxlength="64"
      />
      <button
        type="submit"
        class="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        :disabled="selfAnswered || submitting || !answer.trim()"
      >
        抢答
      </button>
    </div>
    <p
      v-if="feedback"
      class="text-sm"
      :class="
        selfCorrect
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400'
      "
    >
      {{ feedback }}
    </p>
  </form>
</template>
