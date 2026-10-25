<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { site } from '../data/site'
import { openContact } from '../composables/useContact'
import { logoOffset } from '../composables/useWorkProgress'

/* ------------------------------------------------------------------
   Semua isi halaman ada di sini. Ubah teksnya saja, tampilan mengikuti.
   ------------------------------------------------------------------ */

// Isi `url` dengan link sertifikat. Kalau dikosongkan, barisnya tidak bisa diklik.
const certs = [
  { name: 'Intro to Programming', by: 'Kaggle', date: 'Jan 2026', url: 'https://www.kaggle.com/learn/certification/jfrefrey/intro-to-programming' },
  { name: 'Dasar-dasar Metode Perancangan Program untuk Pemula', by: 'BINUS University', date: 'Sep 2024', url: 'https://drive.google.com/file/d/1Z8s4OaRfK4qwhTbltI-EnvQHnXAw79d_/view?usp=sharing' },
  { name: 'Belajar Pengembangan Software Menggunakan Metode Agile', by: 'BINUS University', date: 'Apr 2024', url: 'https://drive.google.com/file/d/1ZyVROWUm_p7pE6O0Th-sbq4AhpRme85d/view?usp=sharing' },
  { name: 'Pengenalan Manajemen Proyek Menggunakan Metode Agile', by: 'BINUS University', date: 'Apr 2024', url: 'https://drive.google.com/file/d/1m6tp_cB8Ar4oXc7h8UnCuysmcZh1QBFR/view?usp=sharing' },
  { name: 'Manajemen Proyek dengan Scrum', by: 'BINUS University', date: 'Apr 2024', url: 'https://drive.google.com/file/d/1hbHtN3O7MLLtNx1eNtMp3JFxfP99CFNA/view?usp=sharing' },
]

const stats = [
  { value: 1, suffix: ' yr', label: 'Industry experience' },
  { value: certs.length, suffix: '', label: 'Certifications' },
]

// Isi terminal. type 'cmd' = diketik satu per satu, 'out' = hasil yang langsung muncul.
// ok: true = hijau, live: true = ada titik hijau berdenyut.
const termLines = [
  { type: 'cmd', text: 'whoami' },
  { type: 'out', text: 'jeffrey ali · full stack developer' },
  { type: 'cmd', text: 'cat stack.txt' },
  { type: 'out', text: 'laravel  php  python vue.js  postgresql  mysql' },
  { type: 'cmd', text: './run-tests --all' },
  { type: 'out', text: '✓ 0 failures   ✓ all clear   ✓ docs   ready for prod', ok: true },
  { type: 'cmd', text: 'git status' },
  { type: 'out', text: 'ready for new projects', live: true },
]

const skills = [
  { title: 'Languages & Frameworks', items: ['PHP (Laravel)', 'Python', 'Vue.js', 'HTML', 'CSS', 'JavaScript'] },
  { title: 'Database', items: ['MySQL', 'PostgreSQL'] },
  {
    title: 'Tools & Practice',
    items: ['Linux', 'Postman', 'Manual testing', 'API testing', 'User Acceptance Testing', 'Technical documentation'],
  },
  { title: 'Soft skills', items: ['Teamwork', 'Adaptability', 'Communication'] },
]

const job = {
  role: 'Programmer Intern',
  company: 'PT. Trans Indonesia Superkoridor',
  place: 'Jakarta',
  period: 'Mar 2025 — Mar 2026',
  points: [
    'Built and maintained internal Laravel web applications that digitized operational workflows for NOC teams, replacing manual processes.',
    'Designed backend features, REST APIs, dashboards and database structures on PostgreSQL and MySQL.',
    'Integrated internal systems with external monitoring and network management tools such as Cacti.',
    'Ran manual functional and API testing before deployment, and wrote the test cases and testing scenarios behind it.',
    'Wrote user guides and technical documentation to support deployment and end-user adoption.',
    'Diagnosed and fixed defects together with the team to improve performance and usability.',
  ],
}

