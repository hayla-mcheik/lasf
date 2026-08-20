<template>
  <div class="enhanced-location-card">
    <div class="card-inner">
      <div class="card-header" :class="'status-' + statusKey">
        <div class="status-indicator">
          <div class="status-dot"></div>
          <div class="status-glow"></div>
        </div>
        <div class="header-content">
          <h5 class="location-name text-white">{{ location?.name }}</h5>
          <div class="location-region text-white-50 small">
            <i class="bi bi-geo-alt"></i> {{ location?.type }}
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="sports-tags mb-3">
          <span v-for="sport in location?.sports" :key="sport.id" class="sport-tag">
            <i class="bi" :class="getSportIcon(sport.name)"></i> {{ sport.name }}
          </span>
        </div>

        <!-- Status message – now uses computed property -->
        <div class="status-details p-3 rounded-3 mb-3 bg-light border-start border-4" :class="'border-' + bootstrapColor">
          <div class="status-message small fw-bold">
            <i class="bi" :class="statusIcon"></i>
            {{ statusMessage }}
          </div>
        </div>
      </div>

      <div class="card-footer bg-white border-top p-3 d-flex gap-2">
        <NuxtLink :to="'/location/' + location?.slug" class="btn btn-outline-secondary flex-grow-1 btn-sm py-2 rounded-3">
          Details
        </NuxtLink>
        
        <button 
          class="btn flex-grow-2 btn-sm py-2 rounded-3 fw-bold" 
          :class="isCurrentLocationSession ? 'btn-success' : 'btn-primary'"
          @click="navigateTo(`/location/${location.slug}`)" 
          :disabled="statusKey !== 'green'"
        >
          <template v-if="isCurrentLocationSession">
            <i class="bi bi-airplane-fill me-1"></i> You are Live
          </template>
          <template v-else>
            <i class="bi bi-qr-code-scan me-1"></i> Check-in
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const props = defineProps({ location: Object })

// ------------------------------------------------
// Helper: get status for today (or latest)
// ------------------------------------------------
const getTodayStatus = (location) => {
  if (!location?.clearance_statuses?.length) return 'red'

  const today = new Date().toISOString().split('T')[0]
  let permission = location.clearance_statuses.find(p => p.permission_date === today)

  if (!permission) {
    const sorted = [...location.clearance_statuses].sort(
      (a, b) => new Date(b.permission_date) - new Date(a.permission_date)
    )
    permission = sorted[0]
  }

  return permission?.status ?? 'red'
}

// ------------------------------------------------
// Computed statuses
// ------------------------------------------------
const statusKey = computed(() => {
  if (!props.location) return null
  return getTodayStatus(props.location)
})

const bootstrapColor = computed(() => {
  switch (statusKey.value) {
    case 'green': return 'success'
    case 'yellow': return 'warning'
    case 'red': return 'danger'
    default: return 'secondary'
  }
})

const statusIcon = computed(() => {
  switch (statusKey.value) {
    case 'green': return 'bi-check-circle-fill'
    case 'yellow': return 'bi-exclamation-triangle-fill'
    case 'red': return 'bi-x-circle-fill'
    default: return 'bi-question-circle'
  }
})

// ------------------------------------------------
// Status message (display the reason or a default)
// ------------------------------------------------
const statusMessage = computed(() => {
  if (!props.location) return 'Loading...'

  const today = new Date().toISOString().split('T')[0]
  let permission = props.location.clearance_statuses?.find(p => p.permission_date === today)
  if (!permission && props.location.clearance_statuses?.length) {
    const sorted = [...props.location.clearance_statuses].sort(
      (a, b) => new Date(b.permission_date) - new Date(a.permission_date)
    )
    permission = sorted[0]
  }

  if (permission?.reason) return permission.reason

  switch (statusKey.value) {
    case 'green': return 'Open for flight'
    case 'yellow': return 'Pending approval'
    case 'red': return 'Closed for flight'
    default: return 'Status unknown'
  }
})

// ------------------------------------------------
// Check if this location is the user's current session
// ------------------------------------------------
const currentSession = computed(() => authStore.activeSession || null)

const isCurrentLocationSession = computed(() => {
  if (!props.location?.id || !currentSession.value) return false
  const sessionLocationId = currentSession.value.flying_location_id || currentSession.value.location?.id || null
  return Number(sessionLocationId) === Number(props.location.id)
})

// ------------------------------------------------
// Sport icon mapping
// ------------------------------------------------
const getSportIcon = (name) => {
  const icons = {
    'Paragliding': 'bi-parachute',
    'Hang Gliding': 'bi-airplane',
    'Paramotoring': 'bi-fan'
  }
  return icons[name] || 'bi-wind'
}
</script>


<style scoped>
/* Main Card Design */
.enhanced-location-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  border: 1px solid #f0f0f0;
}

.enhanced-location-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.1);
}

.card-header {
  padding: 20px;
  min-height: 90px;
}

.location-name {
  font-size: 1.25rem;
  margin-bottom: 0;
}

/* Animations */
.live-pulse {
  width: 10px;
  height: 10px;
  background: #0d6efd;
  border-radius: 50%;
  animation: pulse-blue 2s infinite;
}

@keyframes pulse-blue {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(13, 110, 253, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
}

/* Footer sizing */
.flex-grow-2 { flex-grow: 2; }
.status-green {
  background: linear-gradient(135deg, #198754, #28a745);
}

.status-yellow {
  background: linear-gradient(135deg, #ffc107, #ffca2c);
  color: #212529;
}

.status-red {
  background: linear-gradient(135deg, #dc3545, #bd2130);
}
</style>