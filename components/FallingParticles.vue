<script setup lang="ts">
const { kind, count = 50 } = defineProps<{
  /** Snowflakes drift down slowly; confetti fall faster and spin, in several colors. */
  kind: 'snow' | 'confetti';
  count?: number;
}>();

// Same values on the server and in the browser (no Math.random), so hydration matches. Rounded:
// Math.sin may differ in the last digits between Node and the browser.
const pseudoRandom = (index: number, salt: number) => {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
};

const particles = computed(() =>
  Array.from({ length: count }, (_, index) => ({
    index,
    style: {
      left: `${pseudoRandom(index, 1) * 100}%`,
      '--size': `${4 + pseudoRandom(index, 2) * 6}px`,
      '--drift': `${(pseudoRandom(index, 3) - 0.5) * 120}px`,
      animationDuration: `${(kind === 'snow' ? 8 : 3) + pseudoRandom(index, 4) * 6}s`,
      // Negative delays: the screen is already full when the page shows.
      animationDelay: `${-pseudoRandom(index, 5) * 14}s`,
    },
  })),
);
</script>

<template>
  <div :class="['particles', `particles--${kind}`]" aria-hidden="true">
    <span v-for="particle in particles" :key="particle.index" class="particle" :style="particle.style" />
  </div>
</template>

<style scoped>
.particles {
  position: fixed;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: -20px;
  width: var(--size);
  height: var(--size);
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.particles--snow .particle {
  background: var(--public-snow);
  border-radius: 50%;
  opacity: 0.9;
}

.particles--confetti .particle {
  height: calc(var(--size) * 1.6);
  border: 1px solid var(--public-ink);
}

.particles--confetti .particle:nth-child(4n) { background: var(--public-sun); }
.particles--confetti .particle:nth-child(4n + 1) { background: var(--public-berry); }
.particles--confetti .particle:nth-child(4n + 2) { background: var(--public-ocean); }
.particles--confetti .particle:nth-child(4n + 3) { background: var(--public-grass); }

@keyframes fall {
  to {
    translate: var(--drift) 105vh;
    rotate: 540deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .particles {
    display: none;
  }
}
</style>
