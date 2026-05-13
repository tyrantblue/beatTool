<script setup lang="ts">
import { computed } from 'vue'
import { Play, Square } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{ playing: boolean; beatInterval: number }>()
const emit = defineEmits<{ toggle: [] }>()

const auraStyle = computed(() => ({
  animationDuration: `${props.beatInterval * 4}s`,
}))
</script>

<template>
  <div class="relative flex items-center justify-center">
    <!-- Breathing aura rings -->
    <span
      v-if="playing"
      class="absolute inset-0 animate-pulse rounded-full bg-primary/20"
      :style="auraStyle"
    />
    <span
      v-if="playing"
      class="absolute -inset-3 animate-pulse rounded-full bg-primary/10"
      :style="{ animationDuration: `${beatInterval * 4}s`, animationDelay: `${beatInterval * 2}s` }"
    />

    <Button
      variant="default"
      size="icon-lg"
      class="relative z-10 !size-16 rounded-full transition-transform active:scale-95 [&_svg]:!size-7"
      @click="emit('toggle')"
      :aria-label="playing ? 'Stop' : 'Play'"
    >
      <Play v-if="!playing" class="size-7 fill-current ml-0.5" />
      <Square v-else class="size-7 fill-current" />
    </Button>
  </div>
</template>
