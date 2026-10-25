<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

/* ------------------------------------------------------------------
   Pengaturan (ubah di sini)
   ------------------------------------------------------------------ */
const NAME = ['JEFFREY', 'ALI'] // kata terakhir berwarna aksen
const STORAGE_KEY = 'ja-intro-seen'
const MAX_PARTICLES = 5500 // jumlah partikel maksimum (desktop)
const MAX_PARTICLES_MOBILE = 3800
const MORPH_AT = 1.0 // kapan bola berubah jadi tulisan (detik)
const EXPLODE_AT = 2.75 // kapan partikel menembus layar (detik)

/* Hanya tampil sekali per kunjungan (tab), dan tidak untuk "reduce motion".
   Untuk menonton ulang kapan saja: buka  /?intro  */
const replay = new URLSearchParams(window.location.search).has('intro')
const shouldPlay = () => {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    if (replay) return true
    if (sessionStorage.getItem(STORAGE_KEY)) return false
  } catch {
    /* diabaikan */
  }
  return true
}

const active = ref(shouldPlay())
const root = ref(null)
const canvasEl = ref(null)

let tl = null
let draw = null

/* Selama animasi berjalan, scroll dan keyboard tidak boleh sampai ke halaman di belakang */
const stop = (e) => {
  e.preventDefault()
  e.stopImmediatePropagation()
}
const onKey = (e) => {
  e.stopImmediatePropagation()
  if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip()
}
const addBlockers = () => {
  window.addEventListener('wheel', stop, { capture: true, passive: false })
  window.addEventListener('touchmove', stop, { capture: true, passive: false })
  window.addEventListener('keydown', onKey, true)
}
const removeBlockers = () => {
  window.removeEventListener('wheel', stop, true)
  window.removeEventListener('touchmove', stop, true)
  window.removeEventListener('keydown', onKey, true)
}

const skip = () => {
  tl?.timeScale(3.5) // dipercepat, bukan dipotong, supaya tetap halus
}

const stopLoop = () => {
  if (draw) gsap.ticker.remove(draw)
  draw = null
}

const finish = () => {
  stopLoop()
  removeBlockers()
  active.value = false
}

const cssVar = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

/* ==================================================================
   Adegan partikel:
   1. Bola partikel 3D bermekaran dari titik tengah sambil berputar
   2. Bola berubah menjadi tulisan nama (gelombang dari kiri ke kanan)
   3. Partikel meledak ke arah kamera dan membuka halaman
   ================================================================== */
