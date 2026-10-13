<template>
  <div class="container-fluid py-4">
 
    <!-- HEADER -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">
 
        <div class="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2 class="fw-bold mb-1">
              <i class="bi bi-airplane-fill text-primary me-2"></i>
              Live Pilot Tracking
            </h2>
            <p class="text-muted mb-0">
              Track all currently flying pilots in real time.
            </p>
          </div>
 
          <div class="text-end">
            <div class="badge bg-success fs-6 px-3 py-2">
              {{ pilots.length }} Active Pilots
            </div>
 
            <div v-if="lastUpdated" class="small text-muted mt-2">
              Last update: {{ lastUpdated }}
            </div>
          </div>
        </div>
 
        <hr>
 
        <div class="row">
          <div class="col-lg-4">
            <label class="fw-bold mb-2">Flying Location</label>
 
            <select
              v-model="selectedLocation"
              class="form-select"
              @change="loadPilots"
            >
              <option value="">All Flying Locations</option>
 
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
    </div>
 
    <!-- MAP -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div id="map"></div>
      </div>
    </div>
 
    <!-- LEGEND -->
    <div class="d-flex flex-wrap gap-3 mt-3 small">
      <span><span class="legend-dot" style="background:#0d6efd"></span> Live GPS</span>
      <span><span class="legend-dot" style="background:#dc3545"></span> Outside zone</span>
      <span><span class="legend-dot" style="background:#6c757d"></span> No / old GPS signal</span>
    </div>
 
    <!-- ACTIVE PILOTS -->
    <div class="card shadow-sm border-0 mt-4">
 
      <div class="card-header bg-white fw-bold">
        <i class="bi bi-people-fill me-2"></i>
        Active Pilots
      </div>
 
      <div class="card-body">
 
        <div
          v-if="pilots.length === 0"
          class="text-center text-muted py-5"
        >
          <i class="bi bi-airplane display-3"></i>
          <p class="mt-3">No pilots currently flying.</p>
        </div>
 
        <div
          v-for="pilot in pilots"
          :key="pilot.id"
          class="pilot-card"
        >
 
          <div class="pilot-card-left">
 
            <div class="pilot-avatar">
              <i class="bi bi-person-fill"></i>
            </div>
 
            <div>
              <h5>{{ pilot.pilot?.name }}</h5>
 
              <small class="text-muted">
                {{ pilot.location?.name }}
              </small>
 
              <div
                v-if="pilot.last_gps_update"
                class="small text-muted mt-1"
              >
                GPS: {{ formatGpsTime(pilot.last_gps_update) }}
                <span
                  v-if="isStale(pilot)"
                  class="text-warning fw-bold"
                >
                  (old)
                </span>
              </div>
 
              <div
                v-else
                class="small text-danger fw-bold mt-1"
              >
                No GPS signal
              </div>
            </div>
 
          </div>
 
          <div class="pilot-card-right">
 
            <span class="badge bg-success">Flying</span>
 
            <div
              v-if="pilot.outside_zone"
              class="outside-warning mt-2"
            >
              ⚠️ Outside Zone
            </div>
 
          </div>
 
        </div>
 
      </div>
 
    </div>
 
  </div>
</template>
 
 
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import { useAuthStore } from '~/stores/auth'
 
definePageMeta({
  layout: 'admin'
})
 
const config = useRuntimeConfig()
const authStore = useAuthStore()
 
/* A pilot is "stale" if no GPS update for this long */
const STALE_AFTER_MS = 2 * 60 * 1000
 
let L = null
let map = null
 
const locations = ref([])
const pilots = ref([])
const selectedLocation = ref('')
const lastUpdated = ref(null)
 
/* Markers are kept by Airspace Session ID */
const markerMap = new Map()
 
let refreshTimer = null
let isLoading = false
let kmlLayers = []
 
 
/*
|--------------------------------------------------------------------------
| ON MOUNT
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  if (!process.client) return
 
  const leaflet = await import('leaflet')
  L = leaflet.default
 
  if (!L) {
    console.error('Leaflet failed to load')
    return
  }
 
  delete L.Icon.Default.prototype._getIconUrl
 
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  })
 
  map = L.map('map', { zoomControl: true }).setView([33.8547, 35.8623], 8)
 
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 16,
      attribution: 'Tiles &copy; Esri'
    }
  ).addTo(map)
 
  await loadLocations()
  drawPolygons()
  await loadPilots()
 
  refreshTimer = setInterval(() => {
    loadPilots()
  }, 5000)
 
  setTimeout(() => {
    if (map) map.invalidateSize()
  }, 300)
})
 
 
/*
|--------------------------------------------------------------------------
| ON UNMOUNT
|--------------------------------------------------------------------------
*/
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
 
  clearMarkers()
  clearPolygons()
 
  if (map) {
    map.remove()
    map = null
  }
 
  markerMap.clear()
  L = null
})
 
 
/*
|--------------------------------------------------------------------------
| LOAD LOCATIONS
|--------------------------------------------------------------------------
*/
async function loadLocations() {
  try {
    const response = await $fetch(
      `${config.public.apiBase}/admin/flying-locations`,
      {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }
    )
 
    locations.value = response.data || response
  } catch (e) {
    console.error('Failed to load flying locations:', e)
  }
}
 
 
/*
|--------------------------------------------------------------------------
| POLYGONS
|--------------------------------------------------------------------------
*/
function drawPolygons() {
  if (!map || !L) return
 
  clearPolygons()
 
  locations.value.forEach(location => {
    if (!location.kml_polygon || !Array.isArray(location.kml_polygon)) return
 
    location.kml_polygon.forEach(polygon => {
      if (!Array.isArray(polygon)) return
 
      const points = polygon.map(point => [
        Number(point.lat),
        Number(point.lng)
      ])
 
      if (points.length < 3) return
 
      const layer = L.polygon(points, {
        weight: 3,
        fillOpacity: 0.25
      }).addTo(map)
 
      kmlLayers.push(layer)
    })
  })
}
 
