<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import type { BeatAnimation } from '@/composables/useSettings'

const props = defineProps<{
  currentBeat: number
  beatCount: number
  animation: BeatAnimation
}>()

const dots = computed(() => Array.from({ length: props.beatCount }, (_, i) => i + 1))

// Flash the active dot for ~80ms then clear, so it doesn't stay lit
// until the next beat. currentBeat=0 means stopped — clear immediately.
const activeBeat = ref(0)
let flashTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.currentBeat, (beat) => {
  if (flashTimer !== null) clearTimeout(flashTimer)
  if (beat === 0) {
    activeBeat.value = 0
    return
  }
  activeBeat.value = beat
  flashTimer = setTimeout(() => {
    activeBeat.value = 0
  }, 80)
})

onUnmounted(() => {
  if (flashTimer !== null) clearTimeout(flashTimer)
})
</script>

<template>
  <div class="flex items-end justify-center gap-2">
    <div
      v-for="beat in dots"
      :key="beat"
      class="relative rounded-full transition-all duration-75"
      :class="[
        beat === 1 ? 'size-4' : 'size-3',
        beat === activeBeat
          ? beat === 1
            ? 'bg-primary shadow-lg shadow-primary/60 scale-150'
            : 'bg-foreground shadow-md scale-110'
          : beat === 1
            ? 'bg-primary/50'
            : 'bg-muted-foreground/25',
        animation === 'bounce' && beat === activeBeat ? '-translate-y-1' : '',
        animation === 'glow' && beat === activeBeat
          ? beat === 1
            ? 'shadow-primary/80 shadow-xl'
            : 'shadow-foreground/30 shadow-lg'
          : '',
      ]"
    >
      <!-- Pulse: ping ring -->
      <span
        v-if="beat === activeBeat && animation === 'pulse'"
        class="absolute -inset-1 animate-ping rounded-full"
        :class="beat === 1 ? 'bg-primary/40' : 'bg-foreground/15'"
      />
      <!-- Glow: slow-pulse ring -->
      <span
        v-if="beat === activeBeat && animation === 'glow'"
        class="absolute -inset-2 animate-pulse rounded-full"
        :class="beat === 1 ? 'bg-primary/20' : 'bg-foreground/10'"
      />
      <!-- Accent ring (beat 1, not active) -->
      <span
        v-if="beat === 1 && beat !== activeBeat && animation !== 'minimal'"
        class="absolute -inset-0.5 rounded-full border border-primary/30"
      />
    </div>
  </div>
</template>
