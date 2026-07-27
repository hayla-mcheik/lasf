import { defineStore } from 'pinia'
import { useAuthStore } from '~/stores/auth'

export const useCrossCountryStore = defineStore('crossCountry', {

    state: () => ({

        loading: false,

        request: null,

        requests: [],

        session: null,

        track: [],

        statistics: {

            total_flights: 0,
            total_hours: 0,
            longest_flight: 0

        }

    }),

    getters: {

        currentRequest: (state) => {

            if (!state.request)
                return null

            if (Array.isArray(state.request.requests))
                return state.request.requests[0] ?? null

            return state.request

        },

        hasRequest() {

            return !!this.currentRequest

        },

        status() {

            return this.currentRequest?.status ?? null

        },

        isPending() {

            return this.status === 'pending'

        },

        isApproved() {

            return this.status === 'open'

        },

        isFlying() {

            return !!this.activeSession

        },

        isClosed() {

            return this.status === 'closed'

        },

        isCancelled() {

            return this.status === 'cancelled'

        },

        activeSession() {

            return (

                this.session ||

                this.currentRequest?.session ||

                this.currentRequest?.activeSession ||

                null

            )

        },

        canCreateRequest() {

            return (

                !this.currentRequest ||

                this.isClosed ||

                this.isCancelled

            )

        }

    },

    actions: {

        getHeaders() {

            const authStore = useAuthStore()

            return {

                Authorization: `Bearer ${authStore.token}`,

                Accept: 'application/json'

            }

        },

        async refresh() {

            try {

                await this.loadCurrentRequest()

            }

            catch {

                this.request = null

                this.session = null

            }

        },

        async loadCurrentRequest() {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-requests`,

                    {

                        headers: this.getHeaders()

                    }

                )

                /*
                 API may return:

                 {
                    requests:[]
                 }

                 or

                 {
                    request:{}
                 }

                 or

                 {}
                */

                if (response.requests) {

                    this.request = response.requests.length
                        ? response.requests[0]
                        : null

                }

                else if (response.request) {

                    this.request = response.request

                }

                else {

                    this.request = response

                }

                this.session =

                    this.request?.session ||

                    this.request?.activeSession ||

                    null

                return this.request

            }

            catch (error) {

                console.error(error)

                this.request = null

                this.session = null

                return null

            }

            finally {

                this.loading = false

            }

        },

        async loadRequest(id = null) {

            if (!id) {

                return await this.loadCurrentRequest()

            }

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-requests/${id}`,

                    {

                        headers: this.getHeaders()

                    }

                )

                this.request = response.request || response

                this.session =

                    this.request?.session ||

                    this.request?.activeSession ||

                    null

                return this.request

            }

            finally {

                this.loading = false

            }

        },

        async createRequest(data) {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-requests`,

                    {

                        method: 'POST',

                        headers: this.getHeaders(),

                        body: data

                    }

                )

                /*
                 Always reload after creating.
                 Prevents "No Active Flight"
                */

                await this.loadCurrentRequest()

                return response

            }

            finally {

                this.loading = false

            }

        },

        async cancelRequest(id) {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                await $fetch(

                    `${config.public.apiBase}/cross-country-requests/${id}/cancel`,

                    {

                        method: 'PATCH',

                        headers: this.getHeaders()

                    }

                )

                await this.loadCurrentRequest()

            }

            finally {

                this.loading = false

            }

        },
                /*
        |--------------------------------------------------------------------------
        | LOAD HISTORY
        |--------------------------------------------------------------------------
        */

        async loadHistory() {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country/history`,

                    {
                        headers: this.getHeaders()
                    }

                )

                this.requests = response.requests || response.data || []

                return this.requests

            }

            catch (error) {

                console.error(error)

                this.requests = []

                return []

            }

            finally {

                this.loading = false

            }

        },

        /*
        |--------------------------------------------------------------------------
        | LOAD STATISTICS
        |--------------------------------------------------------------------------
        */

        async loadStatistics() {

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country/statistics`,

                    {
                        headers: this.getHeaders()
                    }

                )

                this.statistics = response.statistics || response

                return this.statistics

            }

            catch (error) {

                console.error(error)

                return this.statistics

            }

        },

        /*
        |--------------------------------------------------------------------------
        | LOAD FLIGHT TRACK
        |--------------------------------------------------------------------------
        */

        async loadTrack(sessionId) {

            if (!sessionId) {

                this.track = []

                return []

            }

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-sessions/${sessionId}/track`,

                    {
                        headers: this.getHeaders()
                    }

                )

                this.track = response.track || response.locations || []

                return this.track

            }

            catch (error) {

                console.error(error)

                this.track = []

                return []

            }

        },

        /*
        |--------------------------------------------------------------------------
        | START FLIGHT
        |--------------------------------------------------------------------------
        */

        async startFlight(requestId) {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-requests/${requestId}/start`,

                    {

                        method: 'POST',

                        headers: this.getHeaders()

                    }

                )

                this.session = response.session || response

                /*
                 Reload request after starting.
                 This keeps every page synchronized.
                */

                await this.loadRequest(requestId)

                return response

            }

            catch (error) {

                console.error(error)

                throw error

            }

            finally {

                this.loading = false

            }

        },

        /*
        |--------------------------------------------------------------------------
        | FINISH FLIGHT
        |--------------------------------------------------------------------------
        */

        async finishFlight(sessionId) {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-sessions/${sessionId}/finish`,

                    {

                        method: 'POST',

                        headers: this.getHeaders()

                    }

                )

                this.session = null

                this.track = []

                /*
                 Reload request after finishing.
                 The pilot should immediately see
                 the request as Closed.
                */

                await this.loadCurrentRequest()

                return response

            }

            catch (error) {

                console.error(error)

                throw error

            }

            finally {

                this.loading = false

            }

        },

        /*
        |--------------------------------------------------------------------------
        | REFRESH EVERYTHING
        |--------------------------------------------------------------------------
        */

        async refreshEverything() {

            await Promise.allSettled([

                this.loadCurrentRequest(),

                this.loadHistory(),

                this.loadStatistics()

            ])

        },

        /*
        |--------------------------------------------------------------------------
        | CLEAR STORE
        |--------------------------------------------------------------------------
        */

        clearStore() {

            this.loading = false

            this.request = null

            this.requests = []

            this.session = null

            this.track = []

            this.statistics = {

                total_flights: 0,

                total_hours: 0,

                longest_flight: 0

            }

        }

    }

})