<script setup lang="ts">
import type { GlobalParticipant } from '~/types/event';

const { data: participants, refresh } = await useFetch<GlobalParticipant[]>('/api/participants');

const active = computed(() => (participants.value ?? []).filter((p) => p.active));
const inactive = computed(() => (participants.value ?? []).filter((p) => !p.active));

// Per-card editable state
type CardState = { name: string; quote: string; saving: boolean; saved: boolean };
const cardState = reactive<Record<string, CardState>>({});

watch(
  participants,
  (list) => {
    if (!list) return;
    for (const p of list) {
      if (!cardState[p.id]) {
        cardState[p.id] = { name: p.name, quote: p.quote, saving: false, saved: false };
      } else {
        cardState[p.id].name = p.name;
        cardState[p.id].quote = p.quote;
      }
    }
  },
  { immediate: true }
);

const saveCard = async (id: string) => {
  const state = cardState[id];
  state.saving = true;
  state.saved = false;
  await $fetch(`/api/participants/${id}`, {
    method: 'PUT',
    body: { name: state.name, quote: state.quote },
  });
  state.saving = false;
  state.saved = true;
  await refresh();
  setTimeout(() => { state.saved = false; }, 2000);
};

const toggleActive = async (id: string, active: boolean) => {
  await $fetch(`/api/participants/${id}`, { method: 'PUT', body: { active } });
  await refresh();
};

const uploadAvatar = async (id: string, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  await $fetch(`/api/participants/${id}/avatar`, { method: 'POST', body: fd });
  await refresh();
};

const onAvatarChange = (id: string, e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) uploadAvatar(id, file);
};

// Add participant form
const showAddForm = ref(false);
const addForm = reactive({ name: '', quote: '' });
const addError = ref('');
const adding = ref(false);

const addId = computed(() =>
  addForm.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
);

const submitAdd = async () => {
  addError.value = '';
  adding.value = true;
  try {
    await $fetch('/api/participants', {
      method: 'POST',
      body: { name: addForm.name, quote: addForm.quote },
    });
    addForm.name = '';
    addForm.quote = '';
    showAddForm.value = false;
    await refresh();
  } catch (e: unknown) {
    addError.value = (e as { data?: { message?: string } }).data?.message ?? 'Erreur';
  } finally {
    adding.value = false;
  }
};
</script>

