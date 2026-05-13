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
  // nextBeatTime is the absolute AudioContext time of the next beat to schedule.
  // It is always computed as anchorTime + beatsAfterAnchor * spb,
  // never accumulated with +=, so floating-point drift cannot compound.
  let anchorTime = 0
  let beatsAfterAnchor = 0
  let beatIndex = 0

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

  // Absolute time of the beat `beatsAfterAnchor` beats after the anchor.
  function beatTime(after: number): number {
    return anchorTime + after * secondsPerBeat()
  }

  function updateCurrentBeat() {
    const ctx = audioContext
    if (!ctx || !playing.value) return
    const elapsed = ctx.currentTime - anchorTime
    if (elapsed < 0) return
    const spb = secondsPerBeat()
    if (spb <= 0) return
    const totalBeats = Math.floor(elapsed / spb)
    currentBeat.value = (totalBeats % timeSignature.value.numerator) + 1
  }

  function scheduler() {
    const ctx = getAudioContext()
    const spb = secondsPerBeat()
    // Cover at least 4 beats ahead so setTimeout jitter cannot starve us.
    const lookAhead = Math.max(0.2, spb * 4)

    // If scheduler was starved (e.g. tab backgrounded), jump forward
    const nextTime = beatTime(beatsAfterAnchor)
    if (nextTime < ctx.currentTime - spb) {
      const skippedBeats = Math.floor((ctx.currentTime - anchorTime) / spb)
      beatsAfterAnchor = Math.max(beatsAfterAnchor, skippedBeats)
      beatIndex = beatsAfterAnchor % timeSignature.value.numerator
    }

    // Schedule every beat that fits inside the look-ahead window
    while (beatTime(beatsAfterAnchor) < ctx.currentTime + lookAhead) {
      scheduleClick(beatTime(beatsAfterAnchor), beatIndex === 0)
      beatsAfterAnchor++
      beatIndex++
      if (beatIndex >= timeSignature.value.numerator) {
        beatIndex = 0
      }
    }

    // Wake up frequently enough to refill the window
    schedulerTimer = setTimeout(scheduler, Math.max(15, (lookAhead / 4) * 1000))
  }

  function start() {
    if (playing.value) return

    const ctx = getAudioContext()
    anchorTime = ctx.currentTime
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

  // When BPM or denominator changes mid-playback, re-anchor so the next
  // beat fires exactly one new-spb interval from now.
  watch([bpm, () => timeSignature.value.denominator], () => {
    if (!playing.value || !audioContext) return
    anchorTime = audioContext.currentTime
    beatsAfterAnchor = 1
    beatIndex = currentBeat.value // keep the beat position, advance on next tick
    if (beatIndex >= timeSignature.value.numerator) beatIndex = 0
  })

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
