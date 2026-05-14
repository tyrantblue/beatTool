<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ currentBeat: number; beatCount: number }>();

const dots = computed(() =>
  Array.from({ length: props.beatCount }, (_, i) => i + 1),
);
</script>

<template>
  <div class="flex items-center justify-center gap-2.5">
    <div
      v-for="beat in dots"
      :key="beat"
      class="relative rounded-full transition-all duration-75"
      :class="[
        beat === 1 ? 'size-3.5' : 'size-3',
        beat === currentBeat
          ? beat === 1
            ? 'bg-primary shadow-lg shadow-primary/50 scale-125'
            : 'bg-foreground shadow-md scale-110'
          : beat === 1
            ? 'bg-primary/40'
            : 'bg-muted-foreground/30',
      ]"
    >
      <!-- glow ring on active beat -->
      <span
        v-if="beat === currentBeat"
        class="absolute -inset-1 animate-ping rounded-full"
        :class="beat === 1 ? 'bg-primary/30' : 'bg-foreground/20'"
      />
    </div>
  </div>
</template>
