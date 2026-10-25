<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { projects } from '../data/projects'
import { useWorkScroll } from '../composables/useWorkScroll'
import CardStack from '../components/CardStack.vue'
import ProjectList from '../components/ProjectList.vue'
import ProjectMeta from '../components/ProjectMeta.vue'
import ProjectCounter from '../components/ProjectCounter.vue'

const router = useRouter()
const { progress, active, goTo } = useWorkScroll(projects.length)

const current = computed(() => projects[active.value])

const openProject = (slug) => router.push(`/project/${slug}`)

// Klik judul di daftar: kalau sudah aktif buka project, kalau belum pindah dulu.
const onSelect = (i) => (i === active.value ? openProject(projects[i].slug) : goTo(i))
</script>

<template>
  <main class="work">
    <CardStack :projects="projects" :progress="progress" @open="openProject" @select="goTo" />
    <ProjectList :projects="projects" :progress="progress" @select="onSelect" />
    <ProjectMeta :project="current" />
    <ProjectCounter :index="active" :total="projects.length" />

    <p class="work__mobile-title">{{ current.title }}</p>

    <span class="work__scroll label">Scroll</span>

    <div class="work__swatches" aria-hidden="true">
      <i v-for="color in current.swatches" :key="color" :style="{ background: color }" />
    </div>
  </main>
</template>

<style scoped>
.work {
  background: var(--bg);
  position: fixed;
  inset: 0;
  overflow: hidden;
  touch-action: none;
}

.work__scroll {
  position: absolute;
  left: var(--pad);
  bottom: 22px;
}

/* Kotak warna: posisi dibulatkan ke piksel utuh supaya ketiganya selalu sejajar.
   Baris pertama adalah cadangan untuk browser lama. */
.work__swatches {
  position: absolute;
  right: 19px;
  top: 49.2vh;
  top: round(nearest, 49.2vh, 1px);
  display: flex;
  align-items: flex-start;
  gap: 3px;
}
.work__swatches i {
  display: block;
  flex: none;
  width: 15px;
  height: 15px;
  transition: background 0.4s ease;
}

.work__mobile-title {
  display: none;
}

@media (max-width: 900px) {
  .work__mobile-title {
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: 76vh;
    text-align: center;
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .work__swatches {
    top: auto;
    bottom: 60px;
  }
  .work__scroll {
    display: none;
  }
}
</style>