const languages = [
  { name: 'Bahasa Indonesia', level: 'Full professional' },
  { name: 'English', level: 'Full professional' },
]

/* ------------------------------------------------------------------
   Logo kiri atas ikut berputar saat halaman di-scroll.
   PX_PER_FACE = jarak scroll (px) untuk memutar satu sisi (90°).
   Setelah berhenti scroll, logo berhenti rapi di salah satu sisi.
   ------------------------------------------------------------------ */
const PX_PER_FACE = 420
const SETTLE_DELAY = 160 // ms setelah berhenti scroll

const scroller = ref(null)
let lastTop = 0
let settleTimer = null
let spin = null
const proxy = { v: 0 }

const settleLogo = () => {
  spin?.kill()
  proxy.v = logoOffset.value
  spin = gsap.to(proxy, {
    v: Math.round(proxy.v),
    duration: 0.5,
    ease: 'expo.out',
    onUpdate: () => {
      logoOffset.value = proxy.v
    },
  })
}

const onScroll = () => {
  const top = scroller.value.scrollTop
  spin?.kill()
  logoOffset.value += (top - lastTop) / PX_PER_FACE
  lastTop = top
  clearTimeout(settleTimer)
  settleTimer = setTimeout(settleLogo, SETTLE_DELAY)
  updateParallax()
}

/* ------------------------------------------------------------------
   PARALLAX (ubah angka di sini)
   Elemen yang diberi atribut data-px ikut bergerak saat di-scroll:
   - data-px="0.06"            : "tertinggal" dari scroll (positif) atau
                                 "mendahului" scroll (negatif), dihitung dari
                                 jaraknya ke tengah layar
   - data-px-mode="top"        : dihitung dari posisi scroll (nol di paling atas),
                                 dipakai untuk bagian intro di atas halaman
   ------------------------------------------------------------------ */
const PX_SMOOTH = 0.12 // kehalusan gerak (0.05 = sangat "melayang", 0.3 = hampir langsung)
const reduceMotion =
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let pxItems = []

const buildParallax = () => {
  pxItems = Array.from(scroller.value.querySelectorAll('[data-px]')).map((el) => ({
    el,
    depth: parseFloat(el.dataset.px) || 0,
    mode: el.dataset.pxMode || 'center',
    y: 0,
    ty: 0,
    fresh: true,
    str: '',
  }))
}

const updateParallax = () => {
  const sc = scroller.value
  if (!sc) return
  const vh = window.innerHeight
  const top = sc.scrollTop
  const on = !reduceMotion && window.innerWidth > 900

  pxItems.forEach((it) => {
    if (!on) {
      it.ty = 0
    } else if (it.mode === 'top') {
      it.ty = top * it.depth
    } else {
      // it.y dikurangkan supaya hasilnya tidak terpengaruh transform yang sedang berjalan
      const r = it.el.getBoundingClientRect()
      const d = r.top + r.height / 2 - it.y - vh / 2
      it.ty = -it.depth * Math.max(-vh, Math.min(vh, d))
    }
    if (it.fresh) {
      it.y = it.ty
      it.fresh = false
    }
  })
}

const pxTick = (time, delta) => {
  const k = 1 - Math.pow(1 - PX_SMOOTH, delta / 16.67)
  pxItems.forEach((it) => {
    it.y += (it.ty - it.y) * k
    const str = Math.abs(it.y) < 0.01 ? 'none' : `translate3d(0, ${it.y.toFixed(2)}px, 0)`
    if (str !== it.str) {
      it.el.style.transform = str
      it.str = str
    }
  })
}

/* ------------------------------------------------------------------
   Terminal: mengetik otomatis saat muncul di layar
   ------------------------------------------------------------------ */
const TYPE_SPEED = 45 // ms per huruf
const term = ref([])
let termStarted = false
let alive = true
const termTimers = []

const sleep = (ms) => new Promise((resolve) => termTimers.push(setTimeout(resolve, ms)))

const showAllTerm = () => {
  term.value = termLines.map((l) => ({ ...l }))
}

