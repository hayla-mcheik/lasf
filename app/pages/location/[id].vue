<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#app'
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'
import { useAuthStore } from '~/stores/auth'
import { useCrossCountryStore } from '~/stores/crossCountry'

/*
|--------------------------------------------------------------------------
| Stores
|--------------------------------------------------------------------------
*/

const authStore = useAuthStore()
const crossCountryStore = useCrossCountryStore()

const config = useRuntimeConfig()
const route = useRoute()

/*
|--------------------------------------------------------------------------
| Load Location
|--------------------------------------------------------------------------
*/

const {
    data: location,
    pending,
    error: locationError,
    refresh: refreshLocation
} = await useFetch(

    () => `${config.public.apiBase}/flying-locations/${route.params.slug || route.params.id}`,

    {

        key: `location-${route.params.slug || route.params.id}`,

        immediate: true,

        transform: (response) => response.data || response

    }

)

/*
|--------------------------------------------------------------------------
| Load Cross Country
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const checkingIn = ref(false)

const currentRequest = computed(() => crossCountryStore.currentRequest)

const crossCountrySession = computed(() => crossCountryStore.activeSession)

const hasCrossCountry = computed(() => crossCountryStore.hasRequest)

const isPending = computed(() => crossCountryStore.isPending)

const isApproved = computed(() => crossCountryStore.isApproved)

const isClosed = computed(() => crossCountryStore.isClosed)

const isCancelled = computed(() => crossCountryStore.isCancelled)

/*
|--------------------------------------------------------------------------
| Airspace Session
|--------------------------------------------------------------------------
*/

const activeSession = computed(() => authStore.activeSession)

/*
|--------------------------------------------------------------------------
| Flying Here
|--------------------------------------------------------------------------
*/

const isFlyingHere = computed(() => {

    if (!location.value)
        return false

    const sessionLocationId =

        activeSession.value?.flying_location_id ||

        activeSession.value?.location?.id ||

        null

    return Number(sessionLocationId) === Number(location.value.id)

})

/*
|--------------------------------------------------------------------------
| Cross Country Helpers
|--------------------------------------------------------------------------
*/

const canCreateCrossCountry = computed(() => {

    return (

        !hasCrossCountry.value ||

        isClosed.value ||

        isCancelled.value

    )

})

const canStartCrossCountry = computed(() => {

    return (

        hasCrossCountry.value &&

        isApproved.value &&

        !crossCountrySession.value

    )

})