const buildScene = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = window.innerWidth
  const H = window.innerHeight
  const mobile = W < 700
  const limit = mobile ? MAX_PARTICLES_MOBILE : MAX_PARTICLES

  const cv = canvasEl.value
  cv.width = Math.round(W * dpr)
  cv.height = Math.round(H * dpr)
  const c = cv.getContext('2d')
  c.setTransform(dpr, 0, 0, dpr, 0, 0)

  const accent = cssVar('--accent', '#ff5b3a')
  const fg = cssVar('--fg', '#f1efe9')
  const family = cssVar('--font-display', 'sans-serif')

  /* ---- 1. Gambar tulisan di canvas tersembunyi lalu ambil titik-titiknya ---- */
  const off = document.createElement('canvas')
  off.width = W
  off.height = H
  const o = off.getContext('2d', { willReadFrequently: true })
  o.textBaseline = 'middle'
  o.textAlign = 'left'

  let fs = mobile ? W * 0.24 : Math.min(W * 0.14, H * 0.3)
  const measure = () => {
    o.font = `500 ${fs}px ${family}`
    return { wJ: o.measureText(NAME[0]).width, wA: o.measureText(NAME[1]).width }
  }
  let m = measure()
  if (mobile) {
    while (Math.max(m.wJ, m.wA) > W * 0.84) {
      fs *= 0.95
      m = measure()
    }
    const gapY = fs * 0.55
    o.fillStyle = fg
    o.fillText(NAME[0], W / 2 - m.wJ / 2, H / 2 - gapY)
    o.fillStyle = accent
    o.fillText(NAME[1], W / 2 - m.wA / 2, H / 2 + gapY)
  } else {
    let gap = fs * 0.28
    while (m.wJ + gap + m.wA > W * 0.84) {
      fs *= 0.95
      gap = fs * 0.28
      m = measure()
    }
    const startX = W / 2 - (m.wJ + gap + m.wA) / 2
    o.fillStyle = fg
    o.fillText(NAME[0], startX, H / 2)
    o.fillStyle = accent
    o.fillText(NAME[1], startX + m.wJ + gap, H / 2)
  }

  const img = o.getImageData(0, 0, W, H).data
  let step = 3
  let pts = []
  for (;;) {
    pts = []
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const idx = (y * W + x) * 4
        if (img[idx + 3] > 140) pts.push(x, y, img[idx] - img[idx + 1] > 80 ? 1 : 0)
      }
    }
    if (pts.length / 3 <= limit) break
    step++
  }

  const N = pts.length / 3
  if (!N) return false

  /* ---- 2. Siapkan data tiap partikel ---- */
  const order = Array.from({ length: N }, (_, i) => i)
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }

  const Tx = new Float32Array(N) // posisi tujuan (di tulisan), relatif ke tengah layar
  const Ty = new Float32Array(N)
  const Cc = new Uint8Array(N) // 0 = putih, 1 = aksen
  const Sx = new Float32Array(N) // posisi di bola (satuan radius)
  const Sy = new Float32Array(N)
  const Sz = new Float32Array(N)
  const D = new Float32Array(N) // jeda per partikel (gelombang kiri ke kanan)
  const DX = new Float32Array(N) // arah ledakan
  const DY = new Float32Array(N)
  const SIZE = new Float32Array(N)

  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const src = order[i] * 3
    Tx[i] = pts[src] - W / 2
    Ty[i] = pts[src + 1] - H / 2
    Cc[i] = pts[src + 2]

    const yy = 1 - (2 * (i + 0.5)) / N
    const rr = Math.sqrt(1 - yy * yy)
    const ph = i * golden
    const shell = 0.88 + Math.random() * 0.24
    Sx[i] = Math.cos(ph) * rr * shell
    Sy[i] = yy * shell
    Sz[i] = Math.sin(ph) * rr * shell

    D[i] = ((pts[src] / W) * 0.55 + Math.random() * 0.18)
    const a = Math.atan2(Ty[i], Tx[i]) + (Math.random() - 0.5) * 0.9
    const sp = 0.5 + Math.random() * 0.9
    DX[i] = Math.cos(a) * sp
    DY[i] = Math.sin(a) * sp
    SIZE[i] = step * 0.62 + Math.random() * 0.5
  }

  /* ---- 3. Loop gambar ---- */
  const st = { radius: 0, angle: 0, m: 0, e: 0, alpha: 0 }
  const FOV = Math.min(W, H) * 1.1
  const cx = W / 2
  const cy = H / 2
  const tilt = 0.35
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  const dist = Math.max(W, H) * 0.55
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)

  draw = () => {
    c.clearRect(0, 0, W, H)
    if (st.alpha <= 0.001) return
    c.globalCompositeOperation = 'lighter'

    const ca = Math.cos(st.angle)
    const sa = Math.sin(st.angle)
    const R = st.radius
    const t = performance.now() / 1000
    const fade = st.alpha * Math.pow(1 - st.e, 1.4)
    if (fade <= 0.001) return

    for (let g = 0; g < 2; g++) {
      c.fillStyle = g ? accent : fg
      for (let i = 0; i < N; i++) {
        if (Cc[i] !== g) continue

        // posisi di bola yang berputar
        const sx = Sx[i] * R
        const sy = Sy[i] * R
        const sz = Sz[i] * R
        const rx = sx * ca + sz * sa
        let rz = -sx * sa + sz * ca
        const ry = sy * cosT - rz * sinT
        rz = sy * sinT + rz * cosT

        // berubah menjadi tulisan (gelombang)
        let k = clamp(st.m * 1.7 - D[i], 0, 1)
        k = k * k * (3 - 2 * k)
        let x = rx + (Tx[i] - rx) * k
        let y = ry + (Ty[i] - ry) * k
        let z = rz * (1 - k)

        // "napas" halus saat tulisan sudah terbentuk
        if (k > 0.99) {
          x += Math.sin(t * 2 + i) * 0.6
          y += Math.cos(t * 1.7 + i * 1.3) * 0.6
        }

        // ledakan menembus layar
        if (st.e > 0) {
          x += DX[i] * st.e * dist
          y += DY[i] * st.e * dist
          z -= st.e * FOV * 0.9
        }

        const sc = FOV / (FOV + z)
        if (sc <= 0) continue
        const px = cx + x * sc
        const py = cy + y * sc
        if (px < -40 || px > W + 40 || py < -40 || py > H + 40) continue

        // sisi dekat lebih terang, sisi jauh lebih redup
        const depth = clamp(z / Math.max(R, 1), -1, 1)
        const da = 0.55 - 0.4 * depth
        const a = (da * (1 - k) + 0.95 * k) * fade
        const size = Math.min(SIZE[i] * sc, 14)

        c.globalAlpha = a
        c.fillRect(px - size / 2, py - size / 2, size, size)
      }
    }
    c.globalAlpha = 1
  }
  gsap.ticker.add(draw)

  /* ---- 4. Alur waktu ---- */
  tl = gsap.timeline({ onComplete: finish })
  tl.to(st, { alpha: 1, duration: 0.6, ease: 'power1.out' }, 0)
    .to(st, { radius: Math.min(W, H) * 0.3, duration: 1.3, ease: 'expo.out' }, 0)
    .to(st, { angle: Math.PI * 3.2, duration: 2.3, ease: 'power1.inOut' }, 0)
    .fromTo('.intro__eyebrow', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.2)
    .to(st, { m: 1, duration: 1.2, ease: 'expo.inOut' }, MORPH_AT)
    .fromTo('.intro__tag', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, MORPH_AT + 1.0)
    .to(['.intro__eyebrow', '.intro__tag'], { opacity: 0, duration: 0.3, ease: 'power1.in' }, EXPLODE_AT - 0.1)
    .to(st, { e: 1, duration: 0.95, ease: 'power3.in' }, EXPLODE_AT)
    .to(root.value, { backgroundColor: 'rgba(13,13,13,0)', duration: 0.7, ease: 'power1.in' }, EXPLODE_AT + 0.15)

  return true
}

