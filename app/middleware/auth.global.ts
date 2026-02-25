import { useAuthStore } from "~/stores/auth"

// middleware/auth.global.ts

export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()

  if (to.path.startsWith('/admin')) {
    if (!auth.isAuthenticated) return navigateTo('/login')

    // 1. Super Admin can access everything
    if (auth.isAdmin) return

    // 2. Army Access Rules
    if (auth.isArmy) {
      // Define what the Army IS allowed to see
      const allowedArmyPaths = ['/admin/locations', '/admin/dashboard']
      
      // Check if the current path is in the allowed list
      const isAllowed = allowedArmyPaths.some(path => to.path.startsWith(path))

      if (!isAllowed) {
        console.warn('Army user tried to access restricted route:', to.path)
        return navigateTo('/admin/locations') // Force them back to Locations
      }
      return
    }

    // 3. If neither Admin nor Army, kick to home
    return navigateTo('/')
  }
})