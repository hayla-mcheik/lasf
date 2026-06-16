<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const route = useRoute()

console.log('Full Route Params:', route.params)
console.log('Slug Value:', route.params.slug)
console.log('ID Value:', route.params.id)
// Use production API
const API_BASE = 'https://lasf.info/api'
console.log('🌐 Using API Base:', API_BASE)

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

console.log('📍 Location data:', location.value)
console.log('📍 Location ID:', location.value?.id)

const activePilots = ref([])
const checkingIn = ref(false)
const fetchError = ref(null)
const loadingActivePilots = ref(false)

// Fix: Proper fetch function
// pages/location/[id].vue

async function fetchActivePilots() {
  if (!location.value?.id) return
  
  loadingActivePilots.value = true
  fetchError.value = null
  
  try {
    // 1. Ensure NO trailing slash unless Laravel requires it
    // 2. Use simple 'query' object
    const response = await $fetch(`${API_BASE}/airspace-sessions/active`, {
      method: 'GET',
      params: { location_id: location.value.id }, // $fetch uses 'params' for query strings
      // Remove custom headers for the GET request to avoid CORS preflight issues
      headers: {
        'Accept': 'application/json'
      },
      // Important for Nuxt: ignore the base URL if API_BASE is absolute
      baseURL: undefined 
    })
    
    // ... handle response ...
    if (response) {
       activePilots.value = Array.isArray(response) ? response : (response.data || [])
    }
  } catch (error) {
    console.error('❌ Fetch error:', error)
    fetchError.value = error
  } finally {
    loadingActivePilots.value = false
  }
}
watch(
  () => isFlyingHere.value,
  (active) => {
    if (active && !watchId) {
      startTracking()
    }
  },
  { immediate: true }
)
// Fix: Use onMounted properly
onMounted(async () => {

  console.log('🚀 Component mounted')
  console.log('🔗 Current URL:', window.location.href)
  console.log('🔗 Route query:', route.query)
  
  if (location.value) {
    console.log('📍 Location loaded:', location.value.name, '(ID:', location.value.id, ')')
    
    // Fetch active pilots
    await fetchActivePilots()
    
    // Set up polling with error handling
    let retryCount = 0
    const maxRetries = 3
    
    const pollInterval = setInterval(async () => {
      if (retryCount < maxRetries) {
        await fetchActivePilots()
        if (fetchError.value) {
          retryCount++
          console.log(`🔄 Retry ${retryCount}/${maxRetries}`)
        } else {
          retryCount = 0 // Reset on success
        }
      }
    }, 30000) // Poll every 30 seconds
    
    // Clean up interval
    onUnmounted(() => {
      clearInterval(pollInterval)
    })
    
    // Handle auto check-in if token exists
    const scanToken = route.query.token
    
    if (scanToken) {
      console.log('🔑 QR Token found:', scanToken)
      
      if (authStore.isAuthenticated) {
        console.log('👤 User authenticated, attempting auto check-in...')
        await handleAutoCheckIn(scanToken)
      } else {
        console.log('🔒 User not authenticated, redirecting to login...')
        const redirectUrl = `/login?redirect=${encodeURIComponent(route.fullPath)}`
        navigateTo(redirectUrl)
      }
    } else {
      console.log('❌ No QR token in URL')
    }
  } else {
    console.log('⚠️ Location data not available')
  }
})


// Fix: Auto check-in function
async function handleAutoCheckIn(token) {
  if (isFlyingHere.value) {
    console.log('✈️ User already flying here')
    return
  }
  
  if (!token) {
    console.log('⚠️ No token provided for check-in')
    return
  }
  
  checkingIn.value = true
  
  try {
    console.log('🔄 Sending check-in request...')
    
    const response = await $fetch(`${API_BASE}/airspace-sessions`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: token }),
      timeout: 15000,
      onRequest({ request, options }) {
        console.log('📤 Check-in request:', { token })
      }
    })
    
    console.log('✅ Check-in response:', response)
    
    // Update session in auth store
    if (response.data) {
      authStore.activeSession = response.data
    } else if (response) {
      authStore.activeSession = response
    }
    
    // Refresh active pilots list
    await fetchActivePilots()
    
    // Clean URL without token
    window.history.replaceState({}, '', route.path)
    
    // Show success message
    alert(`✅ Successfully checked in at ${location.value.name}!`)
    
  } catch (error) {
    console.error('❌ Check-in failed:', {
      message: error.message,
      status: error.status,
      data: error.data
    })
    
    let errorMessage = 'Check-in failed'
    
    if (error.status === 403) {
      errorMessage = error.data?.message || 'You are not authorized to check in'
    } else if (error.status === 401) {
      errorMessage = 'Please login again'
      authStore.logout()
      navigateTo('/login')
    } else if (error.message?.includes('Failed to fetch')) {
      errorMessage = 'Cannot connect to server. Please try again.'
    }
    
    alert(`❌ ${errorMessage}`)
    
  } finally {
    checkingIn.value = false
  }
}

// Fix: Compute if user is flying here
const isFlyingHere = computed(() => {
  const sessionLocationId = authStore.activeSession?.flying_location_id || 
                          authStore.activeSession?.location?.id
  const currentLocationId = location.value?.id
  
  const isHere = sessionLocationId === currentLocationId
  
  console.log('🛩️ Flying here check:', {
    sessionLocationId,
    currentLocationId,
    isHere,
    activeSession: authStore.activeSession
  })
  
  return isHere
})

