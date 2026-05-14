import { useStorage } from '@vueuse/core'

export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red'
export type ClickSound = 'triangle' | 'sine' | 'square' | 'wood'
export type BeatAnimation = 'pulse' | 'glow' | 'bounce' | 'minimal'
export type BorderEffect = 'default' | 'glow' | 'rainbow' | 'none'

export interface AppSettings {
  themeColor: ThemeColor
  clickSound: ClickSound
  beatAnimation: BeatAnimation
  borderEffect: BorderEffect
}

const defaults: AppSettings = {
  themeColor: 'blue',
  clickSound: 'triangle',
  beatAnimation: 'pulse',
  borderEffect: 'default',
}

export function useSettings() {
  const themeColor = useStorage<ThemeColor>('beattool-theme', defaults.themeColor)
  const clickSound = useStorage<ClickSound>('beattool-sound', defaults.clickSound)
  const beatAnimation = useStorage<BeatAnimation>('beattool-anim', defaults.beatAnimation)
  const borderEffect = useStorage<BorderEffect>('beattool-border', defaults.borderEffect)

  function resetAll() {
    themeColor.value = defaults.themeColor
    clickSound.value = defaults.clickSound
    beatAnimation.value = defaults.beatAnimation
    borderEffect.value = defaults.borderEffect
  }

  return {
    themeColor,
    clickSound,
    beatAnimation,
    borderEffect,
    resetAll,
  }
}