const canContinueCrossCountry = computed(() => {

    return !!crossCountrySession.value

})
const canCheckIn = computed(() => {
    return location.value?.status_label === 'green'
})
/*
|--------------------------------------------------------------------------
| Refresh Everything
|--------------------------------------------------------------------------
*/
async function handlePause()
{
    try
    {
        console.log('Session:', activeSession.value)

        await $fetch(
            `${config.public.apiBase}/airspace-sessions/${activeSession.value.id}/pause`,
            {
                method: 'PATCH',

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        )

        stopTracking()

        await authStore.loadActiveSession()

        alert('Permission paused successfully.')
    }
    catch (error)
    {
        console.log(error)

        console.log(error.response)

        alert(
            error?.data?.message ||
            error?.response?._data?.message ||
            error?.message ||
            'Pause failed.'
        )
    }
}
async function handleResume()
{
    try
    {
        await $fetch(
            `${config.public.apiBase}/airspace-sessions/${activeSession.value.id}/resume`,
            {
                method: 'POST',

                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        )

        startTracking()

        await authStore.loadActiveSession()

        alert('Permission resumed successfully.')
    }
    catch (error)
    {
          console.log(error)
    alert(JSON.stringify(error))
    alert(
        error?.data?.message ||
        error?.message ||
        'Resume failed.'
    )
    }
}
const refreshEverything = async () => {

    await Promise.allSettled([

        refreshLocation(),

        crossCountryStore.refresh(),

        authStore.loadActiveSession(),

    ])

}

/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(async () => {
    await authStore.loadActiveSession()

    if (authStore.isAuthenticated) {
        await crossCountryStore.loadCurrentRequest()
    }

    await refreshEverything()
})
/*
|--------------------------------------------------------------------------
| Check In
|--------------------------------------------------------------------------
*/

async function handleCheckIn(token) {

      console.log('1. handleCheckIn called');
    console.log('2. token =', token);
    console.log('3. isFlyingHere =', isFlyingHere.value);
    console.log('4. activeSession =', authStore.activeSession);

    if (!token) {
        console.log('STOP: No token');
        return;
    }

    if (isFlyingHere.value) {
        console.log('STOP: Already flying here');
        return;
    }

    console.log('5. Sending POST request...');
    checkingIn.value = true

    try {

        const response = await $fetch(

            `${config.public.apiBase}/airspace-sessions`,

            {

                method: 'POST',

                headers: {

                    Authorization: `Bearer ${authStore.token}`

                },

                body: {

                    token

                }

            }

        )

        authStore.activeSession = response.session

        /*
        |--------------------------------------------------------------------------
        | Refresh Cross Country
        |--------------------------------------------------------------------------
        */

        await crossCountryStore.refresh()

        window.history.replaceState(

            {},

            '',

            `/location/${location.value.slug}`

        )

        startTracking()

        alert('Successfully checked in.')

        await refreshEverything()

    }

catch (error) {

    console.error(error)

    if (
        error?.status === 422 &&
        error?.data?.active_session
    ) {

        authStore.activeSession = error.data.active_session

        await refreshEverything()

        alert('You already have an active flying session.')

        return
    }

    alert(
        error?.data?.message ||
        'Check-in failed.'
    )
}
    finally {

        checkingIn.value = false

    }

}

/*
|--------------------------------------------------------------------------
| GPS Tracking
|--------------------------------------------------------------------------
*/

let watchId = null
const outsideZoneWarningShown = ref(false)
function startTracking() {

    if (!process.client)
        return

    if (!navigator.geolocation)
        return

    if (watchId)
        return

    watchId = navigator.geolocation.watchPosition(

        async (position) => {

            try {

  const response = await $fetch(
    `${config.public.apiBase}/gps/update`,
    {
        method: 'POST',

        headers: {
            Authorization: `Bearer ${authStore.token}`
        },

        body: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        }
    }
)

if (
    response.outside_zone &&
    !outsideZoneWarningShown.value
) {

    outsideZoneWarningShown.value = true

    alert(
        'Warning: You are outside the authorized flying zone.'
    )

}

if (!response.outside_zone) {

    outsideZoneWarningShown.value = false

}

            }

            catch (error) {

                console.error(error)

            }

        },

        (error) => {

            console.error(error)

        },

        {

            enableHighAccuracy: true,

            maximumAge: 5000,

            timeout: 10000

        }

    )

}

function stopTracking()
{
    if (!watchId)
    {
        return
    }

    navigator.geolocation.clearWatch(watchId)

    watchId = null
}

/*
|--------------------------------------------------------------------------
| Auto Start Tracking
|--------------------------------------------------------------------------
*/

watch(

    isFlyingHere,

    (flying) => {

        if (flying) {

            startTracking()

        }

    },

    {

        immediate: true

    }

)

/*
|--------------------------------------------------------------------------
| Check Out
|--------------------------------------------------------------------------
*/

async function handleCheckOut() {

    if (!activeSession.value)
        return

    if (!confirm('Are you sure you landed?'))
        return

    try {

        await $fetch(

            `${config.public.apiBase}/airspace-sessions/${activeSession.value.id}/checkout`,

            {

                method: 'POST',

                headers: {

                    Authorization: `Bearer ${authStore.token}`

                }

            }

        )

        if (watchId) {

            navigator.geolocation.clearWatch(watchId)

            watchId = null

        }

        authStore.activeSession = null

        /*
        |--------------------------------------------------------------------------
        | Refresh Cross Country
        |--------------------------------------------------------------------------
        */

        await crossCountryStore.refresh()

        await refreshEverything()

        alert('Successfully checked out.')

    }

    catch (error) {

        console.error(error)

        alert(

            error?.data?.message ||

            'Checkout failed.'

        )

    }

}

/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/
function formatTime(date) {

    if (!date) return '-'

    return new Date(date).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })

}
onUnmounted(() => {

    if (watchId) {

        navigator.geolocation.clearWatch(watchId)

    }

})
</script>

<template>
<Breadcrumbs
    parent="Flying Locations"
    :title="location?.name"
