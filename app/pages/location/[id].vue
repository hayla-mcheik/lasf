<script setup>
const authStore = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()

const API_BASE = config.public.apiBase
const activePilots = ref([])
const checkingIn = ref(false)
let pollInterval = null

// 1. Fetch Location Data
const { data: location, pending } = await useFetch(
  () => `${API_BASE}/flying-locations/${route.params.slug || route.params.id}`, 
  { transform: (res) => res.data || res }
)

// 2. Lifecycle Cleanup
onUnmounted(() => { if (pollInterval) clearInterval(pollInterval) })

// 3. Logic Functions
async function fetchActivePilots() {
  if (!location.value?.id) return
  activePilots.value = await $fetch(`${API_BASE}/airspace-sessions/active`, {
    params: { location_id: location.value.id }
  })
}

async function handleCheckIn() {
  if (!route.query.token) return alert("Please scan a QR code to check in.")
  checkingIn.value = true
  try {
    const res = await $fetch(`${API_BASE}/airspace-sessions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: { token: route.query.token }
    })
    authStore.activeSession = res
    await fetchActivePilots()
    window.history.replaceState({}, '', route.path) // Clear token from URL
  } catch (e) {
    alert(e.data?.message || "Check-in failed")
  } finally {
    checkingIn.value = false
  }
}

async function handleCheckOut() {
  if (!authStore.activeSession?.id || !confirm("Confirm you have landed?")) return
  try {
    await $fetch(`${API_BASE}/airspace-sessions/${authStore.activeSession.id}/checkout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    authStore.activeSession = null
    await fetchActivePilots()
  } catch (e) {
    alert("Checkout failed. Please try again.")
  }
}

// 4. Computed State
const isFlyingHere = computed(() => {
  if (!authStore.activeSession || !location.value) return false
  const sessionLocId = authStore.activeSession.flying_location_id || authStore.activeSession.location?.id
  return Number(sessionLocId) === Number(location.value.id)
})

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  if (location.value) {
    await fetchActivePilots()
    pollInterval = setInterval(fetchActivePilots, 30000)
    
    // Auto-trigger check-in if token is present
    if (route.query.token && authStore.isAuthenticated) {
      handleCheckIn()
    }
  }
})
</script>

<template>
  <div class="location-page py-5">
    <div v-if="location" class="container">
      <div class="row g-4">
        
        <div class="col-lg-8">
          <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div class="card-header bg-dark text-white p-4">
              <h1 class="h3 mb-1">{{ location.name }}</h1>
              <span class="badge bg-primary text-uppercase">{{ location.type }}</span>
            </div>

            <div class="card-body p-5 text-center">
              
              <div v-if="isFlyingHere" class="py-4">
                <div class="status-icon mb-4">
                  <i class="bi bi-airplane-engines-fill display-1 text-success pulse"></i>
                </div>
                <h2 class="fw-bold">You are in the Air!</h2>
                <p class="text-muted">Checked in at: {{ formatTime(authStore.activeSession.checked_in_at) }}</p>
                <button @click="handleCheckOut" class="btn btn-danger btn-xl rounded-pill px-5 shadow">
                  <i class="bi bi-box-arrow-right me-2"></i> Confirm Landing (Checkout)
                </button>
              </div>

              <div v-else-if="authStore.isAuthenticated && route.query.token" class="py-4">
                <i class="bi bi-qr-code-scan display-1 text-primary mb-4"></i>
                <h2>QR Code Recognized</h2>
                <p>Click below to begin your flight session at {{ location.name }}.</p>
                <button @click="handleCheckIn" :disabled="checkingIn" class="btn btn-success btn-xl rounded-pill px-5 shadow">
                  <span v-if="checkingIn" class="spinner-border spinner-border-sm me-2"></span>
                  Start Flight Session
                </button>
              </div>

              <div v-else-if="authStore.isAuthenticated && authStore.activeSession" class="py-4">
                <div class="alert alert-warning border-0 shadow-sm rounded-4 p-4">
                  <i class="bi bi-exclamation-triangle-fill fs-1 mb-3 d-block"></i>
                  <h4>Active at Another Location</h4>
                  <p>You are currently checked in at <strong>{{ authStore.activeSession.location?.name || 'another site' }}</strong>.</p>
                  <p class="small mb-0">You must check out from your previous location before starting a new session here.</p>
                </div>
              </div>

              <div v-else-if="!authStore.isAuthenticated" class="py-4">
                <i class="bi bi-person-lock display-1 text-muted mb-4"></i>
                <h4>Pilot Identification Required</h4>
                <p>Please log in to register your flight in the Lebanon Airspace System.</p>
                <NuxtLink :to="`/login?redirect=${route.fullPath}`" class="btn btn-primary btn-lg rounded-pill px-5">
                  Log in to System
                </NuxtLink>
              </div>

              <div v-else class="py-4">
                <i class="bi bi-upc-scan display-1 text-muted mb-4"></i>
                <h4>Ready to Fly?</h4>
                <p>Scan the official QR code located at the takeoff point to start your session.</p>
              </div>

            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card shadow-sm border-0 rounded-4 h-100">
            <div class="card-header bg-white border-bottom py-3">
              <h5 class="mb-0 fw-bold"><i class="bi bi-people-fill text-primary me-2"></i>Live Airspace</h5>
            </div>
            <div class="card-body p-0">
              <ul class="list-group list-group-flush">
                <li v-if="activePilots.length === 0" class="list-group-item text-center py-5 text-muted">
                  <i class="bi bi-wind display-4 d-block mb-3 opacity-25"></i>
                  Airspace is clear
                </li>
                <li v-for="session in activePilots" :key="session.id" class="list-group-item p-3">
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary-subtle text-primary rounded-circle p-2 me-3">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div>
                      <div class="fw-bold">{{ session.pilot?.name }}</div>
                      <small class="text-muted">In: {{ formatTime(session.checked_in_at) }}</small>
                    </div>
                    <div class="ms-auto">
                      <span class="badge bg-success-subtle text-success rounded-pill">Flying</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="card-footer bg-light border-0 py-3 text-center">
              <small class="text-muted">Updates automatically every 30s</small>
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