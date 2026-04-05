<script setup lang="ts">
import type { TripEvent, GlobalParticipant } from '~/types/event';

const { clear: clearSession } = useUserSession();
const logout = async () => { await clearSession(); await navigateTo('/login'); };

const { data: events, refresh } = await useFetch<TripEvent[]>('/api/events');
const { data: participants } = await useFetch<GlobalParticipant[]>('/api/participants');

const activeIds = computed(() => new Set((participants.value ?? []).filter((p) => p.active).map((p) => p.id)));

const activeParticipantCount = (event: TripEvent) =>
  event.participants.filter((id) => activeIds.value.has(id)).length;

const sorted = computed(() =>
  [...(events.value ?? [])].sort((a, b) => {
    const da = Date.parse(a.deadline) || Infinity;
    const db = Date.parse(b.deadline) || Infinity;
    return db - da;
  }),
);

const atLimit = computed(() => (events.value?.length ?? 0) >= EVENT_LIMIT);

const deleteError = ref('');
const deleting = ref<string | null>(null);

const deleteEvent = async (slug: string) => {
  if (!confirm(`Supprimer l'événement "${slug}" ? Cette action est irréversible.`)) return;
  deleting.value = slug;
  deleteError.value = '';
  try {
    await $fetch(`/api/events/${slug}`, { method: 'DELETE' });
    await refresh();
  } catch (e: unknown) {
    deleteError.value = extractErrorMessage(e, 'Erreur lors de la suppression');
  } finally {
    deleting.value = null;
  }
};
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <NuxtLink to="/" class="back-link">← Retour</NuxtLink>
      <h1>Événements</h1>
      <NuxtLink to="/admin/participants" class="btn-secondary">Participants</NuxtLink>
      <NuxtLink v-if="!atLimit" to="/admin/new" class="btn-primary">+ Nouvel événement</NuxtLink>
      <span v-else class="limit-reached" title="Supprimez un événement pour en créer un nouveau">
        Limite atteinte ({{ EVENT_LIMIT }}/{{ EVENT_LIMIT }})
      </span>
      <button class="btn-logout" @click="logout">Déconnexion</button>
    </div>

    <div v-if="deleteError" class="alert-error">{{ deleteError }}</div>

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
          <td>{{ activeParticipantCount(event) }}</td>
          <td>
            <span :class="['badge', event.published ? 'published' : 'draft']">
              {{ event.published ? 'Publié' : 'Brouillon' }}
            </span>
          </td>
          <td class="col-actions">
            <NuxtLink :to="`/admin/${event.slug}`" class="btn-primary">Éditer</NuxtLink>
            <NuxtLink :to="`/${event.slug}`" target="_blank" class="btn-preview">Aperçu ↗</NuxtLink>
            <button
              class="btn-delete"
              :disabled="deleting === event.slug"
              @click="deleteEvent(event.slug)"
            >
              {{ deleting === event.slug ? '…' : 'Supprimer' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.empty { text-align: center; color: var(--color-text-muted); padding: 40px; }

.limit-reached {
  padding: var(--btn-padding);
  border-radius: var(--radius-sm);
  background: var(--color-warning-light);
  color: var(--color-warning);
  font-size: var(--font-size-base);
  font-weight: bold;
  cursor: default;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.events-table th {
  background: var(--color-bg);
  text-align: left;
  padding: 12px 16px;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}

.events-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-light);
  vertical-align: middle;
}

.events-table tr:last-child td { border-bottom: none; }

.col-name { font-weight: bold; }
.col-slug { font-family: monospace; font-size: var(--font-size-sm); color: var(--color-text-muted); }
.col-dates { font-size: var(--font-size-base); }
.col-actions { display: flex; gap: 8px; align-items: center; }

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: bold;
}

.badge.published { background: var(--color-success-light); color: var(--color-success); }
.badge.draft { background: var(--color-warning-light); color: var(--color-warning); }

.btn-logout {
  padding: var(--btn-padding);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  margin-left: auto;
}

.btn-logout:hover { background: var(--color-bg); }
</style>
