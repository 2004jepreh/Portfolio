<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { site } from '../data/site'
import { contactOpen, closeContact } from '../composables/useContact'

const panel = ref(null)
const copied = ref(false)
const time = ref('')

let copyTimer = null
let clock = null
let previouslyFocused = null

// Keterangan singkat untuk tiap link sosial (cocokkan dengan `label` di site.js).
const notes = {
  GitHub: 'Code & repositories',
  LinkedIn: 'Professional network',
}

const formatTime = () => {
  time.value = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(new Date())
}

watch(contactOpen, async (open) => {
  if (open) {
    formatTime()
    clock = setInterval(formatTime, 15000)
    previouslyFocused = document.activeElement
    await nextTick()
    panel.value?.focus()
  } else {
    clearInterval(clock)
    previouslyFocused?.focus?.()
  }
})

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(site.email)
  } catch {
    // Cadangan untuk browser yang tidak mengizinkan clipboard API.
    const ta = document.createElement('textarea')
    ta.value = site.email
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch {
      /* diabaikan */
    }
    ta.remove()
  }
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 1800)
}

// Keyboard: Esc menutup, Tab berputar di dalam popup, dan tombol lain
// tidak diteruskan ke halaman di belakang (supaya kartu tidak ikut bergerak).
const onKey = (e) => {
  e.stopPropagation()

  if (e.key === 'Escape') {
    closeContact()
    return
  }

  if (e.key === 'Tab' && panel.value) {
    const items = panel.value.querySelectorAll('a[href], button:not([disabled])')
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === panel.value)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

onBeforeUnmount(() => {
  clearInterval(clock)
  clearTimeout(copyTimer)
})
</script>

<template>
  <!-- `duration` memberi tahu Vue berapa lama seluruh rangkaian animasi (termasuk
       elemen yang muncul bergantian) supaya tidak terpotong di tengah jalan. -->
  <Transition name="contact" :duration="{ enter: 1900, leave: 700 }">
    <div
      v-if="contactOpen"
      class="overlay"
      @click.self="closeContact"
      @keydown="onKey"
      @wheel.stop
      @touchmove.stop
    >
      <section
        ref="panel"
        class="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        tabindex="-1"
      >
        <!-- Garis cahaya yang melebar dulu sebelum panel terbuka -->
        <span class="beam" aria-hidden="true" />

        <header class="top rise" style="--i: 0">
          <span class="eyebrow">// Contact</span>
          <button type="button" class="close" @click="closeContact">
            <span>Close</span>
            <kbd>Esc</kbd>
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" fill="none" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </button>
        </header>

        <h2 id="contact-title" class="title">
          <span class="line"><span class="line__in" style="--i: 1">Let's build something</span></span>
          <span class="line"><span class="line__in" style="--i: 2">together.</span></span>
        </h2>

        <div class="email rise" style="--i: 3">
          <div class="email__main">
            <span class="tag">// Email</span>
            <a class="email__link" :href="`mailto:${site.email}`">{{ site.email }}</a>
          </div>
          <button type="button" class="copy" :class="{ 'is-copied': copied }" @click="copyEmail">
            {{ copied ? 'Copied ✓' : 'Copy' }}
          </button>
        </div>

        <ul class="links">
          <li v-for="(s, idx) in site.socials" :key="s.label" class="rise" :style="{ '--i': 4 + idx }">
            <a class="tile" :href="s.url" target="_blank" rel="noopener noreferrer">
              <span class="tile__head">
                <span class="tag">// {{ s.label }}</span>
                <span class="tile__arrow" aria-hidden="true">↗</span>
              </span>
              <span class="tile__name">{{ s.label }}</span>
              <span class="tile__note">{{ notes[s.label] || '' }}</span>
            </a>
          </li>
        </ul>

        <footer class="bottom rise" style="--i: 7">
          <span class="status">
            <span class="status__dot" aria-hidden="true" />
            {{ site.availability }}
          </span>
          <span class="where">{{ site.base }} · {{ time }} WIB</span>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 4vh 4vw;
  background-color: rgba(4, 4, 4, 0.66);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  perspective: 1400px;
}

