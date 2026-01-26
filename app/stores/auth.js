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
    isAdmin: (state) => state.user?.is_admin === true || state.user?.is_admin == 1,
    isPilotFlying: (state) => {
      if (!state.activeSession) return false
      return state.activeSession.status === 'active' && 
             new Date(state.activeSession.expires_at) > new Date() &&
             !state.activeSession.checked_out_at
    }
  },
  actions: {
    async login(credentials) {
      this.loading = true
      const route = useRoute() 

      try {
        const response = await $fetch('https://lasf.info/api/login', {
          method: 'POST',
          body: credentials,
        })
        
        this.user = response.user
        this.token = response.token

        // --- AUTOMATIC REDIRECTION LOGIC ---
        // 1. If we came from the QR scan, return there.
        // 2. Otherwise, go to Admin Dashboard or Home.
        const redirectTo = route.query.redirect || (this.isAdmin ? '/admin/dashboard' : '/')
        navigateTo(redirectTo)

        return { success: true }
      } catch (error) {
        return { success: false, message: error.data?.message || 'Login failed' }
      } finally {
        this.loading = false
      }
    },
    
    async fetchActiveSession() {
      if (!this.token) return;
      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/airspace-sessions/active-pilot`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        
        if (response && response.status === 'active' && 
            new Date(response.expires_at) > new Date()) {
          this.activeSession = response
        } else {
          this.activeSession = null
        }
      } catch (error) {
        this.activeSession = null
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