<script setup>
import { useAuthStore } from '~/stores/auth'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Breadcrumbs from '~/components/Frontend/Breadcrumbs.vue'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const route = useRoute()

const API_BASE = 'https://lasf.info/api'

const {
  data: location,
  pending,
  error: locationError,
  refresh: refreshLocation
} = await useFetch(
  () => `${API_BASE}/flying-locations/${route.params.slug || route.params.id}`,
  {
    key: `location-${route.params.slug || route.params.id}`,
    immediate: true,
    transform: (res) => res.data || res,
  }
)

const checkingIn = ref(false)

onMounted(() => {

  console.log('Component Loaded')

  if (!location.value)
    return

  console.log('Location:', location.value.name)

  // NO AUTO CHECK-IN ANYMORE

})

const isFlyingHere = computed(() => {

  const sessionLocationId =
    authStore.activeSession?.flying_location_id ||
    authStore.activeSession?.location?.id

  return sessionLocationId === location.value?.id

})

async function handleCheckIn(token) {

  if (!token) {
    alert('QR token missing.')
    return
  }

  if (isFlyingHere.value) {
    alert('You are already flying here.')
    return
  }

  checkingIn.value = true

  try {

    const session = await $fetch(`${API_BASE}/airspace-sessions`, {

      method: 'POST',

      headers: {
        Authorization: `Bearer ${authStore.token}`
      },

      body: {
        token
      }

    })

    authStore.activeSession = session

    // remove token from url
    window.history.replaceState({}, '', `/location/${location.value.slug}`)

    alert('Successfully checked in.')

    navigateTo(`/location/${location.value.slug}`)

  } catch (error) {

    console.error(error)

    alert(error?.data?.message || 'Check-in failed.')

  } finally {

    checkingIn.value = false

  }

}

let watchId = null

watch(

  () => isFlyingHere.value,

  (active) => {

    if (active && !watchId) {

      startTracking()

    }

  },

  {
    immediate: true
  }

)

function startTracking() {

  if (!process.client)
    return

  if (!navigator.geolocation)
    return

  watchId = navigator.geolocation.watchPosition(

    async (position) => {

      try {

        await $fetch(`${config.public.apiBase}/gps/update`, {

          method: 'POST',

          headers: {
            Authorization: `Bearer ${authStore.token}`
          },

          body: {

            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy

          }

        })

      } catch (e) {

        console.error(e)

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

async function handleCheckOut() {

  if (!authStore.activeSession)
    return

  if (!confirm('Are you sure you landed?'))
    return

  try {

    const sessionId = authStore.activeSession.id

    const response = await $fetch(

      `${API_BASE}/airspace-sessions/${sessionId}/checkout`,

      {

        method: 'POST',

        headers: {

          Authorization: `Bearer ${authStore.token}`

        }

      }

    )

    console.log(response)

    if (watchId) {

      navigator.geolocation.clearWatch(watchId)

      watchId = null

    }

    authStore.activeSession = null

    alert('Successfully checked out.')

  } catch (error) {

    console.error(error)

    alert(error?.data?.message || 'Checkout failed.')

  }

}

onUnmounted(() => {

  if (watchId) {

    navigator.geolocation.clearWatch(watchId)

  }

})

function formatTime(dateString) {

  if (!dateString)
    return 'N/A'

  const date = new Date(
    dateString.includes('Z')
      ? dateString
      : dateString + 'Z'
  )

  return date.toLocaleTimeString('en-US', {

    hour: '2-digit',
    minute: '2-digit',
    hour12: true

  })

}

async function refreshData() {

  await refreshLocation()

}
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
      <div class="location-header py-5 bg-dark text-white">
        <div class="container">
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
                <div v-else-if="isFlyingHere" class="text-center py-4">
                  <div class="alert alert-success border-0 rounded-3">
                    <div class="d-flex align-items-center justify-content-center mb-3">
                      <i class="bi bi-airplane-fill display-4 me-3"></i>
                      <div class="text-start">
                        <h3 class="fw-bold mb-1">You're Flying!</h3>
                        <p class="mb-0">Active at {{ location.name }}</p>
                      </div>
                    </div>
                    
                    <div class="session-info bg-white bg-opacity-25 rounded-2 p-3 mb-4">
                      <div class="row text-center">
                        <div class="col">
                          <div class="fw-bold">Checked In</div>
                          <div class="text-muted small">
                            {{ formatTime(authStore.activeSession?.checked_in_at) }}
                          </div>
                        </div>
                        <div class="col">
                          <div class="fw-bold">Expires</div>
                          <div class="text-muted small">
                            {{ formatTime(authStore.activeSession?.expires_at) }}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      @click="handleCheckOut" 
                      class="btn btn-danger btn-lg px-5 rounded-pill"
                    >
                      <i class="bi bi-box-arrow-right me-2"></i>
                      Confirm Landing
                    </button>
                    
                    <p class="mt-3 text-muted small">
                      Click when you've landed to free up the airspace
                    </p>
                  </div>
                </div>

                <!-- Flying elsewhere -->
                <div v-else-if="authStore.activeSession" class="text-center py-4">
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
                        @click="handleCheckIn(route.query.token)" 
                        class="btn btn-success btn-lg px-5 rounded-pill shadow"
                      >
                        <i class="bi bi-check-circle me-2"></i>
                        Start Flight Session
                      </button>
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

.location-header {
  background: white;
}

.debug-panel {
  background: white;
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