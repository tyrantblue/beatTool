<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ currentBeat: number; beatCount: number }>()

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
      ]"
    >
      <!-- ping ring on active beat -->
      <span
        v-if="beat === currentBeat"
        class="absolute -inset-1 animate-ping rounded-full"
        :class="beat === 1 ? 'bg-primary/40' : 'bg-foreground/15'"
      />
      <!-- accent ring on beat 1 when NOT active (always visible hint) -->
      <span
        v-if="beat === 1 && beat !== currentBeat"
        class="absolute -inset-0.5 rounded-full border border-primary/30"
      />
    </div>
  </div>
</template>
