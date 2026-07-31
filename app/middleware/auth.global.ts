import { useAuthStore } from "~/stores/auth"

export default defineNuxtRouteMiddleware((to) => {

  const auth = useAuthStore()

  /*
  |--------------------------------------------------------------------------
  | Prevent authenticated users from visiting Login
  |--------------------------------------------------------------------------
  */

  if (to.path === '/login' && auth.isAuthenticated) {

    if (auth.isAdmin) {
      return navigateTo('/admin/dashboard')
    }

    if (auth.isArmy) {
      return navigateTo('/admin/dashboard')
    }

    if (auth.isWatcher) {
      return navigateTo('/admin/dashboard')
    }

    return navigateTo('/account')
  }

  /*
  |--------------------------------------------------------------------------
  | Admin Area Protection
  |--------------------------------------------------------------------------
  */

  if (to.path.startsWith('/admin')) {

    if (!auth.isAuthenticated) {
      return navigateTo('/login')
    }

    /*
    |--------------------------------------------------------------------------
    | Super Admin
    |--------------------------------------------------------------------------
    */

    if (auth.isAdmin) {
      return
    }

    /*
    |--------------------------------------------------------------------------
    | Army
    |--------------------------------------------------------------------------
    */

    if (auth.isArmy) {

      const allowedArmyPaths = [
        '/admin/dashboard',
        '/admin/locations',
        '/admin/live-tracking',
        '/admin/pilots'
      ]

      const allowed = allowedArmyPaths.some(path =>
        to.path.startsWith(path)
      )

      if (!allowed) {
        return navigateTo('/admin/dashboard')
      }

      return
    }

    /*
    |--------------------------------------------------------------------------
    | Watcher
    |--------------------------------------------------------------------------
    */

    if (auth.isWatcher) {

      const allowedWatcherPaths = [
        '/admin/dashboard',
        '/admin/live-tracking'
      ]

      const allowed = allowedWatcherPaths.some(path =>
        to.path.startsWith(path)
      )

      if (!allowed) {
        return navigateTo('/admin/dashboard')
      }

      return
    }

    /*
    |--------------------------------------------------------------------------
    | Pilot
    |--------------------------------------------------------------------------
    */

    return navigateTo('/account')
  }

})