<script setup lang="ts">
import type { DrinkKind } from '~/utils/drinks';

const { kind, x, y, surface } = defineProps<{
  kind: DrinkKind;
  /** Where the mouth stops to pour, in the glass's 64×64 box. */
  x: number;
  y: number;
  /** Height of the liquid in the glass: where the stream lands. */
  surface: number;
}>();

/*
  Each bottle drawn upright with its mouth at (0, 0), the body going down. `label`: a paper label
  at [y, height]; `cap`: what closes the neck (a cap, the champagne foil, the shaker lid).
*/
type Bottle = { body: string; label?: [number, number]; cap: string };

const BOTTLES: Record<DrinkKind, Bottle> = {
  beer: { body: 'M-2 0V8Q-2 11-5 14V34Q-5 36-3 36H3Q5 36 5 34V14Q2 11 2 8V0Z', label: [20, 8], cap: 'M-2.5-1.5H2.5V1.5H-2.5Z' },
  cola: {
    body: 'M-2 0V6Q-5 10-5 16Q-3 21-5 26Q-5 34-3 36H3Q5 34 5 26Q3 21 5 16Q5 10 2 6V0Z',
    label: [17, 6],
    cap: 'M-2.5-1.5H2.5V1.5H-2.5Z',
  },
  cocktail: { body: 'M-4 4H4L6 12V34Q6 36 4 36H-4Q-6 36-6 34V12Z', cap: 'M-2 0H2L4 4H-4Z' },
  syrup: { body: 'M-2 0V5Q-6 8-6 13V34Q-6 36-4 36H4Q6 36 6 34V13Q6 8 2 5V0Z', label: [18, 10], cap: 'M-2.5-1.5H2.5V1.5H-2.5Z' },
  wine: { body: 'M-2 0V10Q-2 14-6 17V35Q-6 37-4 37H4Q6 37 6 35V17Q2 14 2 10V0Z', label: [23, 8], cap: 'M-2.5-1H2.5V5H-2.5Z' },
  champagne: {
    body: 'M-2 0V10Q-2 14-6 17V35Q-6 37-4 37H4Q6 37 6 35V17Q2 14 2 10V0Z',
    label: [24, 6],
    cap: 'M-3-1H3V10Q3 12 1 12H-1Q-3 12-3 10Z',
  },
};

const bottle = computed(() => BOTTLES[kind]);
</script>

<!--
  Comes from the top right, tilts to pour into the glass, holds while the stream flows, then goes
  back and fades out. The whole loop lasts 4s and starts again.
-->
<template>
  <g class="pour" :style="{ '--pour-x': `${x}px`, '--pour-y': `${y}px` }">
    <line class="stream" :class="`stream--${kind}`" :x1="x" :y1="y + 1" :x2="x" :y2="surface" />
    <g :class="['bottle', `bottle--${kind}`]">
      <path class="bottle-body" :d="bottle.body" />
      <rect v-if="bottle.label" class="bottle-label" x="-5" :y="bottle.label[0]" width="10" :height="bottle.label[1]" />
      <path class="bottle-cap" :d="bottle.cap" />
      <path class="bottle-shine" d="M-3 18V31" />
    </g>
  </g>
</template>

<style scoped>
.bottle {
  transform-origin: 0 0;
  animation: pour 4s ease-in-out infinite;
}

/*
  The mouth is the pivot: at the pouring pose it sits on (--pour-x, --pour-y), body up and right.
  Drawn at the glasses' scale, the bottles are enlarged (--bottle-scale) to tower over the glass.
*/
.bottle {
  --bottle-scale: 2.2;
}

@keyframes pour {
  0%   { opacity: 0; transform: translate(calc(var(--pour-x) + 28px), calc(var(--pour-y) - 52px)) rotate(-60deg) scale(var(--bottle-scale)); }
  12%  { opacity: 1; transform: translate(calc(var(--pour-x) + 28px), calc(var(--pour-y) - 48px)) rotate(-60deg) scale(var(--bottle-scale)); }
  32%  { opacity: 1; transform: translate(var(--pour-x), var(--pour-y)) rotate(-118deg) scale(var(--bottle-scale)); }
  68%  { opacity: 1; transform: translate(var(--pour-x), var(--pour-y)) rotate(-124deg) scale(var(--bottle-scale)); }
  88%  { opacity: 1; transform: translate(calc(var(--pour-x) + 28px), calc(var(--pour-y) - 48px)) rotate(-60deg) scale(var(--bottle-scale)); }
  100% { opacity: 0; transform: translate(calc(var(--pour-x) + 28px), calc(var(--pour-y) - 52px)) rotate(-60deg) scale(var(--bottle-scale)); }
}

/* Flows while the bottle is tilted: drawn from the mouth down, then cut off from the top. */
.stream {
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: stream 4s linear infinite;
}

@keyframes stream {
  0%, 33% { stroke-dashoffset: 60; }
  42%     { stroke-dashoffset: 0; }
  66%     { stroke-dashoffset: 0; }
  74%, 100% { stroke-dashoffset: -60; }
}

.stream--beer { stroke: var(--drink-beer); }
.stream--cocktail { stroke: var(--drink-cocktail); }
.stream--cola { stroke: var(--drink-cola); }
.stream--syrup { stroke: var(--drink-syrup); }
.stream--wine { stroke: var(--drink-wine); }
.stream--champagne { stroke: var(--drink-champagne); }

.bottle-body,
.bottle-label,
.bottle-cap {
  stroke: var(--public-ink);
  stroke-width: 1.5;
  stroke-linejoin: round;
}

.bottle--beer .bottle-body { fill: var(--bottle-beer); }
.bottle--cola .bottle-body { fill: var(--drink-cola); }
.bottle--cocktail .bottle-body { fill: var(--bottle-metal); }
.bottle--syrup .bottle-body { fill: var(--drink-syrup); }
.bottle--wine .bottle-body,
.bottle--champagne .bottle-body { fill: var(--bottle-wine); }

.bottle-label { fill: var(--public-paper); }
.bottle--cola .bottle-label { fill: var(--public-holly); }

.bottle-cap { fill: var(--public-ink); }
.bottle--champagne .bottle-cap { fill: var(--public-sun); }
.bottle--cocktail .bottle-cap { fill: var(--bottle-metal); }

.bottle-shine {
  fill: none;
  stroke: var(--public-paper);
  stroke-width: 1.5;
  stroke-linecap: round;
  opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
  .pour {
    display: none;
  }
}
</style>
