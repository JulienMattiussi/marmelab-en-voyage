<script setup lang="ts">
type Props = {
  currentBeer?: number;
};

const { currentBeer = 0 } = defineProps<Props>();
const dryBeer = useState("dryBeer", () => true);

defineShortcuts({
  b: () => {
    dryBeer.value = !dryBeer.value;
  },
});

const chooseBeerImage = (index: number) => {
  if (index === currentBeer + 1) {
    return "assets/beer_last.png";
  }

  if (index === currentBeer + 2) {
    return "assets/beer_prelast.png";
  }

  if (currentBeer >= index) {
    return "assets/beer.gif";
  }

  return "assets/beer.png";
};
</script>

<template>
  <div class="img-container">
    <div v-for="index in 9" :key="index">
      <NuxtImg
        class="beer"
        :alt="currentBeer.toString()"
        :src="chooseBeerImage(index)"
        preload
      />
      <span
        :style="`visibility: ${dryBeer ? 'visible' : 'hidden'};`"
        class="dry-beer"
        >0°</span
      >
    </div>
  </div>
</template>

<style scoped>
.img-container {
  display: flex;
  justify-content: space-between;
}

img.beer {
  width: 60px;
}

span.dry-beer {
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
}

@media (max-width: 1250px) {
  span.dry-beer {
    font-size: x-small;
    left: 13px;
    bottom: 28px;
  }
}
</style>