function clearPolygons() {
  if (!map) return
 
  kmlLayers.forEach(layer => {
    if (map.hasLayer(layer)) map.removeLayer(layer)
  })
 
  kmlLayers = []
}
 
 
/*
|--------------------------------------------------------------------------
| LOAD LIVE PILOTS
|--------------------------------------------------------------------------
*/
async function loadPilots() {
  if (isLoading) return
 
  isLoading = true
 
  try {
    const url = selectedLocation.value
      ? `${config.public.apiBase}/admin/gps/live/${selectedLocation.value}`
      : `${config.public.apiBase}/admin/gps/live`
 
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
 
    if (!Array.isArray(response)) {
      pilots.value = []
      removeMissingMarkers(new Set())
      return
    }
 
    pilots.value = response
    lastUpdated.value = new Date().toLocaleTimeString()
 
    updateMarkers(response)
  } catch (e) {
    console.error('Failed to load live pilots:', e)
  } finally {
    isLoading = false
  }
}
 
 
/*
|--------------------------------------------------------------------------
| MARKER STATE
|--------------------------------------------------------------------------
|
| ok     = live GPS, inside zone     (blue)
| danger = live GPS, outside zone    (red)
| stale  = GPS older than 2 minutes  (grey)
| nogps  = no GPS at all             (grey, placed at the flying location)
|
*/
function isStale(session) {
  if (!session.last_gps_update) return false
 
  return (
    Date.now() - new Date(session.last_gps_update).getTime() > STALE_AFTER_MS
  )
}
 
function getState(session) {
  if (!session.gps) return 'nogps'
  if (isStale(session)) return 'stale'
  if (session.outside_zone) return 'danger'
  return 'ok'
}
 
 
/*
|--------------------------------------------------------------------------
| UPDATE MARKERS
|--------------------------------------------------------------------------
*/
function updateMarkers(sessions) {
  if (!map || !L) return
 
  const activeSessionIds = new Set()
 
  sessions.forEach(session => {
    const gps = session.gps
    const hasGps = !!gps
 
    // No GPS yet -> fall back to the flying location position
    const latitude = Number(hasGps ? gps.latitude : session.location?.latitude)
    const longitude = Number(hasGps ? gps.longitude : session.location?.longitude)
 
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      console.warn('No valid coordinates for session', session.id)
      return
    }
 
    const sessionId = String(session.id)
    activeSessionIds.add(sessionId)
 
    const state = getState(session)
 
    const popup = createPopupContent(
      session,
      gps || { latitude, longitude, created_at: null },
      state
    )
 
    const existing = markerMap.get(sessionId)
 
    if (existing) {
      existing.marker.setLatLng([latitude, longitude])
 
      if (existing.state !== state) {
        existing.marker.setIcon(createAirplaneIcon(state))
        existing.state = state
      }
 
      existing.marker.setPopupContent(popup)
      return
    }
 
    const marker = L.marker([latitude, longitude], {
      icon: createAirplaneIcon(state)
    })
      .addTo(map)
      .bindPopup(popup)
 
    marker.on('click', () => {
      const pos = marker.getLatLng()
      map.flyTo([pos.lat, pos.lng], 16, { animate: true, duration: 1 })
    })
 
    markerMap.set(sessionId, { marker, state })
  })
 
  removeMissingMarkers(activeSessionIds)
}
 
function removeMissingMarkers(activeSessionIds) {
  if (!map) return
 
  markerMap.forEach((data, sessionId) => {
    if (!activeSessionIds.has(sessionId)) {
      if (map.hasLayer(data.marker)) map.removeLayer(data.marker)
      markerMap.delete(sessionId)
    }
  })
}
 
