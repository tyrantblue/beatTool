<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { Sun, Moon } from 'lucide-vue-next'
import { useMetronome, type TimeSignature as TS } from '@/composables/useMetronome'
import { useCountdown } from '@/composables/useCountdown'
import MetronomeDisplay from '@/components/MetronomeDisplay.vue'
import BpmSlider from '@/components/BpmSlider.vue'
import PlayButton from '@/components/PlayButton.vue'
import BeatIndicator from '@/components/BeatIndicator.vue'
import PresetTempo from '@/components/PresetTempo.vue'
import TimeSignature from '@/components/TimeSignature.vue'
import CustomTimeSignature from '@/components/CustomTimeSignature.vue'
import CountdownDisplay from '@/components/CountdownDisplay.vue'
import TimingDebug from '@/components/TimingDebug.vue'

const bpm = ref(120)
const timeSignature = ref<TS>({ numerator: 4, denominator: 4 })
const playing = ref(false)
const duration = ref(0)
const showCustom = ref(false)

const { currentBeat, lastBeatTime, start, stop, toggle } = useMetronome(bpm, timeSignature, playing)
const { remaining, isExpired } = useCountdown(duration, playing)

const isDark = useDark()
const toggleDark = useToggle(isDark)

const beatInterval = computed(() => bpm.value > 0 ? 60 / bpm.value : 0.5)

watch(isExpired, (expired) => {
  if (expired) stop()
})

function onPresetSelect(value: number) {
  bpm.value = value
}

function onTimeSignatureUpdate(num: number, den: number) {
  timeSignature.value = { numerator: num, denominator: den }
  showCustom.value = false
}

;(window as any).__metro = {
  bpm, timeSignature, playing, duration,
  currentBeat, remaining, isExpired,
  start, stop, toggle,
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center bg-background text-foreground p-4 transition-colors duration-300">
    <!-- Dark mode toggle -->
    <button
      class="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      @click="toggleDark()"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <Sun v-if="isDark" class="size-4" />
      <Moon v-else class="size-4" />
    </button>

    <!-- Card with enter transition -->
    <Transition name="card" appear>
      <div class="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <BeatIndicator
          :current-beat="playing ? currentBeat : 0"
          :beat-count="timeSignature.numerator"
        />

        <MetronomeDisplay
          :bpm="bpm"
          @update:bpm="bpm = $event"
        />

        <BpmSlider
          :bpm="bpm"
          @update:bpm="bpm = $event"
        />

        <PresetTempo @select="onPresetSelect" />

        <div class="flex w-full items-start justify-between gap-4">
          <div class="flex flex-col items-center gap-2">
            <TimeSignature
              :numerator="timeSignature.numerator"
              :denominator="timeSignature.denominator"
              @update:numerator="(n:number) => onTimeSignatureUpdate(n, timeSignature.denominator)"
              @update:denominator="(d:number) => onTimeSignatureUpdate(timeSignature.numerator, d)"
              @open-custom="showCustom = !showCustom"
            />
            <CustomTimeSignature
              v-if="showCustom"
              :numerator="timeSignature.numerator"
              :denominator="timeSignature.denominator"
              @update:numerator="(n:number) => onTimeSignatureUpdate(n, timeSignature.denominator)"
              @update:denominator="(d:number) => onTimeSignatureUpdate(timeSignature.numerator, d)"
            />
          </div>

          <PlayButton
            :playing="playing"
            :beat-interval="beatInterval"
            class="mt-6"
            @toggle="toggle()"
          />

          <CountdownDisplay
            :duration="duration"
            :remaining="remaining"
            :playing="playing"
            class="mt-1"
            @update:duration="duration = $event"
          />
        </div>

        <TimingDebug
          :last-beat-time="lastBeatTime"
          :bpm="bpm"
          :numerator="timeSignature.numerator"
          :denominator="timeSignature.denominator"
          :playing="playing"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.card-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.card-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>
