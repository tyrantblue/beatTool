<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ duration: number; remaining: number; playing: boolean }>()
const emit = defineEmits<{ 'update:duration': [value: number] }>()

const editing = ref(false)
const minutes = ref(0)
const seconds = ref(0)

const isWarning = computed(() => props.playing && props.duration > 0 && props.remaining <= 10 && props.remaining > 0)

function openEditor() {
  minutes.value = Math.floor(props.duration / 60)
  seconds.value = props.duration % 60
  editing.value = true
}

function apply() {
  const total = minutes.value * 60 + seconds.value
  emit('update:duration', Math.max(0, total))
  editing.value = false
}

function clear() {
  emit('update:duration', 0)
  editing.value = false
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Timer</span>

    <div v-if="!editing" class="flex items-center gap-1">
      <button
        class="font-mono text-sm tabular-nums transition-all"
        :class="[
          isWarning
            ? 'text-destructive animate-pulse scale-110 font-bold'
            : duration > 0
              ? 'text-foreground hover:text-primary'
              : 'text-muted-foreground hover:text-foreground',
        ]"
        @click="openEditor"
      >
        {{ duration > 0 ? formatTime(remaining) : '∞' }}
      </button>
    </div>

    <div v-else class="flex flex-col items-center gap-2">
      <div class="flex items-center gap-1 font-mono text-sm">
        <button class="px-1 hover:text-primary" @click="minutes = Math.max(0, minutes - 1)">−</button>
        <input
          v-model.number="minutes"
          class="w-8 text-center border-b border-border bg-transparent outline-none focus:border-primary"
          min="0" max="99"
        />
        <span class="text-muted-foreground">:</span>
        <input
          v-model.number="seconds"
          class="w-8 text-center border-b border-border bg-transparent outline-none focus:border-primary"
          min="0" max="59"
        />
        <button class="px-1 hover:text-primary" @click="seconds = Math.min(59, seconds + 1)">+</button>
      </div>
      <div class="flex gap-2">
        <button class="rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground" @click="apply">
          Set
        </button>
        <button class="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground" @click="clear">
          Off
        </button>
      </div>
    </div>
  </div>
</template>
