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
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slide-in 0.2s ease-out;
}

.toast.success { background: #2e7d32; color: white; }
.toast.error   { background: #c62828; color: white; }

@keyframes slide-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
