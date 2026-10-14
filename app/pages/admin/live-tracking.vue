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
              Last refresh: {{ lastUpdated }}
            </div>
          </div>
        </div>
 
        <div
          v-if="connectionError"
          class="alert alert-warning py-2 mt-3 mb-0"
        >
          ⚠️ Connection problem - retrying every 5 seconds.
          The data shown may be old.
        </div>
 
        <hr>
 
        <div class="row align-items-end g-3">
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
 
          <div class="col-lg-8 d-flex flex-wrap align-items-center gap-3">
            <div class="form-check form-switch mb-0">
              <input
                id="followSwitch"
                v-model="followEnabled"
                class="form-check-input"
                type="checkbox"
              >
              <label class="form-check-label" for="followSwitch">
                Auto-follow pilot
              </label>
            </div>
 
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="fitAll"
            >
              <i class="bi bi-arrows-fullscreen me-1"></i>
              Fit all pilots
            </button>
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
        <span class="text-muted fw-normal small ms-2">
          (click a pilot to zoom to the pin)
        </span>
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
          @click="focusPilot(pilot)"
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
 
/* Abort a request that hangs longer than this */
const REQUEST_TIMEOUT_MS = 8000
 
/* How many past positions to draw as a trail per pilot */
const MAX_TRAIL_POINTS = 100
 
let L = null
let map = null
 
const locations = ref([])
const pilots = ref([])
const selectedLocation = ref('')
const lastUpdated = ref(null)
const connectionError = ref(false)
 
/* Map follows the pilot when exactly one pilot has GPS */
const followEnabled = ref(true)
 
/*
| Markers are kept by Airspace Session ID:
| { marker, state, trail (polyline), points: [[lat, lng], ...] }
*/
const markerMap = new Map()
 
let refreshTimer = null
let isLoading = false
let kmlLayers = []
let didInitialFit = false
 
 
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
 
  // If the admin drags the map by hand, stop auto-following.
  map.on('dragstart', () => {
    followEnabled.value = false
  })
 
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
        headers: { Authorization: `Bearer ${authStore.token}` },
        timeout: REQUEST_TIMEOUT_MS
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
 
    // timeout: a hung request can no longer block all future refreshes
    const response = await $fetch(url, {
      headers: { Authorization: `Bearer ${authStore.token}` },
      timeout: REQUEST_TIMEOUT_MS,
      retry: 0
    })
 
    connectionError.value = false
 
    if (!Array.isArray(response)) {
      pilots.value = []
      removeMissingMarkers(new Set())
      return
    }
 
    pilots.value = response
    lastUpdated.value = new Date().toLocaleTimeString()
 
    updateMarkers(response)
  } catch (e) {
    connectionError.value = true
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
 
    let entry = markerMap.get(sessionId)
 
    if (entry) {
      entry.marker.setLatLng([latitude, longitude])
 
      if (entry.state !== state) {
        entry.marker.setIcon(createAirplaneIcon(state))
        entry.state = state
      }
 
      entry.marker.setPopupContent(popup)
    } else {
      const marker = L.marker([latitude, longitude], {
        icon: createAirplaneIcon(state)
      })
        .addTo(map)
        .bindPopup(popup)
 
      marker.on('click', () => {
        const pos = marker.getLatLng()
        followEnabled.value = false
        map.flyTo([pos.lat, pos.lng], 16, { animate: true, duration: 1 })
      })
 
      const trail = L.polyline([], {
        color: '#0d6efd',
        weight: 3,
        opacity: 0.6,
        dashArray: '6 6'
      }).addTo(map)
 
      entry = { marker, state, trail, points: [] }
 
      markerMap.set(sessionId, entry)
    }
 
    /* Trail: only real GPS points, and only if the position changed */
    if (hasGps) {
      const last = entry.points[entry.points.length - 1]
 
      if (!last || last[0] !== latitude || last[1] !== longitude) {
        entry.points.push([latitude, longitude])
 
        if (entry.points.length > MAX_TRAIL_POINTS) {
          entry.points.shift()
        }
 
        entry.trail.setLatLngs(entry.points)
      }
    }
  })
 
  removeMissingMarkers(activeSessionIds)
 
  handleCamera()
}
 
function removeMissingMarkers(activeSessionIds) {
  if (!map) return
 
  markerMap.forEach((data, sessionId) => {
    if (!activeSessionIds.has(sessionId)) {
      if (map.hasLayer(data.marker)) map.removeLayer(data.marker)
      if (map.hasLayer(data.trail)) map.removeLayer(data.trail)
      markerMap.delete(sessionId)
    }
  })
}
 
function clearMarkers() {
  if (!map) return
 
  markerMap.forEach(data => {
    if (map.hasLayer(data.marker)) map.removeLayer(data.marker)
    if (map.hasLayer(data.trail)) map.removeLayer(data.trail)
  })
 
  markerMap.clear()
}
 
 
/*
|--------------------------------------------------------------------------
| CAMERA
|--------------------------------------------------------------------------
*/
function handleCamera() {
  if (!map || markerMap.size === 0) return
 
  // First time pilots appear -> show all of them.
  if (!didInitialFit) {
    didInitialFit = true
    fitAll()
    return
  }
 
  // Follow mode: keep a single pilot in view without changing zoom.
  if (followEnabled.value && markerMap.size === 1) {
    const [entry] = markerMap.values()
    map.panTo(entry.marker.getLatLng(), { animate: true, duration: 0.8 })
  }
}
 
function fitAll() {
  if (!map || !L || markerMap.size === 0) return
 
  const latLngs = []
 
  markerMap.forEach(data => {
    latLngs.push(data.marker.getLatLng())
  })
 
  if (latLngs.length === 1) {
    map.setView(latLngs[0], 15)
    return
  }
 
  map.fitBounds(L.latLngBounds(latLngs), {
    padding: [60, 60],
    maxZoom: 15
  })
}
 
function focusPilot(session) {
  if (!map) return
 
  const entry = markerMap.get(String(session.id))
 
  if (!entry) return
 
  followEnabled.value = false
 
  const pos = entry.marker.getLatLng()
 
  map.flyTo([pos.lat, pos.lng], 16, { animate: true, duration: 1 })
 
  entry.marker.openPopup()
 
  // Scroll the map into view on small screens
  document.getElementById('map')?.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
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
  cursor: pointer;
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
 