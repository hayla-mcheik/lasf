import { useAuthStore } from "~/stores/auth"

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()

  // Prevent logged-in users from visiting Login
  if (to.path === '/login' && auth.isAuthenticated) {

    if (auth.isAdmin) {
      return navigateTo('/admin/dashboard')
    }

    if (auth.isArmy) {
      return navigateTo('/admin/locations')
    }

    return navigateTo('/account')
  }

  // Existing Admin Protection
  if (to.path.startsWith('/admin')) {

    if (!auth.isAuthenticated) {
      return navigateTo('/login')
    }

    // Super Admin
    if (auth.isAdmin) {
      return
    }

    // Army
    if (auth.isArmy) {

      const allowedArmyPaths = [
        '/admin/locations',
        '/admin/dashboard'
      ]

      const isAllowed = allowedArmyPaths.some(path =>
        to.path.startsWith(path)
      )

      if (!isAllowed) {
        return navigateTo('/admin/locations')
      }

      return
    }

    // Normal user
    return navigateTo('/')
  }
})