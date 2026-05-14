<script setup lang="ts">
import { computed } from 'vue'
import type { BeatAnimation } from '@/composables/useSettings'

const props = defineProps<{
  currentBeat: number
  beatCount: number
  animation: BeatAnimation
}>()

const dots = computed(() => Array.from({ length: props.beatCount }, (_, i) => i + 1))
</script>

<template>
  <div class="flex items-end justify-center gap-2">
    <div
      v-for="beat in dots"
      :key="beat"
      class="relative rounded-full transition-all duration-75"
      :class="[
        beat === 1 ? 'size-4' : 'size-3',
        beat === currentBeat
          ? beat === 1
            ? 'bg-primary shadow-lg shadow-primary/60 scale-150'
            : 'bg-foreground shadow-md scale-110'
          : beat === 1
            ? 'bg-primary/50'
            : 'bg-muted-foreground/25',
        // Bounce animation (vertical shift)
        animation === 'bounce' && beat === currentBeat ? '-translate-y-1' : '',
        // Glow animation (soft shadow pulse instead of ping)
        animation === 'glow' && beat === currentBeat
          ? beat === 1
            ? 'shadow-primary/80 shadow-xl'
            : 'shadow-foreground/30 shadow-lg'
          : '',
      ]"
    >
      <!-- Pulse: ping ring -->
      <span
        v-if="beat === currentBeat && animation === 'pulse'"
        class="absolute -inset-1 animate-ping rounded-full"
        :class="beat === 1 ? 'bg-primary/40' : 'bg-foreground/15'"
      />
      <!-- Glow: slow-pulse ring -->
      <span
        v-if="beat === currentBeat && animation === 'glow'"
        class="absolute -inset-2 animate-pulse rounded-full"
        :class="beat === 1 ? 'bg-primary/20' : 'bg-foreground/10'"
      />
      <!-- Accent ring (beat 1, not active) -->
      <span
        v-if="beat === 1 && beat !== currentBeat && animation !== 'minimal'"
        class="absolute -inset-0.5 rounded-full border border-primary/30"
      />
    </div>
  </div>
</template>
