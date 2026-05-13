<script setup lang="ts">
defineProps<{ numerator: number; denominator: number }>()
const emit = defineEmits<{
  'update:numerator': [value: number]
  'update:denominator': [value: number]
  'open-custom': []
}>()

const presets = [
  { num: 2, den: 4 },
  { num: 3, den: 4 },
  { num: 4, den: 4 },
  { num: 6, den: 8 },
  { num: 8, den: 8 },
]
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time Signature</span>
    <div class="flex flex-wrap items-center justify-center gap-1.5">
      <button
        v-for="ts in presets"
        :key="`${ts.num}/${ts.den}`"
        class="rounded-md border px-2.5 py-1 text-sm font-mono transition-colors"
        :class="
          numerator === ts.num && denominator === ts.den
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
        "
        @click="emit('update:numerator', ts.num); emit('update:denominator', ts.den)"
      >
        {{ ts.num }}/{{ ts.den }}
      </button>
      <button
        class="rounded-md border border-dashed border-border px-2.5 py-1 text-sm font-mono text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        @click="emit('open-custom')"
        :class="{
          'border-primary bg-primary/10 text-primary':
            !presets.some(p => p.num === numerator && p.den === denominator),
        }"
      >
        {{ !presets.some(p => p.num === numerator && p.den === denominator) ? `${numerator}/${denominator}` : '···' }}
      </button>
    </div>
  </div>
</template>
