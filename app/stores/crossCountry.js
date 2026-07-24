import { defineStore } from 'pinia'

export const useCrossCountryStore = defineStore('crossCountry', {

    state: () => ({

        loading: false,

        request: null,

        requests: [],

        statistics: {

            total_flights: 0,

            total_hours: 0,

            longest_flight: 0

        },

        session: null,

        track: []

    }),

    getters: {

        /*
        |--------------------------------------------------------------------------
        | CURRENT REQUEST
        |--------------------------------------------------------------------------
        */

        currentRequest: (state) => {

            if (!state.request) {

                return null

            }

            if (state.request.requests) {

                return state.request.requests[0] || null

            }

            return state.request

        },

        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        isPending() {

            return this.currentRequest?.status === 'pending'

        },

        isOpen() {

            return this.currentRequest?.status === 'open'

        },

        isClosed() {

            return this.currentRequest?.status === 'closed'

        },

        isCancelled() {

            return this.currentRequest?.status === 'cancelled'

        },

        /*
        |--------------------------------------------------------------------------
        | ACTIVE SESSION
        |--------------------------------------------------------------------------
        */

        activeSession() {

            return (

                this.session ||

                this.currentRequest?.activeSession ||

                this.currentRequest?.session ||

                null

            )

        }

    },

    actions: {

        /*
        |--------------------------------------------------------------------------
        | REQUEST HEADERS
        |--------------------------------------------------------------------------
        */

        getHeaders() {

            const token = useCookie('token')

            return {

                Authorization: `Bearer ${token.value}`,

                Accept: 'application/json'

            }

        },

        /*
        |--------------------------------------------------------------------------
        | LOAD CURRENT REQUEST
        |--------------------------------------------------------------------------
        */

        async loadCurrentRequest() {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-requests/current`,

                    {

                        headers: this.getHeaders()

                    }

                )

                this.request = response.request || response

                this.session =

                    this.request?.activeSession ||

                    this.request?.session ||

                    null

                return this.request

            }

            catch (error) {

                console.error(error)

                this.request = null

                this.session = null

                throw error

            }

            finally {

                this.loading = false

            }

        },

        /*
        |--------------------------------------------------------------------------
        | LOAD REQUEST BY ID
        |--------------------------------------------------------------------------
        */

        async loadRequest(id) {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-requests/${id}`,

                    {

                        headers: this.getHeaders()

                    }

                )

                this.request = response.request

                this.session =

                    response.request?.activeSession ||

                    response.request?.session ||

                    null

                return response.request

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
        | CREATE REQUEST
        |--------------------------------------------------------------------------
        */

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

                this.request = response.request || response

                this.session =

                    this.request?.activeSession ||

                    this.request?.session ||

                    null

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
        | CANCEL REQUEST
        |--------------------------------------------------------------------------
        */

        async cancelRequest(id) {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-requests/${id}/cancel`,

                    {

                        method: 'PATCH',

                        headers: this.getHeaders()

                    }

                )

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
        | LOAD HISTORY
        |--------------------------------------------------------------------------
        */

        async loadHistory() {

            this.loading = true

            try {

                const config = useRuntimeConfig()

                const response = await $fetch(

                    `${config.public.apiBase}/cross-country-requests/history`,

                    {

                        headers: this.getHeaders()

                    }

                )

                this.requests = response.requests || []

                return this.requests

            }

            catch (error) {

                console.error(error)

                this.requests = []

                throw error

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

                this.statistics =

                    response.statistics ||

                    response

                return this.statistics

            }

            catch (error) {

                console.error(error)

                throw error

            }

        },
                /*
        |--------------------------------------------------------------------------
        | LOAD TRACK
        |--------------------------------------------------------------------------
        */

        async loadTrack(sessionId) {

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

                throw error

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
        | CLEAR STORE
        |--------------------------------------------------------------------------
        */

        clearStore() {

            this.request = null

            this.requests = []

            this.session = null

            this.track = []

            this.statistics = {

                total_flights: 0,

                total_hours: 0,

                longest_flight: 0

            }

            this.loading = false

        }

    }

})