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

          </div>

        </div>

        <hr>

        <div class="row">

          <div class="col-lg-4">

            <label class="fw-bold mb-2">
              Flying Location
            </label>

            <select
              v-model="selectedLocation"
              class="form-select"
              @change="loadPilots"
            >

              <option value="">
                Select Flying Location
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
    </div>

    <!-- MAP -->

    <div class="card shadow-sm border-0">

      <div class="card-body p-0">

        <div id="map"></div>

      </div>

    </div>

    <!-- ACTIVE PILOTS -->

    <div class="card shadow-sm border-0 mt-4">

      <div class="card-header bg-white fw-bold">

        <i class="bi bi-people-fill me-2"></i>

        Active Pilots

      </div>

      <div class="card-body">

        <div
          v-if="pilots.length==0"
          class="text-center text-muted py-5"
        >

          <i class="bi bi-airplane display-3"></i>

          <p class="mt-3">
            No pilots currently flying.
          </p>

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

              <h5>

                {{ pilot.pilot?.name }}

              </h5>

              <small class="text-muted">

            {{ pilot.location?.name }}

              </small>

            </div>

          </div>

<div class="pilot-card-right">

    <span class="badge bg-success">
        Flying
    </span>

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
// import { loadKml } from '~/utils/loadKmz'
definePageMeta({
    layout: 'admin'
})

const config = useRuntimeConfig()
const authStore = useAuthStore()

// Leaflet (loaded only on client)
let L = null
let map = null
let airplaneIcon = null

const locations = ref([])
const pilots = ref([])
const selectedLocation = ref('')

let markers = []
let kmlLayer = null
let refreshTimer = null

onMounted(async () => {

    if (!process.client) return

    // Load Leaflet only in browser
// Load Leaflet only on the client
const leaflet = await import('leaflet')
L = leaflet.default

if (!L) {
    console.error('Leaflet failed to load')
    return
}

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// Airplane marker
airplaneIcon = L.divIcon({
    html: `
        <div class="airplane-marker">
            <i class="bi bi-airplane-fill"></i>
        </div>
    `,
    className: 'custom-airplane-icon',
    iconSize: [44, 44],
iconAnchor: [24,24],
popupAnchor: [0,-24],
})

    // Create map
    map = L.map('map', {
        zoomControl: true
    }).setView([33.8547, 35.8623], 8)

    // Same style as Flying Locations page
    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap & CARTO'
        }
    ).addTo(map)
function drawPolygons() {
    if (!map) return

    locations.value.forEach(location => {

        if (
            !location.kml_polygon ||
            !Array.isArray(location.kml_polygon)
        ) {
            return
        }

        location.kml_polygon.forEach(polygon => {

            const points = polygon.map(point => [
                Number(point.lat),
                Number(point.lng)
            ])

            L.polygon(points, {
                weight: 3,
                fillOpacity: 0.25
            }).addTo(map)

        })

    })
}

setTimeout(() => {
    map.invalidateSize()
}, 200)

    await loadLocations()
    drawPolygons()
    await loadPilots()

    refreshTimer = setInterval(() => {
   loadPilots()
    }, 10000)

})

onUnmounted(() => {

    if (refreshTimer) {
        clearInterval(refreshTimer)
    }

    clearMarkers()

    if (map) {
        map.remove()
        map = null
    }

    L = null

})

function getSelectedLocationName() {

    const loc = locations.value.find(
        l => l.id == selectedLocation.value
    )

    return loc?.name || ''

}

