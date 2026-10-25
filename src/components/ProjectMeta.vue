<script setup>
defineProps({
  project: { type: Object, required: true },
})
</script>

<template>
  <Transition name="fade" mode="out-in">
    <div :key="project.slug" class="meta">
      <dl class="meta__row meta__role">
        <dt class="label">Role</dt>
        <dd>
          <span v-for="r in project.role" :key="r">{{ r }}</span>
        </dd>
      </dl>

      <div class="meta__col">
        <dl class="meta__row">
          <dt class="label">End date</dt>
          <dd>{{ project.launch }}</dd>
        </dl>
        <dl v-if="project.recognition.length" class="meta__row meta__recognition">
          <dt class="label">Recognition</dt>
          <dd>
            <span v-for="r in project.recognition" :key="r">{{ r }}</span>
          </dd>
        </dl>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.meta {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-size: 15px;
}
.meta__row {
  display: grid;
  grid-template-columns: 100px 1fr;
}
.meta__row dd {
  display: flex;
  flex-direction: column;
  font-weight: 500;
}
.meta__role {
  position: absolute;
  top: 42.6vh;
  left: var(--pad);
  grid-template-columns: 64px 1fr;
}
.meta__col {
  position: absolute;
  top: 42.6vh;
  left: var(--c2);
}
.meta__recognition {
  margin-top: 66px;
}

@media (max-width: 900px) {
  .meta__role {
    display: none;
  }
  .meta__col {
    top: 66vh;
  }
  .meta__recognition {
    display: none;
  }
}
</style>