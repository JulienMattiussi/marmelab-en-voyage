<script setup lang="ts">
import type { TripEvent } from '~/types/event';

const { data: events } = await useFetch<TripEvent[]>('/api/events');

const sorted = computed(() =>
  [...(events.value ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
);
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <NuxtLink to="/" class="back-link">← Retour</NuxtLink>
      <h1>Événements</h1>
      <NuxtLink to="/admin/participants" class="btn-secondary">Participants</NuxtLink>
      <NuxtLink to="/admin/new" class="btn-primary">+ Nouvel événement</NuxtLink>
    </div>

    <div v-if="sorted.length === 0" class="empty">
      Aucun événement. <NuxtLink to="/admin/new">Créer le premier</NuxtLink>
    </div>

    <table v-else class="events-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Slug</th>
          <th>Dates</th>
          <th>Participants</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in sorted" :key="event.slug">
          <td class="col-name">{{ event.name }}</td>
          <td class="col-slug">{{ event.slug }}</td>
          <td class="col-dates">
            {{ new Date(event.start).toLocaleDateString('fr-FR') }}
            →
            {{ new Date(event.deadline).toLocaleDateString('fr-FR') }}
          </td>
          <td>{{ event.participants.length }}</td>
          <td>
            <span :class="['badge', event.published ? 'published' : 'draft']">
              {{ event.published ? 'Publié' : 'Brouillon' }}
            </span>
          </td>
          <td class="col-actions">
            <NuxtLink :to="`/admin/${event.slug}`" class="btn-primary">Éditer</NuxtLink>
            <NuxtLink :to="`/${event.slug}`" target="_blank" class="btn-preview">Aperçu ↗</NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.empty { text-align: center; color: #666; padding: 40px; }

.events-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.events-table th {
  background: #f5f5f5;
  text-align: left;
  padding: 12px 16px;
  font-size: 0.85rem;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.events-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.events-table tr:last-child td { border-bottom: none; }

.col-name { font-weight: bold; }
.col-slug { font-family: monospace; font-size: 0.85rem; color: #666; }
.col-dates { font-size: 0.9rem; }
.col-actions { display: flex; gap: 8px; }

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.badge.published { background: #e6f4ea; color: #2e7d32; }
.badge.draft { background: #fff3e0; color: #e65100; }
</style>
