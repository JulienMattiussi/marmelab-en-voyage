<script setup lang="ts">
const RAYS = 12;
</script>

<template>
  <div class="summer-decor" aria-hidden="true">
    <!-- A big sun in the top-right corner, its rays turning slowly. -->
    <svg class="sun" viewBox="-60 -60 120 120">
      <g class="sun-rays">
        <rect v-for="ray in RAYS" :key="ray" x="-4" y="-56" width="8" height="18" rx="4" :transform="`rotate(${(ray * 360) / RAYS})`" />
      </g>
      <circle class="sun-disc" r="30" />
    </svg>
    <span v-for="butterfly in 3" :key="butterfly" class="butterfly">
      <span class="wing" />
      <span class="body" />
      <span class="wing" />
    </span>
  </div>
</template>

<style scoped>
.summer-decor {
  position: fixed;
  inset: 0;
  /* Above the backdrop (also -1, earlier in the page), under the content. */
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.sun {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 220px;
  height: 220px;
}

.sun-rays {
  animation: spin 40s linear infinite;
}

.sun-rays rect,
.sun-disc {
  fill: var(--public-sun);
  stroke: var(--public-ink);
  stroke-width: 2;
}

@keyframes spin {
  to { rotate: 360deg; }
}

/* Two wings flapping, flying a wide loop across the sky. */
.butterfly {
  position: absolute;
  top: 30%;
  left: 0;
  display: flex;
  align-items: center;
  rotate: -15deg;
  animation: flutter-path 22s ease-in-out infinite;
}

.butterfly:nth-child(3) { top: 18%; animation-duration: 28s; animation-delay: -9s; }
.butterfly:nth-child(4) { top: 42%; animation-duration: 25s; animation-delay: -17s; }

.wing {
  width: 20px;
  height: 26px;
  background: var(--public-berry);
  border: var(--public-border);
  border-radius: 60% 40% 50% 50%;
  animation: flap 0.25s ease-in-out infinite alternate;
}

.butterfly:nth-child(3) .wing { background: var(--public-ocean); }
.butterfly:nth-child(4) .wing { background: var(--public-orange); }

.body {
  width: 5px;
  height: 22px;
  margin: 2px -2px 0;
  z-index: 1;
  background: var(--public-ink);
  border-radius: var(--public-radius-pill);
}

.wing:first-child { transform-origin: right center; }
.wing:last-child { transform-origin: left center; }

@keyframes flap {
  to { scale: 0.3 1; }
}

@keyframes flutter-path {
  0%   { translate: -40px 0; }
  25%  { translate: 25vw -60px; }
  50%  { translate: 50vw 30px; }
  75%  { translate: 75vw -40px; }
  100% { translate: calc(100vw + 40px) 0; }
}

@media (prefers-reduced-motion: reduce) {
  .sun-rays,
  .wing {
    animation: none;
  }

  .butterfly {
    display: none;
  }
}

@media (max-width: 760px) {
  .sun {
    width: 140px;
    height: 140px;
    top: -35px;
    right: -35px;
  }
}
</style>
