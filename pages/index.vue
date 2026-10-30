<script setup lang="ts">
import type { TripEvent } from '~/types/event';

const { data: events } = await useFetch<TripEvent[]>('/api/published-events');

// Next trip first.
const published = computed(() =>
  [...(events.value ?? [])].sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline)),
);

useShareMeta({
  title: SITE_NAME,
  description: 'Le compte à rebours des voyages Marmelab',
  image: '/assets/og-home.jpg',
  isPreviewCard: true,
  path: '/',
});
</script>

<template>
  <div class="home">
    <PublicBackdrop image="/assets/back.png" />
    <header class="home-header">
      <NuxtImg alt="Marmelab logo" class="logo" src="/assets/logo-green.png" />
      <MainTitle :message="SITE_NAME" />
    </header>

    <p v-if="published.length === 0" class="empty sticker">
      Aucun événement publié pour l'instant.
    </p>

    <div v-else class="events">
      <NuxtLink
        v-for="event in published"
        :key="event.slug"
        :to="`/${event.slug}`"
        class="event-card sticker sticker--bold"
      >
        <span class="event-visual">
          <NuxtImg :src="event.visuals.goal || '/assets/goal.png'" alt="" class="event-goal" />
        </span>
        <span class="event-name">{{ event.name }}</span>
        <span class="event-title">{{ event.title }}</span>
        <span class="event-rdv">{{ formatRendezVous(event.deadline) }}</span>
      </NuxtLink>
    </div>

    <NuxtLink to="/admin" class="admin-link">Gérer les événements</NuxtLink>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 1120px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 56px 72px 40px;
  box-sizing: border-box;
  font-family: var(--public-font-body);
  color: var(--public-ink);
  text-align: left;
}

.home-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  width: 72px;
  height: auto;
}

.events {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 28px;
}

.event-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 0 18px;
  overflow: hidden;
  color: var(--public-ink);
  text-decoration: none;
  transition: transform 0.15s, box-shadow 0.15s;
}

.event-card:hover,
.event-card:focus-visible {
  transform: translate(-2px, -2px);
  box-shadow: var(--public-shadow-hover);
}

.event-visual {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  padding: 16px;
  background: var(--public-sky);
  border-bottom: var(--public-border-thick);
}

.event-goal {
  width: 140px;
  height: 140px;
  object-fit: contain;
}

.event-name,
.event-title,
.event-rdv {
  margin: 0 20px;
}

.event-name {
  font-family: var(--public-font-display);
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.05;
}

.event-title {
  font-size: 1rem;
  font-weight: 500;
}

.event-rdv {
  align-self: flex-start;
  margin-top: 8px;
  padding: 4px 12px;
  font-size: 0.875rem;
  font-weight: 700;
  background: var(--public-sun);
  border: var(--public-border);
  border-radius: var(--public-radius-pill);
}

.empty {
  align-self: flex-start;
  margin: 0;
  padding: 16px 20px;
  font-weight: 700;
}

.admin-link {
  margin-top: auto;
  align-self: flex-start;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--public-ink);
}

@media (max-width: 760px) {
  .home {
    gap: 28px;
    padding: 40px 16px 28px;
  }

  .home-header {
    gap: 14px;
  }

  .logo {
    width: 48px;
  }

  .events {
    gap: 20px;
  }
}
</style>
