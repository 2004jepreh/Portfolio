<script setup>
const props = defineProps({
  projects: { type: Array, required: true },
  progress: { type: Number, required: true },
})
defineEmits(['select'])

// Membungkus jarak ke rentang [-n/2, n/2) supaya daftar berputar tanpa ujung.
const wrap = (d, n) => ((((d + n / 2) % n) + n) % n) - n / 2

const itemStyle = (i) => {
  const d = wrap(i - props.progress, props.projects.length)
  const ad = Math.abs(d)
  const opacity = ad < 1 ? 1 - 0.78 * ad : Math.max(0, 0.22 - (ad - 1) * 0.1)
  return {
    '--d': d,
    opacity,
    pointerEvents: ad > 2.2 ? 'none' : 'auto',
  }
}
</script>

<template>
  <ul class="list">
    <li
      v-for="(project, i) in projects"
      :key="project.slug"
      class="item"
      :style="itemStyle(i)"
      @click="$emit('select', i)"
    >
      <span class="item__category">{{ project.category }}</span>
      <h2 class="item__title">{{ project.title }}</h2>
      <span class="item__dash">—</span>
      <p class="item__desc">{{ project.description }}</p>
    </li>
  </ul>
</template>

<style scoped>
.list {
  position: absolute;
  top: 50.4vh;
  left: 68.5vw;
  width: 23vw;
  height: 0;
}
.item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  cursor: pointer;
  transform: translateY(calc(-50% + var(--d) * 22.4vh));
  will-change: transform, opacity;
}
.item__category {
  color: var(--accent);
}
.item__title {
  font-family: var(--font-display);
  font-size: clamp(20px, 1.4vw, 29px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
.item__dash {
  color: var(--muted);
  line-height: 0.6;
}
.item__desc {
  max-width: 340px;
  line-height: 1.2;
}

@media (max-width: 900px) {
  .list {
    display: none;
  }
}
</style>