.panel {
  position: relative;
  width: min(860px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  padding: clamp(22px, 3vw, 40px);
  color: var(--fg);
  outline: none;
  background-color: #141414;
  /* Pola grid halus bergaya blueprint */
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.6);
  /* Dipakai untuk animasi "membuka dari garis"; nilai negatif supaya sudut dan bayangan tidak terpotong */
  clip-path: inset(-120px);
  scrollbar-width: none;
}
.panel::-webkit-scrollbar {
  display: none;
}
/* Sudut berbingkai warna aksen */
.panel::before,
.panel::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  pointer-events: none;
}
.panel::before {
  top: -1px;
  left: -1px;
  border-top: 2px solid var(--accent);
  border-left: 2px solid var(--accent);
  transform-origin: top left;
}
.panel::after {
  right: -1px;
  bottom: -1px;
  border-right: 2px solid var(--accent);
  border-bottom: 2px solid var(--accent);
  transform-origin: bottom right;
}

/* Garis cahaya di tengah panel (hanya terlihat saat animasi buka/tutup) */
.beam {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  margin-top: -1px;
  background: var(--accent);
  box-shadow: 0 0 18px 2px var(--accent);
  opacity: 0;
  pointer-events: none;
}

/* Label kecil bergaya komentar kode */
.tag,
.eyebrow {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.eyebrow {
  color: var(--accent);
}
.close {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  transition: border-color 0.3s ease, color 0.3s ease;
}
.close:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.close kbd {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.title {
  margin: clamp(22px, 4vh, 40px) 0 clamp(22px, 4vh, 36px);
  font-family: var(--font-display);
  font-size: clamp(28px, 4.6vw, 58px);
  font-weight: 500;
  line-height: 0.98;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}
/* Tiap baris judul "keluar" dari balik garis (efek topeng) */
.line {
  display: block;
  padding: 0.06em 0;
  margin: -0.06em 0;
  overflow: hidden;
}
.line__in {
  display: block;
}

/* Email besar + tombol Copy */
.email {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.email__main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.email__link {
  font-size: clamp(18px, 2.8vw, 34px);
  letter-spacing: -0.03em;
  line-height: 1.05;
  overflow-wrap: anywhere;
  transition: color 0.3s ease;
}
.email__link:hover {
  color: var(--accent);
}
.copy {
  flex: none;
  padding: 10px 16px;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
.copy:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.copy.is-copied {
  background: var(--accent);
  border-color: var(--accent);
  color: #0d0d0d;
}

/* Kartu link sosial: jumlah kolom menyesuaikan jumlah link */
.links {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 12px;
  margin-top: 18px;
}
.tile {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: border-color 0.3s ease, background 0.3s ease, transform 0.4s var(--ease);
}
.tile:hover {
  border-color: var(--accent);
  background: rgba(255, 91, 58, 0.06);
  transform: translateY(-2px);
}
.tile__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tile__arrow {
  font-size: 16px;
  color: var(--muted);
  transition: transform 0.4s var(--ease), color 0.3s ease;
}
.tile:hover .tile__arrow {
  color: var(--accent);
  transform: translate(3px, -3px);
}
.tile__name {
  margin-top: 14px;
  font-size: 22px;
  letter-spacing: -0.03em;
}
.tile__note {
  font-size: 13px;
  color: var(--muted);
}

.bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 20px;
  margin-top: 22px;
  font-size: 13px;
  color: var(--muted);
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--fg);
}
.status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3ddc84;
  box-shadow: 0 0 0 0 rgba(61, 220, 132, 0.5);
  animation: pulse 2.2s ease-out infinite;
}
@keyframes pulse {
  70% {
    box-shadow: 0 0 0 8px rgba(61, 220, 132, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(61, 220, 132, 0);
  }
}

/* =====================================================================
   ANIMASI BUKA (urutan):
   1. latar menggelap + blur
   2. garis cahaya melebar di tengah
   3. panel terbuka dari garis itu ke atas dan bawah sambil miring 3D lalu mendatar
   4. sudut-sudut aksen muncul
   5. isi muncul bergantian: judul "naik" dari balik garis, lalu baris-baris lainnya
   ===================================================================== */

/* -- Latar -- */
.contact-enter-active {
  transition: background-color 0.6s ease, backdrop-filter 0.6s ease,
    -webkit-backdrop-filter 0.6s ease;
}
.contact-enter-from {
  background-color: rgba(4, 4, 4, 0);
  -webkit-backdrop-filter: blur(0px);
  backdrop-filter: blur(0px);
}

/* -- Garis cahaya -- */
.contact-enter-active .beam {
  animation: beam-in 1s var(--ease) both;
}
@keyframes beam-in {
  0% {
    opacity: 1;
    transform: scaleX(0);
  }
  35% {
    opacity: 1;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(1);
  }
}

/* -- Panel membuka dari garis -- */
.contact-enter-active .panel {
  transition: clip-path 1s var(--ease) 0.3s, transform 1.1s var(--ease) 0.3s;
}
.contact-enter-from .panel {
  clip-path: inset(49% -120px 49% -120px);
  transform: translateY(5vh) rotateX(18deg) rotateZ(-3deg) scale(0.92);
}

/* -- Sudut aksen -- */
.contact-enter-active .panel::before,
.contact-enter-active .panel::after {
  transition: transform 0.6s var(--ease) 1s;
}
.contact-enter-from .panel::before,
.contact-enter-from .panel::after {
  transform: scale(0);
}

/* -- Isi muncul bergantian -- */
.contact-enter-active .rise {
  transition: opacity 0.7s ease calc(0.7s + var(--i) * 0.07s),
    transform 0.9s var(--ease) calc(0.7s + var(--i) * 0.07s);
}
.contact-enter-from .rise {
  opacity: 0;
  transform: translateY(26px);
}
.contact-enter-active .line__in {
  transition: transform 0.9s var(--ease) calc(0.7s + var(--i) * 0.09s);
}
.contact-enter-from .line__in {
  transform: translateY(110%);
}

/* =====================================================================
   ANIMASI TUTUP: isi menghilang cepat, panel menyempit jadi garis,
   garis menyusut, latar kembali terang.
   ===================================================================== */
.contact-leave-active {
  transition: background-color 0.5s ease 0.2s, backdrop-filter 0.5s ease 0.2s,
    -webkit-backdrop-filter 0.5s ease 0.2s;
}
.contact-leave-to {
  background-color: rgba(4, 4, 4, 0);
  -webkit-backdrop-filter: blur(0px);
  backdrop-filter: blur(0px);
}

.contact-leave-active .rise {
  transition: opacity 0.18s ease, transform 0.25s ease;
}
.contact-leave-to .rise {
  opacity: 0;
  transform: translateY(-8px);
}
.contact-leave-active .line__in {
  transition: transform 0.25s ease;
}
.contact-leave-to .line__in {
  transform: translateY(-110%);
}

.contact-leave-active .panel {
  transition: clip-path 0.5s cubic-bezier(0.7, 0, 0.2, 1) 0.15s,
    transform 0.5s cubic-bezier(0.7, 0, 0.2, 1) 0.15s;
}
.contact-leave-to .panel {
  clip-path: inset(49% -120px 49% -120px);
  transform: translateY(2vh) rotateX(-10deg) scale(0.97);
}

.contact-leave-active .beam {
  animation: beam-out 0.5s ease 0.3s both;
}
@keyframes beam-out {
  0% {
    opacity: 0;
    transform: scaleX(1);
  }
  30% {
    opacity: 1;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(0);
  }
}

@media (max-width: 640px) {
  .links {
    grid-auto-flow: row;
    grid-auto-columns: auto;
    grid-template-columns: 1fr;
  }
  .email {
    align-items: flex-start;
    flex-direction: column;
  }
}

/* Pengguna yang mematikan animasi di sistem: tanpa gerak sama sekali */
@media (prefers-reduced-motion: reduce) {
  .contact-enter-active,
  .contact-leave-active,
  .contact-enter-active .panel,
  .contact-leave-active .panel,
  .contact-enter-active .rise,
  .contact-leave-active .rise,
  .contact-enter-active .line__in,
  .contact-leave-active .line__in,
  .contact-enter-active .panel::before,
  .contact-enter-active .panel::after {
    transition: none;
  }
  .contact-enter-active .beam,
  .contact-leave-active .beam,
  .status__dot {
    animation: none;
  }
}
</style>