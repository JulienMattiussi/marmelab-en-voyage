<script setup lang="ts">
const { image } = defineProps<{
  /** Full-screen background picture, under a sky-blue veil that keeps the content readable. */
  image: string;
}>();
</script>

<template>
  <div class="backdrop" aria-hidden="true">
    <NuxtImg class="backdrop-image" :src="image" alt="" />
    <div class="backdrop-veil" />
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: var(--public-sky);
}

.backdrop-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.backdrop-veil {
  position: absolute;
  inset: 0;
  background: var(--public-sky);
  opacity: var(--public-veil-opacity);
}
</style>
