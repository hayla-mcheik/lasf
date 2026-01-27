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

        <div class="status-details p-3 rounded-3 mb-3 bg-light border-start border-4" :class="'border-' + bootstrapColor">
          <div class="status-message small fw-bold">
            <i class="bi" :class="statusIcon"></i>
            {{ location?.clearance_statuses?.[0]?.reason || (statusKey === 'cleared' ? 'Open for flight' : 'Temporary restricted') }}
          </div>
        </div>

        <div v-if="location?.active_sessions_count > 0" class="active-pilots-widget p-2 px-3 rounded-pill d-flex align-items-center justify-content-between bg-primary-subtle border border-primary-subtle">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-person-badge-fill text-primary"></i>
            <span class="small fw-bold text-primary">{{ location.active_sessions_count }} Pilots Live</span>
          </div>
          <div class="live-pulse"></div>
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
          :disabled="statusKey !== 'cleared'"
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
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const props = defineProps({ location: Object });

// Check if this specific location is where the user is checked in
const isCurrentLocationSession = computed(() => {
  if (!props.location?.id || !authStore.activeSession) return false;
  return authStore.activeSession.flying_location_id === props.location.id;
});

// Status Logic
const statusKey = computed(() => {
  const s = props.location?.clearance_statuses?.[0]?.status || 'green';
  return s === 'green' ? 'cleared' : 'closed';
});

const bootstrapColor = computed(() => statusKey.value === 'cleared' ? 'success' : 'danger');
const statusIcon = computed(() => statusKey.value === 'cleared' ? 'bi-check-circle-fill' : 'bi-x-circle-fill');

const getSportIcon = (name) => {
  const icons = { 'Paragliding': 'bi-parachute', 'Hang Gliding': 'bi-airplane', 'Paramotoring': 'bi-fan' };
  return icons[name] || 'bi-wind';
};
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

.status-cleared { background: linear-gradient(135deg, #198754, #28a745); }
.status-closed { background: linear-gradient(135deg, #dc3545, #bd2130); }
</style>