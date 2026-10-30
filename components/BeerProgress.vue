<script setup lang="ts">
import { BEER_COUNT } from '~/utils/countdownMath';

const { beers = 0 } = defineProps<{
  /** Number of beers consumed so far (0–BEER_COUNT) */
  beers?: number;
}>();

// "0°" badges (alcohol-free beers), toggled with the "b" key.
const showDegrees = useState('beerShowDegrees', () => true);

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'b') showDegrees.value = !showDegrees.value;
  };
  window.addEventListener('keydown', handler);
  onUnmounted(() => window.removeEventListener('keydown', handler));
});

const imageForSlot = (slot: number): string => {
  if (slot === beers + 1) return '/assets/beer_last.png';
  if (slot === beers + 2) return '/assets/beer_prelast.png';
  if (beers >= slot)      return '/assets/beer.gif';
  return '/assets/beer.png';
};
</script>

<template>
  <div class="beer-row sticker" :aria-label="`${beers} bières sur ${BEER_COUNT}`" role="img">
    <div v-for="slot in BEER_COUNT" :key="slot" class="beer-slot">
      <NuxtImg
        class="beer"
        :alt="`beer-${slot}`"
        :src="imageForSlot(slot)"
        preload
      />
      <span v-show="showDegrees" class="degree-badge">0°</span>
    </div>
  </div>
</template>

<style scoped>
.beer-row {
  display: flex;
  justify-content: center;
  padding: 2px 10px;
}

.beer-slot {
  position: relative;
}

/* The mug pictures are square with wide margins: overlap them a little. */
img.beer {
  display: block;
  width: 52px;
  height: 52px;
  margin: 0 -5px;
}

/* A little round sticker on the mug, like a label on the glass. */
.degree-badge {
  position: absolute;
  right: 4px;
  bottom: 6px;
  min-width: 20px;
  padding: 1px 3px;
  box-sizing: border-box;
  font-family: var(--public-font-display);
  font-size: 0.625rem;
  font-weight: 800;
  line-height: 16px;
  text-align: center;
  background: var(--public-grass);
  border: var(--public-border);
  border-radius: var(--public-radius-pill);
}

@media (max-width: 760px) {
  .beer-row {
    padding: 0 6px;
  }

  img.beer {
    width: 40px;
    height: 40px;
    margin: 0 -3px;
  }

  .degree-badge {
    right: 1px;
    bottom: 3px;
    min-width: 17px;
    font-size: 0.5625rem;
    line-height: 13px;
  }
}
</style>
