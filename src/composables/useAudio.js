import { ref } from 'vue'

// State bersama (singleton) supaya header dan halaman Work memakai toggle yang sama.
const enabled = ref(false)
let ctx = null

function play() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const t = ctx.currentTime

    osc.type = 'sine'
    osc.frequency.value = 520
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)

    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.2)
  } catch {
    // Audio tidak tersedia, abaikan.
  }
}

export function useAudio() {
  return {
    enabled,
    toggle() {
      enabled.value = !enabled.value
      if (enabled.value) play()
    },
    tick() {
      if (enabled.value) play()
    },
  }
}
