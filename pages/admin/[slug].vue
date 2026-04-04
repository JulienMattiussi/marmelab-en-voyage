<script setup lang="ts">
import type { Event, GlobalParticipant } from '~/types/event';

const route = useRoute();
const router = useRouter();
const slug = route.params.slug as string;
const isNew = slug === 'new';

// Load global participants
const { data: globalParticipants } = await useFetch<GlobalParticipant[]>('/api/participants');

// Load existing event or scaffold a blank one
const { data: existingEvent } = isNew
  ? { data: ref(null) }
  : await useFetch<Event>(`/api/events/${slug}`);

// Form state
const form = reactive<Event>({
  slug: '',
  name: '',
  published: false,
  title: '',
  start: '',
  deadline: '',
  visuals: { background: '', goal: '' },
  participants: [],
});

// Populate form when editing
if (!isNew && existingEvent.value) {
  Object.assign(form, existingEvent.value);
}

// Auto-generate slug from name (new events only)
watch(
  () => form.name,
  (name) => {
    if (!isNew) return;
    form.slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
);

// Participant selection helpers
const isSelected = (id: string) => form.participants.includes(id);

const toggleParticipant = (id: string) => {
  const idx = form.participants.indexOf(id);
  if (idx >= 0) {
    form.participants.splice(idx, 1);
  } else {
    form.participants.push(id);
  }
};

// Save
const saving = ref(false);
const saveError = ref('');

const save = async () => {
  saving.value = true;
  saveError.value = '';
  try {
    if (isNew) {
      await $fetch('/api/events', { method: 'POST', body: form });
      await router.push(`/admin/${form.slug}`);
    } else {
      await $fetch(`/api/events/${slug}`, { method: 'PUT', body: form });
    }
  } catch (e: unknown) {
    saveError.value = (e as { data?: { message?: string } }).data?.message ?? 'Erreur lors de la sauvegarde';
  } finally {
    saving.value = false;
  }
};

// Image upload
const uploadingField = ref<'background' | 'goal' | null>(null);
const uploadError = ref('');

const uploadImage = async (field: 'background' | 'goal', file: File) => {
  uploadingField.value = field;
  uploadError.value = '';
  const fd = new FormData();
  fd.append('file', file);
  fd.append('field', field);
  try {
    const result = await $fetch<{ path: string }>(`/api/events/${isNew ? form.slug : slug}/assets`, {
      method: 'POST',
      body: fd,
    });
    form.visuals[field] = result.path;
  } catch (e: unknown) {
    uploadError.value = (e as { data?: { message?: string } }).data?.message ?? 'Erreur upload';
  } finally {
    uploadingField.value = null;
  }
};

const onFileChange = (field: 'background' | 'goal', event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) uploadImage(field, file);
};
</script>

