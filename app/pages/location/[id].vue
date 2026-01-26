<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const route = useRoute()

// 1. Fetch Location Details
const { data: location, pending } = await useFetch(`${config.public.apiBase}/flying-locations/${route.params.id}`, {
  key: `location-detail-${route.params.id}`,
  transform: (res) => res.data || res
})

const activePilots = ref([])
const checkingIn = ref(false)

// pages/location/[id].vue

async function fetchActivePilots() {
  if (!location.value?.id) return
  try {
    // Explicitly use 'query' instead of 'params' to ensure Nuxt builds the URL correctly
    const res = await $fetch(`${config.public.apiBase}/airspace-sessions/active`, {
      method: 'GET',
      query: { location_id: location.value.id } 
    })
    activePilots.value = res
  } catch (e) {
    // This logs if the server is down or route is still returning 401/404
    console.error("Airspace update failed:", e)
  }
}

// AUTO-CHECKIN LOGIC
onMounted(async () => {
  if (location.value) {
    await fetchActivePilots()
    
    // 1. Get the token from the URL if it exists (?token=xyz)
    const scanToken = route.query.token
    
    if (scanToken) {
      if (authStore.isAuthenticated) {
        // 2. User is logged in -> Auto Check-in
        await handleAutoCheckIn(scanToken)
      } else {
        // 3. User NOT logged in -> Redirect to login
        // We encode the full path so the token stays in the URL after login
        const currentPathWithToken = route.fullPath 
        navigateTo(`/login?redirect=${encodeURIComponent(currentPathWithToken)}`)
      }
    }
  }
})

async function handleAutoCheckIn(token) {
  if (isFlyingHere.value) return 
  checkingIn.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/airspace-sessions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { token: token }
    })
    authStore.activeSession = res
    await fetchActivePilots()
    
    // Clean up the URL so refreshing doesn't re-run the check-in
    window.history.replaceState({}, '', route.path)
    
    alert(`Success! You are now checked-in at ${location.value.name}`)
  } catch (e) {
    console.warn("Auto-checkin failed:", e.data?.message)
  } finally {
    checkingIn.value = false
  }
}

const isFlyingHere = computed(() => {
  return authStore.activeSession?.flying_location_id === location.value?.id
})

async function handleCheckOut() {
  if (!authStore.activeSession || !confirm("Confirm landing?")) return
  try {
    await $fetch(`${config.public.apiBase}/airspace-sessions/${authStore.activeSession.id}/checkout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    authStore.activeSession = null
    await fetchActivePilots()
  } catch (e) {
    alert("Checkout error.")
  }
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="location-page">
    <div v-if="location" class="py-5 bg-dark text-white text-center shadow-sm">
      <div class="container d-flex justify-content-between align-items-center">
        <div class="text-start">
          <h1 class="display-4 fw-bold mb-0">{{ location.name }}</h1>
          <p class="lead mb-0">Airspace Status: 
            <span :class="location.status === 'cleared' ? 'text-success' : 'text-danger'">
              {{ location.status?.toUpperCase() }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class="container py-5" v-if="location">
      <div class="row">
        <div class="col-lg-8">
          <div v-if="checkingIn" class="card shadow border-0 p-5 text-center rounded-4 mb-4">
             <div class="spinner-border text-success mb-3"></div>
             <h3>Verifying your arrival...</h3>
          </div>

          <div v-else-if="!authStore.isAuthenticated" class="card shadow border-0 p-5 text-center rounded-4">
            <i class="bi bi-person-lock display-1 text-muted mb-3"></i>
            <h3>Login Required</h3>
            <p>Please log in to check-in to this airspace.</p>
            <button @click="navigateTo(`/login?redirect=${route.fullPath}`)" class="btn btn-primary btn-lg rounded-pill px-5">
              Login Now
            </button>
          </div>

          <div v-else class="card shadow border-0 p-5 text-center rounded-4">
            <div v-if="isFlyingHere">
              <div class="alert alert-success py-4">
                <h4 class="fw-bold mb-2"><i class="bi bi-airplane-fill me-2"></i> You are Active!</h4>
                <p class="mb-0">Session expires in 2 hours.</p>
              </div>
              <button @click="handleCheckOut" class="btn btn-danger btn-lg mt-4 px-5 rounded-pill shadow">
                Confirm Landing
              </button>
            </div>

            <div v-else-if="authStore.activeSession" class="alert alert-warning p-4">
              <h4 class="fw-bold">Already Active Elsewhere</h4>
              <p>You are checked in at <strong>{{ authStore.activeSession.location?.name }}</strong>.</p>
            </div>

            <div v-else>
              <h3 class="mb-4">Ready to Fly?</h3>
              <p class="text-muted">Click below to start your flight session at {{ location.name }}.</p>
              <button @click="handleAutoCheckIn(route.query.token)" class="btn btn-success btn-lg px-5 rounded-pill shadow">
                Start Session
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card shadow border-0 rounded-4">
            <div class="card-header bg-white fw-bold py-3 border-bottom d-flex justify-content-between align-items-center">
              <span>Live Airspace</span>
              <span class="badge bg-primary">{{ activePilots.length }} Pilots</span>
            </div>
            <ul class="list-group list-group-flush">
              <li v-for="p in activePilots" :key="p.id" class="list-group-item d-flex align-items-center py-3">
                <i class="bi bi-person-circle fs-3 text-primary me-3"></i>
                <div>
                  <span class="fw-bold d-block">{{ p.pilot?.name }}</span>
                  <small class="text-muted">{{ formatTime(p.checked_in_at) }}</small>
                </div>
              </li>
              <li v-if="activePilots.length === 0" class="list-group-item text-center py-5 text-muted">
                Airspace is empty.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.qr-container img {
  width: 250px;
  height: 250px;
  display: block;
}

.location-page {
  min-height: 80vh;
}
.btn-primary{
    background-color: #0f6847 !important;
    border-radius: 0px;
    padding: 10px 15px;
    width: 50%;
    margin: auto;
}
</style>