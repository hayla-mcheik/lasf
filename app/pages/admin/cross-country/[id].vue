<template>

    <div class="container-fluid py-4">

        <!-- Header -->

        <div class="d-flex justify-content-between align-items-center mb-4">

            <div>

                <h2 class="fw-bold">

                    Cross Country Request

                </h2>

                <small class="text-muted">

                    Request #{{ request?.id }}

                </small>

            </div>

            <NuxtLink
                to="/admin/cross-country"
                class="btn btn-outline-secondary"
            >

                Back

            </NuxtLink>

        </div>

        <div
            v-if="loading"
            class="text-center py-5"
        >

            <div class="spinner-border text-success"></div>

        </div>

        <div
            v-else-if="request"
            class="row"
        >

            <!-- LEFT -->

            <div class="col-lg-4">

                <!-- Pilot -->

                <div class="card shadow-sm mb-4">

                    <div class="card-header">

                        Pilot

                    </div>

                    <div class="card-body text-center">

                        <img
                            :src="pilotImage"
                            class="rounded-circle mb-3"
                            width="120"
                            height="120"
                            style="object-fit:cover"
                        >

                        <h5>

                            {{ request.pilot.name }}

                        </h5>

                        <hr>

                        <p>

                            <strong>License</strong><br>

                        {{ request.pilot.pilotProfile?.license_number }}

                        </p>

                        <p>

                            <strong>Phone</strong><br>

                            {{ request.pilot.phone }}

                        </p>

                        <p>

                            <strong>Club</strong><br>
{{ request.pilot.pilotProfile?.club_name }}

                        </p>

                    </div>

                </div>

                <!-- QR -->

                <div
                    v-if="request.qrCode"
                    class="card shadow-sm"
                >

                    <div class="card-header">

                        QR Code

                    </div>

                    <div class="card-body text-center">

                        <img
                            :src="request.qrCode.image"
                            class="img-fluid"
                            style="max-width:220px"
                        >

                    </div>

                </div>

            </div>

            <!-- RIGHT -->

            <div class="col-lg-8">

                <!-- Flight -->

                <div class="card shadow-sm mb-4">

                    <div class="card-header">

                        Flight Information

                    </div>

                    <div class="card-body">

                        <div class="row">

                            <div class="col-md-6">

                                <strong>Status</strong>

                                <p>

                                    <span
                                        class="badge"
                                        :class="badgeClass(request.status)"
                                    >

                                        {{ request.status }}

                                    </span>

                                </p>

                            </div>

                            <div class="col-md-6">

                                <strong>Date</strong>

                                <p>

                       {{ formatDate(request.flight_date) }}

                                </p>

                            </div>

                            <div class="col-md-6">

                                <strong>Takeoff</strong>

                                <p>

                            {{ formatTime(request.takeoff_time) }}

                                </p>

                            </div>

                            <div class="col-md-6">

                                <strong>Estimated Landing</strong>

                                <p>

                                 {{ formatTime(request.estimated_landing_time) }}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- Route -->

                <div class="card shadow-sm mb-4">

                    <div class="card-header">

                        Planned Route

                    </div>

                    <div class="card-body">

                        <div
                            v-for="(stop,index) in request.locations"
                            :key="stop.id"
                            class="d-flex mb-3"
                        >

                            <div style="width:120px">

                                <span
                                    v-if="index===0"
                                    class="badge bg-success"
                                >

                                    Takeoff

                                </span>

                                <span
                                    v-else-if="index===request.locations.length-1"
                                    class="badge bg-danger"
                                >

                                    Landing

                                </span>

                                <span
                                    v-else
                                    class="badge bg-warning text-dark"
                                >

                                    Waypoint

                                </span>

                            </div>

                            <div>

                                {{ stop.location.name }}

                            </div>

                        </div>

                    </div>

                </div>

                <!-- Map -->

                <div class="card shadow-sm mb-4">

                    <div class="card-header">

                        Route Map

                    </div>

                    <div class="card-body">

                        <FlightMap

                            :route="request.locations"

                            :track="track"

                            :current-location="aircraft"

                        />

                    </div>

                </div>

<div class="card shadow-sm mb-4">

    <div class="card-header">
        Flight Status
    </div>

    <div class="card-body">

        <div
       v-if="request.session?.is_active"
            class="alert alert-primary mb-0"
        >
            ✈️ Flight is currently active.
        </div>

        <div
            v-else-if="request.status=='pending'"
            class="alert alert-warning mb-0"
        >
            ⏳ Waiting for administrator approval.
        </div>

        <div
            v-else-if="request.status=='open'"
            class="alert alert-success mb-0"
        >
            ✅ Approved. Pilot can now start the Cross Country flight.
        </div>

        <div
            v-else-if="request.status=='closed'"
            class="alert alert-secondary mb-0"
        >
            🏁 Flight completed successfully.
        </div>

        <div
            v-else
            class="alert alert-danger mb-0"
        >
            ❌ Flight cancelled.
        </div>

    </div>

