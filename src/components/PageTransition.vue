<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { projects } from '../data/projects'

const router = useRouter()
const label = ref('')

const root = ref(null)
const panelEl = ref(null)
const lineEl = ref(null)
const labelEl = ref(null)

let busy = false
let tl = null
let safety = null
let removeBefore = null
let removeAfter = null

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Nama halaman tujuan yang ditampilkan di tengah layar */
const labelFor = (to) => {
  if (to.params?.slug) {
    const p = projects.find((item) => item.slug === to.params.slug)
    return p?.title || 'Project'
  }
  if (to.path.startsWith('/about')) return 'About'
  return 'Projects'
}

const resetStates = () => {
  gsap.set(panelEl.value, { clipPath: 'inset(0% 100% 0% 0%)' })
  gsap.set(lineEl.value, { left: '0%', opacity: 0 })
  gsap.set(labelEl.value, { opacity: 0, y: 12 })
  gsap.set(root.value, { autoAlpha: 0 })
}

/* Fase 1: layar tertutup (halaman lama masih terlihat sampai tertutup) */
const cover = () =>
  new Promise((resolve) => {
    tl?.kill()
    gsap.set(root.value, { autoAlpha: 1 })
    gsap.set(labelEl.value, { opacity: 0, y: 12 })
    tl = gsap.timeline({ onComplete: resolve })

    tl.set(lineEl.value, { opacity: 1 }, 0)
      .fromTo(
        panelEl.value,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power3.inOut' },
        0,
      )
      .fromTo(lineEl.value, { left: '0%' }, { left: '100%', duration: 0.55, ease: 'power3.inOut' }, 0)
      .set(lineEl.value, { opacity: 0 }, 0.55)
      .to(labelEl.value, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.3)
  })

/* Fase 2: halaman baru sudah terpasang, layar dibuka */
const reveal = () =>
  new Promise((resolve) => {
    tl?.kill()
    tl = gsap.timeline({
      onComplete: () => {
        resetStates()
        resolve()
      },
    })

    tl.to(labelEl.value, { opacity: 0, y: -12, duration: 0.25, ease: 'power2.in' }, 0.1)
      .set(lineEl.value, { opacity: 1, left: '0%' }, 0.25)
      .fromTo(
        panelEl.value,
        { clipPath: 'inset(0% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.65, ease: 'power3.inOut' },
        0.25,
      )
      .fromTo(lineEl.value, { left: '0%' }, { left: '100%', duration: 0.65, ease: 'power3.inOut' }, 0.25)
      .set(lineEl.value, { opacity: 0 }, 0.9)
  })

onMounted(() => {
  resetStates()

  // Sebelum pindah halaman: tutup layar dulu, baru izinkan navigasi
  removeBefore = router.beforeEach(async (to, from) => {
    // Lewati: muat pertama, halaman yang sama, atau pengguna memilih "reduce motion"
    if (reduced() || from.matched.length === 0 || to.path === from.path) return true
    // Klik beruntun saat transisi masih berjalan diabaikan
    if (busy) return false

    busy = true
    label.value = labelFor(to)

    // Jaring pengaman: kalau navigasi macet, layar tetap dibuka
    clearTimeout(safety)
    safety = setTimeout(() => {
      if (busy) reveal().finally(() => (busy = false))
    }, 5000)

    await nextTick()
    await cover()
    return true
  })

  // Setelah halaman baru terpasang: buka layar
  removeAfter = router.afterEach(async () => {
    if (!busy) return
    clearTimeout(safety)
    await nextTick()
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    await reveal()
    busy = false
  })
})

onBeforeUnmount(() => {
  removeBefore?.()
  removeAfter?.()
  clearTimeout(safety)
  tl?.kill()
})
</script>

<template>
  <div ref="root" class="pt" aria-hidden="true">
    <div ref="panelEl" class="pt__panel" />
    <span ref="lineEl" class="pt__line" />

    <div ref="labelEl" class="pt__label">
      <span class="pt__eyebrow">// Next</span>
      <span class="pt__name">{{ label }}</span>
      <span class="pt__rule" />
    </div>
  </div>
</template>

<style scoped>
.pt {
  position: fixed;
  inset: 0;
  z-index: 900; /* di atas semua halaman dan popup, di bawah intro */
  pointer-events: none;
  visibility: hidden;
}

/* Satu panel + garis aksen di tepinya */
.pt__panel {
  position: absolute;
  inset: 0;
  background: var(--bg);
}
.pt__line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: var(--accent);
  box-shadow: 0 0 24px 4px rgba(255, 91, 58, 0.55);
  opacity: 0;
}

/* Nama halaman tujuan */
.pt__label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.2vh;
  padding: 0 7vw;
  color: var(--fg);
}
.pt__eyebrow {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}
.pt__name {
  max-width: 86vw;
  font-family: var(--font-display);
  font-size: clamp(34px, 8vw, 130px);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-align: center;
  text-transform: uppercase;
  text-wrap: balance;
}
.pt__rule {
  display: block;
  width: min(220px, 40vw);
  height: 2px;
  background: var(--accent);
}
</style>