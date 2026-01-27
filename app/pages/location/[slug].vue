<template>
  <div class="location-detail-page bg-light min-vh-100">
    <Breadcrumbs />

    <div class="container py-5" v-if="location">
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div :class="['status-banner p-3 text-center text-white fw-bold', statusKey === 'cleared' ? 'bg-success' : 'bg-danger']">
              <i class="bi" :class="statusKey === 'cleared' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
              {{ statusKey === 'cleared' ? 'AREA CLEARED FOR FLYING' : 'AREA CLOSED' }}
            </div>

            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h1 class="display-5 fw-bold mb-1">{{ location.name }}</h1>
                  <p class="text-muted fs-5"><i class="bi bi-geo-alt"></i> {{ location.type }}</p>
                </div>
                <div class="text-end">
                  <span class="badge bg-primary px-3 py-2 rounded-pill">
                    {{ location.active_sessions?.length || 0 }} Pilots Active
                  </span>
                </div>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-white border rounded-3 text-center">
                    <small class="text-muted d-block">Takeoff Kato</small>
                    <span class="fw-bold">{{ location.takeoff_kato }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-white border rounded-3 text-center">
                    <small class="text-muted d-block">Takeoff Nazim</small>
                    <span class="fw-bold">{{ location.takeoff_nazim }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-white border rounded-3 text-center">
                    <small class="text-muted d-block">Max Altitude</small>
                    <span class="fw-bold text-primary">{{ location.max_altitude || 'N/A' }}</span>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="p-3 bg-white border rounded-3 text-center">
                    <small class="text-muted d-block">Sports</small>
                    <div class="d-flex gap-1 justify-content-center">
                       <span v-for="s in location.sports" :key="s.id" class="badge bg-light text-dark border">{{ s.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="action-zone p-4 rounded-4 border-2 border-dashed text-center">
                <div v-if="!authStore.isAuthenticated">
                  <h4 class="fw-bold">Want to fly here?</h4>
                  <p class="text-muted">You must be logged in as a licensed pilot to check-in.</p>
                  <button @click="handleLoginRedirect" class="btn btn-primary btn-lg px-5 rounded-pill shadow">
                    Login to Check-in
                  </button>
                </div>

                <div v-else-if="activeSession">
                  <div class="active-session-ui animate__animated animate__pulse animate__infinite">
                    <div class="text-success mb-2"><i class="bi bi-airplane-engines fs-1"></i></div>
                    <h3 class="fw-bold">You are Live!</h3>
                    <p class="mb-1">Checked in at: <strong>{{ formatTime(activeSession.checked_in_at) }}</strong></p>
                    <p class="text-muted small mb-4">Session expires in: {{ remainingTime }}</p>
                    <button @click="handleCheckout" :disabled="processing" class="btn btn-danger btn-lg px-5 rounded-pill">
                      <span v-if="processing" class="spinner-border spinner-border-sm"></span>
                      <i v-else class="bi bi-landing"></i> Check-out (Landed)
                    </button>
                  </div>
                </div>

                <div v-else>
                  <h4 class="fw-bold">Ready for takeoff?</h4>
                  <p v-if="statusKey !== 'cleared'" class="text-danger">Check-in is disabled while the location is closed.</p>
                  <button 
                    @click="handleCheckin" 
                    :disabled="statusKey !== 'cleared' || processing" 
                    class="btn btn-success btn-lg px-5 rounded-pill shadow"
                  >
                    <span v-if="processing" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-qr-code-scan"></i> Reserve Airspace (Check-in)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4">
            <div class="card-header bg-dark text-white p-3">
              <h5 class="mb-0"><i class="bi bi-broadcast me-2 text-danger"></i>Live Airspace</h5>
            </div>
            <div class="card-body p-0">
              <ul class="list-group list-group-flush">
                <li v-for="session in location.airspace_sessions" :key="session.id" class="list-group-item p-3 d-flex align-items-center">
                  <div class="avatar-sm bg-primary-subtle text-primary rounded-circle me-3 d-flex align-items-center justify-content-center">
                    {{ session.pilot?.name?.charAt(0) }}
                  </div>
                  <div>
                    <h6 class="mb-0 fw-bold">{{ session.pilot?.name }}</h6>
                    <small class="text-muted">License: {{ session.pilot?.pilot_profile?.license_number }}</small>
                  </div>
                  <div class="ms-auto text-end">
                    <span class="badge bg-success-subtle text-success border">Active</span>
                    <div class="small text-muted mt-1">{{ formatTimeAgo(session.checked_in_at) }}</div>
                  </div>
                </li>
                <li v-if="!location.airspace_sessions?.length" class="list-group-item p-4 text-center text-muted">
                  No active pilots at the moment.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
const route = useRoute();
const config = useRuntimeConfig();
const authStore = useAuthStore();
const processing = ref(false);

// 1. Fetch Location Data
const { data: response, refresh } = await useAsyncData(`location-${route.params.slug}`, () => 
  $fetch(`${config.public.apiBase}/flying-locations/${route.params.slug}`)
);

const location = computed(() => response.value?.data);
const statusKey = computed(() => location.value?.clearance_statuses?.[0]?.status === 'green' ? 'cleared' : 'closed');

// 2. Local Session State (Checks if user is currently flying here)
const activeSession = computed(() => {
  if (!authStore.activeSession || !location.value) return null;
  return authStore.activeSession.flying_location_id === location.value.id ? authStore.activeSession : null;
});

// 3. Actions
const handleLoginRedirect = () => {
  navigateTo(`/login?redirect=${route.fullPath}`);
};

const handleCheckin = async () => {
  // Security: Check for token in URL (from QR scan)
  const token = route.query.token;
  if (!token) {
    alert("Please scan the on-site QR code to check-in.");
    return;
  }

  processing.value = true;
  try {
    const res = await $fetch(`${config.public.apiBase}/airspace-sessions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: { token }
    });
    authStore.activeSession = res; // Update Pinia store
    refresh(); // Refresh page data
  } catch (e) {
    alert(e.data?.message || "Check-in failed");
  } finally {
    processing.value = false;
  }
};

const handleCheckout = async () => {
  if (!activeSession.value) return;
  processing.value = true;
  try {
    await $fetch(`${config.public.apiBase}/airspace-sessions/${activeSession.value.id}/checkout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    authStore.activeSession = null;
    refresh();
  } catch (e) {
    alert("Checkout failed");
  } finally {
    processing.value = false;
  }
};

// 4. Helpers
const formatTime = (time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatTimeAgo = (dateString) => {
  const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
  return diff < 1 ? 'Just now' : `${diff}m ago`;
};
</script>

<style scoped>
.status-banner {
  letter-spacing: 1px;
  font-size: 0.9rem;
}
.action-zone {
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
}
.avatar-sm {
  width: 40px;
  height: 40px;
  font-weight: bold;
}
</style>