</div>
                <!-- Actions -->

                <div
                    v-if="request.status==='pending'"
                    class="card shadow-sm"
                >

                    <div class="card-body text-center">

                        <button
                            class="btn btn-success me-3"
                            @click="approve"
                        >

                            Approve

                        </button>

                        <button
                            class="btn btn-danger"
                            @click="reject"
                        >

                            Reject

                        </button>

                    </div>

                </div>

            </div>

        </div>

    </div>

</template>

<script setup>
import FlightMap from '~/components/CrossCountry/FlightMap.vue'
import { useAuthStore } from '~/stores/auth'
definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const loading = ref(true)

const request = ref(null)

const track = ref([])

/*
|--------------------------------------------------------------------------
| Pilot Image
|--------------------------------------------------------------------------
*/

const pilotImage = computed(() => {

    const image = request.value?.pilot?.pilotProfile?.image

    if (!image) {

        return '/images/default-avatar.png'

    }

    return `${config.public.mediaBase}/storage/${image}`

})
const formatDate = (date) => {

    if (!date) return '-'

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(date))

}

const formatTime = (time) => {

    if (!time) return '-'

    const today = new Date().toISOString().split('T')[0]

    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(new Date(`${today}T${time}`))

}

/*
|--------------------------------------------------------------------------
| Aircraft Position
|--------------------------------------------------------------------------
*/

const aircraft = computed(() => {

    if (!track.value.length) {

        return null

    }

    const last = track.value[track.value.length - 1]

    return [

        last.latitude,

        last.longitude

    ]

})

/*
|--------------------------------------------------------------------------
| Badge
|--------------------------------------------------------------------------
*/

const badgeClass = (status) => {

    switch (status) {

        case 'pending':
            return 'bg-warning text-dark'

        case 'open':
            return 'bg-success'

        case 'closed':
            return 'bg-secondary'

        case 'cancelled':
            return 'bg-danger'

        default:
            return 'bg-primary'

    }

}

/*
|--------------------------------------------------------------------------
| Load Request
|--------------------------------------------------------------------------
*/

const loadRequest = async () => {

    loading.value = true

    try {

        const response = await $fetch(

            `${config.public.apiBase}/admin/cross-country-requests/${route.params.id}`,

            {

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }

            }

        )

        request.value = response.request

        if (request.value?.session) {

            await loadTrack()

        }

    } catch (error) {

        console.error(error)

        alert(error?.data?.message || 'Unable to load request.')

    } finally {

        loading.value = false

    }

}

/*
|--------------------------------------------------------------------------
| Load Track
|--------------------------------------------------------------------------
*/

const loadTrack = async () => {

    if (!request.value?.session) {

        return

    }

    try {

        const response = await $fetch(

            `${config.public.apiBase}/cross-country-sessions/${request.value.session.id}/track`,

            {

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }

            }

        )

        track.value = response.track || []

    }

    catch (error) {

        console.error(error)

    }

}

/*
|--------------------------------------------------------------------------
| Approve Request
|--------------------------------------------------------------------------
*/

const approve = async () => {

    if (!confirm('Approve this Cross Country request?')) {

        return

    }

    try {

        const response = await $fetch(

            `${config.public.apiBase}/admin/cross-country-requests/${request.value.id}/status`,

            {

                method: 'PATCH',

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                },

                body: {

                    status: 'open'

                }

            }

        )

        await loadRequest()

        alert(response.message)

    } catch (error) {

        console.error(error)

        alert(error?.data?.message || 'Unable to approve request.')

    }

}

/*
|--------------------------------------------------------------------------
| Reject Request
|--------------------------------------------------------------------------
*/

const reject = async () => {

    if (!confirm('Reject this Cross Country request?')) {

        return

    }

    try {

        const response = await $fetch(

            `${config.public.apiBase}/admin/cross-country-requests/${request.value.id}/status`,

            {

                method: 'PATCH',

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                },

                body: {

                    status: 'closed'

                }

            }

        )

        await loadRequest()

        alert(response.message)

    } catch (error) {

        console.error(error)

        alert(error?.data?.message || 'Unable to reject request.')

    }

}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {

    loadRequest()

})
</script>
<style scoped>

.card{

    border:none;

    border-radius:16px;

}

.card-header{

    font-weight:600;

    background:#fff;

}

.badge{

    font-size:.85rem;

    padding:.55rem .9rem;

    text-transform:capitalize;

}

img.rounded-circle{

    border:4px solid #f2f2f2;

}

</style>