<template>
  <div class="page">

    <div class="header">
      <NuxtLink to="/admin" class="back-link">← Événements</NuxtLink>
      <h1>Participants</h1>
      <button class="btn-primary" @click="showAddForm = !showAddForm">
        {{ showAddForm ? 'Annuler' : '+ Ajouter' }}
      </button>
    </div>

    <!-- Add form -->
    <div v-if="showAddForm" class="add-form">
      <h2>Nouveau participant</h2>
      <div class="add-fields">
        <label class="field">
          <span>Nom</span>
          <input v-model="addForm.name" type="text" placeholder="Marie Dupont" autofocus />
          <small v-if="addForm.name" class="id-preview">id : {{ addId }}</small>
        </label>
        <label class="field">
          <span>Citation</span>
          <input v-model="addForm.quote" type="text" placeholder="Je suis trop content·e !" />
        </label>
      </div>
      <div v-if="addError" class="alert-error">{{ addError }}</div>
      <div class="add-actions">
        <p class="add-hint">L'avatar peut être uploadé après création.</p>
        <button class="btn-primary" :disabled="!addForm.name || adding" @click="submitAdd">
          {{ adding ? 'Création…' : 'Créer' }}
        </button>
      </div>
    </div>

    <!-- Active participants -->
    <section>
      <h2 class="section-title">Actifs <span class="count">{{ active.length }}</span></h2>
      <div class="grid">
        <div v-for="p in active" :key="p.id" class="card">
          <div class="card-avatar-wrap">
            <NuxtImg :src="p.avatar" :alt="p.name" class="avatar" />
            <label class="avatar-upload" title="Changer l'avatar">
              <input type="file" accept="image/*" @change="(e) => onAvatarChange(p.id, e)" />
              ✎
            </label>
          </div>
          <div class="card-body">
            <input v-model="cardState[p.id].name" type="text" class="input-name" />
            <input v-model="cardState[p.id].quote" type="text" class="input-quote" placeholder="Citation…" />
            <div class="card-actions">
              <button
                class="btn-disable"
                title="Désactiver ce participant"
                @click="toggleActive(p.id, false)"
              >Désactiver</button>
              <button
                class="btn-save"
                :disabled="cardState[p.id].saving"
                @click="saveCard(p.id)"
              >
                {{ cardState[p.id].saving ? '…' : cardState[p.id].saved ? '✓ Sauvegardé' : 'Sauvegarder' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Inactive participants -->
    <section v-if="inactive.length > 0" class="inactive-section">
      <h2 class="section-title">
        Désactivés <span class="count">{{ inactive.length }}</span>
        <small>(non disponibles dans les événements)</small>
      </h2>
      <div class="grid">
        <div v-for="p in inactive" :key="p.id" class="card card--inactive">
          <div class="card-avatar-wrap">
            <NuxtImg :src="p.avatar" :alt="p.name" class="avatar" />
          </div>
          <div class="card-body">
            <span class="input-name inactive-name">{{ p.name }}</span>
            <span class="input-quote inactive-quote">{{ p.quote || '—' }}</span>
            <div class="card-actions">
              <button class="btn-enable" @click="toggleActive(p.id, true)">Réactiver</button>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px 80px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
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

.btn-primary {
  background: #2c3e50;
  color: white;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) { background: #1a252f; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Add form */
.add-form {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 32px;
}

.add-form h2 {
  margin: 0 0 16px;
  font-size: 1rem;
  color: #2c3e50;
}

.add-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field > span {
  font-size: 0.82rem;
  font-weight: bold;
  color: #555;
}

.field input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  color: #2c3e50;
}

.id-preview {
  color: #888;
  font-size: 0.78rem;
}

.add-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-hint {
  color: #999;
  font-size: 0.82rem;
  margin: 0;
}

.alert-error {
  background: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #c0392b;
  margin-bottom: 12px;
}

/* Sections */
.section-title {
  font-size: 1rem;
  color: #555;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title small {
  font-weight: normal;
  color: #aaa;
  font-size: 0.85rem;
}

.count {
  background: #e0e0e0;
  color: #555;
  border-radius: 20px;
  padding: 1px 8px;
  font-size: 0.8rem;
  font-weight: normal;
}

.inactive-section {
  margin-top: 40px;
}

/* Cards grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.card--inactive {
  opacity: 0.55;
}

.card-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.avatar-upload {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #2c3e50;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
}

.avatar-upload input {
  display: none;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.input-name {
  font-weight: bold;
  font-size: 0.95rem;
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-family: inherit;
  color: #2c3e50;
  width: 100%;
  box-sizing: border-box;
}

.input-quote {
  font-size: 0.82rem;
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-family: inherit;
  color: #555;
  font-style: italic;
  width: 100%;
  box-sizing: border-box;
}

.input-name:focus,
.input-quote:focus {
  outline: none;
  border-color: #2c3e50;
}

.inactive-name {
  font-weight: bold;
  font-size: 0.95rem;
  color: #2c3e50;
  border: none;
  padding: 4px 0;
}

.inactive-quote {
  font-size: 0.82rem;
  color: #555;
  font-style: italic;
  padding: 2px 0;
}

.card-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.btn-save {
  flex: 1;
  padding: 5px 10px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
}

.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-disable {
  padding: 5px 10px;
  background: #f0f0f0;
  color: #c0392b;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
}

.btn-disable:hover { background: #fdecea; }

.btn-enable {
  padding: 5px 10px;
  background: #f0f0f0;
  color: #2e7d32;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
}

.btn-enable:hover { background: #e6f4ea; }
</style>
