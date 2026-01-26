<template>
  <div class="location-page">
    <div v-if="pending && !location" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Loading airspace data...</p>
    </div>

    <template v-else-if="location">
      <div class="py-5 bg-dark text-white text-center shadow-sm">
        <div class="container d-flex justify-content-between align-items-center">
          <div class="text-start">
            <h1 class="display-4 fw-bold mb-0">{{ location?.name }}</h1>
            <p class="lead mb-0">Status: 
              <span :class="location?.status === 'cleared' ? 'text-success' : 'text-danger'">
                {{ location?.status }}
              </span>
            </p>
          </div>
          <div v-if="authStore.isAuthenticated" class="d-flex gap-2">
            <button @click="authStore.logout()" class="btn btn-danger rounded-pill">Logout</button>
          </div>
        </div>
      </div>

      <div class="container py-5">
        <div class="row">
          <div class="col-lg-8">
            <div v-if="!authStore.isAuthenticated" class="card shadow border-0 p-5 text-center rounded-4">
              <i class="bi bi-lock-fill display-1 text-muted mb-3"></i>
              <h3>Login Required</h3>
              <p>You must be logged in as a pilot to check-in and see the QR code.</p>
              <button @click="navigateTo(`/login?redirect=${route.fullPath}`)" class="btn btn-primary btn-lg rounded-pill px-5">
                Login Now
              </button>
            </div>

            <div v-else class="card shadow border-0 p-5 text-center rounded-4">
              <div v-if="!authStore.activeSession">
                <h3 class="mb-4">Scan QR to Check-in</h3>
                
                <div v-if="qrUrl" class="qr-container bg-light p-4 d-inline-block rounded-4 border">
                  <img 
                    :src="`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`" 
                    alt="Location QR"
                  >
                </div>
                <div v-else class="p-4 text-muted">
                  <div class="spinner-border spinner-border-sm me-2"></div>
                  Generating secure access code...
                </div>

                <p class="mt-4 text-muted">Scan this code at the location to start your flight session.</p>
                <button @click="handleCheckIn" class="btn btn-success mt-3">Manual Confirm (Simulation)</button>
              </div>

              <div v-else-if="isFlyingHere">
                <div class="alert alert-success">
                  <h4><i class="bi bi-airplane-fill"></i> You are Currently Flying!</h4>
                  <p>You are active in the {{ location?.name }} airspace.</p>
                </div>
                <button @click="handleCheckOut" class="btn btn-danger btn-lg mt-4 px-5 rounded-pill">
                  <i class="bi bi-land"></i> Land & Checkout
                </button>
              </div>

              <div v-else class="alert alert-warning p-5">
                <i class="bi bi-exclamation-triangle display-4"></i>
                <h4 class="mt-3">Already Active Elsewhere</h4>
                <p>You are currently checked in at another location. You must checkout there first.</p>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card shadow border-0 rounded-4">
              <div class="card-header bg-white fw-bold py-3 border-bottom">
                Pilots currently in {{ location?.name }}
              </div>
              <ul class="list-group list-group-flush">
                <li v-for="p in activePilots" :key="p.id" class="list-group-item d-flex align-items-center py-3">
                  <i class="bi bi-person-circle fs-4 me-3 text-primary"></i>
                  <div>
                    <span class="fw-bold d-block">{{ p.pilot?.name || 'Pilot' }}</span>
                    <small class="text-muted">Checked in: {{ formatTime(p.checked_in_at) }}</small>
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
    </template>

    <div v-else-if="!pending" class="container py-5 text-center">
      <div class="alert alert-danger rounded-4">
        <h4>Location not found</h4>
        <p>The airspace you are looking for does not exist or is currently restricted.</p>
        <NuxtLink to="/" class="btn btn-outline-danger mt-2">Return Home</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const route = useRoute()

// 1. Fetch Location Data
const { data: location, pending } = await useFetch(`${config.public.apiBase}/flying-locations/${route.params.id}`, {
  key: `location-detail-${route.params.id}`,
  transform: (res) => res.data || null
})

const activePilots = ref([])

// 2. AUTO-CHECKIN LOGIC
onMounted(async () => {
  if (location.value) {
    await fetchActivePilots()
    
    // Check if there is a token in the URL (from a QR scan)
    const scanToken = route.query.token
    
    if (scanToken && authStore.isAuthenticated) {
      // If logged in, perform automatic check-in
      await handleAutoCheckIn(scanToken)
    }
  }
})

async function handleAutoCheckIn(token) {
  // If already flying here, don't do anything
  if (isFlyingHere.value) return 

  try {
    const res = await $fetch(`${config.public.apiBase}/airspace-sessions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { token: token }
    })
    authStore.activeSession = res
    await fetchActivePilots()
    alert(`Welcome to ${location.value.name}! Check-in successful.`)
  } catch (e) {
    console.error("Auto check-in failed", e.data?.message)
  }
}
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
    alert("Checkout error. Please contact LASF administrator.")
  }
}

function formatTime(date) {
  if (!date) return '--:--'
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

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