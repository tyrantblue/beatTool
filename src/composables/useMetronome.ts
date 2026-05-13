import { ref, watch, type Ref } from 'vue'

export interface TimeSignature {
  numerator: number
  denominator: number
}

export function useMetronome(
  bpm: Ref<number>,
  timeSignature: Ref<TimeSignature>,
  playing: Ref<boolean>,
) {
  const currentBeat = ref(1)

  let audioContext: AudioContext | null = null
  let schedulerTimer: ReturnType<typeof setTimeout> | null = null
  let beatUpdater: ReturnType<typeof setInterval> | null = null
  let nextBeatTime = 0
  let beatIndex = 0
  let startTime = 0

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

    const dur = isAccent ? 0.03 : 0.02
    gain.gain.setValueAtTime(1, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + dur)
  }

  function secondsPerBeat(): number {
    return (60 / bpm.value) * (4 / timeSignature.value.denominator)
  }

  function updateCurrentBeat() {
    const ctx = audioContext
    if (!ctx || !playing.value) return
    const elapsed = ctx.currentTime - startTime
    if (elapsed < 0) return
    const spb = secondsPerBeat()
    if (spb <= 0) return
    const totalBeats = Math.floor(elapsed / spb)
    currentBeat.value = (totalBeats % timeSignature.value.numerator) + 1
  }

  function scheduler() {
    const ctx = getAudioContext()
    const spb = secondsPerBeat()
    // Keep at least 1.5 beats ahead, min 100ms
    const lookAhead = Math.max(0.1, spb * 1.5)

    // If we fell behind (e.g. tab was backgrounded), resync
    if (nextBeatTime < ctx.currentTime - spb) {
      const elapsedBeats = Math.floor((ctx.currentTime - startTime) / spb)
      nextBeatTime = startTime + elapsedBeats * spb
      beatIndex = elapsedBeats % timeSignature.value.numerator
    }

    while (nextBeatTime < ctx.currentTime + lookAhead) {
      const isAccent = beatIndex === 0
      scheduleClick(nextBeatTime, isAccent)

      beatIndex++
      if (beatIndex >= timeSignature.value.numerator) {
        beatIndex = 0
      }
      nextBeatTime += spb
    }

    // Wake up at half the lookAhead window
    schedulerTimer = setTimeout(scheduler, Math.max(15, (lookAhead / 2) * 1000))
  }

  function start() {
    if (playing.value) return

    const ctx = getAudioContext()
    startTime = ctx.currentTime + 0.05
    nextBeatTime = startTime
    beatIndex = 0
    currentBeat.value = 1

    playing.value = true
    scheduler()
    // Poll currentBeat ~30fps from actual elapsed time
    beatUpdater = setInterval(updateCurrentBeat, 33)
  }

  function stop() {
    if (!playing.value) return

    playing.value = false
    if (schedulerTimer !== null) {
      clearTimeout(schedulerTimer)
      schedulerTimer = null
    }
    if (beatUpdater !== null) {
      clearInterval(beatUpdater)
      beatUpdater = null
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
