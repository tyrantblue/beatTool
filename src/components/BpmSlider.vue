<script setup lang="ts">
import { Slider } from '@/components/ui/slider'

defineProps<{ bpm: number }>()
const emit = defineEmits<{ 'update:bpm': [value: number] }>()

function onUpdate(value: number[] | undefined) {
  if (value && value.length > 0) {
    emit('update:bpm', value[0])
  }
}
</script>

<template>
  <div class="w-full max-w-md px-4">
    <div class="flex items-center gap-3">
      <span class="text-xs font-mono text-muted-foreground w-8 text-right">20</span>
      <Slider
        :model-value="[bpm]"
        :min="20"
        :max="300"
        :step="1"
        class="flex-1"
        @update:model-value="onUpdate"
      />
      <span class="text-xs font-mono text-muted-foreground w-8">300</span>
    </div>
  </div>
</template>
