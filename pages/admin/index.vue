<script setup lang="ts">
import type { Event } from '~/types/event';

const { data: events, refresh } = await useFetch<Event[]>('/api/events');

const sorted = computed(() =>
  [...(events.value ?? [])].sort((a, b) => a.name.localeCompare(b.name))
);
</script>

<template>
  <div class="admin">
    <div class="header">
      <NuxtLink to="/" class="back-link">← Retour</NuxtLink>
      <h1>Événements</h1>
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
          <td class="name">{{ event.name }}</td>
          <td class="slug">{{ event.slug }}</td>
          <td class="dates">
            {{ new Date(event.start).toLocaleDateString('fr-FR') }}
            →
            {{ new Date(event.deadline).toLocaleDateString('fr-FR') }}
          </td>
          <td class="participants">{{ event.participants.length }}</td>
          <td>
            <span :class="['badge', event.published ? 'published' : 'draft']">
              {{ event.published ? 'Publié' : 'Brouillon' }}
            </span>
          </td>
          <td class="actions">
            <NuxtLink :to="`/admin/${event.slug}`" class="btn-edit">Éditer</NuxtLink>
            <NuxtLink :to="`/${event.slug}`" target="_blank" class="btn-preview">
              Aperçu ↗
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.header h1 {
  flex: 1;
  margin: 0;
  font-size: 1.6rem;
}

.back-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn-primary {
  background: #2c3e50;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
}

.btn-primary:hover {
  background: #1a252f;
}

.empty {
  text-align: center;
  color: #666;
  padding: 40px;
}

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

.events-table tr:last-child td {
  border-bottom: none;
}

.name {
  font-weight: bold;
}

.slug {
  font-family: monospace;
  font-size: 0.85rem;
  color: #666;
}

.dates {
  font-size: 0.9rem;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.badge.published {
  background: #e6f4ea;
  color: #2e7d32;
}

.badge.draft {
  background: #fff3e0;
  color: #e65100;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-preview {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  text-decoration: none;
}

.btn-edit {
  background: #2c3e50;
  color: white;
}

.btn-preview {
  background: #f0f0f0;
  color: #2c3e50;
}
</style>
