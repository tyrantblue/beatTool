<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ bpm: number }>()
const emit = defineEmits<{ 'update:bpm': [value: number] }>()

const flipping = ref(false)

watch(() => props.bpm, () => {
  flipping.value = true
  setTimeout(() => { flipping.value = false }, 200)
})
</script>

<template>
  <div class="flex items-center justify-center gap-4">
    <button
      class="flex size-12 items-center justify-center rounded-full bg-secondary text-2xl text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
      @click="emit('update:bpm', Math.max(20, bpm - 1))"
      aria-label="Decrease BPM"
    >−</button>

    <span
      class="w-28 text-center text-7xl font-mono font-bold tabular-nums tracking-tight transition-all duration-200"
      :class="{ 'scale-110 text-primary': flipping }"
    >
      {{ bpm }}
    </span>

    <button
      class="flex size-12 items-center justify-center rounded-full bg-secondary text-2xl text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
      @click="emit('update:bpm', Math.min(300, bpm + 1))"
      aria-label="Increase BPM"
    >+</button>
  </div>
</template>
