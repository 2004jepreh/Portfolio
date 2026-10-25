<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { projects } from '../data/projects'
import { logoOffset } from '../composables/useWorkProgress'

const route = useRoute()
const router = useRouter()

const project = computed(() => projects.find((p) => p.slug === route.params.slug))
if (!project.value) router.replace('/')

// Project berikutnya (setelah yang terakhir kembali ke yang pertama).
const nextProject = computed(() => {
  const i = projects.findIndex((p) => p.slug === route.params.slug)
  if (i < 0 || projects.length < 2) return null
  return projects[(i + 1) % projects.length]
})

// Gambar halaman detail: gallery > image > 3 placeholder.
const images = computed(() => {
  const p = project.value
  if (!p) return []
  if (p.gallery?.length) return p.gallery
  if (p.image) return [p.image]
  return [null, null, null]
})

// Recognition: entri kosong diabaikan, barisnya hilang kalau tidak ada isinya.
const recognition = computed(() => (project.value?.recognition || []).filter((r) => r && r.trim()))

// Teks tombol link: pakai `linkLabel` dari data project, cadangannya "Visit site".
const linkLabel = computed(() => project.value?.linkLabel || 'Visit site')

const gradient = computed(() => {
  const p = project.value
  return p ? `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` : ''
})

const scroller = ref(null)
const imgEls = ref([])
const activeIndex = ref(0)

const setImg = (el, i) => {
  imgEls.value[i] = el
}

// Pengguna yang mematikan animasi di sistemnya: tanpa gerak parallax (efek memudar tetap ada).
const reduceMotion =
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// --- Efek memudar saat di-scroll ---
// titleFade : judul besar memudar setelah foto pertama
// sideFade  : teks kiri + thumbnail kanan memudar saat mendekati "Next project"
// nextFade  : bagian "Next project" muncul perlahan
const isDesktop = ref(true)
const titleFade = ref(1)
const titleShift = ref(0)
const sideFade = ref(1)
const nextFade = ref(0)

const clamp01 = (v) => Math.min(1, Math.max(0, v))

/* ------------------------------------------------------------------
   PARALLAX (ubah angka di sini)
   ------------------------------------------------------------------ */
const SHOT_DEPTH = 0.07 // makin besar = gambar makin "tertinggal" saat di-scroll
const SHOT_SCALE = 0.04 // gambar sedikit mengecil saat jauh dari tengah layar (0 = mati)
const SMOOTH = 0.12 // kehalusan gerak (0.05 = sangat "melayang", 0.3 = hampir langsung)
const TITLE_DRIFT = 0.5 // judul ikut naik pelan saat memudar (0 = diam)
const NEXT_LIFT = 6 // "Next project" naik dari bawah sejauh ini (satuan vh)

const updateFade = () => {
  const el = scroller.value
  if (!el) return
  const vh = window.innerHeight
  const top = el.scrollTop
  // Sisa jarak scroll sampai paling bawah (0 = sudah di dasar halaman).
  const remaining = el.scrollHeight - el.clientHeight - top

  titleFade.value = clamp01(1 - top / (vh * 0.4))
  titleShift.value = reduceMotion ? 0 : Math.min(top, vh * 0.4) * TITLE_DRIFT
  sideFade.value = clamp01((remaining - vh * 0.35) / (vh * 0.5))
  nextFade.value = clamp01((vh - remaining) / (vh * 0.6))
}

const titleStyle = computed(() =>
  isDesktop.value
    ? {
        opacity: titleFade.value,
        transform: `translateY(${-titleShift.value}px)`,
      }
    : {},
)

// Teks kiri dan thumbnail kanan: memudar, dan tidak bisa diklik saat sudah hilang.
const sideStyle = computed(() =>
  isDesktop.value
    ? {
        opacity: sideFade.value,
        pointerEvents: sideFade.value < 0.15 ? 'none' : 'auto',
      }
    : {},
)