const runTerm = async () => {
  if (termStarted) return
  termStarted = true

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    showAllTerm()
    return
  }

  await sleep(500)
  for (const line of termLines) {
    if (!alive) return
    if (line.type === 'cmd') {
      const idx = term.value.push({ ...line, text: '' }) - 1
      for (const ch of line.text) {
        if (!alive) return
        term.value[idx].text += ch
        await sleep(TYPE_SPEED)
      }
      await sleep(300)
    } else {
      term.value.push({ ...line })
      await sleep(420)
    }
  }
}

/* ------------------------------------------------------------------
   Animasi muncul saat di-scroll + hitung naik untuk angka
   ------------------------------------------------------------------ */
const counts = ref(stats.map(() => 0))
let observer = null
const rafs = []

const runCount = (i) => {
  const target = stats[i].value
  const start = performance.now()
  const dur = 1400
  const tick = (now) => {
    const t = Math.min((now - start) / dur, 1)
    const eased = 1 - Math.pow(1 - t, 4)
    counts.value[i] = target * eased
    if (t < 1) rafs[i] = requestAnimationFrame(tick)
  }
  rafs[i] = requestAnimationFrame(tick)
}

onMounted(() => {
  logoOffset.value = Math.round(logoOffset.value)
  lastTop = scroller.value.scrollTop

  buildParallax()
  updateParallax()
  window.addEventListener('resize', updateParallax)
  gsap.ticker.add(pxTick)

  const els = scroller.value.querySelectorAll('[data-reveal]')

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'))
    counts.value = stats.map((s) => s.value)
    showAllTerm()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        e.target.classList.add('is-in')
        if (e.target.dataset.count !== undefined) runCount(Number(e.target.dataset.count))
        if (e.target.dataset.term !== undefined) runTerm()
        observer.unobserve(e.target)
      })
    },
    { root: scroller.value, threshold: 0.15 },
  )
  els.forEach((el) => observer.observe(el))
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateParallax)
  gsap.ticker.remove(pxTick)
  alive = false
  observer?.disconnect()
  rafs.forEach((r) => cancelAnimationFrame(r))
  termTimers.forEach((t) => clearTimeout(t))
  clearTimeout(settleTimer)
  settleLogo() // pastikan logo berhenti di sisi yang rapi saat pindah halaman
})
</script>

