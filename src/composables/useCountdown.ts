import { ref, watch, onUnmounted, type Ref } from 'vue'

export function useCountdown(
  duration: Ref<number>,
  playing: Ref<boolean>,
) {
  const remaining = ref(duration.value)
  const isExpired = ref(false)

  let timer: ReturnType<typeof setInterval> | null = null

  function clearTimer() {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function startTimer() {
    clearTimer()
    remaining.value = duration.value
    isExpired.value = false

    if (duration.value <= 0) return // unlimited, no countdown

    timer = setInterval(() => {
      remaining.value = Math.max(0, remaining.value - 1)

      if (remaining.value <= 0) {
        isExpired.value = true
        clearTimer()
      }
    }, 1000)
  }

  // Reset and start countdown when playing starts
  watch(playing, (isPlaying) => {
    if (isPlaying) {
      startTimer()
    } else {
      clearTimer()
      isExpired.value = false
    }
  })

  // Keep remaining in sync with duration when not playing
  watch(duration, (newDuration) => {
    if (!playing.value) {
      remaining.value = newDuration
    }
  })

  onUnmounted(() => {
    clearTimer()
  })

  return {
    remaining,
    isExpired,
  }
}
