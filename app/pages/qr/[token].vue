<template>
  <div class="qr-scan-page">
    <div class="container py-5">
      <div class="card shadow border-0 rounded-4 mb-4">
        <div class="card-body p-4 p-md-5 text-center">
          <div class="mb-4">
            <i class="bi bi-geo-alt-fill display-1 text-primary mb-3"></i>
            <h1 class="fw-bold">{{ location?.name || 'Loading Airspace...' }}</h1>
            <p class="lead text-muted">{{ location?.region || 'Verifying location...' }}</p>
          </div>

          <div class="row g-3 justify-content-center mb-4">
            <div class="col-6 col-md-3">
              <div class="p-3 border rounded-3 bg-white">
                <small class="text-muted d-block text-uppercase fw-bold x-small">Status</small>
                <span :class="['fw-bold', location?.status === 'cleared' ? 'text-success' : 'text-danger']">
                  {{ location?.status || '...' }}
                </span>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="p-3 border rounded-3 bg-white">
                <small class="text-muted d-block text-uppercase fw-bold x-small">Active Pilots</small>
                <span class="fw-bold text-primary">{{ activePilots.length }}</span>
              </div>
            </div>
          </div>

          <div v-if="authStore.isAuthenticated">
            <div v-if="isFlyingHere" class="active-session-zone">
              <div class="alert alert-success border-0 shadow-sm mb-4">
                <i class="bi bi-check-circle-fill me-2"></i> You are checked-in and active.
              </div>
              
              <div class="timer-card mb-4">
                <h2 class="display-4 fw-black text-primary mb-0">{{ timeLeft }}</h2>
                <small class="text-muted fw-bold">SESSION TIME REMAINING</small>
              </div>

              <button @click="handleCheckOut" class="btn btn-danger btn-lg px-5 rounded-pill shadow">
                <i class="bi bi-land-fill me-2"></i> Check-out & Land
              </button>
            </div>

            <div v-else-if="authStore.activeSession" class="alert alert-warning border-0 shadow-sm">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              You are currently active at <strong>{{ authStore.activeSession.location?.name }}</strong>. 
              Please check-out there before starting a new session.
            </div>

            <div v-else>
              <button @click="handleCheckIn" 
                      :disabled="location?.status !== 'cleared' || checkingIn"
                      class="btn btn-success btn-lg px-5 rounded-pill shadow">
                <span v-if="checkingIn" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-airplane-engines-fill me-2"></i>
                Start Flight Session
              </button>
            </div>
          </div>

          <div v-else class="py-3">
            <p class="text-muted mb-4">You must be logged in as a pilot to check-in.</p>
            <div class="d-flex gap-2 justify-content-center">
              <NuxtLink :to="`/login?redirect=${route.fullPath}`" class="btn btn-primary px-4 rounded-pill">Login</NuxtLink>
              <NuxtLink to="/register" class="btn btn-outline-primary px-4 rounded-pill">Register</NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="active-pilots-list mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3 px-2">
          <h4 class="fw-bold mb-0">
            <i class="bi bi-person-lines-fill me-2 text-primary"></i>Live Airspace
          </h4>
          <span class="badge bg-light text-dark border">{{ activePilots.length }} Pilots In Air</span>
        </div>

        <div v-if="activePilots.length" class="row g-3">
          <div v-for="session in activePilots" :key="session.id" class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm rounded-3 h-100">
              <div class="card-body d-flex align-items-center">
                <div class="pilot-avatar me-3">
                  <i class="bi bi-person-circle fs-2 text-primary"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="fw-bold mb-0">{{ session.pilot?.name }}</h6>
                  <small class="text-muted">License: {{ session.pilot?.pilot_profile?.license_number || 'Pending' }}</small>
                </div>
                <div class="status-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-5 bg-white rounded-4 border border-dashed">
          <i class="bi bi-cloud-sun display-4 text-muted mb-3 d-block"></i>
          <p class="text-muted mb-0">The airspace is currently empty. Safe for launch!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const location = ref(null)
const activePilots = ref([])
const checkingIn = ref(false)
const timeLeft = ref("02:00:00")
let timerInterval = null

// Fetch data on load
const fetchData = async () => {
  try {
    const res = await $fetch(`${config.public.apiBase}/qr/${route.params.token}`)
    location.value = res
    await fetchActivePilots()
  } catch (e) {
    console.error("Invalid QR Token")
  }
}

const fetchActivePilots = async () => {
  if (!location.value?.id) return
  try {
    const res = await $fetch(`${config.public.apiBase}/airspace-sessions/active`, {
      query: { location_id: location.value.id }
    })
    activePilots.value = res
  } catch (e) {
    console.error("Failed to load active pilots")
  }
}

const handleCheckIn = async () => {
  checkingIn.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/airspace-sessions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { token: route.params.token }
    })
    authStore.activeSession = res
    startTimer(res.expires_at)
    await fetchActivePilots()
  } catch (err) {
    alert(err.data?.message || "Check-in failed")
  } finally {
    checkingIn.value = false
  }
}

const handleCheckOut = async () => {
  if (!confirm('Are you sure you have landed and want to check-out?')) return
  try {
    await $fetch(`${config.public.apiBase}/airspace-sessions/${authStore.activeSession.id}/checkout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    authStore.activeSession = null
    clearInterval(timerInterval)
    await fetchActivePilots()
  } catch (e) {
    alert('Check-out failed')
  }
}

const startTimer = (expiry) => {
  if (timerInterval) clearInterval(timerInterval)
  const end = new Date(expiry).getTime()
  
  timerInterval = setInterval(() => {
    const diff = end - new Date().getTime()
    if (diff <= 0) {
      authStore.activeSession = null
      clearInterval(timerInterval)
      fetchActivePilots()
      return
    }
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
    timeLeft.value = `${h}:${m}:${s}`
  }, 1000)
}

const isFlyingHere = computed(() => {
  return authStore.activeSession?.flying_location_id === location.value?.id
})

onMounted(() => {
  fetchData()
  setInterval(fetchActivePilots, 30000) // Refresh pilot list every 30s
})

onUnmounted(() => clearInterval(timerInterval))
</script>

<style scoped>
.qr-scan-page {
  min-height: 100vh;
  background: #f4f7f6;
  font-family: 'Inter', sans-serif;
}
.fw-black { font-weight: 900; }
.x-small { font-size: 0.65rem; }
.timer-card {
  background: #e3f2fd;
  padding: 1.5rem;
  border-radius: 1.5rem;
  display: inline-block;
  border: 2px solid #2196f3;
}
.status-pulse {
  width: 12px;
  height: 12px;
  background: #198754;
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(25, 135, 84, 0.4);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
}
.border-dashed { border-style: dashed !important; border-width: 2px !important; }
</style>