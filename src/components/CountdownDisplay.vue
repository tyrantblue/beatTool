<script setup lang="ts">
import { ref, computed } from 'vue'
import { Timer, Clock, X } from 'lucide-vue-next'

const props = defineProps<{ duration: number; remaining: number; playing: boolean }>()
const emit = defineEmits<{ 'update:duration': [value: number] }>()

const editing = ref(false)
const minutes = ref(0)
const seconds = ref(0)

const presets = [
  { label: '5 min', secs: 300 },
  { label: '10 min', secs: 600 },
  { label: '15 min', secs: 900 },
  { label: '20 min', secs: 1200 },
  { label: '30 min', secs: 1800 },
]

const isWarning = computed(() =>
  props.playing && props.duration > 0 && props.remaining <= 10 && props.remaining > 0,
)

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

function selectPreset(secs: number) {
  emit('update:duration', secs)
  editing.value = false
}

function clearTimer() {
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

    <!-- Display mode -->
    <button
      class="group flex items-center gap-1 transition-all"
      :class="[
        isWarning
          ? 'text-destructive animate-pulse scale-110 font-bold'
          : duration > 0
            ? 'text-foreground hover:text-primary'
            : 'text-muted-foreground hover:text-foreground',
      ]"
      @click="openEditor"
    >
      <Timer v-if="duration > 0" class="size-4" />
      <Clock v-else class="size-4" />
      <span class="font-mono text-sm tabular-nums">
        {{ duration > 0 ? formatTime(props.playing ? remaining : duration) : 'Timer' }}
      </span>
    </button>
  </div>

  <!-- Edit modal -->
  <Teleport to="body">
    <div
      v-if="editing"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="editing = false"
    >
      <div class="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div class="flex w-full items-center justify-between">
          <span class="text-sm font-semibold">Countdown Timer</span>
          <button class="text-muted-foreground hover:text-foreground" @click="editing = false">
            <X class="size-4" />
          </button>
        </div>

        <!-- Presets -->
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="p in presets"
            :key="p.secs"
            class="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
            @click="selectPreset(p.secs)"
          >{{ p.label }}</button>
        </div>

        <div class="h-px w-full bg-border" />

        <!-- Manual input -->
        <div class="flex items-center gap-2 font-mono text-lg">
          <button class="px-2 py-1 rounded hover:bg-secondary" @click="minutes = Math.max(0, minutes - 1)">−</button>
          <input
            v-model.number="minutes"
            class="w-14 text-center border border-border rounded-lg bg-transparent py-1 outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0" max="99"
          />
          <span class="text-muted-foreground">min</span>
          <input
            v-model.number="seconds"
            class="w-12 text-center border border-border rounded-lg bg-transparent py-1 outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="0" max="59"
          />
          <span class="text-muted-foreground">sec</span>
          <button class="px-2 py-1 rounded hover:bg-secondary" @click="seconds = Math.min(59, seconds + 1)">+</button>
        </div>

        <div class="flex gap-2">
          <button class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" @click="apply">Set</button>
          <button class="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground" @click="clearTimer">Turn Off</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
