<script setup lang="ts">
import type { DrinkKind } from '~/utils/drinks';

const { kind, level } = defineProps<{
  kind: DrinkKind;
  /** How full the glass is: 0 (empty) to 1 (full). */
  level: number;
  /** The glass being filled: its bottle comes and pours into it, again and again. */
  pouring?: boolean;
}>();

/*
  Each glass in a 64×64 box. `glass` is the part that holds the drink (it also cuts the liquid),
  `stem` the rest of the outline, `shine` a reflection on the glass. The liquid rises from
  `bottom` to `full` (its surface when full). `bubbles`: where bubbles rise, for fizzy drinks.
  `drip`: a drop beading at x on the full glass, sliding down from y `from` to `to`.
  `pour`: where the bottle's mouth stops to pour, just above the rim.
*/
type Glass = {
  glass: string;
  stem?: string;
  foot?: boolean;
  shine: string;
  full: number;
  bottom: number;
  bubbles?: number[];
  drip: { x: number; from: number; to: number };
  pour: { x: number; y: number };
};

const GLASSES: Record<DrinkKind, Glass> = {
  beer: {
    glass: 'M13 18H41V50Q41 57 34 57H20Q13 57 13 50Z',
    stem: 'M41 25Q53 24 53 34Q53 46 41 47',
    shine: 'M17 23V47',
    full: 23,
    bottom: 57,
    bubbles: [21, 28, 35],
    drip: { x: 28, from: 26, to: 52 },
    pour: { x: 30, y: 9 },
  },
  cocktail: {
    glass: 'M8 14H56L32 38Z',
    stem: 'M32 38V54',
    foot: true,
    shine: 'M15 18L25 29',
    full: 17,
    bottom: 38,
    drip: { x: 28, from: 17, to: 31 },
    pour: { x: 36, y: 5 },
  },
  cola: {
    glass: 'M16 12H48L44 57H20Z',
    shine: 'M21 17L24 50',
    full: 19,
    bottom: 57,
    bubbles: [26, 32, 39],
    drip: { x: 27, from: 15, to: 52 },
    pour: { x: 34, y: 3 },
  },
  syrup: {
    glass: 'M21 6H43V53Q43 57 39 57H25Q21 57 21 53Z',
    shine: 'M25 11V49',
    full: 14,
    bottom: 57,
    drip: { x: 39, from: 9, to: 52 },
    pour: { x: 32, y: -2 },
  },
  wine: {
    glass: 'M18 9H46Q49 31 32 36Q15 31 18 9Z',
    stem: 'M32 36V54',
    foot: true,
    shine: 'M22 14Q21 24 25 30',
    full: 21,
    bottom: 36,
    drip: { x: 27, from: 12, to: 31 },
    pour: { x: 34, y: 1 },
  },
  champagne: {
    glass: 'M7 22H57Q55 39 32 39Q9 39 7 22Z',
    stem: 'M32 39V54',
    foot: true,
    shine: 'M12 26Q14 33 20 35',
    full: 25,
    bottom: 39,
    bubbles: [24, 32, 40, 47],
    drip: { x: 41, from: 25, to: 35 },
    pour: { x: 36, y: 13 },
  },
};

const shape = computed(() => GLASSES[kind]);
const isFull = computed(() => level >= 1);
const surface = computed(() => shape.value.bottom - level * (shape.value.bottom - shape.value.full));
// The liquid is drawn full and slid down: `transform` animates when the level changes.
const drop = computed(() => (1 - Math.min(1, Math.max(0, level))) * (shape.value.bottom - shape.value.full));
const clipId = useId();
</script>

