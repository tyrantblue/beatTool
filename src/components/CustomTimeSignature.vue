<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ numerator: number; denominator: number }>()
const emit = defineEmits<{
  'update:numerator': [value: number]
  'update:denominator': [value: number]
}>()

const localNum = ref(props.numerator)
const localDen = ref(props.denominator)

const denominators = [1, 2, 4, 8, 16]

function apply() {
  emit('update:numerator', Math.max(1, Math.min(16, localNum.value)))
  emit('update:denominator', localDen.value)
}
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-4">
    <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom</span>
    <div class="flex items-center gap-3">
      <div class="flex flex-col items-center gap-1">
        <span class="text-[10px] text-muted-foreground">Beats</span>
        <div class="flex items-center gap-1">
          <button
            class="flex size-7 items-center justify-center rounded border border-border text-sm hover:bg-secondary"
            @click="localNum = Math.max(1, localNum - 1)"
          >−</button>
          <span class="w-8 text-center font-mono text-lg font-bold">{{ localNum }}</span>
          <button
            class="flex size-7 items-center justify-center rounded border border-border text-sm hover:bg-secondary"
            @click="localNum = Math.min(16, localNum + 1)"
          >+</button>
        </div>
      </div>
      <span class="mt-4 text-xl text-muted-foreground">/</span>
      <div class="flex flex-col items-center gap-1">
        <span class="text-[10px] text-muted-foreground">Unit</span>
        <div class="flex items-center gap-0.5">
          <button
            v-for="d in denominators"
            :key="d"
            class="rounded px-1.5 py-1 text-xs font-mono transition-colors"
            :class="
              localDen === d
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            "
            @click="localDen = d"
          >
            {{ d }}
          </button>
        </div>
      </div>
    </div>
    <button
      class="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      @click="apply"
    >
      Apply
    </button>
  </div>
</template>