/>
  <div class="location-page">


    <!-- Loading state -->
    <div v-if="pending" class="container py-5 text-center">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading location information...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="locationError" class="container py-5">
      <div class="alert alert-danger">
        <h4><i class="bi bi-exclamation-triangle"></i> Error Loading Location</h4>
        <p>{{ locationError.message || 'Failed to load location data' }}</p>
        <button @click="refreshLocation" class="btn btn-outline-danger mt-2">
          Try Again
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div v-else-if="location" class="location-content">
      <!-- Header -->
      <div class="location-header py-5 ">
        <div class="container">
                <a
        href="#"
        class="text-decoration-none fw-semibold"
        @click.prevent="$router.back()"
    >
        <i class="bi bi-arrow-left me-2"></i>
        Back to Flying Locations
    </a>
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="display-5 fw-bold mb-5 text-dark">{{ location.name }}</h1>
              <div class="d-flex align-items-center gap-3">
                <span class="badge text-dark">{{ location.type }}</span>
                <!-- <span class="text-muted">
                  <i class="bi bi-geo-alt me-1"></i>
                  ID: {{ location.id }}
                </span> -->
              </div>
            </div>
            <div class="col-md-4 text-md-end">
              <!-- <div class="location-stats">
                <div class="fw-bold fs-4">{{ activePilots.length }}</div>
                <div class="text-muted">Active Pilots</div>
              </div> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="container py-5">
        <div class="row g-4">
          <!-- Left column - Check-in/Check-out -->
          <div class="col-lg-12">
            <div class="card shadow border-0 rounded-4">
              <div class="card-body p-5">
              <!-- <div class="alert alert-info text-start">
  <p><strong>Current Location ID:</strong> {{ location?.id }}</p>
  <p><strong>Session Location ID:</strong> {{ authStore.activeSession?.flying_location_id }}</p>
  <pre>{{ JSON.stringify(authStore.activeSession, null, 2) }}</pre>
  <p><strong>Session Location Relation:</strong> {{ authStore.activeSession?.location?.id }}</p>
  <p><strong>isFlyingHere:</strong> {{ isFlyingHere }}</p>
</div> -->
                <!-- Loading check-in state -->
                <div v-if="checkingIn" class="text-center py-4">
                  <div class="spinner-border text-success" style="width: 4rem; height: 4rem;" role="status">
                    <span class="visually-hidden">Checking in...</span>
                  </div>
                  <h3 class="mt-4">Processing Check-in...</h3>
                  <p class="text-muted">Please wait while we verify your session</p>
                </div>

                <!-- Not authenticated -->
                <div v-else-if="!authStore.isAuthenticated" class="text-center py-4">
                  <div class="icon-placeholder mb-4">
                    <i class="bi bi-person-lock display-1 text-muted"></i>
                  </div>
                  <h3 class="mb-3">Login Required</h3>
                  <p class="text-muted mb-4">You need to be logged in to check into this airspace</p>
                  <button 
                    @click="navigateTo(`/login?redirect=${route.fullPath}`)" 
                    class="btn btn-primary btn-lg px-5 rounded-pill"
                  >
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Login Now
                  </button>
                </div>

                <!-- Already flying here -->
           <!-- Already Flying Here -->
<div
    v-else-if="isFlyingHere"
    class="text-center py-4"
>

    <div class="alert alert-success border-0 rounded-3">

        <div class="d-flex align-items-center justify-content-center mb-3">

            <i class="bi bi-airplane-fill display-4 me-3"></i>

            <div class="text-start">

                <h3 class="fw-bold mb-1">

                    You're Flying!

                </h3>

                <p class="mb-0">

                    Active at {{ location.name }}

                </p>

            </div>

        </div>

        <div class="session-info bg-white bg-opacity-25 rounded-3 p-3 mb-4">

            <div class="row text-center">

                <div class="col">

                    <div class="fw-bold">

                        Checked In

                    </div>

                    <div class="text-muted small">
{{ activeSession?.checked_in_at }}


                    </div>

                </div>

                <div class="col">

                    <div class="fw-bold">

                        Expires

                    </div>

                    <div class="text-muted small">

                        {{ (activeSession?.expires_at) }}

                    </div>

                </div>

            </div>

        </div>

        <div class="d-flex flex-column gap-3">

            <!-- ================================================= -->
            <!-- ACTIVE CROSS COUNTRY -->
            <!-- ================================================= -->

            <NuxtLink

                v-if="canContinueCrossCountry"

                :to="`/cross-country/active?id=${currentRequest.id}`"

                class="btn btn-success btn-lg"

            >

                <i class="bi bi-airplane-engines me-2"></i>

                Continue Cross Country

            </NuxtLink>

            <!-- ================================================= -->
            <!-- APPROVED -->
            <!-- ================================================= -->

            <NuxtLink

                v-else-if="canStartCrossCountry"

                :to="`/cross-country/active?id=${currentRequest.id}`"

                class="btn btn-primary btn-lg"

            >

                <i class="bi bi-play-circle me-2"></i>

                Start Cross Country Flight

            </NuxtLink>

            <!-- ================================================= -->
            <!-- PENDING -->
            <!-- ================================================= -->

            <button

                v-else-if="isPending"

                disabled

                class="btn btn-warning btn-lg"

            >

                <i class="bi bi-hourglass-split me-2"></i>

                Waiting For Approval

            </button>

            <!-- ================================================= -->
            <!-- CREATE REQUEST -->
            <!-- ================================================= -->

            <NuxtLink

                v-else-if="canCreateCrossCountry"

                to="/cross-country/request"

                class="btn btn-primary btn-lg"

            >

                <i class="bi bi-plus-circle me-2"></i>

                Create Cross Country Request

            </NuxtLink>

