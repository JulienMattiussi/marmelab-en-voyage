<script setup lang="ts">
import type { TripEvent } from '~/types/event';

const { data: events } = await useFetch<TripEvent[]>('/api/events');
const published = computed(() => (events.value ?? []).filter((e) => e.published));
</script>

<template>
  <div class="home">
    <NuxtImg class="back" alt="Background" src="/assets/back.png" />
    <div class="content">
      <NuxtImg alt="Marmelab logo" class="logo" src="/assets/logo-green.png" />
      <h1>Marmelab en Voyage</h1>

      <div v-if="published.length === 0" class="empty">
        Aucun événement publié pour l'instant.
      </div>

      <div v-else class="events">
        <NuxtLink
          v-for="event in published"
          :key="event.slug"
          :to="`/${event.slug}`"
          class="event-card"
        >
          <span class="event-name">{{ event.name }}</span>
          <span class="event-dates">
            {{ new Date(event.start).toLocaleDateString('fr-FR') }}
            →
            {{ new Date(event.deadline).toLocaleDateString('fr-FR') }}
          </span>
        </NuxtLink>
      </div>

      <NuxtLink to="/admin" class="admin-link">⚙ Gérer les événements</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.home { min-height: 100vh; }

.back {
  position: absolute;
  top: 0;
  left: 0;
  margin: 30px;
  filter: contrast(40%) blur(5px) brightness(1.5);
  width: calc(100vw - 60px);
  height: calc(100vh - 60px);
}

.content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.logo { width: 200px; }
h1 { font-size: 2rem; margin: 0; }

.events {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  width: 400px;
  max-width: 90vw;
}

.event-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  text-decoration: none;
  color: #2c3e50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s;
}

.event-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25); }

.event-name { font-size: 1.2rem; font-weight: bold; }
.event-dates { font-size: 0.9rem; color: #666; margin-top: 4px; }

.empty { color: #666; margin-top: 24px; }

.admin-link {
  margin-top: 32px;
  color: #666;
  font-size: 0.85rem;
  text-decoration: none;
}

.admin-link:hover { color: #2c3e50; }
</style>