async function loadLocations() {

    try {

        const response = await $fetch(
            `${config.public.apiBase}/admin/flying-locations`,
            {
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        )

        locations.value = response.data || response

    } catch (e) {

        console.error(e)

    }

}

function clearMarkers() {

    if (!map) return

    markers.forEach(marker => {

        if (map.hasLayer(marker)) {
            map.removeLayer(marker)
        }

    })

    markers = []

}

async function loadPilots() {
    try {
        const url = selectedLocation.value
            ? `${config.public.apiBase}/admin/gps/live/${selectedLocation.value}`
            : `${config.public.apiBase}/admin/gps/live`

        const response = await $fetch(url, {
            headers: {
                Authorization: `Bearer ${authStore.token}`
            }
        })

        pilots.value = response
        console.log(response)

        // Clear old markers
        clearMarkers()

        if (!Array.isArray(response) || !map) {
            pilots.value = []
            return
        }

        // Add markers for each pilot
        response.forEach(session => {
            const gps = session.gps
            if (!gps) return

            // Phone formatting (for contact buttons)
            const rawPhone = session.pilot?.phone ?? ''
            let phone = rawPhone.replace(/\D/g, '')
            if (phone.startsWith('0')) {
                phone = phone.substring(1)
            }
            if (!phone.startsWith('961')) {
                phone = '961' + phone
            }

            const mapsUrl = `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`

            // Choose marker icon (danger if outside zone)
            const currentIcon = L.divIcon({
                html: `
                    <div class="${session.outside_zone ? 'airplane-marker-danger' : 'airplane-marker'}">
                        <i class="bi bi-airplane-fill"></i>
                    </div>
                `,
                className: 'custom-airplane-icon',
                iconSize: [44, 44],
                iconAnchor: [24, 24],
                popupAnchor: [0, -24],
            })

            const marker = L.marker(
                [Number(gps.latitude), Number(gps.longitude)],
                { icon: currentIcon }
            ).addTo(map)

            // Build popup content
            const contactButtons = authStore.canContactPilots
                ? `
                    <a class="btn btn-primary btn-sm" href="tel:${phone}">📞 Call Pilot</a>
                    <a target="_blank" class="btn btn-success btn-sm" href="https://wa.me/${phone}?text=${encodeURIComponent('⚠️ LASF Emergency: Please land immediately.')}">💬 Send WhatsApp</a>
                  `
                : ''

            marker.bindPopup(`
                <div class="pilot-popup">
                    <div class="popup-header">
                        <div class="popup-icon"><i class="bi bi-airplane-fill"></i></div>
                        <div>
                            <h5>${session.pilot?.name ?? 'Pilot'}</h5>
                            <small>📍 ${session.location?.name ?? 'Unknown Location'}</small>
                        </div>
                    </div>
                    <div class="popup-status ${session.outside_zone ? 'popup-status-danger' : ''}">
                        ${session.outside_zone ? '⚠️ Outside Authorized Zone' : '🟢 Currently Flying'}
                    </div>
                    <table class="table table-sm mb-3">
                        <tr><td><strong>Phone</strong></td><td>${rawPhone}</td></tr>
                        <tr><td><strong>Latitude</strong></td><td>${Number(gps.latitude).toFixed(6)}</td></tr>
                        <tr><td><strong>Longitude</strong></td><td>${Number(gps.longitude).toFixed(6)}</td></tr>
                    </table>
                    <div class="d-grid gap-2">
                        ${contactButtons}
                        <a target="_blank" class="btn btn-dark btn-sm" href="${mapsUrl}">🗺️ Google Maps</a>
                    </div>
                </div>
            `)

            // Click on marker → zoom to that pilot
            marker.on('click', () => {
                map.flyTo(
                    [Number(gps.latitude), Number(gps.longitude)],
                    16,
                    { animate: true, duration: 1 }
                )
            })

            markers.push(marker)
        })

        // ❌ REMOVED the auto‑fit‑bounds block – now the map stays at its current zoom/center.
        // The user can manually zoom or click a marker to zoom in.

    } catch (e) {
        console.error(e)
    }
}
</script>

<style scoped>

#map{

    width:100%;

    height:720px;

    border-radius:14px;

}

/***************************
ACTIVE PILOT CARD
****************************/

.pilot-card{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:18px;

    border-radius:12px;

    border:1px solid #eee;

    margin-bottom:12px;

    transition:.3s;

}

.pilot-card:hover{

    transform:translateY(-2px);

    box-shadow:0 10px 25px rgba(0,0,0,.08);

}

.pilot-card-left{

    display:flex;

    align-items:center;

    gap:15px;

}

.pilot-avatar{

    width:55px;

    height:55px;

    border-radius:50%;

    background:#0d6efd;

    display:flex;

    align-items:center;

    justify-content:center;

    color:white;

    font-size:24px;

}

.pilot-card h5{

    margin:0;

    font-weight:700;

}

.pilot-card small{

    color:#888;

}

/***************************
LEAFLET POPUP
****************************/

:deep(.pilot-popup){

    width:260px;

}

:deep(.popup-header){

    display:flex;

    align-items:center;

    gap:15px;

    margin-bottom:15px;

}

:deep(.popup-icon){

    width:55px;

    height:55px;

    border-radius:50%;

    background:#0d6efd;

    display:flex;

    align-items:center;

    justify-content:center;

    color:#fff;

    font-size:24px;

}

:deep(.popup-header h5){

    margin:0;

    font-weight:700;

}

:deep(.popup-status){

    background:#198754;

    color:#fff;

    text-align:center;

    padding:8px;

    border-radius:8px;

    margin-bottom:15px;

    font-weight:bold;

}

:deep(.leaflet-popup-content-wrapper){

    border-radius:16px;

}

:deep(.leaflet-popup-content){

    margin:15px;

}

/***************************
Responsive
****************************/

@media(max-width:768px){

#map{

height:500px;

}

.pilot-card{

flex-direction:column;

align-items:flex-start;

gap:15px;

}

}
:deep(.custom-airplane-icon){
    background: transparent !important;
    border:none !important;
}

:deep(.airplane-marker){
    width:48px;
    height:48px;
    border-radius:50%;
    background:#0d6efd;
    display:flex;
    align-items:center;
    justify-content:center;
    color:#fff;
    border:3px solid #fff;
    box-shadow:0 10px 20px rgba(0,0,0,.25);
}

:deep(.airplane-marker i){
    font-size:22px;
    color:#fff;
}
.outside-warning {

    background: #dc3545;

    color: white;

    padding: 6px 12px;

    border-radius: 8px;

    font-size: 12px;

    font-weight: bold;

}

:deep(.popup-status-danger) {

    background: #dc3545 !important;

}

:deep(.airplane-marker-danger) {

    width: 48px;

    height: 48px;

    border-radius: 50%;

    background: #dc3545;

    display: flex;

    align-items: center;

    justify-content: center;

    color: #fff;

    border: 3px solid #fff;

    box-shadow: 0 10px 20px rgba(0, 0, 0, .25);

}
</style>