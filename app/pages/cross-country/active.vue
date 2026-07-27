<template>
    <Breadcrumbs title="Active Cross Country Flight" />

    <div class="container py-5">

        <div
            v-if="loading"
            class="text-center py-5"
        >
            <div class="spinner-border text-success"></div>
        </div>

        <div
            v-else-if="request"
            class="row justify-content-center"
        >

            <div class="col-xl-10">

                <!-- ========================= -->
                <!-- Flight Information -->
                <!-- ========================= -->

                <div class="card shadow border-0 mb-4">

                    <div class="card-header bg-success text-white">

                        <h3 class="mb-0">

                            <i class="bi bi-airplane-engines me-2"></i>

                            Active Cross Country Flight

                        </h3>

                    </div>

                    <div class="card-body">

                        <div class="row text-center">

                            <div class="col-md-3 mb-3">

                                <h6>Status</h6>

                                <span class="badge bg-success">

                                    {{ request.status }}

                                </span>

                            </div>

                            <div class="col-md-3 mb-3">

                                <h6>Date</h6>

                                {{ request.flight_date }}

                            </div>

                            <div class="col-md-3 mb-3">

                                <h6>Takeoff</h6>

                                {{ request.takeoff_time }}

                            </div>

                            <div class="col-md-3 mb-3">

                                <h6>Duration</h6>

                                {{ duration }}

                            </div>

                        </div>

                    </div>

                </div>

                <!-- ========================= -->
                <!-- QR -->
                <!-- ========================= -->

                <div
                    v-if="request.qrCode"
                    class="card shadow border-0 mb-4"
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

                        <p class="text-muted mt-3">

                            Scan this QR before starting the flight.

                        </p>

                    </div>

                </div>

                <!-- ========================= -->
                <!-- Route -->
                <!-- ========================= -->

                <div class="card shadow border-0 mb-4">

                    <div class="card-header">

                        Flight Route

                    </div>

                    <div class="card-body">

                        <div
                            v-for="(stop,index) in request.locations"
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
                                    v-else-if="index===request.locations.length-1"
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

                <!-- ========================= -->
                <!-- Live Map -->
                <!-- ========================= -->

                <div class="card shadow border-0 mb-4">

                    <div class="card-header">

                        Live Flight Map

                    </div>

                    <div class="card-body">

                        <FlightMap
                            :route="request.locations"
                            :track="track"
                            :current-location="aircraft"
                        />

                    </div>

                </div>

                <!-- ========================= -->
                <!-- Controls -->
                <!-- ========================= -->

                <div class="card shadow border-0">

                    <div class="card-body text-center">

                        <button
                            v-if="!session"
                            class="btn btn-success btn-lg px-5"
                            @click="startFlight"
                            :disabled="starting"
                        >

                            <span
                                v-if="starting"
                                class="spinner-border spinner-border-sm me-2"
                            />

                            <i class="bi bi-play-circle me-2"></i>

                            Start Flight

                        </button>

                        <button
                            v-else
                            class="btn btn-danger btn-lg px-5"
                            @click="finishFlight"
                            :disabled="finishing"
                        >

                            <span
                                v-if="finishing"
                                class="spinner-border spinner-border-sm me-2"
                            />

                            <i class="bi bi-stop-circle me-2"></i>

                            Finish Flight

                        </button>

                    </div>

                </div>

            </div>

        </div>

    </div>

</template>
<script setup>
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'
import FlightMap from '~/components/CrossCountry/FlightMap.vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const route = useRoute()

const config = useRuntimeConfig()

const loading = ref(true)
const starting = ref(false)
const finishing = ref(false)

const request = ref(null)
const session = ref(null)
const track = ref([])

const duration = ref('00:00:00')

let timer = null
let gpsTimer = null

const headers = computed(() => ({
    Authorization: `Bearer ${authStore.token}`,
    Accept: 'application/json'
}))

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
| Load Request
|--------------------------------------------------------------------------
*/

const loadRequest = async () => {

    loading.value = true

    try {

        const response = await $fetch(

            `${config.public.apiBase}/cross-country-requests/${route.query.id}`,

            {
                headers: headers.value
            }

        )

        request.value = response.request

        session.value = response.request.session

        if (session.value) {

            updateDuration()

            if (timer) {
                clearInterval(timer)
            }

            timer = setInterval(updateDuration, 1000)

            await loadTrack()

            if (gpsTimer) {
                clearInterval(gpsTimer)
            }

            gpsTimer = setInterval(loadTrack, 10000)

        }

    }

    catch (error) {

        console.error(error)

        alert(error?.data?.message || 'Unable to load flight.')

    }

    finally {

        loading.value = false

    }

}

/*
|--------------------------------------------------------------------------
| Load GPS Track
|--------------------------------------------------------------------------
*/

const loadTrack = async () => {

    if (!session.value) {
        return
    }

    try {

        const response = await $fetch(

            `${config.public.apiBase}/cross-country-sessions/${session.value.id}/track`,

            {
                headers: headers.value
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
| Flight Duration
|--------------------------------------------------------------------------
*/

const updateDuration = () => {

    if (!session.value?.started_at) {
        return
    }

    const started = new Date(session.value.started_at)
    const now = new Date()

    const diff = Math.floor((now - started) / 1000)

    const h = String(Math.floor(diff / 3600)).padStart(2, '0')
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
    const s = String(diff % 60).padStart(2, '0')

    duration.value = `${h}:${m}:${s}`

}

/*
|--------------------------------------------------------------------------
| Start Flight
|--------------------------------------------------------------------------
*/

const startFlight = async () => {

    starting.value = true

    try {

        const response = await $fetch(

            `${config.public.apiBase}/cross-country-requests/${request.value.id}/start`,

            {

                method: 'POST',

                headers: headers.value

            }

        )

        session.value = response.session

        await loadRequest()

        updateDuration()

        if (timer) {
            clearInterval(timer)
        }

        timer = setInterval(updateDuration, 1000)

        await loadTrack()

        if (gpsTimer) {
            clearInterval(gpsTimer)
        }

        gpsTimer = setInterval(loadTrack, 10000)

    }

    catch (error) {

        console.error(error)

        alert(error?.data?.message || 'Unable to start flight.')

    }

    finally {

        starting.value = false

    }

}

/*
|--------------------------------------------------------------------------
| Finish Flight
|--------------------------------------------------------------------------
*/

const finishFlight = async () => {

    finishing.value = true

    try {

        await $fetch(

            `${config.public.apiBase}/cross-country-sessions/${session.value.id}/finish`,

            {

                method: 'POST',

                headers: headers.value

            }

        )

        await navigateTo('/cross-country/history')

    }

    catch (error) {

        console.error(error)

        alert(error?.data?.message || 'Unable to finish flight.')

    }

    finally {

        finishing.value = false

    }

}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {

    await loadRequest()

})

onUnmounted(() => {

    if (timer) {
        clearInterval(timer)
    }

    if (gpsTimer) {
        clearInterval(gpsTimer)
    }

})
</script>

<style scoped>

.card{

    border-radius:16px;

}

.card-header{

    font-weight:600;

}

.badge{

    font-size:.9rem;

    padding:.55rem 1rem;

}

</style>