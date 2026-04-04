<template>
  <div>
    <NuxtPage />
    <AppToast />
  </div>
</template>

<style>
/* Global base styles */
#app {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--color-text);
  padding-top: 60px;
}

@media (max-width: 1250px) {
  #app {
    padding-top: 10px;
  }
}

#greenframe_embedable_score_page {
  position: absolute;
  bottom: 10px;
  right: 40px;
}
</style>