<template>
  <section class="page about" ref="scroller" @scroll.passive="onScroll">
    <div class="about__inner">
      <!-- 1. Intro -->
      <div class="hero">
        <div class="hero__main" data-px="0.12" data-px-mode="top">
          <span class="eyebrow" data-reveal>// About</span>
          <p class="hero__lead" data-reveal style="--d: 1">
            I build web applications and <em>test them</em> before they ship.
          </p>
          <p class="hero__sub" data-reveal style="--d: 2">
            A year of hands-on work with Laravel, REST APIs and PostgreSQL/MySQL. I also write the
            test cases and documentation that production deployments rely on.
          </p>
        </div>

        <div class="px" data-px="0.22" data-px-mode="top">
          <dl class="hero__meta" data-reveal style="--d: 3">
            <div>
              <dt class="label">Role</dt>
              <dd>{{ site.title }}</dd>
            </div>
            <div>
              <dt class="label">Focus</dt>
              <dd>Quality Assurance · Analyst</dd>
            </div>
            <div>
              <dt class="label">Based</dt>
              <dd>{{ site.base.replace('Based in ', '') }}</dd>
            </div>
            <div>
              <dt class="label">Status</dt>
              <dd class="status"><i aria-hidden="true" />{{ site.availability }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- 2. Angka + terminal -->
      <div class="facts">
        <div class="px" data-px="0.06">
          <ul class="stats">
            <li
              v-for="(s, i) in stats"
              :key="s.label"
              class="stat"
              data-reveal
              :data-count="i"
              :style="{ '--d': i }"
            >
              <span class="stat__num">{{ Math.round(counts[i]) }}<small>{{ s.suffix }}</small></span>
              <span class="label">{{ s.label }}</span>
            </li>
          </ul>
        </div>

        <div class="px" data-px="-0.05">
          <div class="term" data-reveal data-term style="--d: 2" aria-label="Terminal">
            <div class="term__bar" aria-hidden="true">
              <span class="term__dots"><i /><i /><i /></span>
              <span class="term__title">~/ terminal</span>
            </div>
            <div class="term__body">
              <p
                v-for="(l, i) in term"
                :key="i"
                class="term__line"
                :class="{ 'term__line--out': l.type === 'out', 'is-ok': l.ok }"
              >
                <span v-if="l.type === 'cmd'" class="term__prompt">$</span>
                <i v-if="l.live" class="term__live" aria-hidden="true" />
                <span>{{ l.text }}</span>
                <span v-if="i === term.length - 1 && l.type === 'cmd'" class="term__cursor" aria-hidden="true" />
              </p>
              <p v-if="term.length && term[term.length - 1].type === 'out'" class="term__line">
                <span class="term__prompt">$</span><span class="term__cursor" aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Skills -->
      <section class="sec">
        <h2 class="sec__title" data-reveal><span>01</span> Skills</h2>
        <div class="sec__body skills">
          <div v-for="(g, gi) in skills" :key="g.title" class="skill" data-reveal :style="{ '--d': gi }">
            <h3 class="label">// {{ g.title }}</h3>
            <ul class="chips">
              <li v-for="it in g.items" :key="it">{{ it }}</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 4. Pengalaman -->
      <section class="sec">
        <h2 class="sec__title" data-reveal><span>02</span> Experience</h2>
        <div class="sec__body">
          <article class="job" data-reveal>
            <div class="job__head">
              <div>
                <h3 class="job__role">{{ job.role }}</h3>
                <p class="job__co">{{ job.company }} · {{ job.place }}</p>
              </div>
              <span class="job__date">{{ job.period }}</span>
            </div>
            <ul class="job__points">
              <li v-for="(p, i) in job.points" :key="i">{{ p }}</li>
            </ul>
          </article>
        </div>
      </section>

      <!-- 5. Sertifikasi (bisa diklik kalau `url` diisi) -->
      <section class="sec">
        <h2 class="sec__title" data-reveal><span>03</span> Certifications</h2>
        <ul class="sec__body rows">
          <li v-for="(c, i) in certs" :key="c.name" data-reveal :style="{ '--d': i * 0.5 }">
            <component
              :is="c.url ? 'a' : 'div'"
              class="row"
              :class="{ 'row--link': c.url }"
              :href="c.url || undefined"
              :target="c.url ? '_blank' : undefined"
              :rel="c.url ? 'noopener noreferrer' : undefined"
            >
              <span class="row__name">{{ c.name }}</span>
              <span class="row__by">{{ c.by }}</span>
              <span class="row__date">{{ c.date }}</span>
              <span class="row__arrow" aria-hidden="true">{{ c.url ? '↗' : '' }}</span>
            </component>
          </li>
        </ul>
      </section>

      <!-- 6. Bahasa -->
      <section class="sec">
        <h2 class="sec__title" data-reveal><span>04</span> Languages</h2>
        <ul class="sec__body rows">
          <li v-for="(l, i) in languages" :key="l.name" data-reveal :style="{ '--d': i * 0.5 }">
            <div class="row row--two">
              <span class="row__name">{{ l.name }}</span>
              <span class="row__date">{{ l.level }}</span>
            </div>
          </li>
        </ul>
      </section>

      <!-- 7. Ajakan -->
      <section class="cta" data-reveal>
        <span class="eyebrow">// Next</span>
        <p class="cta__title" data-px="0.05">Have a project or a team that needs a developer who also tests?</p>
        <div class="cta__actions">
          <button type="button" class="cta__btn" @click="openContact">
            <span>Get in touch</span><i aria-hidden="true">↗</i>
          </button>
          <router-link to="/" class="cta__link">See projects →</router-link>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
/* Halaman ini bisa di-scroll sendiri (body global overflow: hidden) */
.about {
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  /* Isi memudar di bawah header supaya tidak bertabrakan dengan menu */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, transparent 96px, #000 170px);
  mask-image: linear-gradient(to bottom, transparent 0, transparent 96px, #000 170px);
}
.about::-webkit-scrollbar {
  display: none;
}
.about__inner {
  padding: 190px 0 120px var(--c2);
  max-width: 1500px;
}

.eyebrow {
  display: block;
  margin-bottom: 22px;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}

/* Pembungkus elemen yang digerakkan efek parallax */
.px {
  will-change: transform;
}

/* ---------- Muncul saat scroll ---------- */
[data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s var(--ease) calc(var(--d, 0) * 0.1s),
    transform 1.1s var(--ease) calc(var(--d, 0) * 0.1s);
}
[data-reveal].is-in {
  opacity: 1;
  transform: none;
}

/* ---------- Intro ---------- */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 6vw;
  align-items: end;
  padding-right: 4vw;
}
.hero__lead {
  max-width: 14em;
  font-size: clamp(30px, 3.6vw, 60px);
  line-height: 1.02;
  letter-spacing: -0.045em;
}
.hero__lead em {
  font-style: normal;
  color: var(--accent);
}
.hero__sub {
  max-width: 36em;
  margin-top: 24px;
  font-size: 15px;
  line-height: 1.35;
  color: var(--muted);
}
.hero__meta {
  display: grid;
  gap: 18px;
  padding-left: 20px;
  border-left: 1px solid rgba(255, 255, 255, 0.14);
}
.hero__meta dd {
  margin-top: 4px;
  font-weight: 500;
}
.status {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3ddc84;
  box-shadow: 0 0 0 0 rgba(61, 220, 132, 0.5);
  animation: pulse 2.2s ease-out infinite;
}
@keyframes pulse {
  70% {
    box-shadow: 0 0 0 7px rgba(61, 220, 132, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(61, 220, 132, 0);
  }
}

/* ---------- Angka + terminal ---------- */
.facts {
  display: grid;
  grid-template-columns: minmax(0, 520px) minmax(0, 1fr);
  gap: 6vw;
  align-items: start;
  margin: 12vh 4vw 0 0;
}
.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 16px 0 0;
}
.stat + .stat {
  padding-left: 20px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}
.stat__num {
  font-family: var(--font-display);
  font-size: clamp(48px, 7vw, 120px);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}
.stat__num small {
  font-size: 0.32em;
  letter-spacing: 0;
  color: var(--accent);
}

/* Jendela terminal */
.term {
  max-width: 560px;
  background-color: #111;
  /* Pola grid halus bergaya blueprint, sama seperti popup contact */
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 28px 28px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-family: var(--font-display);
}
.term__bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.term__dots {
  display: flex;
  gap: 6px;
}
.term__dots i {
  width: 9px;
  height: 9px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50%;
}
.term__dots i:first-child {
  border-color: var(--accent);
  background: var(--accent);
}
.term__title {
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.term__body {
  min-height: 15.5em; /* tinggi tetap supaya halaman tidak "melompat" saat mengetik */
  padding: 16px 16px 20px;
  font-size: 14px;
  line-height: 1.75;
}
.term__line {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-wrap: anywhere;
}
.term__line--out {
  padding-left: 18px;
  color: var(--muted);
}
.term__line.is-ok {
  color: #3ddc84;
}
.term__prompt {
  color: var(--accent);
}
.term__live {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3ddc84;
  box-shadow: 0 0 0 0 rgba(61, 220, 132, 0.5);
  animation: pulse 2.2s ease-out infinite;
}
.term__cursor {
  display: inline-block;
  width: 0.55em;
  height: 1.1em;
  margin-left: 1px;
  background: var(--fg);
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* ---------- Seksi ---------- */
.sec {
  display: grid;
  grid-template-columns: 17vw minmax(0, 1fr);
  gap: 3vw;
  margin: 14vh 4vw 0 0;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}
.sec__title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.sec__title span {
  color: var(--accent);
}

/* Skills */
.skills {
  display: grid;
  gap: 34px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.chips li {
  padding: 9px 14px;
  font-size: clamp(15px, 1.35vw, 21px);
  letter-spacing: -0.03em;
  border: 1px solid rgba(255, 255, 255, 0.16);
  transition: border-color 0.3s ease, color 0.3s ease, background 0.3s ease, transform 0.4s var(--ease);
}
.chips li:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(255, 91, 58, 0.06);
  transform: translateY(-2px);
}

/* Pengalaman */
.job__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}
.job__role {
  font-family: var(--font-display);
  font-size: clamp(22px, 2.6vw, 42px);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}
.job__co {
  margin-top: 8px;
  color: var(--muted);
  font-size: 14px;
}
.job__date {
  flex: none;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  padding-top: 4px;
}
.job__points {
  margin-top: 26px;
  display: grid;
  gap: 12px;
  max-width: 46em;
}
.job__points li {
  position: relative;
  padding-left: 26px;
  font-size: 15px;
  line-height: 1.3;
}
.job__points li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--accent);
}