const nextStyle = computed(() =>
  isDesktop.value
    ? {
        opacity: nextFade.value,
        '--lift': reduceMotion ? '0vh' : `${(1 - nextFade.value) * NEXT_LIFT}vh`,
      }
    : {},
)

// --- Parallax gambar ---
// Posisi tujuan tiap gambar dihitung saat scroll, lalu digerakkan halus oleh ticker.
// Dihitung dari posisi layout (offsetTop), bukan getBoundingClientRect, supaya
// tidak terpengaruh transform yang sedang berjalan.
const shots = []

const updateParallax = () => {
  const el = scroller.value
  if (!el) return
  const vh = window.innerHeight
  const top = el.scrollTop

  imgEls.value.forEach((fig, i) => {
    if (!fig) return
    if (!shots[i]) shots[i] = { y: 0, ty: 0, s: 1, ts: 1, fresh: true, str: '' }
    const st = shots[i]

    if (!isDesktop.value || reduceMotion) {
      st.ty = 0
      st.ts = 1
    } else {
      const d = fig.offsetTop + fig.offsetHeight / 2 - top - vh / 2
      st.ty = -SHOT_DEPTH * Math.max(-vh, Math.min(vh, d))
      st.ts = 1 - Math.min(Math.abs(d) / vh, 1) * SHOT_SCALE
    }

    // Pertama kali: langsung di posisinya, tanpa meluncur dari nol
    if (st.fresh) {
      st.y = st.ty
      st.s = st.ts
      st.fresh = false
    }
  })
}

const tick = (time, delta) => {
  const k = 1 - Math.pow(1 - SMOOTH, delta / 16.67)
  shots.forEach((st, i) => {
    const fig = imgEls.value[i]
    if (!st || !fig) return
    st.y += (st.ty - st.y) * k
    st.s += (st.ts - st.s) * k

    const settled = Math.abs(st.y) < 0.01 && Math.abs(st.s - 1) < 0.0005
    const str = settled ? 'none' : `translate3d(0, ${st.y.toFixed(2)}px, 0) scale(${st.s.toFixed(4)})`
    if (str !== st.str) {
      fig.style.transform = str
      st.str = str
    }
  })
}

// --- Logo di header ikut berputar saat halaman di-scroll ---
// Setiap SPIN_DISTANCE x tinggi layar scroll = satu sisi (90 derajat).
// Setelah scroll berhenti sebentar, logo berhenti pas menghadap lurus ke depan.
const SPIN_DISTANCE = 0.5 // makin kecil = logo makin cepat berputar
const SPIN_IDLE = 140 // milidetik: jeda setelah scroll berhenti sebelum logo merapikan diri
const SPIN_SETTLE = 0.7 // detik: lama logo merapikan diri

const spin = { v: logoOffset.value }
let lastTop = 0
let spinTimer = null

const updateSpin = () => {
  const el = scroller.value
  if (!el) return
  const top = el.scrollTop
  const delta = top - lastTop
  lastTop = top

  gsap.killTweensOf(spin)
  spin.v += delta / (window.innerHeight * SPIN_DISTANCE)
  logoOffset.value = spin.v

  clearTimeout(spinTimer)
  spinTimer = setTimeout(() => {
    gsap.to(spin, {
      v: Math.round(spin.v),
      duration: SPIN_SETTLE,
      ease: 'power3.out',
      onUpdate: () => {
        logoOffset.value = spin.v
      },
    })
  }, SPIN_IDLE)
}

// --- Thumbnail di kanan mengikuti gambar yang paling dekat dengan tengah layar ---
const updateActive = () => {
  const el = scroller.value
  if (!el) return
  const mid = el.scrollTop + window.innerHeight * 0.5
  let best = 0
  let bestDist = Infinity
  imgEls.value.forEach((fig, i) => {
    if (!fig) return
    const dist = Math.abs(fig.offsetTop + fig.offsetHeight / 2 - mid)
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  })
  activeIndex.value = best
}

const onScroll = () => {
  updateActive()
  updateFade()
  updateParallax()
  updateSpin()
}

