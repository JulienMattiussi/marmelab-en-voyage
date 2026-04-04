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
    deleteError.value =
      (e as { data?: { message?: string } }).data?.message ?? 'Erreur lors de la suppression';
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
.empty { text-align: center; color: #666; padding: 40px; }

.limit-reached {
  padding: 8px 16px;
  border-radius: 6px;
  background: #fff3e0;
  color: #e65100;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: default;
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

.events-table tr:last-child td { border-bottom: none; }

.col-name { font-weight: bold; }
.col-slug { font-family: monospace; font-size: 0.85rem; color: #666; }
.col-dates { font-size: 0.9rem; }
.col-actions { display: flex; gap: 8px; align-items: center; }

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.badge.published { background: #e6f4ea; color: #2e7d32; }
.badge.draft { background: #fff3e0; color: #e65100; }

.btn-delete {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #e53935;
  background: white;
  color: #e53935;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
}

.btn-delete:hover:not(:disabled) { background: #fdecea; }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-logout {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: white;
  color: #666;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  margin-left: auto;
}

.btn-logout:hover { background: #f5f5f5; }
</style>
