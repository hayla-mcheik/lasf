<template>
  <div class="qr-scan-page">
    <div class="container py-5">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 fw-bold text-muted">Verifying Airspace Token...</p>
      </div>

      <div v-else-if="location" class="card shadow-lg border-0 rounded-4 overflow-hidden animate-fade-in">
        <div class="card-header py-4 text-center border-0" :class="{
  'bg-success': location.status === 'green',
  'bg-warning text-dark': location.status === 'yellow',
  'bg-danger': location.status === 'red'
}">
          <h1 class="text-white fw-bold mb-0">{{ location.name }}</h1>
          <p class="text-white-50 mb-0"><i class="bi bi-geo-alt me-1"></i>{{ location.region }}</p>
        </div>

        <div class="card-body p-4 p-md-5 text-center">
          <div v-if="!authStore.isAuthenticated">
            <div class="mb-4">
              <i class="bi bi-person-lock display-1 text-muted opacity-50"></i>
            </div>
            <h3>Pilot Login Required</h3>
            <p class="text-muted mb-4">You must be logged in to your pilot account to check-in to this airspace.</p>
            
            <NuxtLink 
              :to="`/login?redirect=${route.fullPath}`" 
              class="btn btn-success btn-lg px-5 rounded-pill shadow hover-scale"
            >
              Login to Check-in
            </NuxtLink>
          </div>

          <div v-else>
            <div v-if="isFlyingHere" class="active-session">
              <div class="alert alert-success d-flex align-items-center justify-content-center border-0 shadow-sm mb-4">
                <i class="bi bi-check-circle-fill fs-4 me-2"></i>
                <span class="fw-bold">You are already active in this airspace!</span>
              </div>
              <button @click="navigateTo(`/location/${location.slug}`)" class="btn btn-primary btn-lg px-5 rounded-pill shadow">
                Open Flight Dashboard
              </button>
            </div>

 <div v-else-if="authStore.activeSession && !isFlyingHere" class="elsewhere-session">
              <div class="alert alert-warning border-0 shadow-sm mb-4 p-4">
                <i class="bi bi-exclamation-triangle-fill fs-2 d-block mb-2"></i>
                You are currently active at <strong>{{ authStore.activeSession.location?.name || 'another location' }}</strong>.
              </div>
              <p class="text-muted">You must land and check-out from your current session before starting a new one here.</p>
              <button @click="navigateTo('/locations')" class="btn btn-outline-secondary rounded-pill px-4">View Airspace Map</button>
            </div>

            <div v-else class="ready-to-fly">
              <div class="mb-4">
                <i class="bi bi-airplane-engines-fill display-2 text-primary"></i>
              </div>
              <h3 class="fw-bold">Ready to Launch?</h3>
              <p class="text-muted mb-4">You are checking in to <strong>{{ location.name }}</strong>. Your session will be active for 2 hours.</p>
              
              <button 
                @click="handleCheckIn" 
                :disabled="location.status !== 'green' || checkingIn"
                class="btn btn-success btn-lg px-5 rounded-pill shadow-lg w-100 py-3 fw-bold action-btn"
              >
                <span v-if="checkingIn" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check2-circle me-2"></i>
                Confirm Arrival & Start
              </button>

<div v-if="location.status === 'yellow'" class="mt-4 p-3 bg-warning-subtle rounded-3">
  <p class="text-warning mb-0 fw-bold">
    <i class="bi bi-exclamation-triangle-fill me-1"></i>
    This airspace is currently PENDING.
    Check-in is temporarily disabled.
  </p>
</div>

<div v-if="location.status === 'red'" class="mt-4 p-3 bg-danger-subtle rounded-3">
  <p class="text-danger mb-0 fw-bold">
    <i class="bi bi-x-circle-fill me-1"></i>
    This airspace is currently CLOSED.
    Check-in is disabled.
  </p>
</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5">
        <div class="alert alert-danger rounded-4 p-5 shadow">
          <i class="bi bi-qr-code display-1 mb-3"></i>
          <h3 class="fw-bold">Invalid QR Code</h3>
          <p>This access token is incorrect, expired, or the location has been moved.</p>
          <NuxtLink to="/" class="btn btn-outline-danger mt-3 rounded-pill px-4">Return Home</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted
} from 'vue'

import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(true)
const checkingIn = ref(false)
const location = ref(null)

// 1. Fetch data on load
const fetchData = async () => {
  try {
    const res = await $fetch(`${config.public.apiBase}/qr/${route.params.token}`)
  location.value = res.location
  } catch (e) {
    console.error("QR Validation Failed")
  } finally {
    loading.value = false
  }
}

// 2. Computed check for current session
const isFlyingHere = computed(() => {
  if (!location.value) return false

  if (!authStore.activeSession) return false

  return authStore.activeSession.flying_location_id === location.value.id
})

// 3. Handle Check-in Action
const handleCheckIn = async () => {
  if (location.value.status !== 'green') {
  return alert('This flying location is currently unavailable.')
}
  checkingIn.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/airspace-sessions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { token: route.params.token } 
    })
    
 authStore.activeSession = res.session
  console.log('Session from API:', res.session)
console.log('Stored session:', authStore.activeSession)
console.log('Current location:', location.value)
console.log('Session location id:', authStore.activeSession.flying_location_id)
console.log('Current location id:', location.value.id)
console.log('isFlyingHere:', isFlyingHere.value)
    // Direct redirect to the full location details page
    navigateTo(`/location/${location.value.slug}`)
  } catch (err) {
    alert(err.data?.message || "Check-in failed. Please try again.")
  } finally {
    checkingIn.value = false
  }
}

onMounted(fetchData)

</script>

<style scoped>
.qr-scan-page {
  min-height: 100vh;
  background: #f4f7f6;
  display: flex;
  align-items: center;
}
.card {
  max-width: 600px;
  margin: 0 auto;
}
.hover-scale {
  transition: transform 0.2s;
}
.hover-scale:hover {
  transform: scale(1.05);
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>