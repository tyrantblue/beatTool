import { ref, watch, type Ref } from 'vue'

export interface TimeSignature {
  numerator: number   // beats per measure (1-16)
  denominator: number // beat unit (1, 2, 4, 8, 16)
}

export function useMetronome(
  bpm: Ref<number>,
  timeSignature: Ref<TimeSignature>,
  playing: Ref<boolean>,
) {
  const currentBeat = ref(1)

  let audioContext: AudioContext | null = null
  let schedulerTimer: ReturnType<typeof setTimeout> | null = null
  let nextBeatTime = 0
  let beatIndex = 0 // 0-based internal counter

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext()
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    return audioContext
  }

  function scheduleClick(time: number, isAccent: boolean) {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.value = isAccent ? 880 : 660

    const duration = isAccent ? 0.03 : 0.02
    gain.gain.setValueAtTime(1, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + duration)
  }

  function scheduler() {
    const ctx = getAudioContext()
    const lookAhead = 0.1 // seconds

    while (nextBeatTime < ctx.currentTime + lookAhead) {
      const isAccent = beatIndex === 0
      scheduleClick(nextBeatTime, isAccent)

      // Update the reactive beat indicator (1-based)
      currentBeat.value = beatIndex + 1

      // Advance beat
      beatIndex++
      if (beatIndex >= timeSignature.value.numerator) {
        beatIndex = 0
      }

      // BPM always = quarter-note beats per minute.
      // Scale interval by 4/denominator so smaller note values click faster.
      const secondsPerBeat = (60 / bpm.value) * (4 / timeSignature.value.denominator)
      nextBeatTime += secondsPerBeat
    }

    schedulerTimer = setTimeout(scheduler, 25)
  }

  function start() {
    if (playing.value) return

    const ctx = getAudioContext()
    nextBeatTime = ctx.currentTime + 0.05
    beatIndex = 0
    currentBeat.value = 1

    playing.value = true
    scheduler()
  }

  function stop() {
    if (!playing.value) return

    playing.value = false
    if (schedulerTimer !== null) {
      clearTimeout(schedulerTimer)
      schedulerTimer = null
    }
    currentBeat.value = 1
  }

  function toggle() {
    if (playing.value) {
      stop()
    } else {
      start()
    }
  }

  // When numerator changes mid-playback, reset beat cycle if we've overflowed
  watch(() => timeSignature.value.numerator, (newNum) => {
    if (beatIndex >= newNum) {
      beatIndex = 0
    }
  })

  return {
    currentBeat,
    start,
    stop,
    toggle,
  }
}
