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
  const lastBeatTime = ref(0)

  let audioContext: AudioContext | null = null
  let schedulerTimer: ReturnType<typeof setTimeout> | null = null
  let beatUpdater: ReturnType<typeof setInterval> | null = null
  let anchorTime = 0
  let beatsAfterAnchor = 0
  let beatIndex = 0

  // ---- audio plumbing ----

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext()
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    return audioContext
  }

  function destroyAudioContext() {
    if (schedulerTimer !== null) {
      clearTimeout(schedulerTimer)
      schedulerTimer = null
    }
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
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

  // ---- timing helpers ----

  function secondsPerBeat(): number {
    return (60 / bpm.value) * (4 / timeSignature.value.denominator)
  }

  function beatTime(after: number): number {
    return anchorTime + after * secondsPerBeat()
  }

  // ---- beat indicator updater (polled from audio clock) ----

  function updateCurrentBeat() {
    if (!audioContext || !playing.value) return
    const elapsed = audioContext.currentTime - anchorTime
    if (elapsed < 0) return
    const spb = secondsPerBeat()
    if (spb <= 0) return
    const totalBeats = Math.floor(elapsed / spb)
    currentBeat.value = (totalBeats % timeSignature.value.numerator) + 1
  }

  // ---- look-ahead scheduler ----

  function scheduler() {
    const ctx = getAudioContext()
    const spb = secondsPerBeat()
    const lookAhead = Math.max(0.2, spb * 4)

    // Re-sync if we fell behind (e.g. tab was backgrounded)
    const nextTime = beatTime(beatsAfterAnchor)
    if (nextTime < ctx.currentTime - spb) {
      const skippedBeats = Math.floor((ctx.currentTime - anchorTime) / spb)
      beatsAfterAnchor = Math.max(beatsAfterAnchor, skippedBeats)
      beatIndex = beatsAfterAnchor % timeSignature.value.numerator
    }

    while (beatTime(beatsAfterAnchor) < ctx.currentTime + lookAhead) {
      const t = beatTime(beatsAfterAnchor)
      scheduleClick(t, beatIndex === 0)
      lastBeatTime.value = t
      beatsAfterAnchor++
      beatIndex++
      if (beatIndex >= timeSignature.value.numerator) {
        beatIndex = 0
      }
    }

    schedulerTimer = setTimeout(scheduler, 25)
  }

  // ---- public API ----

  function start() {
    if (playing.value) return

    anchorTime = getAudioContext().currentTime
    beatsAfterAnchor = 0
    beatIndex = 0
    currentBeat.value = 1

    playing.value = true
    scheduler()
    beatUpdater = setInterval(updateCurrentBeat, 33)
  }

  function stop() {
    if (!playing.value) return

    playing.value = false
    destroyAudioContext()
    if (beatUpdater !== null) {
      clearInterval(beatUpdater)
      beatUpdater = null
    }
    currentBeat.value = 1
  }

  function toggle() {
    playing.value ? stop() : start()
  }

  // ---- mid-playback parameter changes ----

  function restartAudio() {
    if (!playing.value) return

    destroyAudioContext()

    // Fresh context, first beat one interval from now.
    // Always start at beat 0 (accent) — simplest predictable behaviour.
    anchorTime = getAudioContext().currentTime
    beatsAfterAnchor = 1
    beatIndex = 0
    currentBeat.value = 1

    scheduler()
  }

  // BPM or denominator change → full restart to clear old-tempo clicks
  watch([bpm, () => timeSignature.value.denominator], () => {
    restartAudio()
  })

  // Numerator change → restart to keep accent pattern aligned
  watch(() => timeSignature.value.numerator, () => {
    restartAudio()
  })

  return {
    currentBeat,
    lastBeatTime,
    start,
    stop,
    toggle,
  }
}
