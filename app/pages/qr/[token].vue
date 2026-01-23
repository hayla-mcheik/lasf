<!-- pages/qr/[token].vue -->
<template>
  <div class="qr-scan-page">
    <div class="container py-5">
      <!-- Pilot Check-in Status -->
      <div v-if="authStore.isAuthenticated" class="card shadow border-0 rounded-4 mb-4">
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <i class="bi bi-airplane-engines display-1 text-primary mb-3"></i>
            <h2 class="fw-bold">Check-in at {{ location?.name }}</h2>
            <p class="text-muted">{{ location?.region }}</p>
          </div>
          
          <!-- If pilot is already checked in here -->
          <div v-if="isFlyingHere" class="active-session">
            <div class="alert alert-success mb-4">
              <i class="bi bi-check-circle-fill me-2"></i>
              You are already checked in at this location
            </div>
            
            <!-- Timer display -->
            <div class="timer-display text-center mb-4">
              <h3 class="text-primary fw-bold mb-2">{{ timeLeft }}</h3>
              <p class="text-muted">Remaining flight time</p>
            </div>
            
            <!-- Active pilots list -->
            <div class="active-pilots mb-4">
              <h5 class="fw-bold mb-3">
                <i class="bi bi-people me-2"></i>
                Pilots in this Airspace ({{ activePilots.length }})
              </h5>
              <div class="list-group">
                <div v-for="pilot in activePilots" :key="pilot.id" 
                     class="list-group-item d-flex align-items-center">
                  <i class="bi bi-person-circle fs-4 me-3 text-primary"></i>
                  <div class="flex-grow-1">
                    <span class="fw-bold">{{ pilot.pilot?.name }}</span>
                    <small class="text-muted d-block">
                      License: {{ pilot.pilot?.pilot_profile?.license_number }}
                    </small>
                  </div>
                  <span v-if="pilot.pilot_id === authStore.user?.id" 
                        class="badge bg-success">You</span>
                </div>
              </div>
            </div>
            
            <!-- Checkout button -->
            <div class="text-center">
              <button @click="handleCheckOut" class="btn btn-danger btn-lg px-5 rounded-pill">
                <i class="bi bi-land-fill me-2"></i> Check-out & Land
              </button>
            </div>
          </div>
          
          <!-- If pilot is not checked in anywhere -->
          <div v-else-if="!authStore.isPilotFlying" class="not-checked-in">
            <div class="alert alert-info mb-4">
              <i class="bi bi-info-circle me-2"></i>
              You can check-in to start your flight session
            </div>
            
            <!-- Location details -->
            <div class="location-details mb-4">
              <div class="row">
                <div class="col-md-6">
                  <p><i class="bi bi-geo-alt me-2"></i> {{ location?.name }}</p>
                  <p><i class="bi bi-map me-2"></i> {{ location?.region }}</p>
                </div>
                <div class="col-md-6">
                  <p><i class="bi bi-wind me-2"></i> Status: 
                    <span :class="`badge bg-${location?.status === 'cleared' ? 'success' : 'danger'}`">
                      {{ location?.status }}
                    </span>
                  </p>
                  <p><i class="bi bi-person me-2"></i> Active pilots: {{ activePilots.length }}</p>
                </div>
              </div>
            </div>
            
            <!-- Check-in button -->
            <div class="text-center">
              <button @click="handleCheckIn" 
                      :disabled="location?.status !== 'cleared'"
                      class="btn btn-success btn-lg px-5 rounded-pill">
                <i class="bi bi-airplane-engines me-2"></i> Check-in Now
              </button>
              <p v-if="location?.status !== 'cleared'" class="text-danger mt-2">
                <i class="bi bi-exclamation-triangle me-1"></i>
                This location is currently {{ location?.status }}
              </p>
            </div>
          </div>
          
          <!-- If pilot is checked in at another location -->
          <div v-else class="already-flying">
            <div class="alert alert-warning mb-4">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              You are already flying at another location
            </div>
            
            <div class="current-session-info text-center">
              <i class="bi bi-airplane-fill display-4 text-primary mb-3"></i>
              <h5>Currently flying at: {{ authStore.activeSession?.location?.name }}</h5>
              <p class="text-muted">You must check-out from your current location first</p>
              
              <button @click="navigateToCurrentLocation" 
                      class="btn btn-outline-primary mt-3">
                <i class="bi bi-arrow-right-circle me-2"></i>
                Go to Current Location
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Login Required -->
      <div v-else class="text-center py-5">
        <div class="card shadow border-0 rounded-4 p-5">
          <i class="bi bi-person-lock display-1 text-muted mb-3"></i>
          <h3 class="fw-bold mb-3">Login Required</h3>
          <p class="text-muted mb-4">
            You need to login as a pilot to check-in at this flying location
          </p>
          
          <div class="d-flex gap-3 justify-content-center">
            <NuxtLink to="/login" class="btn btn-primary btn-lg px-4 rounded-pill">
              <i class="bi bi-box-arrow-in-right me-2"></i> Login
            </NuxtLink>
            <NuxtLink to="/register" class="btn btn-outline-primary btn-lg px-4 rounded-pill">
              <i class="bi bi-person-plus me-2"></i> Register
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const location = ref(null)
const activePilots = ref([])
const timeLeft = ref("02:00:00")
let timer = null