<template>
  <svg :class="['drink', `drink--${kind}`, { 'drink--full': isFull }]" viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <clipPath :id="clipId">
        <path :d="shape.glass" />
      </clipPath>
    </defs>

    <path class="glass-inside" :d="shape.glass" />

    <g :clip-path="`url(#${clipId})`">
      <g class="liquid" :style="{ transform: `translateY(${drop}px)` }">
        <rect class="liquid-fill" x="0" :y="shape.full" width="64" :height="shape.bottom - shape.full + 4" />
        <!-- Deeper at the bottom, a lighter band on the surface. -->
        <rect class="liquid-depth" x="0" :y="(shape.full + shape.bottom) / 2" width="64" :height="shape.bottom" />
        <rect class="liquid-surface" x="0" :y="shape.full" width="64" height="3" />
      </g>
      <g v-if="isFull && shape.bubbles">
        <circle
          v-for="(x, index) in shape.bubbles"
          :key="x"
          class="bubble"
          :style="{ animationDelay: `${index * 0.45}s` }"
          :cx="x"
          :cy="shape.bottom - 3"
          :r="1.2 + (index % 2) * 0.6"
        />
      </g>
      <template v-if="kind === 'beer'">
        <path class="facet" d="M22 22V54M32 22V54" />
      </template>
      <template v-if="isFull && kind === 'cola'">
        <rect class="ice" x="22" y="22" width="10" height="10" rx="2" transform="rotate(-12 27 27)" />
        <rect class="ice" x="31" y="29" width="10" height="10" rx="2" transform="rotate(14 36 34)" />
      </template>
    </g>

    <path class="glass-shine" :d="shape.shine" />

    <path class="glass-outline" :d="shape.glass" />
    <path v-if="shape.stem" class="glass-outline" :d="shape.stem" />
    <ellipse v-if="shape.foot" class="glass-foot" cx="32" cy="56" rx="11" ry="2.5" />

    <!-- A drop beading on the full glass, then sliding down: it forms, stretches, slides, vanishes. -->
    <g
      v-if="isFull"
      class="drip"
      :style="{ '--drip-x': `${shape.drip.x}px`, '--drip-from': `${shape.drip.from}px`, '--drip-to': `${shape.drip.to}px` }"
    >
      <path class="drop" d="M0 -5Q3.5 0 3.5 2.5A3.5 3.5 0 0 1 -3.5 2.5Q-3.5 0 0 -5Z" />
    </g>

    <!-- What makes each drink recognizable once poured: drawn over the rim. -->
    <g v-if="isFull" class="garnish">
      <path
        v-if="kind === 'beer'"
        class="foam"
        d="M11 24Q8 16 15 15Q17 9 24 11Q29 5 35 9Q42 7 43 14Q48 17 43 23Q44 30 40 29Q38 25 35 25H21Q19 29 16 28Q12 28 11 24Z"
      />
      <template v-else-if="kind === 'cocktail'">
        <path class="pick" d="M22 32L17 6" />
        <path class="umbrella" d="M5 11Q15 -1 28 6Z" />
        <path class="umbrella-ribs" d="M16.5 5L5 11M16.5 5L28 6M16.5 5L16 9" />
        <circle class="orange" cx="51" cy="14" r="7" />
        <circle class="orange-flesh" cx="51" cy="14" r="4.5" />
        <path class="slice-segments" d="M51 9.5V18.5M46.5 14H55.5M47.8 10.8L54.2 17.2M54.2 10.8L47.8 17.2" />
      </template>
      <template v-else-if="kind === 'cola'">
        <path class="straw-base" d="M41 1L35 44" />
        <path class="straw-stripes straw-stripes--red" d="M41 1L35 44" />
        <circle class="lemon" cx="18" cy="13" r="7" />
        <circle class="lemon-flesh" cx="18" cy="13" r="4.5" />
        <path class="slice-segments" d="M18 8.5V17.5M13.5 13H22.5M14.8 9.8L21.2 16.2M21.2 9.8L14.8 16.2" />
      </template>
      <template v-else-if="kind === 'syrup'">
        <path class="straw-base" d="M37 0L31 46" />
        <path class="straw-stripes straw-stripes--blue" d="M37 0L31 46" />
        <path class="mint" d="M43 7Q48 0 54 4Q50 10 43 7Z" />
        <path class="mint" d="M43 7Q44 0 39 -2Q36 4 43 7Z" />
      </template>
      <template v-else-if="kind === 'champagne'">
        <path class="sparkle" d="M52 6L53.5 10.5L58 12L53.5 13.5L52 18L50.5 13.5L46 12L50.5 10.5Z" />
        <path class="sparkle sparkle--small" d="M13 9L14 12L17 13L14 14L13 17L12 14L9 13L12 12Z" />
      </template>
    </g>

    <DrinkBottle v-if="pouring" :kind="kind" :x="shape.pour.x" :y="shape.pour.y" :surface="surface" />
  </svg>
</template>

<style scoped>
.drink {
  display: block;
  overflow: visible;
}

.glass-inside {
  fill: var(--public-paper);
}

