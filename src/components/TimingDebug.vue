<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  lastBeatTime: number
  bpm: number
  numerator: number
  denominator: number
  playing: boolean
}>()

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
  const delta = (t - prevTime) * 1000
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

function ok(val: string): boolean {
  const n = parseFloat(val)
  if (isNaN(n)) return true
  return Math.abs(n - expectedMs.value) < 2
}
</script>

<template>
  <div class="w-full rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs">
    <div class="grid grid-cols-5 gap-x-2 gap-y-1 text-center">
      <span class="text-muted-foreground">预期</span>
      <span class="text-muted-foreground">上次</span>
      <span class="text-muted-foreground">均(16)</span>
      <span class="text-muted-foreground">漂移</span>
      <span class="text-muted-foreground">拍数</span>

      <span class="text-foreground">{{ expectedMs.toFixed(0) }}ms</span>
      <span :class="ok(lastMs) ? 'text-green-500' : 'text-red-500'">{{ lastMs }}ms</span>
      <span :class="ok(avgMs) ? 'text-green-500' : 'text-red-500'">{{ avgMs }}ms</span>
      <span :class="Math.abs(parseFloat(driftMs)) < 3 ? 'text-green-500' : 'text-red-500'">{{ driftMs }}ms</span>
      <span class="text-foreground">{{ beatCount }}</span>
    </div>
  </div>
</template>
