export const useCrossCountryApi = () => {

    const config = useRuntimeConfig()

    const token = useCookie('token')

    const headers = {
        Authorization: `Bearer ${token.value}`,
        Accept: 'application/json'
    }

    // ============================
    // Pilot
    // ============================

    const myRequests = () => {
        return $fetch(`${config.public.apiBase}/cross-country-requests`, {
            headers
        })
    }

    const show = (id) => {
        return $fetch(`${config.public.apiBase}/cross-country-requests/${id}`, {
            headers
        })
    }

    const create = (data) => {
        return $fetch(`${config.public.apiBase}/cross-country-requests`, {
            method: 'POST',
            headers,
            body: data
        })
    }

    const cancel = (id) => {
        return $fetch(`${config.public.apiBase}/cross-country-requests/${id}/cancel`, {
            method: 'PATCH',
            headers
        })
    }

    const startFlight = (id) => {
        return $fetch(`${config.public.apiBase}/cross-country-requests/${id}/start`, {
            method: 'POST',
            headers
        })
    }

    const finishFlight = (sessionId) => {
        return $fetch(`${config.public.apiBase}/cross-country-sessions/${sessionId}/finish`, {
            method: 'POST',
            headers
        })
    }

    const track = (sessionId) => {
        return $fetch(`${config.public.apiBase}/cross-country-sessions/${sessionId}/track`, {
            headers
        })
    }

    const statistics = () => {
        return $fetch(`${config.public.apiBase}/cross-country/statistics`, {
            headers
        })
    }

    // ============================
    // Admin
    // ============================

    const adminRequests = () => {
        return $fetch(`${config.public.apiBase}/admin/cross-country-requests`, {
            headers
        })
    }

    const updateStatus = (id, status) => {
        return $fetch(`${config.public.apiBase}/admin/cross-country-requests/${id}/status`, {
            method: 'PATCH',
            headers,
            body: {
                status
            }
        })
    }

    return {
        myRequests,
        show,
        create,
        cancel,
        startFlight,
        finishFlight,
        track,
        statistics,
        adminRequests,
        updateStatus
    }
}