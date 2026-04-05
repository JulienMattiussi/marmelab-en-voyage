<script setup lang="ts">
import type { GlobalParticipant } from '~/types/event';

const { data: participants, refresh } = await useFetch<GlobalParticipant[]>('/api/participants');

const activeList = computed(() => (participants.value ?? []).filter((p) => p.active));
const inactiveList = computed(() => (participants.value ?? []).filter((p) => !p.active));

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
        cardState[p.id]!.name = p.name;
        cardState[p.id]!.quote = p.quote;
      }
    }
  },
  { immediate: true },
);

const saveCard = async (id: string) => {
  const state = cardState[id];
  if (!state) return;
  state.saving = true;
  state.saved = false;
  await $fetch(`/api/participants/${id}`, {
    method: 'PUT',
    body: { name: state.name, quote: state.quote },
  });
  state.saving = false;
  state.saved = true;
  await refresh();
  setTimeout(() => { state.saved = false; }, 2_000);
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

const onAvatarChange = (id: string, e: InputEvent) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) uploadAvatar(id, file);
};

// Add participant form
const showAddForm = ref(false);
const addForm = reactive({ name: '', quote: '' });
const addError = ref('');
const adding = ref(false);

const addId = computed(() => slugify(addForm.name, ''));

const submitAdd = async () => {
  addError.value = '';
  adding.value = true;
  try {
    await $fetch('/api/participants', { method: 'POST', body: { name: addForm.name, quote: addForm.quote } });
    addForm.name = '';
    addForm.quote = '';
    showAddForm.value = false;
    await refresh();
  } catch (e: unknown) {
    addError.value = extractErrorMessage(e);
  } finally {
    adding.value = false;
  }
};
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <NuxtLink to="/admin" class="back-link">← Événements</NuxtLink>
      <h1>Participants</h1>
      <button class="btn-primary" @click="showAddForm = !showAddForm">
        {{ showAddForm ? 'Annuler' : '+ Ajouter' }}
      </button>
    </div>

    <div v-if="showAddForm" class="add-form">
      <h2>Nouveau participant</h2>
      <div class="add-fields">
        <label class="add-field">
          <span>Nom</span>
          <input v-model="addForm.name" type="text" placeholder="Marie Dupont" autofocus >
          <small v-if="addForm.name" class="id-preview">id : {{ addId }}</small>
        </label>
        <label class="add-field">
          <span>Citation</span>
          <input v-model="addForm.quote" type="text" placeholder="Je suis trop content·e !" >
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

    <section>
      <h2 class="section-title">
        Actifs <span class="count-badge">{{ activeList.length }}</span>
      </h2>
      <div class="grid">
        <div v-for="p in activeList" :key="p.id" class="card">
          <div class="avatar-wrap">
            <NuxtImg :src="p.avatar" :alt="p.name" class="avatar" />
            <label class="avatar-upload" title="Changer l'avatar">
              <input type="file" accept="image/*" @change="(e) => onAvatarChange(p.id, e as InputEvent)" >
              ✎
            </label>
          </div>
          <div class="card-body">
            <input v-model="cardState[p.id]!.name" type="text" class="input-name" >
            <input v-model="cardState[p.id]!.quote" type="text" class="input-quote" placeholder="Citation…" >
            <div class="card-actions">
              <button class="btn-disable" @click="toggleActive(p.id, false)">Désactiver</button>
              <button class="btn-save" :disabled="cardState[p.id]!.saving" @click="saveCard(p.id)">
                {{ cardState[p.id]!.saving ? '…' : cardState[p.id]!.saved ? '✓ Sauvegardé' : 'Sauvegarder' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="inactiveList.length > 0" class="inactive-section">
      <h2 class="section-title">
        Désactivés <span class="count-badge">{{ inactiveList.length }}</span>
        <small>(non disponibles dans les événements)</small>
      </h2>
      <div class="grid">
        <div v-for="p in inactiveList" :key="p.id" class="card card--inactive">
          <div class="avatar-wrap">
            <NuxtImg :src="p.avatar" :alt="p.name" class="avatar" />
          </div>
          <div class="card-body">
            <span class="inactive-name">{{ p.name }}</span>
            <span class="inactive-quote">{{ p.quote || '—' }}</span>
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
.add-form {
  background: var(--color-bg-faint);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 32px;
}

.add-form h2 { margin: 0 0 16px; font-size: 1rem; }

.add-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }

.add-field { display: flex; flex-direction: column; gap: 5px; }
.add-field > span { font-size: var(--font-size-sm); font-weight: bold; color: var(--color-text-muted); }

.add-field input {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-family: inherit;
  color: var(--color-text);
}

.id-preview { color: var(--color-text-subtle); font-size: 0.78rem; }

.add-actions { display: flex; justify-content: space-between; align-items: center; }
.add-hint { color: var(--color-text-faint); font-size: var(--font-size-sm); margin: 0; }

.section-title {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title small { font-weight: normal; color: var(--color-text-faint); }

.count-badge {
  background: var(--color-border);
  color: var(--color-text-muted);
  border-radius: 20px;
  padding: 1px 8px;
  font-size: var(--font-size-sm);
}

.inactive-section { margin-top: 40px; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin-bottom: 24px; }

.card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.card--inactive { opacity: 0.55; }

.avatar-wrap { position: relative; flex-shrink: 0; }

.avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; display: block; }

.avatar-upload {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: var(--color-primary);
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

.avatar-upload input { display: none; }

.card-body { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }

.input-name {
  font-weight: bold;
  font-size: 0.95rem;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  color: var(--color-text);
  width: 100%;
  box-sizing: border-box;
}

.input-quote {
  font-size: var(--font-size-sm);
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  color: var(--color-text-muted);
  font-style: italic;
  width: 100%;
  box-sizing: border-box;
}

.input-name:focus,
.input-quote:focus { outline: none; border-color: var(--color-primary); }

.inactive-name { font-weight: bold; font-size: 0.95rem; color: var(--color-text); }
.inactive-quote { font-size: var(--font-size-sm); color: var(--color-text-muted); font-style: italic; }

.card-actions { display: flex; gap: 6px; margin-top: 4px; }

.btn-save {
  flex: 1;
  padding: 5px 10px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-family: inherit;
}

.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-disable {
  padding: 5px 10px;
  background: var(--color-bg-hover);
  color: var(--color-danger);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-family: inherit;
}

.btn-disable:hover { background: var(--color-error-light); }

.btn-enable {
  padding: 5px 10px;
  background: var(--color-bg-hover);
  color: var(--color-success);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-family: inherit;
}

.btn-enable:hover { background: var(--color-success-light); }
</style>