const onResize = () => {
  isDesktop.value = window.innerWidth > 900
  updateActive()
  updateFade()
  updateParallax()
}

const goToImage = (i) => {
  imgEls.value[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
  gsap.ticker.add(tick)
  // Fokus ke area scroll supaya tombol panah/spasi langsung berfungsi.
  scroller.value?.focus({ preventScroll: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  gsap.ticker.remove(tick)
  // Hentikan animasi logo dan berhenti di sisi terdekat supaya tidak tertinggal miring.
  clearTimeout(spinTimer)
  gsap.killTweensOf(spin)
  logoOffset.value = Math.round(spin.v)
})
</script>

<template>
  <section v-if="project" ref="scroller" class="project" tabindex="-1" @scroll.passive="onScroll">
    <aside class="info" :style="sideStyle">
      <div class="info__row">
        <span class="label">About</span>
        <p class="info__about">{{ project.about }}</p>
      </div>

      <div class="info__facts">
        <span class="label">Role</span>
        <div class="info__list">
          <span v-for="r in project.role" :key="r">{{ r }}</span>
        </div>
        <span class="label">End date</span>
        <span>{{ project.launch }}</span>
      </div>

      <div v-if="recognition.length" class="info__row">
        <span class="label">Recognition</span>
        <div class="info__list">
          <span v-for="r in recognition" :key="r">{{ r }}</span>
        </div>
      </div>

      <a
        v-if="project.url"
        class="info__visit"
        :href="project.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ linkLabel }} →
      </a>
    </aside>

    <h1 class="title" :style="titleStyle">{{ project.title }}</h1>

    <div class="gallery">
      <figure v-for="(src, i) in images" :key="i" :ref="(el) => setImg(el, i)" class="shot">
        <img v-if="src" :src="src" :alt="`${project.title} ${i + 1}`" @load="updateParallax" />
        <div v-else class="shot__placeholder" :style="{ background: gradient }">
          <small>Image coming soon</small>
        </div>
      </figure>
    </div>

    <router-link v-if="nextProject" class="next" :to="`/project/${nextProject.slug}`" :style="nextStyle">
      <span class="next__label">Next project</span>
      <span class="next__title"><span class="next__text">{{ nextProject.title }}</span></span>
    </router-link>

    <ul class="thumbs" :style="sideStyle">
      <li v-for="(src, i) in images" :key="i">
        <button
          type="button"
          class="thumb"
          :class="{ 'is-active': i === activeIndex }"
          :aria-label="`Image ${i + 1}`"
          @click="goToImage(i)"
        >
          <img v-if="src" :src="src" alt="" />
          <span v-else class="thumb__placeholder" :style="{ background: gradient }" />
        </button>
      </li>
    </ul>

    <span class="scroll label">Scroll</span>
  </section>
</template>

<style scoped>
.project {
  position: fixed;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--bg);
  outline: none;
  scrollbar-width: none;
}
.project::-webkit-scrollbar {
  display: none;
}

/* Kolom kiri (tetap di tempat saat gambar di-scroll, memudar di dekat "Next project") */
.info {
  position: fixed;
  left: var(--pad);
  top: 35vh;
  z-index: 5;
  width: 26vw;
  display: flex;
  flex-direction: column;
  gap: 36px;
  font-size: 15px;
  line-height: 1.1;
}
.info__row {
  display: grid;
  grid-template-columns: 91px 1fr;
}
.info__about {
  max-width: clamp(260px, 16.5vw, 360px);
  font-weight: 500;
}
.info__facts {
  display: grid;
  grid-template-columns: 91px 148px 80px 1fr;
  font-weight: 500;
}
.info__facts .label {
  font-weight: 400;
}
.info__list {
  display: flex;
  flex-direction: column;
  font-weight: 500;
}
.info__visit {
  align-self: flex-start;
  margin-left: 91px;
  font-size: 24px;
  letter-spacing: -0.03em;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  transition: color 0.3s ease;
}
.info__visit:hover {
  color: var(--accent);
}

/* Judul besar di kanan bawah. Ukuran TETAP untuk semua project (ubah angka
   font-size di bawah untuk membesarkan/mengecilkan). Judul yang terlalu panjang
   turun ke baris berikutnya dan tumbuh ke atas. Opacity dan posisi saat
   di-scroll diatur dari script. */
.title {
  position: fixed;
  right: 1vw;
  bottom: 3.5vh;
  z-index: 6;
  max-width: 80vw;
  font-family: var(--font-display);
  font-size: 7vw;
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: -0.01em;
  text-align: right;
  text-transform: uppercase;
  text-wrap: balance;
  color: var(--accent);
  pointer-events: none;
}

/* Gambar di tengah (ditampilkan utuh, tanpa dipotong) */
.gallery {
  margin-left: 27.3vw;
  width: 44.7vw;
  padding: 30.4vh 0 24vh;
  display: flex;
  flex-direction: column;
  gap: 9vh;
}
.shot {
  overflow: hidden;
  background: #111;
  will-change: transform; /* digerakkan oleh efek parallax */
}
.shot img {
  display: block;
  width: 100%;
  height: auto;
}
.shot__placeholder {
  display: flex;
  align-items: flex-end;
  aspect-ratio: 16 / 10;
  width: 100%;
  padding: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* Bagian "Next project": satu layar penuh di akhir halaman */
.next {
  position: relative;
  z-index: 7;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 0 4vw;
  text-align: center;
}
.next__label {
  font-size: 15px;
  font-weight: 500;
  transform: translateY(calc(var(--lift, 0vh) * 0.5));
}
.next__title {
  display: block;
  max-width: 92vw;
  font-family: var(--font-display);
  font-size: 8vw;
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  text-wrap: balance;
  color: var(--accent);
  transform: translateY(var(--lift, 0vh));
}
/* Garis bawah dibuat per baris teks (bukan per kotak), jadi panjangnya selalu
   pas dengan tulisan, juga untuk judul yang terpecah jadi beberapa baris.
   Tumbuh perlahan dari kiri ke kanan saat di-hover.
   Jarak garis dari huruf: ubah 0.19em di background-position
   (makin BESAR angkanya, garis makin DEKAT ke huruf; makin kecil, makin jauh). */
.next__text {
  background-image: linear-gradient(currentColor, currentColor);
  background-repeat: no-repeat;
  background-position: 0 calc(100% - 0.19em);
  background-size: 0% 2px;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  transition: background-size 1.6s var(--ease);
}
.next:hover .next__text,
.next:focus-visible .next__text {
  background-size: 100% 2px;
}

/* Thumbnail di kanan (memudar di dekat "Next project") */
.thumbs {
  position: fixed;
  right: 38px;
  top: 31.7vh;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 46px;
}
.thumb {
  display: block;
  width: 100%;
  height: 30px;
  overflow: hidden;
  outline: 1px solid transparent;
  outline-offset: 4px;
  transition: outline-color 0.3s ease;
}
.thumb.is-active {
  outline-color: var(--fg);
}
.thumb img,
.thumb__placeholder {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scroll {
  position: fixed;
  left: var(--pad);
  bottom: 22px;
  z-index: 5;
}

@media (max-width: 900px) {
  .project {
    display: flex;
    flex-direction: column;
  }
  .info {
    order: 1;
    position: static;
    width: auto;
    padding: 130px var(--pad) 0;
  }
  .info__facts {
    grid-template-columns: 91px 1fr;
    row-gap: 8px;
  }
  .title {
    order: 2;
    position: static;
    max-width: none;
    padding: 28px var(--pad) 0;
    font-size: 12vw;
    text-align: left;
    line-height: 0.95;
  }
  .gallery {
    order: 3;
    margin-left: var(--pad);
    width: calc(100% - var(--pad) * 2);
    padding: 28px 0 40px;
    gap: 24px;
  }
  .next {
    order: 4;
    min-height: 60vh;
  }
  .next__title {
    font-size: 11vw;
  }
  .thumbs,
  .scroll {
    display: none;
  }
}
</style>