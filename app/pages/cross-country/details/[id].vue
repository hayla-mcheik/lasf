<template>
   <Breadcrumbs
    parent="Cross Country"
    title="Flight Details"
/>

    <div class="container py-5">
<div class="mb-4">
    <button
        class="btn btn-light border shadow-sm rounded-pill px-4"
        @click="$router.back()"
    >
        <i class="bi bi-arrow-left me-2"></i>
        Back
    </button>
</div>
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-success"></div>
        </div>

        <div
            v-else-if="flight"
            class="row justify-content-center"
        >

            <div class="col-lg-10">

                <!-- Header -->

                <div class="card shadow border-0 mb-4">

                    <div class="card-header bg-success text-white">

                        <h3 class="mb-0">

                            <i class="bi bi-airplane-engines me-2"></i>

                            Cross Country Flight

                        </h3>

                    </div>

                    <div class="card-body">

                        <div class="row">

                            <div class="col-md-3">

                                <strong>Status</strong>

                                <br>

                                <span
                                    class="badge"
                                    :class="badgeClass"
                                >

                                    {{ flight.status }}

                                </span>

                            </div>

                            <div class="col-md-3">

                                <strong>Date</strong>

                                <br>

                                               {{ formatDate(flight.flight_date) }}

                            </div>

                            <div class="col-md-3">

                                <strong>Takeoff</strong>

                                <br>

                                {{ flight.takeoff_time }}

                            </div>

                            <div class="col-md-3">

                                <strong>Landing</strong>

                                <br>

                                {{ flight.estimated_landing_time }}

                            </div>

                        </div>

                    </div>

                </div>

                <!-- Route -->

                <div class="card shadow border-0 mb-4">

                    <div class="card-header">

                        Flight Route

                    </div>

                    <div class="card-body">

                        <div
                            v-for="(stop,index) in flight.locations"
                            :key="stop.id"
                            class="d-flex align-items-center mb-3"
                        >

                            <div style="width:120px">

                                <span
                                    v-if="index===0"
                                    class="badge bg-success"
                                >
                                    Takeoff
                                </span>

                                <span
                                    v-else-if="index===flight.locations.length-1"
                                    class="badge bg-danger"
                                >
                                    Landing
                                </span>

                                <span
                                    v-else
                                    class="badge bg-warning text-dark"
                                >
                                    Waypoint {{ index }}
                                </span>

                            </div>

                            <div>

                                {{ stop.location.name }}

                            </div>

                        </div>

                    </div>

                </div>

                <!-- Statistics -->

                <div class="card shadow border-0 mb-4">

                    <div class="card-header">

                        Flight Statistics

                    </div>

                    <div class="card-body">

                        <div class="row text-center">

                            <div class="col-md-4">

                                <h3>

                                    {{ statistics.total_flights }}

                                </h3>

                                <small>Total Flights</small>

                            </div>

                            <div class="col-md-4">

                                <h3>

                                    {{ statistics.total_hours }}

                                </h3>

                                <small>Total Hours</small>

                            </div>

                            <div class="col-md-4">

                                <h3>

                                    {{ statistics.longest_flight }}

                                </h3>

                                <small>Longest Flight (min)</small>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- GPS Track -->

                <div class="card shadow border-0">

                    <div class="card-header">

                        GPS Track

                    </div>

                    <div class="card-body">

                        <div
                            v-if="track.length===0"
                            class="text-center text-muted py-4"
                        >

                            No GPS points available.

                        </div>

                        <table
                            v-else
                            class="table"
                        >

                            <thead>

                                <tr>

                                    <th>#</th>

                                    <th>Latitude</th>

                                    <th>Longitude</th>

                                    <th>Recorded At</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr
                                    v-for="(point,index) in track"
                                    :key="index"
                                >

                                    <td>

                                        {{ index+1 }}

                                    </td>

                                    <td>

                                        {{ point.latitude }}

                                    </td>

                                    <td>

                                        {{ point.longitude }}

                                    </td>

                                    <td>

                                        {{ point.created_at }}

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    </div>

</template>

<script setup>
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const route = useRoute()

const config = useRuntimeConfig()

const loading = ref(true)

const flight = ref(null)

const statistics = ref({

    total_flights: 0,

    total_hours: 0,

    longest_flight: 0

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
const track = ref([])

const headers = computed(() => ({
    Authorization: `Bearer ${authStore.token}`,
    Accept: 'application/json'
}))

/*
|--------------------------------------------------------------------------
| Badge Color
|--------------------------------------------------------------------------
*/

const badgeClass = computed(() => {

    switch (flight.value?.status) {

        case 'closed':
            return 'bg-success'

        case 'pending':
            return 'bg-warning text-dark'

        case 'open':
            return 'bg-primary'

        case 'cancelled':
            return 'bg-danger'

        default:
            return 'bg-secondary'

    }

})

/*
|--------------------------------------------------------------------------
| Load Flight Details
|--------------------------------------------------------------------------
*/

const loadFlight = async () => {

    const response = await $fetch(

        `${config.public.apiBase}/cross-country-requests/${route.params.id}`,

        {

            headers: headers.value

        }

    )

    flight.value = response.request

}

/*
|--------------------------------------------------------------------------
| Load Statistics
|--------------------------------------------------------------------------
*/

const loadStatistics = async () => {

    const response = await $fetch(

        `${config.public.apiBase}/cross-country/statistics`,

        {

            headers: headers.value

        }

    )

    statistics.value = response

}

/*
|--------------------------------------------------------------------------
| Load Track
|--------------------------------------------------------------------------
*/

const loadTrack = async () => {

    const session = flight.value?.activeSession || flight.value?.session

    if (!session) {

        track.value = []

        return

    }

    const response = await $fetch(

        `${config.public.apiBase}/cross-country-sessions/${session.id}/track`,

        {

            headers: headers.value

        }

    )

    track.value = response.track || []

}

/*
|--------------------------------------------------------------------------
| Load Page
|--------------------------------------------------------------------------
*/

const loadPage = async () => {

    loading.value = true

    try {

        await loadFlight()

        await loadStatistics()

        await loadTrack()

    }

    catch (error) {

        console.error(error)

        alert(

            error?.data?.message ||

            'Unable to load flight details.'

        )

    }

    finally {

        loading.value = false

    }

}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {

    loadPage()

})
</script>

<style scoped>

.card{

    border-radius:16px;

}

.badge{

    padding:.6rem .9rem;

}

.table td,
.table th{

    vertical-align:middle;

}

</style>