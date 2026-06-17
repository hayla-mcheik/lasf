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
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap'
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

      const marker = L.marker([
        Number(gps.latitude),
        Number(gps.longitude)
      ])
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

    if (response.length > 0) {

      const firstGps = response[0]?.locations?.[0]

      if (firstGps) {
        map.setView(
          [
            Number(firstGps.latitude),
            Number(firstGps.longitude)
          ],
          13
        )
      }

    }

  } catch (error) {
    console.error('Failed loading pilots', error)
  }

}
</script>
<style scoped>
#map {
  width: 100%;
  height: 700px;
  border-radius: 12px;
  overflow: hidden;
}

.card {
  border-radius: 12px;
}
</style>