// Fetch location by QR token
const fetchLocation = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/qr/${route.params.token}`)
    location.value = response
    await fetchActivePilots()
  } catch (error) {
    console.error('Error fetching location:', error)
  }
}

// Fetch active pilots in this location
const fetchActivePilots = async () => {
  if (!location.value?.id) return
  try {
    const res = await $fetch(`${config.public.apiBase}/airspace-sessions/active`, {
      query: { location_id: location.value.id }
    })
    activePilots.value = res
  } catch (error) {
    console.error('Error loading pilots:', error)
  }
}

// Handle check-in
const handleCheckIn = async () => {
  if (!location.value?.id) return
  
  try {
    const response = await $fetch(`${config.public.apiBase}/airspace-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: {
        token: route.params.token
      }
    })
    
    authStore.activeSession = response
    startTimer(response.expires_at)
    await fetchActivePilots()
    
    alert('Successfully checked in!')
  } catch (error) {
    alert(error.data?.message || 'Check-in failed')
  }
}

// Handle check-out
const handleCheckOut = async () => {
  if (!confirm('Are you sure you want to check-out?')) return
  
  try {
    await $fetch(`${config.public.apiBase}/airspace-sessions/${authStore.activeSession.id}/checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    authStore.activeSession = null
    clearInterval(timer)
    await fetchActivePilots()
    
    alert('Successfully checked out!')
  } catch (error) {
    alert('Check-out failed')
  }
}

// Start timer for active session
const startTimer = (expiry) => {
  if (timer) clearInterval(timer)
  const end = new Date(expiry).getTime()
  
  timer = setInterval(() => {
    const diff = end - new Date().getTime()
    if (diff <= 0) {
      authStore.activeSession = null
      clearInterval(timer)
      fetchActivePilots()
      return
    }
    
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
    timeLeft.value = `${h}:${m}:${s}`
  }, 1000)
}

// Check if pilot is flying at this location
const isFlyingHere = computed(() => {
  return authStore.activeSession?.flying_location_id === location.value?.id
})

// Navigate to current location
const navigateToCurrentLocation = () => {
  if (authStore.activeSession?.location?.slug) {
    navigateTo(`/locations/${authStore.activeSession.location.slug}`)
  }
}

// Auto-refresh active pilots
onMounted(() => {
  fetchLocation()
  const interval = setInterval(fetchActivePilots, 30000) // Refresh every 30 seconds
  onUnmounted(() => clearInterval(interval))
})

// Cleanup timer on unmount
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.qr-scan-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.timer-display {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 2rem;
  border-radius: 20px;
  border: 3px solid #2196f3;
}

.timer-display h3 {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 2px;
}

.active-pilots .list-group-item {
  border-left: 4px solid #2196f3;
  margin-bottom: 8px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.active-pilots .list-group-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.location-details p {
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 10px;
}

.btn-lg {
  padding: 15px 30px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-lg:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
</style>