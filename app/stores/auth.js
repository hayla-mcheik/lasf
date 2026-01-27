import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    activeSession: null, 
    loading: false
  }),
  persist: true, 
  getters: {
    isAuthenticated: (state) => !!state.token,
    
    // Check if the pilot has a valid, non-expired session
    isFlying: (state) => {
      if (!state.activeSession) return false
      // Status must be active, not checked out, and not expired
      return state.activeSession.status === 'active' && 
             !state.activeSession.checked_out_at &&
             new Date(state.activeSession.expires_at) > new Date()
    },

    // Get the ID of the location where the pilot is currently flying
    currentFlyingLocationId: (state) => {
      return state.activeSession?.flying_location_id || state.activeSession?.location?.id || null
    }
  },
  actions: {
    async login(credentials) {
      this.loading = true
      try {
        const response = await $fetch('https://lasf.info/api/login', {
          method: 'POST',
          body: credentials,
        })
        this.user = response.user
        this.token = response.token
        
        // Fetch session immediately after login to see if they were already flying
        await this.fetchActiveSession()

        // Handle Redirection (e.g., back to the location page after scanning QR)
        const route = useRoute()
        const redirectTo = route.query.redirect || (this.user?.is_admin ? '/admin/dashboard' : '/')
        navigateTo(redirectTo)

        return { success: true }
      } catch (error) {
        return { success: false, message: error.data?.message || 'Login failed' }
      } finally {
        this.loading = false
      }
    },
    
    async fetchActiveSession() {
      if (!this.token) return
      try {
        const config = useRuntimeConfig()
        const res = await $fetch(`${config.public.apiBase}/airspace-sessions/active-pilot`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        // If the API returns a null or closed session, clear it locally
        if (res && res.status === 'active' && !res.checked_out_at) {
          this.activeSession = res
        } else {
          this.activeSession = null
        }
      } catch (e) {
        this.activeSession = null
      }
    },

    async checkout() {
      if (!this.activeSession?.id || !this.token) return
      
      this.loading = true
      try {
        const config = useRuntimeConfig()
        await $fetch(`${config.public.apiBase}/airspace-sessions/${this.activeSession.id}/checkout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        
        // Important: Clear the session locally after successful API call
        this.activeSession = null
        return { success: true }
      } catch (error) {
        console.error('Checkout failed:', error)
        return { success: false, message: 'Failed to confirm landing.' }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.activeSession = null
      navigateTo('/login')
    }
  }
})