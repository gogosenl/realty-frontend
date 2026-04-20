export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  
  const authStore = useAuthStore()

  if (!authStore.isLoggedIn && to.path !== '/login') {
    return navigateTo('/login')
  }
})