onMounted(async () => {
  if (!active.value) return

  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* diabaikan */
  }
  addBlockers()

  // Tunggu font siap supaya tulisan diukur dengan huruf yang benar
  const family = cssVar('--font-display', 'sans-serif')
  await Promise.race([
    Promise.all([document.fonts?.load?.(`500 100px ${family}`), document.fonts?.ready]),
    new Promise((r) => setTimeout(r, 900)),
  ]).catch(() => {})
  if (!root.value) return

  let ok = false
  try {
    ok = buildScene()
  } catch {
    ok = false
  }
  if (!ok) finish() // kalau canvas gagal, jangan sampai menghalangi halaman
})

onBeforeUnmount(() => {
  stopLoop()
  removeBlockers()
  tl?.kill()
})
</script>

<template>
  <div v-if="active" ref="root" class="intro" aria-hidden="true" @click="skip">
    <canvas ref="canvasEl" class="intro__canvas" />
    <span class="intro__eyebrow">// Portfolio</span>
    <span class="intro__tag">Full Stack Developer · Quality Assurance · Analyst</span>
  </div>
</template>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: 1000;
  cursor: progress;
  overflow: hidden;
  background: var(--bg);
}
.intro__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.intro__eyebrow,
.intro__tag {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0;
}
.intro__eyebrow {
  top: 12vh;
  color: var(--accent);
}
.intro__tag {
  bottom: 14vh;
  color: var(--muted);
}

@media (max-width: 900px) {
  .intro__tag {
    padding: 0 10vw;
  }
}
</style>