let watchId = null

const startTracking = () => {

  if (!navigator.geolocation) {
    console.log('GPS not supported')
    return
  }

  watchId = navigator.geolocation.watchPosition(
    async (position) => {

      try {

        await $fetch(
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

      } catch (e) {
        console.error(e)
      }

    },
    (err) => {
      console.error(err)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }
  )
}
// Fix: Checkout function
async function handleCheckOut() {
  if (!authStore.activeSession || !confirm("Are you sure you want to check out?")) {
    return
  }
  if (watchId) {
  navigator.geolocation.clearWatch(watchId)
}
  try {
    const sessionId = authStore.activeSession.id
    
    console.log('🛬 Checking out session:', sessionId)
    
    await $fetch(`${API_BASE}/airspace-sessions/${sessionId}/checkout`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ Check-out successful')
    
    // Clear session from auth store
    authStore.activeSession = null
    
    // Refresh active pilots
    await fetchActivePilots()
    
    alert('✅ Successfully checked out!')
    
  } catch (error) {
    console.error('❌ Check-out error:', error)
    alert('Failed to check out. Please try again.')
  }
}
onUnmounted(() => {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId)
  }
})

function formatTime(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    // 1. Force the string to be treated as UTC if it doesn't have a 'Z' or offset
    // This ensures JavaScript knows it's coming from the server's UTC clock
    const date = new Date(dateString.includes('Z') ? dateString : dateString + 'Z');

    // 2. Format to the user's locale (this automatically converts UTC to Beirut time)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid time';
  }
}

// Refresh function for manual refresh
async function refreshData() {
  await Promise.all([
    refreshLocation(),
    fetchActivePilots()
  ])
}
</script>

<template>
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
              <h1 class="display-5 fw-bold mb-5 text-white">{{ location.name }}</h1>
              <div class="d-flex align-items-center gap-3">
                <span class="badge bg-light text-dark">{{ location.type }}</span>
                <!-- <span class="text-muted">
                  <i class="bi bi-geo-alt me-1"></i>
                  ID: {{ location.id }}
                </span> -->
              </div>
            </div>
            <div class="col-md-4 text-md-end">
              <div class="location-stats">
                <div class="fw-bold fs-4">{{ activePilots.length }}</div>
                <div class="text-muted">Active Pilots</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="container py-5">
        <div class="row g-4">
          <!-- Left column - Check-in/Check-out -->
          <div class="col-lg-8">
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
                        @click="handleAutoCheckIn(route.query.token)" 
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
          <div class="col-lg-4">
            <div class="card shadow border-0 rounded-4 h-100">
              <div class="card-header bg-white border-0 pt-4 pb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h4 class="fw-bold mb-0">
                    <i class="bi bi-people-fill text-primary me-2"></i>
                    Live Airspace
                  </h4>
                  
                  <div class="d-flex align-items-center">
                    <span class="badge bg-primary rounded-pill px-3 py-2 me-2">
                      {{ activePilots.length }}
                    </span>
                    
                    <button 
                      @click="fetchActivePilots" 
                      :disabled="loadingActivePilots"
                      class="btn btn-sm btn-outline-primary"
                      title="Refresh"
                    >
                      <i v-if="loadingActivePilots" class="bi bi-arrow-clockwise spin"></i>
                      <i v-else class="bi bi-arrow-clockwise"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="card-body p-0">
                <!-- Loading state -->
                <div v-if="loadingActivePilots" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2 text-muted">Updating airspace...</p>
                </div>
                
                <!-- Error state -->
                <div v-else-if="fetchError" class="text-center py-5">
                  <i class="bi bi-wifi-off display-4 text-muted mb-3"></i>
                  <p class="text-muted">Unable to load airspace data</p>
                  <button @click="fetchActivePilots" class="btn btn-sm btn-outline-primary">
                    Try Again
                  </button>
                </div>
                
                <!-- Empty state -->
                <div v-else-if="activePilots.length === 0" class="text-center py-5">
                  <i class="bi bi-people display-4 text-muted mb-3"></i>
                  <h5 class="fw-bold">Airspace is Clear</h5>
                  <p class="text-muted small">No pilots currently active</p>
                </div>
                
                <!-- Active pilots list -->
                <div v-else class="active-pilots-list">
                  <div class="list-group list-group-flush">
                    <div 
                      v-for="session in activePilots" 
                      :key="session.id" 
                      class="list-group-item border-0 py-3 px-4"
                    >
                      <div class="d-flex align-items-center">
                        <div class="pilot-avatar me-3">
                          <i class="bi bi-person-circle fs-2 text-primary"></i>
                        </div>
                        
                        <div class="flex-grow-1">
                          <div class="fw-bold mb-1">
                            {{ session.pilot?.name || 'Unknown Pilot' }}
                          </div>
                          
                          <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                              <i class="bi bi-clock me-1"></i>
                              {{ formatTime(session.checked_in_at) }}  
                            </small>
                            
                            <span class="badge bg-success bg-opacity-10 text-success small">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card-footer bg-white border-0 py-3">
                <div class="text-center small text-muted">
                  <i class="bi bi-info-circle me-1"></i>
                  Updates automatically every 30 seconds
                </div>
              </div>
            </div>
          </div>
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.debug-panel {
  background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
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