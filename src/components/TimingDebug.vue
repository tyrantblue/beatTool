<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  lastBeatTime: number
  bpm: number
  numerator: number
  denominator: number
  playing: boolean
}>()

const visible = ref(false)

const expectedMs = computed(() => (60000 / props.bpm) * (4 / props.denominator))

const intervals = ref<number[]>([])
let prevTime = 0
let startTime = 0
let beatCount = 0

watch(() => props.lastBeatTime, (t) => {
  if (!props.playing || t <= 0) return
  if (startTime === 0) {
    startTime = t
    prevTime = t
    beatCount = 0
    intervals.value = []
    return
  }
  const delta = (t - prevTime) * 1000 // ms
  intervals.value.push(delta)
  if (intervals.value.length > 16) intervals.value.shift()
  prevTime = t
  beatCount++
})

watch(() => props.playing, (p) => {
  if (!p) {
    startTime = 0
    prevTime = 0
    beatCount = 0
    intervals.value = []
  }
})

const lastMs = computed(() => {
  if (intervals.value.length === 0) return '—'
  return intervals.value[intervals.value.length - 1].toFixed(1)
})

const avgMs = computed(() => {
  if (intervals.value.length === 0) return '—'
  const sum = intervals.value.reduce((a, b) => a + b, 0)
  return (sum / intervals.value.length).toFixed(1)
})

const driftMs = computed(() => {
  if (startTime === 0 || beatCount === 0) return '—'
  const expectedTotal = (beatCount * expectedMs.value) / 1000
  const actualTotal = prevTime - startTime
  const drift = (actualTotal - expectedTotal) * 1000
  return `${drift >= 0 ? '+' : ''}${drift.toFixed(1)}`
})

// Toggle with Ctrl+Shift+D
function onKey(e: KeyboardEvent) {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    visible.value = !visible.value
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKey)
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed bottom-4 right-4 z-50 rounded-lg border border-border bg-card/95 p-3 font-mono text-xs shadow-lg backdrop-blur-sm"
  >
    <div class="flex items-center justify-between gap-4 mb-2">
      <span class="font-semibold text-foreground">Timing Debug</span>
      <button
        class="text-muted-foreground hover:text-foreground"
        @click="visible = false"
      >×</button>
    </div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-1">
      <span class="text-muted-foreground">BPM / 拍号</span>
      <span class="text-foreground">{{ bpm }} / {{ numerator }}/{{ denominator }}</span>

      <span class="text-muted-foreground">预期间隔</span>
      <span class="text-foreground">{{ expectedMs.toFixed(1) }} ms</span>

      <span class="text-muted-foreground">上次间隔</span>
      <span
        class="font-bold"
        :class="Math.abs((parseFloat(lastMs) - expectedMs)) < 2 ? 'text-green-500' : 'text-red-500'"
      >{{ lastMs }} ms</span>

      <span class="text-muted-foreground">平均 (最近 16)</span>
      <span
        class=""
        :class="Math.abs((parseFloat(avgMs) - expectedMs)) < 2 ? 'text-green-500' : 'text-red-500'"
      >{{ avgMs }} ms</span>

      <span class="text-muted-foreground">累计漂移</span>
      <span
        class="font-bold"
        :class="Math.abs(parseFloat(driftMs)) < 3 ? 'text-green-500' : 'text-red-500'"
      >{{ driftMs }} ms</span>

      <span class="text-muted-foreground">已计拍数</span>
      <span class="text-foreground">{{ beatCount }}</span>
    </div>
    <div class="mt-2 text-[10px] text-muted-foreground">
      Ctrl+Shift+D 切换
    </div>
  </div>
</template>
