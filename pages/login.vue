<script setup lang="ts">
const route = useRoute();
const hasError = route.query.error === 'oauth';
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <img src="/assets/logo-green.png" alt="Marmelab logo" class="logo" />
      <h1>Administration</h1>
      <p v-if="hasError" class="error">Accès refusé. Seul le propriétaire peut accéder à l'administration.</p>
      <a href="/auth/github" class="btn-github">
        <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
            0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
            -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2
            -3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64
            -.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51
            .56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2
            0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        Se connecter avec GitHub
      </a>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: 320px;
}

.logo { height: 48px; width: auto; }

h1 { margin: 0; font-size: 1.4rem; color: #2c3e50; }

.error {
  background: #fdecea;
  color: #c62828;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  text-align: center;
}

.btn-github {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #24292e;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: bold;
  transition: background 0.15s;
}

.btn-github:hover { background: #1a1f24; }
</style>
