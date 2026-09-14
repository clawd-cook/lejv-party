<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div>
    <p class="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{{ label }}</p>
    <slot />
  </div>
</template>
