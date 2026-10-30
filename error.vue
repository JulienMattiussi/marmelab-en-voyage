<script setup lang="ts">
import type { NuxtError } from '#app';

const { error } = defineProps<{ error: NuxtError }>();

const notFound = computed(() => error.statusCode === 404);

useHead({ title: () => (notFound.value ? 'Événement introuvable' : 'Oups') });

const goHome = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="error-page">
    <PublicBackdrop image="/assets/back.png" />
    <main class="error-card sticker sticker--bold">
      <span class="error-code pill">{{ error.statusCode }}</span>
      <h1 class="error-title">{{ notFound ? 'Événement introuvable' : 'Oups, petit souci technique' }}</h1>
      <p class="error-text">
        <template v-if="notFound">
          Ce voyage n'existe pas, ou plus. Vérifie l'adresse, ou retrouve les prochains départs sur l'accueil.
        </template>
        <template v-else>
          La page n'a pas pu s'afficher. Réessaie dans quelques instants.
        </template>
      </p>
      <NuxtImg class="error-bus" src="/assets/bus.png" alt="" />
      <button type="button" class="error-home pill" @click="goHome">Voir les voyages</button>
    </main>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px 16px;
  box-sizing: border-box;
  font-family: var(--public-font-body);
  color: var(--public-ink);
}

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 520px;
  padding: 32px 36px;
  text-align: center;
}

.error-code {
  padding: 2px 14px;
  font-family: var(--public-font-display);
  font-size: 1rem;
  font-weight: 800;
}

.error-title {
  margin: 0;
  font-family: var(--public-font-display);
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}

.error-text {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
}

.error-bus {
  width: 160px;
  height: 86px;
}

.error-home {
  padding: 12px 24px;
  font-family: var(--public-font-body);
  font-size: 1rem;
  color: var(--public-ink);
  cursor: pointer;
  box-shadow: var(--public-shadow);
  transition: transform 0.15s, box-shadow 0.15s;
}

.error-home:hover,
.error-home:focus-visible {
  transform: translate(-2px, -2px);
  box-shadow: var(--public-shadow-lg);
}

@media (max-width: 760px) {
  .error-card {
    padding: 24px 20px;
  }

  .error-title {
    font-size: 2rem;
  }
}
</style>