.glass-outline,
.glass-foot {
  fill: none;
  stroke: var(--public-ink);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.glass-foot {
  fill: var(--public-paper);
  stroke-width: 2.5;
}

.glass-shine {
  fill: none;
  stroke: var(--public-paper);
  stroke-width: 2.5;
  stroke-linecap: round;
  opacity: 0.8;
}

/* The mug's glass ribs. */
.facet {
  fill: none;
  stroke: var(--public-ink);
  stroke-width: 1.5;
  opacity: 0.18;
}

.liquid {
  transition: transform 1.2s ease-in-out;
}

.drink--beer .liquid-fill { fill: var(--drink-beer); }
.drink--cocktail .liquid-fill { fill: var(--drink-cocktail); }
.drink--cola .liquid-fill { fill: var(--drink-cola); }
.drink--syrup .liquid-fill { fill: var(--drink-syrup); }
.drink--wine .liquid-fill { fill: var(--drink-wine); }
.drink--champagne .liquid-fill { fill: var(--drink-champagne); }

.liquid-depth {
  fill: var(--public-ink);
  opacity: 0.12;
}

.liquid-surface {
  fill: var(--public-paper);
  opacity: 0.4;
}

.bubble {
  fill: var(--public-paper);
  opacity: 0;
  animation: rise 1.8s ease-in infinite;
}

@keyframes rise {
  0%   { opacity: 0; transform: translateY(0); }
  20%  { opacity: 0.9; }
  100% { opacity: 0; transform: translateY(-30px); }
}

/* Loops every 3s; slots set --drip-delay so the glasses of the row don't drip together. */
.drip {
  transform: translate(var(--drip-x), var(--drip-from));
  animation: drip 3s ease-in infinite;
  animation-delay: var(--drip-delay, 0s);
}

.drop {
  fill: var(--public-paper);
  stroke: var(--public-ink);
  stroke-width: 1.5;
}

@keyframes drip {
  0%   { transform: translate(var(--drip-x), var(--drip-from)) scale(0.2, 0.2); }
  15%  { transform: translate(var(--drip-x), var(--drip-from)) scale(0.9, 1.2); }
  25%  { transform: translate(var(--drip-x), calc(var(--drip-from) + 3px)) scale(0.8, 1.5); }
  60%  { transform: translate(var(--drip-x), var(--drip-to)) scale(0.75, 1.3); }
  70%  { transform: translate(var(--drip-x), var(--drip-to)) scale(0.6, 0.4); opacity: 1; }
  75%  { transform: translate(var(--drip-x), var(--drip-to)) scale(0.2, 0.1); opacity: 0; }
  100% { transform: translate(var(--drip-x), var(--drip-to)) scale(0.2, 0.1); opacity: 0; }
}

/* Appears once the liquid has risen. */
.garnish {
  animation: garnish-in 0.4s ease-out 1s backwards;
}

@keyframes garnish-in {
  from { opacity: 0; transform: translateY(-4px); }
}

.foam,
.ice,
.lemon,
.orange,
.umbrella,
.mint,
.sparkle {
  stroke: var(--public-ink);
  stroke-width: 2;
  stroke-linejoin: round;
}

.foam { fill: var(--public-paper); }

.ice {
  fill: var(--public-paper);
  fill-opacity: 0.65;
  stroke-width: 1.5;
}

.lemon,
.lemon-flesh { fill: var(--public-sun); }
.orange,
.orange-flesh { fill: var(--public-orange); }

.lemon-flesh,
.orange-flesh {
  stroke: var(--public-paper);
  stroke-width: 1.5;
}

.slice-segments {
  stroke: var(--public-paper);
  stroke-width: 1;
}

.umbrella { fill: var(--public-berry); }

.umbrella-ribs {
  fill: none;
  stroke: var(--public-paper);
  stroke-width: 1;
}

.mint { fill: var(--public-grass); }

.sparkle {
  fill: var(--public-sun);
  stroke-width: 1.5;
  transform-box: fill-box;
  transform-origin: center;
  animation: twinkle 1.4s ease-in-out infinite alternate;
}

.sparkle--small { animation-delay: 0.7s; }

@keyframes twinkle {
  from { scale: 1; }
  to   { scale: 0.5; }
}

.pick,
.straw-base,
.straw-stripes {
  fill: none;
  stroke-linecap: round;
}

.pick {
  stroke: var(--public-ink);
  stroke-width: 1.5;
}

/* Striped straws: a white straw with colored dashes over it, outlined by a wider ink line. */
.straw-base {
  stroke: var(--public-paper);
  stroke-width: 4;
  filter: drop-shadow(1px 0 0 var(--public-ink)) drop-shadow(-1px 0 0 var(--public-ink));
}

.straw-stripes {
  stroke-width: 4;
  stroke-linecap: butt;
  stroke-dasharray: 3 3;
}

.straw-stripes--red { stroke: var(--public-holly); }
.straw-stripes--blue { stroke: var(--public-ocean); }

@media (prefers-reduced-motion: reduce) {
  .liquid {
    transition: none;
  }

  .bubble,
  .garnish,
  .sparkle {
    animation: none;
  }

  .drip {
    display: none;
  }
}
</style>
