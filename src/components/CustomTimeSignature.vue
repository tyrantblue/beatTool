<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{ numerator: number; denominator: number }>()
const emit = defineEmits<{
  'update:numerator': [value: number]
  'update:denominator': [value: number]
  close: []
}>()

const localNum = ref(props.numerator)
const localDen = ref(props.denominator)
const denominators = [1, 2, 4, 8, 16]

function clampNum(v: number) {
  return Math.max(1, Math.min(16, Math.round(v)))
}

function apply() {
  emit('update:numerator', clampNum(localNum.value))
  emit('update:denominator', localDen.value)
  emit('close')
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  localNum.value = clampNum(localNum.value + (e.deltaY < 0 ? 1 : -1))
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="emit('close')">
      <div class="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div class="flex w-full items-center justify-between">
          <span class="text-sm font-semibold">Custom Time Signature</span>
          <button class="text-muted-foreground hover:text-foreground" @click="emit('close')">
            <X class="size-4" />
          </button>
        </div>

        <div class="flex items-center gap-4">
          <!-- Numerator -->
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs text-muted-foreground">Beats</span>
            <input
              v-model.number="localNum"
              type="number"
              min="1" max="16" step="1"
              class="w-16 text-center font-mono text-3xl font-bold bg-transparent border border-border rounded-lg py-1 outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              @wheel="onWheel"
              @change="localNum = clampNum(localNum)"
            />
          </div>

          <span class="mt-6 text-2xl text-muted-foreground">/</span>

          <!-- Denominator -->
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs text-muted-foreground">Note value</span>
            <div class="flex gap-1">
              <button
                v-for="d in denominators"
                :key="d"
                class="rounded-md px-2 py-1 font-mono text-sm transition-colors"
                :class="localDen === d
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'"
                @click="localDen = d"
              >{{ d }}</button>
            </div>
          </div>
        </div>

        <button
          class="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          @click="apply"
        >Apply</button>
      </div>
    </div>
  </Teleport>
</template>
