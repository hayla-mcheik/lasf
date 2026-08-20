<template>
  <div class="enhanced-location-card">
    <div class="card-inner">
      <!-- Card Header with dynamic status background -->
      <div class="card-header" :class="'status-' + statusKey">
        <div class="status-indicator">
          <div class="status-dot"></div>
          <div class="status-glow"></div>
        </div>
        <div class="header-content">
          <h5 class="location-name text-white">{{ location?.name }}</h5>
          <div class="location-region text-white-50 small">
            <i class="bi bi-geo-alt"></i> {{ location?.type || 'Flying Site' }}
          </div>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <!-- Sports Tags -->
        <div class="sports-tags mb-3">
          <span v-for="sport in location?.sports" :key="sport.id" class="sport-tag">
            <i class="bi" :class="getSportIcon(sport.name)"></i> {{ sport.name }}
          </span>
          <span v-if="!location?.sports?.length" class="text-muted small">No sports specified</span>
        </div>

        <!-- Status Message Box -->
        <div class="status-details p-3 rounded-3 mb-3 bg-light" :class="'border-' + bootstrapColor">
          <div class="status-message small fw-bold">
            <i class="bi" :class="statusIcon"></i>
            {{ statusMessage }}
          </div>
        </div>

        <!-- (Optional) Active Pilots Widget -->
        <!-- <div v-if="location?.active_sessions_count > 0" class="active-pilots-widget ...">...</div> -->
      </div>

      <!-- Card Footer with Actions -->
      <div class="card-footer bg-white border-top p-3 d-flex gap-2">
        <NuxtLink :to="'/location/' + location?.slug" class="btn btn-outline-secondary flex-grow-1 btn-sm py-2 rounded-3">
          <i class="bi bi-info-circle me-1"></i> Details
        </NuxtLink>

        <button
          class="btn flex-grow-1 btn-sm py-2 rounded-3 fw-bold"
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

// Helper to get today's status from clearance_statuses
const getTodayStatus = (location) => {
  if (!location?.clearance_statuses) return 'red'
  const today = new Date().toISOString().split('T')[0]
  const todayPermission = location.clearance_statuses.find(p => p.permission_date === today)
  return todayPermission?.status ?? 'red'
}

// Computed status (today)
const statusKey = computed(() => getTodayStatus(props.location))

// Status label and message
const statusLabel = computed(() => {
  return statusKey.value === 'green' ? 'Open' :
         statusKey.value === 'yellow' ? 'Pending' : 'Closed'
})

const bootstrapColor = computed(() => {
  return statusKey.value === 'green' ? 'success' :
         statusKey.value === 'yellow' ? 'warning' : 'danger'
})

const statusIcon = computed(() => {
  return statusKey.value === 'green' ? 'bi-check-circle-fill' :
         statusKey.value === 'yellow' ? 'bi-exclamation-triangle-fill' : 'bi-x-circle-fill'
})

const statusMessage = computed(() => {
  // Use reason from today's permission if available
  const todayPerm = props.location?.clearance_statuses?.find(
    p => p.permission_date === new Date().toISOString().split('T')[0]
  )
  if (todayPerm?.reason) return todayPerm.reason
  return statusKey.value === 'green' ? 'Open for flight' :
         statusKey.value === 'yellow' ? 'Pending approval' : 'Closed for flight'
})

// Check if current session is at this location
const isCurrentLocationSession = computed(() => {
  if (!props.location?.id || !authStore.activeSession) return false
  return authStore.activeSession.flying_location_id === props.location.id
})

// Sport icon mapping
const getSportIcon = (name) => {
  const map = {
    'Paragliding': 'bi-parachute',
    'Paramotor': 'bi-fan',
    'Paratrike': 'bi-airplane',
    'Speedwing': 'bi-wind',
    'Skydive': 'bi-cloud-arrow-down',
    'Delta plane': 'bi-airplane-engines'
  }
  return map[name] || 'bi-wind'
}
</script>

<style scoped>
/* =======================================================
   ENHANCED LOCATION CARD – Glassmorphism with status flair
   ======================================================= */
.enhanced-location-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s ease;
  height: 100%;
  border: 1px solid rgba(0,0,0,0.04);
}

.enhanced-location-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.10);
}

/* ---------- CARD HEADER ---------- */
.card-header {
  padding: 20px 20px 16px;
  position: relative;
  min-height: 90px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

/* Status backgrounds */
.status-green {
  background: linear-gradient(135deg, #1a7a4a, #28a745);
}
.status-yellow {
  background: linear-gradient(135deg, #d39e00, #ffc107);
}
.status-red {
  background: linear-gradient(135deg, #b02a37, #dc3545);
}

/* Status indicator (dot + glow) */
.status-indicator {
  flex-shrink: 0;
  position: relative;
  width: 16px;
  height: 16px;
  margin-top: 6px;
}
.status-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.4);
}
.status-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  animation: pulse-glow 2s infinite;
}
@keyframes pulse-glow {
  0% { transform: scale(0.95); opacity: 0.6; }
  70% { transform: scale(1.4); opacity: 0; }
  100% { transform: scale(0.95); opacity: 0.6; }
}

.header-content {
  flex: 1;
  min-width: 0;
}
.location-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
}
.location-region {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* ---------- BODY ---------- */
.card-body {
  padding: 16px 20px 12px;
}

/* Sports tags */
.sports-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-bottom: 14px;
}
.sport-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f0f4ff;
  color: #1a3a5c;
  padding: 4px 12px 4px 8px;
  border-radius: 30px;
  font-size: 0.78rem;
  font-weight: 500;
  border: 1px solid #dbe4f0;
}
.sport-tag i {
  font-size: 0.9rem;
  color: #2d6a9f;
}

/* Status message box */
.status-details {
  border-left-width: 4px !important;
  border-left-style: solid;
  padding: 10px 14px;
  background: #f8fafc;
}
.status-message {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-message i {
  font-size: 1.1rem;
}

/* ---------- FOOTER ---------- */
.card-footer {
  padding: 12px 20px 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
}
.card-footer .btn {
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.15s;
}
.card-footer .btn-primary {
  background: #0f6847;
  border-color: #0f6847;
}
.card-footer .btn-primary:hover {
  background: #0a5034;
  border-color: #0a5034;
}
.card-footer .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.card-footer .btn-outline-secondary {
  border-color: #d0d7de;
}
.card-footer .btn-outline-secondary:hover {
  background: #f0f4f9;
}

/* ---------- RESPONSIVE ---------- */
@media (max-width: 576px) {
  .card-header {
    padding: 16px 16px 12px;
  }
  .location-name {
    font-size: 1.1rem;
  }
  .card-body {
    padding: 12px 16px 10px;
  }
  .sport-tag {
    font-size: 0.7rem;
    padding: 2px 10px 2px 6px;
  }
}
</style>