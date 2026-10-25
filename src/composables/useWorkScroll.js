import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { workProgress } from './useWorkProgress'

/**
 * Scroll virtual untuk halaman Work (loop tanpa ujung).
 * `progress` adalah angka desimal yang boleh terus bertambah atau berkurang.
 * Project aktif = progress dibulatkan, lalu dibungkus (modulo) ke 0..total-1.
 *
 * Perilaku: kartu mengikuti scroll dengan cepat, lalu begitu scroll berhenti sejenak
 * langsung "snap" ke project berikutnya SEARAH gerakan (satu putaran roda = satu project).
 */

// --- Pengaturan rasa animasi (ubah di sini untuk menyetel) ---
const WHEEL_SPEED = 0.003 // seberapa jauh kartu bergerak per putaran roda (makin besar = makin sensitif)
const TOUCH_SPEED = 0.006 // sama, untuk layar sentuh
const FOLLOW_DURATION = 0.3 // detik: kartu mengejar posisi scroll (makin kecil = makin responsif)
const SNAP_DELAY = 70 // milidetik: jeda setelah scroll berhenti sebelum snap
const SNAP_DURATION = 0.8 // detik: lama meluncur ke project berikutnya
const SNAP_EASE = 'expo.out' // cepat di awal, mengerem halus di akhir
const SNAP_THRESHOLD = 0.04 // gerakan minimal agar dihitung sebagai "pindah project"
const MAX_STEPS = 2 // maksimum lompatan project dalam satu swipe
const KEY_DURATION = 0.85 // detik: lama perpindahan lewat keyboard / klik

export function useWorkScroll(total) {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const dur = (s) => (reduce ? 0 : s)

  // Mulai dari posisi terakhir (supaya kembali dari halaman lain tidak lompat ke awal).
  const start = Math.round(workProgress.value)
  const progress = ref(start)
  const state = { value: start, target: start }
  let anchor = start // project (bilangan bulat) tempat terakhir kartu berhenti
  workProgress.value = start
  const mod = (n) => ((n % total) + total) % total

  let snapTimer = null
  let touchY = null

  const tweenTo = (target, seconds, ease = 'power3.out') => {
    state.target = target
    gsap.to(state, {
      value: target,
      duration: dur(seconds),
      ease,
      overwrite: true,
      onUpdate: () => {
        progress.value = state.value
        workProgress.value = state.value
      },
    })
  }

  const active = computed(() => mod(Math.round(progress.value)))

  // Pindah ke project tertentu lewat jalur terpendek (maju atau mundur).
  const goTo = (i) => {
    clearTimeout(snapTimer)
    let diff = mod(i - anchor)
    if (diff > total / 2) diff -= total
    anchor += diff
    tweenTo(anchor, KEY_DURATION, SNAP_EASE)
  }

  const step = (dir) => {
    clearTimeout(snapTimer)
    anchor += dir
    tweenTo(anchor, KEY_DURATION, SNAP_EASE)
  }

  // Setelah scroll berhenti: snap ke project berikutnya searah gerakan.
  const queueSnap = () => {
    clearTimeout(snapTimer)
    snapTimer = setTimeout(() => {
      const d = state.target - anchor
      const dist = Math.abs(d)
      if (dist > SNAP_THRESHOLD) {
        const steps = Math.min(MAX_STEPS, Math.max(1, Math.round(dist)))
        anchor += Math.sign(d) * steps
      }
      tweenTo(anchor, SNAP_DURATION, SNAP_EASE)
    }, SNAP_DELAY)
  }

  const onWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY
    // Batasi supaya satu swipe liar tidak membuat kartu melesat terlalu jauh.
    const next = state.target + delta * WHEEL_SPEED
    const limited = Math.max(anchor - MAX_STEPS, Math.min(anchor + MAX_STEPS, next))
    tweenTo(limited, FOLLOW_DURATION)
    queueSnap()
  }

  const onKey = (e) => {
    const onControl = e.target?.closest?.('button, a, input, textarea')
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !onControl)) {
      e.preventDefault()
      step(1)
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault()
      step(-1)
    }
  }

  const onTouchStart = (e) => {
    touchY = e.touches[0].clientY
  }
  const onTouchMove = (e) => {
    if (touchY === null) return
    const y = e.touches[0].clientY
    const next = state.target + (touchY - y) * TOUCH_SPEED
    const limited = Math.max(anchor - MAX_STEPS, Math.min(anchor + MAX_STEPS, next))
    tweenTo(limited, FOLLOW_DURATION)
    touchY = y
    queueSnap()
  }
  const onTouchEnd = () => {
    touchY = null
  }

  onMounted(() => {
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    clearTimeout(snapTimer)
    gsap.killTweensOf(state)
    // Berhenti di bilangan bulat terdekat supaya logo tidak tertinggal setengah berputar.
    workProgress.value = Math.round(state.value)
  })

  return { progress, active, goTo }
}