<template>
  <div class="container-fluid py-4">

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">
        <h2 class="fw-bold">
          <i class="bi bi-airplane-fill me-2"></i>
          Live Pilot Tracking
        </h2>

        <div class="row mt-3">
          <div class="col-md-4">
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

    <div id="map"></div>

    <div class="card mt-4 shadow-sm">
      <div class="card-header fw-bold">
        Active Pilots
      </div>

      <div class="card-body">

        <div
          v-if="pilots.length === 0"
          class="text-muted"
        >
          No active pilots
        </div>

        <div
          v-for="pilot in pilots"
          :key="pilot.id"
          class="border-bottom py-2"
        >
          <strong>{{ pilot.pilot?.name }}</strong>

          <br>

          Latitude:
          {{ pilot.locations?.[0]?.latitude }}

          <br>

          Longitude:
          {{ pilot.locations?.[0]?.longitude }}
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuthStore } from '~/stores/auth'


definePageMeta({
  layout: 'admin'
})
const config = useRuntimeConfig()
const authStore = useAuthStore()

const locations = ref([])
const pilots = ref([])
const selectedLocation = ref('')

let map = null
let markers = []
let refreshTimer = null

onMounted(async () => {

  map = L.map('map').setView(
    [33.8547, 35.8623],
    8
  )

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap & CARTO',
    maxZoom: 20
  }
).addTo(map)

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
})

const loadLocations = async () => {

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

  } catch (error) {
    console.error('Failed loading locations', error)
  }

}

const clearMarkers = () => {

  markers.forEach(marker => {
    map.removeLayer(marker)
  })

  markers = []

}

const airplaneIcon = L.icon({
  iconUrl: '/images/airplane-marker.png',

  iconSize: [48, 48],

  iconAnchor: [24, 24],

  popupAnchor: [0, -22]
})
const loadPilots = async () => {

  if (!selectedLocation.value) return

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

    clearMarkers()

    response.forEach(session => {

const gps = session.locations?.[0]

if (!gps) return

const rawPhone = session.pilot?.phone ?? ''

let phone = rawPhone.replace(/\D/g, '')

// Lebanon numbers
if (phone.startsWith('0')) {
    phone = phone.substring(1)
}

if (!phone.startsWith('961')) {
    phone = '961' + phone
}

const mapsUrl =
`https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`

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
<div style="width:260px">

    <h5 class="text-center mb-3">
        ✈️ ${session.pilot?.name ?? 'Pilot'}
    </h5>

    <div class="alert alert-success text-center p-2">
        <strong>🟢 Currently Flying</strong>
    </div>

    <table class="table table-sm">

        <tr>
            <td><strong>📞 Phone</strong></td>
            <td>${rawPhone}</td>
        </tr>

        <tr>
            <td><strong>📍 Latitude</strong></td>
            <td>${Number(gps.latitude).toFixed(6)}</td>
        </tr>

        <tr>
            <td><strong>📍 Longitude</strong></td>
            <td>${Number(gps.longitude).toFixed(6)}</td>
        </tr>

    </table>

    <div class="d-grid gap-2">

        <a
            href="tel:${phone}"
            class="btn btn-primary btn-sm"
        >
            📞 Call Pilot
        </a>

        <a
            href="https://wa.me/${phone}?text=${encodeURIComponent('⚠️ LASF Emergency: Please land immediately.')}"
            target="_blank"
            class="btn btn-success btn-sm"
        >
            💬 Send WhatsApp
        </a>

        <a
            href="${mapsUrl}"
            target="_blank"
            class="btn btn-dark btn-sm"
        >
            🗺️ Open Google Maps
        </a>

    </div>

</div>
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

  } catch (error) {
    console.error('Failed loading pilots', error)
  }

}
</script>
<style scoped>
#map{
    width:100%;
    height:700px;
    border-radius:12px;
}

.pilot-popup{

    width:290px;

    font-family:Arial,sans-serif;

}

.pilot-header{

    display:flex;

    align-items:center;

    gap:15px;

}

.pilot-avatar{

    width:60px;

    height:60px;

    border-radius:50%;

    background:#198754;

    color:white;

    display:flex;

    align-items:center;

    justify-content:center;

    font-size:28px;

}

.pilot-header h5{

    margin:0;

    font-weight:700;

}

.pilot-info{

    display:flex;

    justify-content:space-between;

    margin:10px 0;

    font-size:14px;

}

.pilot-buttons{

    display:grid;

    gap:10px;

    margin-top:20px;

}

.pilot-buttons .btn{

    width:100%;

}
</style>