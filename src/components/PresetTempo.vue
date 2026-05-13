<script setup lang="ts">
const presets = [
  { label: 'Largo', bpm: 40 },
  { label: 'Adagio', bpm: 66 },
  { label: 'Andante', bpm: 76 },
  { label: 'Moderato', bpm: 108 },
  { label: 'Allegro', bpm: 120 },
  { label: 'Presto', bpm: 168 },
]

const emit = defineEmits<{ select: [bpm: number] }>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <button
      v-for="p in presets"
      :key="p.bpm"
      class="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
      @click="emit('select', p.bpm)"
    >
      {{ p.label }} <span class="font-mono">{{ p.bpm }}</span>
    </button>
  </div>
</template>
