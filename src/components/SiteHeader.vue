<script setup>
import { computed } from 'vue'
import { site } from '../data/site'
import { workProgress, logoOffset } from '../composables/useWorkProgress'

// Logo berbentuk balok dengan 4 sisi. Setiap perpindahan project memutarnya 90 derajat,
// jadi scroll ke bawah memutar ke satu arah dan scroll ke atas ke arah sebaliknya.
// Setiap sisi punya teks atas (pendek) dan lambang di tengah:
//   - mark : teks lambang (mis. 'JA' atau '</>')
//   - icon : ikon garis ('check' atau 'chart'); kalau diisi, menggantikan `mark`
//   - small: perkecil teks lambang
//   - long : perkecil teks atas yang panjang supaya muat
const faces = [
  { top: site.name.split(' ')[0].toUpperCase(), mark: site.initials },
  { top: 'DEVELOPER', mark: '</>', small: true, long: true },
  { top: 'QA', icon: 'check' },
  { top: 'ANALYST', icon: 'chart' },
]

// Putaran = scroll kartu di halaman utama + scroll foto di halaman project.
const spinStyle = computed(() => ({
  transform: `translateZ(calc(var(--logo-w) / -2)) rotateY(${-(workProgress.value + logoOffset.value) * 90}deg)`,
}))

const faceStyle = (i) => ({
  transform: `rotateY(${i * 90}deg) translateZ(calc(var(--logo-w) / 2))`,
})
</script>

<template>
  <header class="header">
    <router-link to="/" class="logo" aria-label="Home">
      <span class="logo__inner" :style="spinStyle">
        <span v-for="(face, i) in faces" :key="i" class="logo__face" :style="faceStyle(i)">
          <span class="logo__top" :class="{ 'logo__top--long': face.long }">{{ face.top }}</span>

          <span class="logo__mark" :class="{ 'logo__mark--small': face.small }">
            <!-- Ikon centang (QA) -->
            <svg v-if="face.icon === 'check'" class="logo__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 13l5 5L20 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" />
            </svg>

            <!-- Ikon grafik batang (Analyst) -->
            <svg v-else-if="face.icon === 'chart'" class="logo__icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="12" width="4.5" height="9" fill="currentColor" />
              <rect x="9.75" y="5" width="4.5" height="16" fill="currentColor" />
              <rect x="16.5" y="9" width="4.5" height="12" fill="currentColor" />
            </svg>

            <template v-else>{{ face.mark }}</template>
          </span>
        </span>
      </span>
    </router-link>

    <span class="header__menu label">Menu</span>

    <div class="header__status">
      <span class="header__dot" aria-hidden="true" />
      <span>{{ site.availability }}</span>
      <span class="label">{{ site.base }}</span>
    </div>

    <div class="header__mail">
      <span class="label">For inquiries</span>
      <a :href="`mailto:${site.email}`">{{ site.email }}</a>
    </div>
  </header>
</template>

<style scoped>
/* Teks putih + mix-blend-mode: difference => terang di atas background gelap,
   otomatis terbalik saat melewati gambar terang (seperti di referensi). */
.header {
  --logo-w: 72px; /* lebar logo = kedalaman balok (penampang persegi) */
  position: fixed;
  inset: 0 0 auto 0;
  height: 160px;
  z-index: 50;
  pointer-events: none;
  color: #fff;
  mix-blend-mode: difference;
  font-size: 15px;
}
.header > * {
  position: absolute;
  top: 22px;
  pointer-events: auto;
}
.header .label {
  color: rgba(255, 255, 255, 0.55);
}

/* Logo balok 4 sisi yang berputar 3D */
.logo {
  left: var(--pad);
  top: 20px;
  display: block;
  width: var(--logo-w);
  height: 140px;
  perspective: 520px;
  perspective-origin: 50% 50%;
}
.logo__inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  will-change: transform;
}
.logo__face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  border: 1.5px solid currentColor;
  font-weight: 600;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.logo__top {
  display: block;
  padding: 4px 0;
  border-bottom: 1.5px solid currentColor;
  font-size: 11px;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
}
.logo__top--long {
  font-size: 10px;
  letter-spacing: 0;
}
.logo__mark {
  flex: 1;
  display: grid;
  place-items: center;
  font-size: 38px;
  letter-spacing: -0.06em;
}
.logo__mark--small {
  font-size: 24px;
  letter-spacing: -0.02em;
}
.logo__icon {
  display: block;
  width: 34px;
  height: 34px;
}

.header__menu {
  left: var(--c2);
}
.header__status {
  left: 38.3vw;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 8px;
  row-gap: 3px;
  align-items: center;
}
.header__status .label {
  grid-column: 2;
}
.header__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3ddc84;
}
.header__mail {
  right: var(--pad);
  display: flex;
  gap: 8px;
}
.header__mail a {
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}

@media (max-width: 900px) {
  .header__status {
    display: none;
  }
  .header__menu {
    display: none;
  }
  .header__mail .label {
    display: none;
  }
}
</style>