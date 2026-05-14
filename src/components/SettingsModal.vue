<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { ThemeColor, ClickSound, BeatAnimation, BorderEffect } from '@/composables/useSettings'

defineProps<{
  themeColor: ThemeColor
  clickSound: ClickSound
  beatAnimation: BeatAnimation
  borderEffect: BorderEffect
}>()

const emit = defineEmits<{
  'update:themeColor': [v: ThemeColor]
  'update:clickSound': [v: ClickSound]
  'update:beatAnimation': [v: BeatAnimation]
  'update:borderEffect': [v: BorderEffect]
  reset: []
  close: []
}>()

const themes: { value: ThemeColor; label: string; ring: string }[] = [
  { value: 'blue', label: 'Blue', ring: 'ring-blue-500' },
  { value: 'purple', label: 'Purple', ring: 'ring-purple-500' },
  { value: 'green', label: 'Green', ring: 'ring-green-500' },
  { value: 'orange', label: 'Orange', ring: 'ring-orange-500' },
  { value: 'red', label: 'Red', ring: 'ring-red-500' },
]

const sounds: { value: ClickSound; label: string }[] = [
  { value: 'triangle', label: 'Triangle' },
  { value: 'sine', label: 'Sine' },
  { value: 'square', label: 'Square' },
  { value: 'wood', label: 'Wood Block' },
]

const animations: { value: BeatAnimation; label: string }[] = [
  { value: 'pulse', label: 'Ping Pulse' },
  { value: 'glow', label: 'Soft Glow' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'minimal', label: 'Minimal' },
]

const borders: { value: BorderEffect; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'glow', label: 'Glow' },
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'none', label: 'None' },
]
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="emit('close')">
      <div class="flex w-80 flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold">Settings</span>
          <button class="text-muted-foreground hover:text-foreground" @click="emit('close')">
            <X class="size-4" />
          </button>
        </div>

        <!-- Theme Color -->
        <fieldset class="flex flex-col gap-2">
          <legend class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Theme Color</legend>
          <div class="flex gap-2">
            <button
              v-for="t in themes"
              :key="t.value"
              :title="t.label"
              class="size-8 rounded-full border-2 transition-all"
              :class="[
                themeColor === t.value ? 'ring-2 ring-offset-2 ring-offset-card ' + t.ring : 'border-transparent',
                t.value === 'blue' && 'bg-blue-500',
                t.value === 'purple' && 'bg-purple-500',
                t.value === 'green' && 'bg-green-500',
                t.value === 'orange' && 'bg-orange-500',
                t.value === 'red' && 'bg-red-500',
              ]"
              @click="emit('update:themeColor', t.value)"
            />
          </div>
        </fieldset>

        <!-- Click Sound -->
        <fieldset class="flex flex-col gap-2">
          <legend class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Click Sound</legend>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="s in sounds"
              :key="s.value"
              class="rounded-full border px-3 py-1 text-xs transition-colors"
              :class="clickSound === s.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="emit('update:clickSound', s.value)"
            >{{ s.label }}</button>
          </div>
        </fieldset>

        <!-- Beat Animation -->
        <fieldset class="flex flex-col gap-2">
          <legend class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Beat Animation</legend>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="a in animations"
              :key="a.value"
              class="rounded-full border px-3 py-1 text-xs transition-colors"
              :class="beatAnimation === a.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="emit('update:beatAnimation', a.value)"
            >{{ a.label }}</button>
          </div>
        </fieldset>

        <!-- Border Effect -->
        <fieldset class="flex flex-col gap-2">
          <legend class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Border</legend>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="b in borders"
              :key="b.value"
              class="rounded-full border px-3 py-1 text-xs transition-colors"
              :class="borderEffect === b.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50'"
              @click="emit('update:borderEffect', b.value)"
            >{{ b.label }}</button>
          </div>
        </fieldset>

        <!-- Reset -->
        <button
          class="w-full rounded-lg border border-border py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          @click="emit('reset')"
        >Reset to Defaults</button>
      </div>
    </div>
  </Teleport>
</template>
