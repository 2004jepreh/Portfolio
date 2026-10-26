<script setup>
import { useRoute } from 'vue-router'
import { contactOpen, openContact, closeContact } from '../composables/useContact'

const route = useRoute()

const links = [
  { to: '/', label: 'Projects' },
  { to: '/about', label: 'About' },
  { action: 'contact', label: 'Contact' },
]

// Saat popup Contact terbuka, hanya "Contact" yang menyala.
const isActive = (link) => {
  if (contactOpen.value) return false
  return link.to === '/'
    ? route.path === '/' || route.path.startsWith('/project/')
    : route.path === link.to
}

const toggleContact = () => (contactOpen.value ? closeContact() : openContact())
</script>

<template>
  <nav class="nav" aria-label="Main">
    <template v-for="link in links" :key="link.label">
      <button
        v-if="link.action === 'contact'"
        type="button"
        class="nav__link"
        :class="{ 'is-active': contactOpen }"
        :aria-expanded="contactOpen"
        @click="toggleContact"
      >
        <span class="nav__arrow" aria-hidden="true">→</span>{{ link.label }}
      </button>

      <router-link
        v-else
        :to="link.to"
        class="nav__link"
        :class="{ 'is-active': isActive(link) }"
        @click="closeContact"
      >
        <span class="nav__arrow" aria-hidden="true">→</span>{{ link.label }}
      </router-link>
    </template>
  </nav>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 68px;
  left: var(--c2);
  z-index: 40;
  display: flex;
  flex-direction: column;
}
.nav__link {
  display: flex;
  align-items: baseline;
  padding: 0;
  text-align: left;
  font-size: 26px;
  line-height: 0.86;
  font-weight: 400;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  transition: color 0.3s ease, opacity 0.3s ease;
}
.nav__arrow {
  display: inline-block;
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  font-size: 18px;
  letter-spacing: 0;
  transition: max-width 0.5s var(--ease), opacity 0.3s ease, margin 0.5s var(--ease);
}
.nav__link.is-active {
  color: var(--accent);
}
.nav__link.is-active .nav__arrow {
  max-width: 34px;
  margin-right: 8px;
  opacity: 1;
}
.nav__link:not(.is-active):hover {
  color: var(--accent);
}

@media (max-width: 900px) {
  .nav {
    top: 20px;
    left: 88px;
  }
  .nav__link {
    font-size: 20px;
  }
  /* Di HP, menu aktif cukup ditandai warna. Panah dimatikan supaya lebar menu tetap
     dan tidak menimpa email di kanan. */
  .nav__link.is-active .nav__arrow {
    max-width: 0;
    margin-right: 0;
    opacity: 0;
  }
}
</style>