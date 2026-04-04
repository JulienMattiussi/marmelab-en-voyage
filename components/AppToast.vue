<script setup lang="ts">
type Toast = { id: number; message: string; type: 'success' | 'error' };

const toasts = useState<Toast[]>('app-toasts', () => []);
</script>

<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', toast.type]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.toast {
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  white-space: nowrap;
  box-shadow: var(--shadow-raised);
  animation: slide-in 0.2s ease-out;
}

.toast.success { background: var(--color-success); color: white; }
.toast.error   { background: var(--color-error); color: white; }

@keyframes slide-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
