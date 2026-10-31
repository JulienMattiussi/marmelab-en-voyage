<script setup lang="ts">
// A light garland across the top of the page: swags of wire with a bulb at the bottom of each.
const SWAGS = 12;
const wire = Array.from({ length: SWAGS }, (_, i) => `Q${i * 100 + 50},30 ${(i + 1) * 100},4`).join(' ');
</script>

<template>
  <div class="winter-decor" aria-hidden="true">
    <div class="garland">
      <svg class="garland-wire" viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path :d="`M0,4 ${wire}`" />
      </svg>
      <span
        v-for="bulb in SWAGS"
        :key="bulb"
        class="bulb"
        :style="{ left: `${((bulb - 0.5) / SWAGS) * 100}%` }"
      />
    </div>
    <FallingParticles kind="snow" :count="70" />
  </div>
</template>

<style scoped>
.garland {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  pointer-events: none;
}

.garland-wire {
  width: 100%;
  height: 100%;
}

.garland-wire path {
  fill: none;
  stroke: var(--public-ink);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

/* Hangs from the lowest point of its swag (y = 17 in the 40px-high wire). */
.bulb {
  position: absolute;
  top: 15px;
  width: 11px;
  height: 16px;
  translate: -50% 0;
  border: var(--public-border);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  animation: twinkle 1.6s ease-in-out infinite alternate;
}

.bulb:nth-child(4n + 2) { background: var(--public-holly); }
.bulb:nth-child(4n + 3) { background: var(--public-sun); animation-delay: 0.4s; }
.bulb:nth-child(4n) { background: var(--public-grass); animation-delay: 0.8s; }
.bulb:nth-child(4n + 1) { background: var(--public-ocean); animation-delay: 1.2s; }

@keyframes twinkle {
  from { opacity: 1; filter: brightness(1.15); }
  to   { opacity: 0.45; filter: brightness(0.8); }
}

@media (prefers-reduced-motion: reduce) {
  .bulb {
    animation: none;
  }
}
</style>