/* Baris daftar (sertifikat, bahasa) */
.rows {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 11em 6em 1.2em;
  gap: 16px;
  align-items: baseline;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: padding 0.5s var(--ease), color 0.3s ease, background 0.3s ease;
}
.row--link {
  cursor: pointer;
}
.row--link:hover {
  padding-left: 10px;
  color: var(--accent);
  background: rgba(255, 91, 58, 0.04);
}
.row--two {
  grid-template-columns: minmax(0, 1fr) auto;
}
.row__name {
  font-size: clamp(15px, 1.3vw, 20px);
  letter-spacing: -0.03em;
}
.row__by {
  color: var(--muted);
}
.row__date {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  text-align: right;
}
.row__arrow {
  color: var(--muted);
  transition: transform 0.4s var(--ease), color 0.3s ease;
}
.row--link:hover .row__arrow {
  color: var(--accent);
  transform: translate(3px, -3px);
}

/* ---------- Ajakan ---------- */
.cta {
  margin: 18vh 4vw 0 0;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}
.cta__title {
  max-width: 15em;
  font-size: clamp(30px, 4.2vw, 72px);
  line-height: 1;
  letter-spacing: -0.045em;
}
.cta__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 26px;
  margin-top: 34px;
}
.cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #0d0d0d;
  background: var(--accent);
  border: 1px solid var(--accent);
  transition: background 0.3s ease, color 0.3s ease;
}
.cta__btn i {
  font-style: normal;
  transition: transform 0.4s var(--ease);
}
.cta__btn:hover {
  background: transparent;
  color: var(--accent);
}
.cta__btn:hover i {
  transform: translate(3px, -3px);
}
.cta__link {
  font-size: 15px;
  letter-spacing: -0.02em;
  transition: color 0.3s ease;
}
.cta__link:hover {
  color: var(--accent);
}

/* ---------- Responsif ---------- */
@media (max-width: 1100px) {
  .facts {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 900px) {
  .about {
    -webkit-mask-image: linear-gradient(to bottom, transparent 0, transparent 50px, #000 90px);
    mask-image: linear-gradient(to bottom, transparent 0, transparent 50px, #000 90px);
  }
  .about__inner {
    padding: 110px var(--pad) 90px;
  }
  .hero {
    grid-template-columns: 1fr;
    padding-right: 0;
    gap: 36px;
  }
  .hero__meta {
    padding-left: 0;
    border-left: 0;
    grid-template-columns: 1fr 1fr;
  }
  .facts {
    margin-right: 0;
  }
  .sec {
    grid-template-columns: 1fr;
    gap: 22px;
    margin-right: 0;
  }
  .row {
    grid-template-columns: 1fr auto 1.2em;
  }
  .row--two {
    grid-template-columns: 1fr auto;
  }
  .row__by {
    display: none;
  }
  .job__head {
    flex-direction: column;
    gap: 10px;
  }
  .cta {
    margin-right: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .status i,
  .term__live,
  .term__cursor {
    animation: none;
  }
}
</style>