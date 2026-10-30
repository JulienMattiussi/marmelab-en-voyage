<script setup lang="ts">
defineProps<{ message: string }>();
</script>

<template>
  <h1 class="main-title">{{ message }}</h1>
</template>

<style scoped>
.main-title {
  margin: 0;
  font-family: var(--public-font-display);
  font-size: 4.25rem;
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-align: left;
}

@media (max-width: 760px) {
  .main-title {
    font-size: 2.6rem;
  }
}
</style>
