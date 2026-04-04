<script setup lang="ts">
import { BEER_COUNT } from '~/utils/countdownMath';

const { beers = 0 } = defineProps<{
  /** Number of beers consumed so far (0–BEER_COUNT) */
  beers?: number;
}>();

const showDegrees = useState('beerShowDegrees', () => true);

defineShortcuts({
  b: () => { showDegrees.value = !showDegrees.value; },
});

const imageForSlot = (slot: number): string => {
  if (slot === beers + 1) return 'assets/beer_last.png';
  if (slot === beers + 2) return 'assets/beer_prelast.png';
  if (beers >= slot)      return 'assets/beer.gif';
  return 'assets/beer.png';
};
</script>

<template>
  <div class="beer-row">
    <div v-for="slot in BEER_COUNT" :key="slot">
      <NuxtImg
        class="beer"
        :alt="`beer-${slot}`"
        :src="imageForSlot(slot)"
        preload
      />
      <span
        class="degree-label"
        :style="`visibility: ${showDegrees ? 'visible' : 'hidden'};`"
      >0°</span>
    </div>
  </div>
</template>

<style scoped>
.beer-row {
  display: flex;
  justify-content: space-between;
}

img.beer {
  width: 60px;
}

span.degree-label {
  font-weight: bold;
  color: red;
  position: relative;
  left: -39px;
  bottom: 17px;
}

@media (max-width: 1250px) {
  img.beer {
    width: 40px;
  }

  span.degree-label {
    font-size: x-small;
    left: 13px;
    bottom: 28px;
  }
}
</style>