function clearMarkers() {
  if (!map) return
 
  markerMap.forEach(data => {
    if (map.hasLayer(data.marker)) map.removeLayer(data.marker)
  })
 
  markerMap.clear()
}
 
 
/*
|--------------------------------------------------------------------------
| ICON
|--------------------------------------------------------------------------
*/
function createAirplaneIcon(state = 'ok') {
  const cls = {
    ok: 'airplane-marker',
    danger: 'airplane-marker-danger',
    stale: 'airplane-marker-stale',
    nogps: 'airplane-marker-stale'
  }[state]
 
  return L.divIcon({
    html: `<div class="${cls}"><i class="bi bi-airplane-fill"></i></div>`,
    className: 'custom-airplane-icon',
    iconSize: [44, 44],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
  })
}
 
 
/*
|--------------------------------------------------------------------------
| POPUP
|--------------------------------------------------------------------------
*/
function createPopupContent(session, gps, state) {
  const rawPhone = session.pilot?.phone ?? ''
 
  let phone = rawPhone.replace(/\D/g, '')
 
  if (phone.startsWith('0')) phone = phone.substring(1)
  if (!phone.startsWith('961')) phone = '961' + phone
 
  const mapsUrl = `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`
 
  const contactButtons = authStore.canContactPilots
    ? `
      <a class="btn btn-primary btn-sm" href="tel:${phone}">
        📞 Call Pilot
      </a>
 
      <a
        target="_blank"
        class="btn btn-success btn-sm"
        href="https://wa.me/${phone}?text=${encodeURIComponent(
          '⚠️ LASF Emergency: Please land immediately.'
        )}"
      >
        💬 Send WhatsApp
      </a>
    `
    : ''
 
  const gpsTime = gps.created_at
    ? new Date(gps.created_at).toLocaleString()
    : 'No GPS received yet'
 
  const statusText = {
    ok: '🟢 Currently Flying',
    danger: '⚠️ Outside Authorized Zone',
    stale: '🕒 GPS signal is old',
    nogps: '📵 No GPS signal (location shown is the flying site)'
  }[state]
 
  const statusClass = {
    ok: '',
    danger: 'popup-status-danger',
    stale: 'popup-status-stale',
    nogps: 'popup-status-stale'
  }[state]
 
  return `
    <div class="pilot-popup">
 
      <div class="popup-header">
        <div class="popup-icon">
          <i class="bi bi-airplane-fill"></i>
        </div>
 
        <div>
          <h5>${session.pilot?.name ?? 'Pilot'}</h5>
          <small>📍 ${session.location?.name ?? 'Unknown Location'}</small>
        </div>
      </div>
 
      <div class="popup-status ${statusClass}">
        ${statusText}
      </div>
 
      <table class="table table-sm mb-3">
        <tr>
          <td><strong>Phone</strong></td>
          <td>${rawPhone}</td>
        </tr>
        <tr>
          <td><strong>Latitude</strong></td>
          <td>${Number(gps.latitude).toFixed(6)}</td>
        </tr>
        <tr>
          <td><strong>Longitude</strong></td>
          <td>${Number(gps.longitude).toFixed(6)}</td>
        </tr>
        <tr>
          <td><strong>GPS Updated</strong></td>
          <td>${gpsTime}</td>
        </tr>
      </table>
 
      <div class="d-grid gap-2">
        ${contactButtons}
 
        <a target="_blank" class="btn btn-dark btn-sm" href="${mapsUrl}">
          🗺️ Google Maps
        </a>
      </div>
 
    </div>
  `
}
 
 
function formatGpsTime(value) {
  if (!value) return ''
 
  try {
    return new Date(value).toLocaleTimeString()
  } catch {
    return value
  }
}
</script>
 
 
<style scoped>
#map {
  width: 100%;
  height: 720px;
  border-radius: 14px;
}
 
.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
 
/* ACTIVE PILOT CARD */
.pilot-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 12px;
  transition: .3s;
}
 
.pilot-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, .08);
}
 
.pilot-card-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
 
.pilot-avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: #0d6efd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}
 
.pilot-card h5 {
  margin: 0;
  font-weight: 700;
}
 
.pilot-card small {
  color: #888;
}
 
.outside-warning {
  background: #dc3545;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}
 
/* LEAFLET POPUP */
:deep(.pilot-popup) {
  width: 260px;
}
 
:deep(.popup-header) {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}
 
:deep(.popup-icon) {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: #0d6efd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}
 
:deep(.popup-header h5) {
  margin: 0;
  font-weight: 700;
}
 
:deep(.popup-status) {
  background: #198754;
  color: #fff;
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-weight: bold;
}
 
:deep(.popup-status-danger) {
  background: #dc3545 !important;
}
 
:deep(.popup-status-stale) {
  background: #6c757d !important;
}
 
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 16px;
}
 
:deep(.leaflet-popup-content) {
  margin: 15px;
}
 
/* MARKERS */
:deep(.custom-airplane-icon) {
  background: transparent !important;
  border: none !important;
}
 
:deep(.airplane-marker),
:deep(.airplane-marker-danger),
:deep(.airplane-marker-stale) {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 3px solid #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, .25);
}
 
:deep(.airplane-marker) {
  background: #0d6efd;
}
 
:deep(.airplane-marker-danger) {
  background: #dc3545;
}
 
:deep(.airplane-marker-stale) {
  background: #6c757d;
  opacity: .85;
}
 
:deep(.airplane-marker i),
:deep(.airplane-marker-danger i),
:deep(.airplane-marker-stale i) {
  font-size: 22px;
  color: #fff;
}
 
/* RESPONSIVE */
@media (max-width: 768px) {
  #map {
    height: 500px;
  }
 
  .pilot-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>
 