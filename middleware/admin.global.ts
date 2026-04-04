export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return;

  const { loggedIn } = useUserSession();
  if (!loggedIn.value) {
    return navigateTo('/login');
  }
});