<div class="d-flex flex-column gap-3">

<button
    v-if="activeSession?.status === 'active'"
    @click="handlePause"
    class="btn btn-warning btn-lg"
>
    Pause Permission
</button>

<button
    v-if="activeSession?.status === 'paused'"
    @click="handleResume"
    class="btn btn-success btn-lg"
>
    Resume Permission
</button>

<button
    @click="handleCheckOut"
    class="btn btn-danger btn-lg"
>
    Close Permission
</button>

</div>

        </div>

        <div class="mt-4">

            <div
                v-if="isPending"
                class="alert alert-warning"
            >

                Your Cross Country request is waiting for approval.

            </div>

            <div
                v-else-if="isApproved"
                class="alert alert-success"
            >

                Your request has been approved.

            </div>

            <div
                v-else-if="canContinueCrossCountry"
                class="alert alert-primary"
            >

                Your Cross Country flight is currently active.

            </div>

        </div>

    </div>

</div>
                <!-- Flying elsewhere -->
             <div
    v-else-if="authStore.activeSession?.id"
    class="text-center py-4"
>
                  <div class="alert alert-warning border-0 rounded-3">
                    <i class="bi bi-exclamation-triangle display-4 mb-3"></i>
                    <h3 class="fw-bold mb-3">Already Active Elsewhere</h3>
                    <p class="mb-3">
                      You're currently checked in at 
                      <strong>{{ authStore.activeSession.location?.name || 'another location' }}</strong>
                    </p>
                    <p class="text-muted small mb-0">
                      You must check out from your current location before checking in here
                    </p>
                  </div>
                </div>

                <!-- Ready to check in -->
                <div v-else class="text-center py-4">
                  <div class="checkin-ready">
                    <div class="icon-placeholder mb-4">
                      <i class="bi bi-airplane-takeoff display-1 text-primary"></i>
                    </div>
                    
                    <h2 class="mb-3">Ready to Fly?</h2>
                    <p class="text-muted mb-4">
                      Start your flight session at {{ location.name }}
                    </p>
                    
                    <!-- QR token available -->
                    <div v-if="route.query.token" class="mb-4">
                      <div class="alert alert-info border-0 rounded-3 mb-4">
                        <i class="bi bi-qr-code-scan me-2"></i>
                        QR Code detected - Ready for check-in
                      </div>
                      
              <button
    v-if="canCheckIn"
    @click="handleCheckIn(route.query.token)"
>
    Start Flight Session
</button>

<div
    v-else
    class="alert alert-danger"
>
    This flying location is closed today.
</div>
                    </div>
                    
                    <!-- No QR token -->
                    <div v-else class="mb-4">
                      <div class="alert alert-secondary border-0 rounded-3 mb-4">
                        <i class="bi bi-qr-code me-2"></i>
                        Scan a QR code at the location to get started
                      </div>
                      
                      <button 
                        disabled 
                        class="btn btn-secondary btn-lg px-5 rounded-pill"
                      >
                        <i class="bi bi-qr-code me-2"></i>
                        Scan QR Code to Begin
                      </button>
                    </div>
                    
                    <p class="text-muted small mt-3">
                      Session will expire automatically after 2 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right column - Live airspace -->
         
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.location-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}


.card {
  border: none;
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.icon-placeholder {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 50%;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.active-pilots-list {
  max-height: 400px;
  overflow-y: auto;
}

.session-info {
  backdrop-filter: blur(10px);
}

.btn-primary {
  background-color: #0f6847;
  border-color: #0f6847;
}

.btn-primary:hover {
  background-color: #0a5034;
  border-color: #0a5034;
}

.rounded-4 {
  border-radius: 1rem;
}
</style>