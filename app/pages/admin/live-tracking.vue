<template>
  <div class="pilot-tracking-page">
    <div class="container-fluid py-4">
      
      <!-- Header Section -->
      <div class="dashboard-header mb-4 shadow-sm p-4 bg-white rounded-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 class="display-6 fw-bold text-dark mb-2">
              <i class="bi bi-airplane-fill me-3 text-primary"></i>
              Live Pilot Tracking
            </h1>
            <div class="d-flex align-items-center gap-3">
              <p class="text-muted mb-0">
                <i class="bi bi-geo-alt me-1"></i>
                Real-time pilot positions and tracking
              </p>
              <span class="badge bg-success-subtle text-success">
                <span class="pulse-dot me-1"></span>
                {{ pilots.length }} Active
              </span>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm" @click="refreshData">
              <i class="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
            <button class="btn btn-outline-info btn-sm" @click="zoomToFit">
              <i class="bi bi-arrows-fullscreen me-1"></i> Fit All
            </button>
          </div>
        </div>
      </div>

      <!-- Filters & Controls -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <label class="form-label fw-semibold">
                <i class="bi bi-geo-alt me-1 text-primary"></i> Select Location
              </label>
              <select
                v-model="selectedLocation"
                class="form-select form-select-lg"
                @change="loadPilots"
              >
                <option value="">
                  <i class="bi bi-search me-1"></i> All Locations
                </option>
                <option
                  v-for="location in locations"
                  :key="location.id"
                  :value="location.id"
                >
                  {{ location.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="col-md-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div class="d-flex align-items-center gap-4">
                <div>
                  <span class="text-muted small text-uppercase">Total Pilots</span>
                  <h4 class="mb-0 fw-bold">{{ pilots.length }}</h4>
                </div>
                <div class="vr"></div>
                <div>
                  <span class="text-muted small text-uppercase">Location</span>
                  <h4 class="mb-0 fw-bold text-truncate" style="max-width: 150px;">
                    {{ selectedLocationName || 'Not Selected' }}
                  </h4>
                </div>
                <div class="vr"></div>
                <div>
                  <span class="text-muted small text-uppercase">Last Update</span>
                  <h4 class="mb-0 fw-bold" style="font-size: 1rem;">
                    {{ lastUpdateTime }}
                  </h4>
                </div>
              </div>
              <div class="d-flex gap-2">
                <span class="badge bg-success bg-opacity-10 text-success p-2">
                  <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>
                  Live
                </span>
                <span class="badge bg-primary bg-opacity-10 text-primary p-2">
                  <i class="bi bi-arrow-repeat me-1"></i>
                  Auto-refresh: 10s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-0">
          <div id="map"></div>
        </div>
      </div>

      <!-- Active Pilots List -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-transparent border-0 pt-3">
          <h5 class="mb-0 fw-bold">
            <i class="bi bi-people-fill me-2 text-primary"></i>
            Active Pilots
            <span class="badge bg-primary ms-2">{{ pilots.length }}</span>
          </h5>
        </div>
        <div class="card-body pt-0">
          <div v-if="pilots.length === 0" class="text-center py-5">
            <i class="bi bi-person-x display-1 text-muted"></i>
            <p class="text-muted mt-3">No active pilots at this location</p>
          </div>
          
          <div v-else class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Pilot</th>
                  <th>License</th>
                  <th>Disciplines</th>
                  <th>Location</th>
                  <th>Coordinates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="session in pilots" :key="session.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <img 
                        :src="getAvatarUrl(session.pilot?.image)" 
                        class="rounded-circle me-2" 
                        style="width: 35px; height: 35px; object-fit: cover;"
                        @error="(e) => e.target.src = '/assets/images/avatarpilot.jpg'"
                      >
                      <div>
                        <div class="fw-bold">{{ session.pilot?.name || 'Unknown' }}</div>
                        <small class="text-muted">{{ session.pilot?.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-dark">{{ session.pilot?.license_number || 'N/A' }}</span>
                  </td>
                  <td>
                    <div class="d-flex flex-wrap gap-1">
                      <span 
                        v-for="disc in session.pilot?.disciplines" 
                        :key="disc.id" 
                        class="badge bg-info-subtle text-info border"
                      >
                        {{ disc.name }}
                      </span>
                      <span v-if="!session.pilot?.disciplines?.length" class="text-muted small">None</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary">
                      <i class="bi bi-geo-alt me-1"></i>
                      {{ session.locations?.[0]?.location_name || 'Unknown' }}
                    </span>
                  </td>
                  <td>
                    <div class="small">
                      <div>Lat: {{ session.locations?.[0]?.latitude?.toFixed(6) || 'N/A' }}</div>
                      <div>Lng: {{ session.locations?.[0]?.longitude?.toFixed(6) || 'N/A' }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-success">
                      <span class="pulse-dot-small me-1"></span>
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import 'leaflet/dist/leaflet.css'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()
const authStore = useAuthStore()

let L = null

const locations = ref([])
const pilots = ref([])
const selectedLocation = ref('')
const lastUpdateTime = ref('')

let map = null
let markers = []
let refreshTimer = null
let airplaneIcon = null

const selectedLocationName = computed(() => {
  if (!selectedLocation.value) return 'All Locations'

  const loc = locations.value.find(
    l => String(l.id) === String(selectedLocation.value)
  )

  return loc?.name || 'Unknown'
})

const getAvatarUrl = (imagePath) => {
  if (!imagePath) {
    return '/assets/images/avatarpilot.jpg'
  }

  let baseUrl = config.public.apiBase

  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.replace('/api', '')
  }

  return `${baseUrl}${imagePath}`
}

const initMap = () => {

  if (!L) return

  map = L.map('map').setView(
    [33.8547, 35.8623],
    8
  )

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap'
    }
  ).addTo(map)

  airplaneIcon = L.icon({
    iconUrl: '/images/airplane-marker.avif',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  })

}

const loadLocations = async () => {

  try {

    const response = await $fetch(
      `${config.public.apiBase}/flying-locations`
    )

    locations.value = response.data || response

  } catch (error) {
    console.error('Failed loading locations', error)
  }

}

const clearMarkers = () => {

  markers.forEach(marker => {
    if (map) {
      map.removeLayer(marker)
    }
  })

  markers = []

}

const updateMarkers = () => {

  if (!map) return

  clearMarkers()

  pilots.value.forEach(session => {

    const gps = session.locations?.[0]

    if (!gps) return

    const marker = L.marker(
      [
        Number(gps.latitude),
        Number(gps.longitude)
      ],
      {
        icon: airplaneIcon
      }
    )
    .addTo(map)
    .bindPopup(`
      <strong>${session.pilot?.name ?? 'Pilot'}</strong>
      <br>
      Latitude: ${gps.latitude}
      <br>
      Longitude: ${gps.longitude}
    `)

    markers.push(marker)

  })

  if (markers.length > 0) {

    const group = L.featureGroup(markers)

    map.fitBounds(
      group.getBounds(),
      {
        padding: [50, 50]
      }
    )

  }

}

const loadPilots = async () => {

  if (!selectedLocation.value) {

    pilots.value = []
    clearMarkers()

    return
  }

  try {

    const response = await $fetch(
      `${config.public.apiBase}/admin/gps/live/${selectedLocation.value}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    pilots.value = response

    lastUpdateTime.value =
      new Date().toLocaleTimeString()

    updateMarkers()

  } catch (error) {

    console.error(
      'Failed loading pilots',
      error
    )

  }

}

const refreshData = () => {
  loadPilots()
}

const zoomToFit = () => {

  if (!map) return

  if (markers.length > 0) {

    const group = L.featureGroup(markers)

    map.fitBounds(
      group.getBounds(),
      {
        padding: [50, 50]
      }
    )

  } else {

    map.setView(
      [33.8547, 35.8623],
      8
    )

  }

}

onMounted(async () => {

  const leaflet = await import('leaflet')

  L = leaflet.default

  await nextTick()

  initMap()

  await loadLocations()

  refreshTimer = setInterval(() => {

    if (selectedLocation.value) {
      loadPilots()
    }

  }, 10000)

})

onUnmounted(() => {

  if (refreshTimer) {
    clearInterval(refreshTimer)
  }

  if (map) {
    map.remove()
  }

})
</script>

<style scoped>
.pilot-tracking-page {
  background: #f8fafc;
  min-height: 100vh;
}

#map {
  width: 100%;
  height: 600px;
  border-radius: 12px;
  overflow: hidden;
}

.card {
  border-radius: 12px;
  overflow: hidden;
}

.dashboard-header {
  background: white;
}

/* Pulse Animation */
.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.pulse-dot-small {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* Custom Scrollbar for table */
.table-responsive::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Table styles */
.table th {
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
  border-bottom: 2px solid #e9ecef;
}

.table td {
  vertical-align: middle;
}

/* Badge styles */
.badge {
  font-weight: 500;
}

.bg-success-subtle {
  background-color: #dcfce7;
  color: #166534;
}

.bg-info-subtle {
  background-color: #e0f2fe;
  color: #0369a1;
}

.bg-primary-subtle {
  background-color: #dbeafe;
  color: #1e40af;
}

/* VR divider */
.vr {
  width: 1px;
  height: 30px;
  background: #dee2e6;
}

/* Popup styles */
:deep(.leaflet-popup-content) {
  min-width: 200px;
  padding: 8px 4px;
}

.popup-content {
  font-size: 0.9rem;
}

.popup-content hr {
  margin: 6px 0;
  border-color: #e9ecef;
}

/* Airplane marker animation */
:deep(.airplane-marker) {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  transition: all 0.3s ease;
}

:deep(.airplane-marker:hover) {
  transform: scale(1.2);
}

/* Select */
.form-select-lg {
  font-size: 1rem;
  padding: 0.75rem 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  #map {
    height: 400px;
  }
  
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
  
  .table-responsive {
    font-size: 0.85rem;
  }
  
  .vr {
    display: none;
  }
  
  .pilot-tracking-page {
    padding: 0.5rem;
  }
}

@media (max-width: 576px) {
  #map {
    height: 300px;
  }
  
  .dashboard-header {
    padding: 1rem !important;
  }
  
  .badge {
    font-size: 0.7rem;
  }
}
</style>