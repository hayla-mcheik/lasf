<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const API_BASE = 'https://lasf.info/api'

// --- 1. Fetch Location Data ---
// Works for both /location/11 and /location/albarok
const { data: location, pending, error: locationError } = await useFetch(
  () => `${API_BASE}/flying-locations/${route.params.slug || route.params.id}`, 
  {
    key: `location-${route.params.slug || route.params.id}`,
    transform: (res) => res.data || res,
  }
)

const activePilots = ref([])
const checkingIn = ref(false)
const fetchError = ref(null)
const loadingActivePilots = ref(false)
let pollInterval = null

// --- 2. Lifecycle Hooks (Register first!) ---
onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

// --- 3. Logic Functions ---
async function fetchActivePilots() {
  if (!location.value?.id) return
  loadingActivePilots.value = true
  try {
    const response = await $fetch(`${API_BASE}/airspace-sessions/active`, {
      params: { location_id: location.value.id }
    })
    activePilots.value = response
  } catch (error) {
    fetchError.value = error
  } finally {
    loadingActivePilots.value = false
  }
}

async function handleCheckIn(token) {
  if (isFlyingHere.value || !token) return
  checkingIn.value = true
  try {
    const response = await $fetch(`${API_BASE}/airspace-sessions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: { token: token }
    })
    authStore.activeSession = response
    await fetchActivePilots()
    // Clean URL
    window.history.replaceState({}, '', route.path)
    alert(`✅ Check-in successful! Fly safe.`)
  } catch (error) {
    alert(`❌ ${error.data?.message || 'Check-in failed'}`)
  } finally {
    checkingIn.value = false
  }
}

async function handleCheckOut() {
  if (!authStore.activeSession || !confirm("Confirm your landing?")) return
  try {
    await $fetch(`${API_BASE}/airspace-sessions/${authStore.activeSession.id}/checkout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    authStore.activeSession = null
    await fetchActivePilots()
  } catch (error) {
    alert('Check-out failed.')
  }
}

const isFlyingHere = computed(() => {
  if (!authStore.activeSession || !location.value) return false
  const sessionLocId = authStore.activeSession.flying_location_id || authStore.activeSession.location?.id
  return Number(sessionLocId) === Number(location.value.id)
})

function formatTime(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// --- 4. Initialization ---
onMounted(async () => {
  if (location.value) {
    await fetchActivePilots()
    pollInterval = setInterval(fetchActivePilots, 30000)

    // Auto Check-in logic if token is in URL
    const token = route.query.token
    if (token) {
      if (!authStore.isAuthenticated) {
        navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
      } else if (authStore.user?.pilot_profile || authStore.user?.pilotProfile) {
         await handleCheckIn(token)
      }
    }
  }
})
</script>

<template>
  <div class="location-page">
    <div v-if="pending" class="text-center py-10">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="location" class="container py-5">
      <div class="row">
        <div class="col-lg-8">
          <div class="card shadow rounded-4 mb-4 overflow-hidden">
            <div class="bg-dark text-white p-4">
               <h1 class="h3 mb-1">{{ location.name }}</h1>
               <span class="badge bg-primary">{{ location.type }}</span>
            </div>
            
            <div class="card-body p-4 text-center">
              <div v-if="checkingIn">
                 <div class="spinner-grow text-success mb-3"></div>
                 <h4>Processing your entry...</h4>
              </div>

              <div v-else-if="isFlyingHere" class="py-4">
                 <div class="alert alert-success d-inline-block px-5">
                    <i class="bi bi-airplane-engines fs-1"></i>
                    <h3 class="mt-3">You are Active!</h3>
                    <p>Checked in at {{ formatTime(authStore.activeSession.checked_in_at) }}</p>
                    <button @click="handleCheckOut" class="btn btn-danger btn-lg rounded-pill px-5">
                        Confirm Landing (Check-out)
                    </button>
                 </div>
              </div>

              <div v-else-if="authStore.isAuthenticated && authStore.activeSession" class="py-4">
                 <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle fs-2"></i>
                    <p class="mb-0">You are currently checked in at <b>{{ authStore.activeSession.location?.name }}</b>.</p>
                    <p class="small">Please check out from there before flying here.</p>
                 </div>
              </div>

              <div v-else-if="authStore.isAuthenticated" class="py-4 text-center">
                 <div v-if="route.query.token">
                    <i class="bi bi-qr-code-scan display-1 text-primary"></i>
                    <h2 class="mt-3">Ready to Fly?</h2>
                    <button @click="handleCheckIn(route.query.token)" class="btn btn-success btn-xl px-5 rounded-pill shadow">
                        Start Flight Session
                    </button>
                 </div>
                 <div v-else class="text-muted">
                    <i class="bi bi-upc-scan fs-1"></i>
                    <p>Scan the QR code at the takeoff to start your session.</p>
                 </div>
              </div>

              <div v-else class="py-4">
                 <i class="bi bi-person-lock display-3 text-muted"></i>
                 <h4 class="mt-3">Pilot Login Required</h4>
                 <p>Log in to register your flight session in this airspace.</p>
                 <button @click="navigateTo(`/login?redirect=${route.fullPath}`)" class="btn btn-primary rounded-pill px-5">
                    Login / Register
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card shadow-sm border-0 rounded-4">
            <div class="card-header bg-white py-3 border-0">
               <h5 class="mb-0 fw-bold"><i class="bi bi-people me-2"></i>Live Airspace</h5>
            </div>
            <div class="list-group list-group-flush">
              <div v-if="activePilots.length === 0" class="p-5 text-center text-muted">
                 <p>Airspace is currently empty.</p>
              </div>
              <div v-for="pilotSession in activePilots" :key="pilotSession.id" class="list-group-item d-flex align-items-center py-3">
                 <div class="rounded-circle bg-primary-subtle p-2 me-3">
                    <i class="bi bi-person text-primary"></i>
                 </div>
                 <div>
                    <div class="fw-bold">{{ pilotSession.pilot?.name }}</div>
                    <small class="text-muted">In: {{ formatTime(pilotSession.checked_in_at) }}</small>
                 </div>
                 <div class="ms-auto">
                    <span class="badge rounded-pill bg-success-subtle text-success">Flying</span>
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