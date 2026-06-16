import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    activeSession: null, 
    loading: false
  }),
  persist: {
    key: 'auth',
    storage: persistedState.cookiesWithOptions({
      sameSite: 'lax',
      path: '/',
      maxAge: 604800 
    }),
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    // Super Admin Getter
    isAdmin: (state) => state.user?.is_admin === true || state.user?.is_admin == 1,
    // ✅ Lebanese Army Role Getter
    isArmy: (state) => state.user?.role === 'army',
    // Helper for display name
    userFullName: (state) => state.user?.name || 'User'
  },
  actions: {
    async login(credentials) {
      this.loading = true
      const route = useRoute() 

      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/login`, {
          method: 'POST',
          body: credentials,
        })
        
        this.user = response.user
        this.token = response.token

        // --- TARGET REDIRECTION LOGIC ---
        let redirectTo = route.query.redirect

        if (!redirectTo) {
          if (this.isAdmin) {
            redirectTo = '/admin/dashboard'
          } else if (this.isArmy) {
            // ✅ Matches your folder structure: pages/admin/locations/index.vue
            console.log('Army user detected, redirecting to admin locations');
            redirectTo = '/admin/locations'
          } else {
            redirectTo = '/account'
          }
        }

        await navigateTo(redirectTo)
        return { success: true }
      } catch (error) {
        return { success: false, message: error.data?.message || 'Login failed' }
      } finally {
        this.loading = false
      }
    },

    // ✅ Action to refresh user data and verify token on page load
    async checkAuth() {
      if (!this.token) return false
      try {
        const config = useRuntimeConfig()
        const data = await $fetch(`${config.public.apiBase}/user`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.user = data
        return true
      } catch (err) {
        this.logout()
        return false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.activeSession = null
      localStorage.removeItem('pending_location_slug')
      navigateTo('/login')
    }
  }
})