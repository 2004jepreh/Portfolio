<script setup>
defineProps({
  index: { type: Number, required: true },
  total: { type: Number, required: true },
})

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <div class="counter">
    <span class="counter__label label">Selected work</span>

    <div class="counter__number">
      <Transition name="roll" mode="out-in">
        <span :key="index">{{ pad(index + 1) }}</span>
      </Transition>
    </div>

    <span class="counter__total">/{{ pad(total) }}</span>
  </div>
</template>

<style scoped>
.counter {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.counter__label {
  position: absolute;
  left: var(--c2);
  top: 82.4vh;
  font-size: 15px;
}
.counter__number {
  position: absolute;
  left: 18.2vw;
  top: 79vh;
  display: flex;
  font-size: clamp(120px, 20.8vh, 260px);
  font-weight: 400;
  line-height: 0.8;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums; /* semua digit selebar sama */
  color: #fff;
  mix-blend-mode: difference; /* berubah warna saat di atas kartu */
}
.counter__number > span {
  display: inline-block;
}

/* "/06" dikunci di posisi tetap, tidak ikut lebar angka.
   Posisi kiri dihitung dari lebar dua digit (2 x 0.6em dari ukuran angka).
   Efek difference yang sama dengan angka, supaya warnanya ikut berbalik. */
.counter__total {
  position: absolute;
  left: calc(18.2vw + clamp(120px, 20.8vh, 260px) * 1.2 + 4px);
  top: calc(79vh + 6px);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1;
  color: #fff;
  mix-blend-mode: difference;
}

.roll-enter-active,
.roll-leave-active {
  transition: opacity 0.3s ease, transform 0.4s var(--ease);
}
.roll-enter-from {
  opacity: 0;
  transform: translateY(35%);
}
.roll-leave-to {
  opacity: 0;
  transform: translateY(-35%);
}

@media (max-width: 900px) {
  .counter__label {
    top: auto;
    bottom: 22px;
    left: 88px;
  }
  .counter__number {
    left: var(--pad);
    top: auto;
    bottom: 40px;
    font-size: 96px;
  }
  .counter__total {
    left: calc(var(--pad) + 96px * 1.2 + 4px);
    top: auto;
    bottom: 120px;
  }
}
</style>