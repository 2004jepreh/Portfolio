<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  projects: { type: Array, required: true },
  progress: { type: Number, required: true },
})
const emit = defineEmits(['open', 'select'])

// Membungkus jarak ke rentang [-n/2, n/2) supaya kartu berputar tanpa ujung.
const wrap = (d, n) => ((((d + n / 2) % n) + n) % n) - n / 2

// Ukuran layar: dipakai untuk menghitung susunan kartu khusus HP.
// Susunan laptop (di atas 900px) tidak berubah.
const MOBILE_QUERY = '(max-width: 900px)'
const mobile = ref(false)
const viewW = ref(0)
const viewH = ref(0)
const syncViewport = () => {
  mobile.value = window.matchMedia(MOBILE_QUERY).matches
  viewW.value = window.innerWidth
  viewH.value = window.innerHeight
}
syncViewport()

// Latar kartu otomatis: warna diambil dari tepi atas gambar (kiri ke kanan).
// Dipakai kalau `cardBg: 'auto'` di data project.
const autoBg = reactive({})

const sampleBackground = (project) =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const w = img.naturalWidth
        const h = img.naturalHeight
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)

        const STOPS = 9
        const BOX = 4 // ambil rata-rata kotak kecil supaya tidak kena noise
        const stops = []
        for (let k = 0; k < STOPS; k++) {
          const x = Math.round((w - BOX) * (k / (STOPS - 1)))
          const data = ctx.getImageData(x, 1, BOX, BOX).data
          let r = 0
          let g = 0
          let b = 0
          const count = data.length / 4
          for (let p = 0; p < data.length; p += 4) {
            r += data[p]
            g += data[p + 1]
            b += data[p + 2]
          }
          const pos = Math.round((k / (STOPS - 1)) * 100)
          stops.push(`rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}) ${pos}%`)
        }
        autoBg[project.slug] = `linear-gradient(90deg, ${stops.join(', ')})`
      } catch {
        // Gagal membaca gambar: pakai warna cadangan.
      }
      resolve()
    }
    img.onerror = () => resolve()
    img.src = project.image
  })

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport)
  props.projects.forEach((p) => {
    if (p.cardBg === 'auto' && p.image) sampleBackground(p)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport)
})

const backgroundFor = (project) => {
  if (project.cardBg === 'auto') return autoBg[project.slug] || '#e9e9e9'
  return project.cardBg || '#111'
}

// d = jarak kartu dari posisi aktif (0 = di tengah, negatif = di atas, positif = di bawah).
// Kartu terdekat (|d| <= 1) bergerak jauh, kartu di belakangnya ditumpuk rapat
// dan dikipas ke samping sehingga beberapa kartu mengintip di atas dan bawah.
const cards = computed(() => {
  const n = props.projects.length
  const m = mobile.value

  // Tinggi kartu di HP (harus sama dengan CSS: lebar = min(62vw, 46svh), rasio 5:4).
  const cardH = Math.min(viewW.value * 0.62, viewH.value * 0.46) * 0.8

  return props.projects.map((project, i) => {
    const d = wrap(i - props.progress, n)
    const ad = Math.abs(d)
    const s = Math.sign(d)
    const near = Math.min(ad, 1) // bagian jarak dari tengah sampai kartu terdekat
    const far = Math.max(0, ad - 1) // bagian jarak di belakang kartu terdekat

    // Laptop: jarak dalam vw/vh. HP: geser sedikit, jarak vertikal dari tinggi kartu (px)
    // supaya kartu di belakang hanya mengintip tipis dan tidak naik ke area header.
    const x = m ? -s * (5 * near + 3 * far) : -s * (9 * near + 5.5 * far) // vw
    const y = m
      ? s * (0.62 * cardH * near + 0.07 * cardH * far) // px
      : s * (40 * near + 7 * far) // vh
    const yUnit = m ? 'px' : 'vh'
    const tilt = 7.5 * Math.min(d * d, 1) + far * 2.5 // derajat
    const rotY = d * 8
    const scale = 1 - far * 0.06

    // Laptop: penuh sampai ad 2.6, lalu memudar habis di ad 3 (supaya tidak "loncat" saat berputar).
    // HP: hanya dua kartu di tiap sisi yang terlihat.
    const opacity = m
      ? ad <= 1.6
        ? 1
        : Math.max(0, 1 - (ad - 1.6) * 2.5)
      : ad <= 2.6
        ? 1
        : Math.max(0, 1 - (ad - 2.6) * 2.5)

    return {
      project,
      index: i,
      active: ad < 0.5,
      style: {
        opacity,
        background: backgroundFor(project),
        zIndex: Math.round(100 - ad * 10),
        pointerEvents: ad > 1.6 ? 'none' : 'auto',
        transform: `translate3d(-50%, -50%, 0) translate3d(${x}vw, ${y}${yUnit}, 0) rotateY(${rotY}deg) rotateZ(${tilt}deg) scale(${scale})`,
      },
    }
  })
})

// Kartu di tengah membuka halaman project, kartu lain pindah ke project itu dulu.
const onCardClick = (card) => {
  if (card.active) emit('open', card.project.slug)
  else emit('select', card.index)
}
</script>

<template>
  <div class="stack">
    <article
      v-for="card in cards"
      :key="card.project.slug"
      class="card"
      role="link"
      :aria-label="card.project.title"
      :tabindex="card.active ? 0 : -1"
      :style="card.style"
      @click="onCardClick(card)"
      @keydown.enter="onCardClick(card)"
    >
      <img
        v-if="card.project.image"
        :src="card.project.image"
        :alt="card.project.title"
        :class="{ 'is-contain': card.project.cardFit === 'contain' }"
        :style="{ padding: card.project.cardPad || 0 }"
      />
      <div
        v-else
        class="card__placeholder"
        :style="{
          background: `linear-gradient(135deg, ${card.project.palette[0]}, ${card.project.palette[1]})`,
        }"
      >
        <span class="card__title">{{ card.project.title }}</span>
        <small>Image coming soon</small>
      </div>
    </article>
  </div>
</template>

<style scoped>
.stack {
  position: absolute;
  inset: 0;
  overflow: hidden;
  perspective: 1800px;
  pointer-events: none;
}
.card {
  position: absolute;
  left: 50%;
  top: 51%;
  width: 20.5vw;
  aspect-ratio: 5 / 4;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1); /* garis tipis agar kartu gelap tetap terlihat */
  cursor: pointer;
  outline: none;
  will-change: transform, opacity;
}
.card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Gambar ditampilkan utuh (tidak dipotong); sisa ruang diisi warna latar kartu.
   Jarak di sekelilingnya diatur lewat `cardPad` pada data project. */
.card img.is-contain {
  object-fit: contain;
}
.card__placeholder {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  width: 100%;
  height: 100%;
  padding: 14px;
  color: rgba(255, 255, 255, 0.85);
}
.card__title {
  font-family: var(--font-display);
  font-size: clamp(16px, 1.5vw, 26px);
  font-weight: 400;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
.card__placeholder small {
  font-size: 11px;
  opacity: 0.6;
}

@media (max-width: 900px) {
  .card {
    /* Rumus ini harus sama dengan cardH di script */
    width: min(62vw, 46svh);
    top: 43%;
  }
}
</style>