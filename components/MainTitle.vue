<script setup lang="ts">
type Props = {
  message: string;
};

const { message } = defineProps<Props>();
</script>

<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<style scoped>
h1 {
  margin: 40px 0 0;
  display: flex;
  width: 100%;
  justify-content: center;
}
</style>
