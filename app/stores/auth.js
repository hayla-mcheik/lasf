// stores/auth.js
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
    // Add getter to check if pilot is already flying
    isPilotFlying: (state) => {
      if (!state.activeSession) return false
      // Check if session is still active (not expired and not checked out)
      return state.activeSession.status === 'active' && 
             new Date(state.activeSession.expires_at) > new Date() &&
             !state.activeSession.checked_out_at
    }
  },
  actions: {
async login(credentials) {
    this.loading = true
    const route = useRoute() // Access the current route query

    try {
      const response = await $fetch('https://lasf.info/api/login', {
        method: 'POST',
        body: credentials,
      })
      
      this.user = response.user
      this.token = response.token

      // Logic for Redirection
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
      try {
        const config = useRuntimeConfig()
        const response = await $fetch(`${config.public.apiBase}/airspace-sessions/active-pilot`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })
        
        if (response && response.status === 'active' && 
            new Date(response.expires_at) > new Date()) {
          this.activeSession = response
        } else {
          this.activeSession = null
        }
      } catch (error) {
        console.error('Error fetching active session:', error)
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