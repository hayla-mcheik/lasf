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

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    isAuthenticated: (state) => {
        return !!state.token
    },


    /*
    |--------------------------------------------------------------------------
    | ROLES
    |--------------------------------------------------------------------------
    */

    isAdmin: (state) => {
        return (
            state.user?.is_admin === true ||
            state.user?.is_admin == 1
        )
    },

    isArmy: (state) => {
        return state.user?.role === 'army'
    },

    isWatcher: (state) => {
        return state.user?.role === 'watcher'
    },

    isBeirutAirport: (state) => {
        return state.user?.role === 'beirut_airport'
    },

    isPermission: (state) => {
        return state.user?.role === 'permission'
    },


    /*
    |--------------------------------------------------------------------------
    | PILOT
    |--------------------------------------------------------------------------
    */

    isPilot() {
        return (
            this.isAuthenticated &&
            !this.isAdmin &&
            !this.isArmy &&
            !this.isWatcher &&
            !this.isBeirutAirport &&
            !this.isPermission
        )
    },


    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    canAccessDashboard() {
        return (
            this.isAdmin ||
            this.isArmy ||
            this.isWatcher ||
            this.isBeirutAirport ||
            this.isPermission
        )
    },


    /*
    |--------------------------------------------------------------------------
    | LOCATIONS - VIEW
    |--------------------------------------------------------------------------
    | Admin + Army + Permission
    */

    canViewLocations() {
        return (
            this.isAdmin ||
            this.isArmy ||
            this.isPermission
        )
    },


    /*
    |--------------------------------------------------------------------------
    | LOCATIONS - MANAGEMENT
    |--------------------------------------------------------------------------
    | Admin + Army only
    */

    canManageLocations() {
        return (
            this.isAdmin ||
            this.isArmy
        )
    },


    /*
    |--------------------------------------------------------------------------
    | CLEARANCE STATUS
    |--------------------------------------------------------------------------
    | Admin + Army + Permission
    */

    canManageClearance() {
        return (
            this.isAdmin ||
            this.isArmy ||
            this.isPermission
        )
    },


    /*
    |--------------------------------------------------------------------------
    | PILOTS - VIEW
    |--------------------------------------------------------------------------
    | Admin + Army + Permission
    */

    canViewPilots() {
        return (
            this.isAdmin ||
            this.isArmy ||
            this.isPermission
        )
    },


    /*
    |--------------------------------------------------------------------------
    | PILOTS - MANAGEMENT
    |--------------------------------------------------------------------------
    | Admin only
    */

    canManagePilots() {
        return this.isAdmin
    },


    /*
    |--------------------------------------------------------------------------
    | CONTACT PILOTS
    |--------------------------------------------------------------------------
    | Admin + Army only
    */

    canContactPilots() {
        return (
            this.isAdmin ||
            this.isArmy
        )
    },


    /*
    |--------------------------------------------------------------------------
    | LIVE TRACKING
    |--------------------------------------------------------------------------
    | Admin + Army + Watcher
    */

    canViewLiveTracking() {
        return (
            this.isAdmin ||
            this.isArmy ||
            this.isWatcher
        )
    },


    /*
    |--------------------------------------------------------------------------
    | CMS
    |--------------------------------------------------------------------------
    | Admin only
    */

    canManageCms() {
        return this.isAdmin
    },


    /*
    |--------------------------------------------------------------------------
    | DISPLAY NAME
    |--------------------------------------------------------------------------
    */

    userFullName: (state) => {
        return state.user?.name || 'User'
    }

},


  actions: {

    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    async login(credentials) {

      this.loading = true

      try {

        const config = useRuntimeConfig()

        const response = await $fetch(
          `${config.public.apiBase}/login`,
          {
            method: 'POST',

            body: credentials,
          }
        )


        /*
        |--------------------------------------------------------------------------
        | SAVE AUTH DATA
        |--------------------------------------------------------------------------
        */

        this.user = response.user
console.log(response.user)
        this.token = response.token


        /*
        |--------------------------------------------------------------------------
        | RETURN SUCCESS
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | We do NOT navigate here anymore.
        |
        | The login page already handles:
        |
        | 1. QR redirect
        | 2. redirect query
        | 3. Admin redirect
        | 4. Army redirect
        | 5. Watcher redirect
        | 6. Pilot redirect
        |
        | This prevents double navigateTo() calls.
        |
        */

        return {
          success: true
        }

      } catch (error) {

        console.error(
          'Login error:',
          error
        )


        return {

          success: false,

          message:
            error?.data?.message ||
            'Login failed'

        }

      } finally {

        this.loading = false

      }

    },


    /*
    |--------------------------------------------------------------------------
    | CHECK AUTH
    |--------------------------------------------------------------------------
    */

    async checkAuth() {

      if (!this.token) {

        return false

      }


      try {

        const config = useRuntimeConfig()


        const data = await $fetch(
          `${config.public.apiBase}/user`,
          {

            headers: {

              Authorization:
                `Bearer ${this.token}`

            }

          }
        )


        this.user = data


        return true

      } catch (error) {

        console.error(
          'Check auth error:',
          error
        )


        await this.logout()


        return false

      }

    },

async loadActiveSession() {

    if (!this.token) {
        this.activeSession = null
        return null
    }

    try {

        const config = useRuntimeConfig()

        const session = await $fetch(
            `${config.public.apiBase}/airspace-sessions/active-pilot`,
            {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            }
        )

        console.log('ACTIVE SESSION RESPONSE:', session)
        console.log('TYPE:', typeof session)
        console.log('KEYS:', Object.keys(session || {}))

        this.activeSession =
            session && Object.keys(session).length > 0
                ? session
                : null

        return this.activeSession

    } catch (error) {

        this.activeSession = null
        return null

    }
},
    /*
    |--------------------------------------------------------------------------
    | SET ACTIVE SESSION
    |--------------------------------------------------------------------------
    */

setActiveSession(session) {

this.activeSession =
    session && session.id
        ? session
        : null

},

clearActiveSession() {

    this.activeSession = null

},

async refreshFlightState() {

    await this.loadActiveSession()

},

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    async logout() {

      /*
      |--------------------------------------------------------------------------
      | CALL BACKEND LOGOUT WHEN POSSIBLE
      |--------------------------------------------------------------------------
      */

      if (this.token) {

        try {

          const config = useRuntimeConfig()


          await $fetch(
            `${config.public.apiBase}/logout`,
            {

              method: 'POST',

              headers: {

                Authorization:
                  `Bearer ${this.token}`

              }

            }
          )

        } catch (error) {

          console.error(
            'Backend logout failed:',
            error
          )

        }

      }


      /*
      |--------------------------------------------------------------------------
      | CLEAR AUTH DATA
      |--------------------------------------------------------------------------
      */

      this.user = null

      this.token = null

      this.activeSession = null


      /*
      |--------------------------------------------------------------------------
      | CLEAR PENDING QR LOCATION
      |--------------------------------------------------------------------------
      */

      if (import.meta.client) {

        localStorage.removeItem(
          'pending_location_slug'
        )

      }


      /*
      |--------------------------------------------------------------------------
      | REDIRECT
      |--------------------------------------------------------------------------
      */

      await navigateTo('/login')

    }

  }

})