<template>
  <div class="editor">
    <div class="header">
      <NuxtLink to="/admin" class="back-link">← Événements</NuxtLink>
      <h1>{{ isNew ? 'Nouvel événement' : form.name }}</h1>
      <div class="header-actions">
        <NuxtLink v-if="!isNew" :to="`/${slug}`" target="_blank" class="btn-preview">
          Aperçu ↗
        </NuxtLink>
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Sauvegarde…' : isNew ? 'Créer' : 'Sauvegarder' }}
        </button>
      </div>
    </div>

    <div v-if="saveError" class="alert-error">{{ saveError }}</div>

    <div class="sections">

      <!-- General info -->
      <section class="card">
        <h2>Informations générales</h2>
        <div class="fields">
          <label class="field">
            <span>Nom de l'événement</span>
            <input v-model="form.name" type="text" placeholder="Belmont 2025" />
          </label>
          <label class="field">
            <span>Slug <small>(URL : /{{ form.slug || 'mon-evenement' }})</small></span>
            <input v-model="form.slug" type="text" placeholder="belmont-2025" :disabled="!isNew" />
          </label>
          <label class="field full">
            <span>Titre affiché sur la page</span>
            <input v-model="form.title" type="text" placeholder="Belmont, nous voici !!!" />
          </label>
        </div>
      </section>

      <!-- Dates -->
      <section class="card">
        <h2>Dates</h2>
        <div class="fields">
          <label class="field">
            <span>Départ</span>
            <input v-model="form.start" type="datetime-local" />
          </label>
          <label class="field">
            <span>Arrivée</span>
            <input v-model="form.deadline" type="datetime-local" />
          </label>
        </div>
      </section>

      <!-- Visuals -->
      <section class="card">
        <h2>Visuels</h2>
        <div v-if="isNew && !existingEvent" class="info-notice">
          Sauvegardez d'abord l'événement pour pouvoir uploader des images.
        </div>
        <div class="fields">
          <div class="field">
            <span>Image de fond</span>
            <div class="upload-row">
              <input
                type="file"
                accept="image/*"
                :disabled="isNew"
                @change="(e) => onFileChange('background', e as unknown as Event)"
              />
              <span v-if="uploadingField === 'background'" class="uploading">Upload…</span>
              <NuxtImg v-if="form.visuals.background" :src="form.visuals.background" class="thumb" />
            </div>
          </div>
          <div class="field">
            <span>Image destination (goal)</span>
            <div class="upload-row">
              <input
                type="file"
                accept="image/*"
                :disabled="isNew"
                @change="(e) => onFileChange('goal', e as unknown as Event)"
              />
              <span v-if="uploadingField === 'goal'" class="uploading">Upload…</span>
              <NuxtImg v-if="form.visuals.goal" :src="form.visuals.goal" class="thumb" />
            </div>
          </div>
        </div>
        <div v-if="uploadError" class="alert-error">{{ uploadError }}</div>
      </section>

      <!-- Participants -->
      <section class="card">
        <h2>
          Participants <small>({{ form.participants.length }} sélectionnés)</small>
          <NuxtLink to="/admin/participants" class="manage-link">Gérer les participants ↗</NuxtLink>
        </h2>
        <div class="participants-grid">
          <div
            v-for="gp in (globalParticipants ?? []).filter(p => p.active)"
            :key="gp.id"
            :class="['participant-card', { selected: isSelected(gp.id) }]"
          >
            <div class="participant-top" @click="toggleParticipant(gp.id)">
              <NuxtImg :src="gp.avatar" :alt="gp.name" class="participant-avatar" />
              <span class="participant-name">{{ gp.name }}</span>
              <span class="participant-check">{{ isSelected(gp.id) ? '✓' : '+' }}</span>
            </div>
            <p v-if="isSelected(gp.id)" class="participant-quote">{{ gp.quote }}</p>
          </div>
        </div>
      </section>

      <!-- Publication -->
      <section class="card">
        <h2>Publication</h2>
        <label class="toggle-field">
          <input v-model="form.published" type="checkbox" />
          <span>{{ form.published ? 'Publié (visible sur la page d\'accueil)' : 'Brouillon (non visible)' }}</span>
        </label>
      </section>

    </div>

    <div class="footer-actions">
      <div v-if="saveError" class="alert-error">{{ saveError }}</div>
      <button class="btn-primary" :disabled="saving" @click="save">
        {{ saving ? 'Sauvegarde…' : isNew ? 'Créer l\'événement' : 'Sauvegarder' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.editor {
  max-width: 860px;
  margin: 40px auto;
  padding: 0 20px 80px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
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
  white-space: nowrap;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background: #2c3e50;
  color: white;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary:hover:not(:disabled) {
  background: #1a252f;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-preview {
  background: #f0f0f0;
  color: #2c3e50;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card h2 {
  margin: 0 0 20px;
  font-size: 1.1rem;
  color: #2c3e50;
}

.card h2 small {
  font-weight: normal;
  color: #888;
  font-size: 0.85rem;
}

.manage-link {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: normal;
  color: #888;
  text-decoration: none;
}

.manage-link:hover {
  color: #2c3e50;
}

.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

.field > span {
  font-size: 0.85rem;
  font-weight: bold;
  color: #555;
}

.field > span small {
  font-weight: normal;
  color: #999;
}

.field input[type="text"],
.field input[type="datetime-local"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #2c3e50;
}

.field input:disabled {
  background: #f5f5f5;
  color: #999;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.thumb {
  height: 50px;
  width: auto;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.uploading {
  font-size: 0.85rem;
  color: #666;
}

.info-notice {
  background: #fff3e0;
  border: 1px solid #ffe0b2;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.85rem;
  color: #e65100;
  margin-bottom: 16px;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.participant-card {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.participant-card.selected {
  border-color: #2c3e50;
}

.participant-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  cursor: pointer;
  background: #fafafa;
}

.participant-card.selected .participant-top {
  background: #ecf0f1;
}

.participant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.participant-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: bold;
}

.participant-check {
  font-weight: bold;
  color: #888;
  font-size: 1rem;
}

.participant-card.selected .participant-check {
  color: #2c3e50;
}

.participant-quote {
  margin: 0;
  padding: 6px 10px;
  border-top: 1px solid #e0e0e0;
  font-size: 0.78rem;
  color: #666;
  font-style: italic;
  background: white;
}

.toggle-field {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.95rem;
}

.toggle-field input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.footer-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.alert-error {
  background: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.9rem;
  color: #c0392b;
}
</style>
