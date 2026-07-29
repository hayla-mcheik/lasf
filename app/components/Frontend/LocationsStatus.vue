<template>
  <div class="enhanced-locations-status">

    <!-- Dashboard Statistics -->
    <div
      class="row g-4 mb-5"
      v-if="!pending"
    >
      <div
        v-for="stat in dashboardStats"
        :key="stat.id"
        class="col-md-4 col-lg-3"
      >
        <div
          class="stat-card"
          :style="{ background: stat.background }"
        >

          <div
            class="stat-icon"
            :style="{
              backgroundColor: stat.iconBg,
              color: stat.color
            }"
          >
            <i
              class="bi"
              :class="stat.icon"
            />
          </div>

          <div class="stat-content">

            <div class="stat-value">
              {{ stat.value }}
            </div>

            <div class="stat-label">
              {{ stat.label }}
            </div>

          </div>

        </div>
      </div>
    </div>

    <!-- MAP -->
    <div class="map-preview mb-5">

      <div
        class="map-header d-flex justify-content-between align-items-center"
      >

        <h4 class="mb-0 text-white">
          <i class="bi bi-globe-americas me-2"></i>

          Lebanon Flying Locations
        </h4>

        <button
          class="btn btn-outline-light btn-sm"
          @click="showMap = !showMap"
        >

          <i
            class="bi"
            :class="showMap ? 'bi-list' : 'bi-map'"
          ></i>

          {{ showMap ? 'Hide Map' : 'Show Map' }}

        </button>

      </div>

      <div
        class="map-container"
        v-show="showMap"
      >

        <div id="locations-map"></div>

      </div>

    </div>

    <!-- SECTION HEADER -->

    <div class="section-header mb-5">

      <h3 class="section-title">

        {{ limit > 0 ? 'Featured Locations' : 'All Flying Locations' }}

      </h3>

      <div
        class="section-controls"
        v-if="limit === 0"
      >

        <div class="search-box">

          <i class="bi bi-search"></i>

          <input

            v-model="searchQuery"

            class="search-input"

            placeholder="Search locations..."

            type="text"

          >

        </div>

        <div class="filter-buttons">

          <button

            v-for="filter in filterOptions"

            :key="filter.id"

            class="filter-btn"

            :class="{ active: activeFilter === filter.id }"

            @click="activeFilter = filter.id"

          >

            <i :class="filter.icon"></i>

            {{ filter.name }}

          </button>

        </div>

      </div>

    </div>

    <!-- LOCATION CARDS -->

    <div
      class="row g-4"
      v-if="displayLocations.length"
    >

      <div

        v-for="loc in displayLocations"

        :key="loc.id"

        class="col-xl-4 col-lg-6"

      >

        <LocationCard
          :location="loc"
        />

      </div>

    </div>

    <div

      v-else-if="!pending"

      class="text-center py-5 bg-white rounded-4 shadow-sm"

    >

      <i class="bi bi-airplane-engines fs-1 text-muted"></i>

      <h4 class="mt-3">

        No matching locations found

      </h4>

      <button

        v-if="limit === 0"

        class="btn btn-link"

        @click="resetFilters"

      >

        Reset Filters

      </button>

    </div>

    <div

      v-if="limit > 0 && locations.length > limit"

      class="text-center mt-5"

    >

      <NuxtLink

        to="/location"

        class="btn btn-success btn-lg px-5 rounded-pill"

      >

        Explore All Locations

        <i class="bi bi-arrow-right ms-2"></i>

      </NuxtLink>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

import 'leaflet/dist/leaflet.css'
import LocationCard from './LocationCard.vue'
let L = null
const props = defineProps({
  limit: {
    type: Number,
    default: 0
  }
})

const config = useRuntimeConfig()

// Search & Filters
const searchQuery = ref('')
const activeFilter = ref('all')

// Map
const showMap = ref(true)
let map = null
let markers = []

// Fetch Locations
const { data: locationsData, pending } = await useFetch(
  `${config.public.apiBase}/flying-locations`,
  {
    transform: (res) => res.data || res
  }
)

const locations = computed(() => locationsData.value || [])

// Status
const getStatusKey = (location) => {
    return location.status_label
}

const getStatusBootstrapColor = (status) => {
  switch (status) {
    case 'green':
      return 'success'

    case 'yellow':
      return 'warning'

    case 'red':
      return 'danger'

    default:
      return 'secondary'
  }
}

// Filters
const displayLocations = computed(() => {

  let filtered = locations.value.filter(location => {

    const status = getStatusKey(location)

    const matchesSearch =
      location.name
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase())

    const matchesFilter =
      activeFilter.value === 'all' ||
      status === activeFilter.value

    return matchesSearch && matchesFilter

  })

  if (props.limit > 0) {
    filtered = filtered.slice(0, props.limit)
  }

  return filtered

})

// Dashboard Cards
const dashboardStats = computed(() => [

  {
    id: 1,
    value: locations.value.filter(l => getStatusKey(l) === 'green').length,
    label: 'Open',
    icon: 'bi-check-circle-fill',
    color: '#198754',
    iconBg: 'rgba(25,135,84,.15)',
    background:
      'linear-gradient(135deg,#ecfdf3,#ffffff)'
  },

  {
    id: 2,
    value: locations.value.filter(l => getStatusKey(l) === 'yellow').length,
    label: 'Pending',
    icon: 'bi-exclamation-triangle-fill',
    color: '#ffc107',
    iconBg: 'rgba(255,193,7,.15)',
    background:
      'linear-gradient(135deg,#fff8e1,#ffffff)'
  },

  {
    id: 3,
    value: locations.value.filter(l => getStatusKey(l) === 'red').length,
    label: 'Closed',
    icon: 'bi-x-circle-fill',
    color: '#dc3545',
    iconBg: 'rgba(220,53,69,.15)',
    background:
      'linear-gradient(135deg,#fdecec,#ffffff)'
  },
])

const filterOptions = [

  {
    id: 'all',
    name: 'All',
    icon: 'bi-grid'
  },

  {
    id: 'green',
    name: 'Open',
    icon: 'bi-check-circle'
  },

  {
    id: 'yellow',
    name: 'Pending',
    icon: 'bi-exclamation-triangle'
  },

  {
    id: 'red',
    name: 'Closed',
    icon: 'bi-x-circle'
  }

]

const resetFilters = () => {

  searchQuery.value = ''
  activeFilter.value = 'all'

}
// ===========================================
// LEAFLET MAP
// ===========================================

const drawMap = async () => {
  if (!process.client) return

  if (!L) {
    const leaflet = await import('leaflet')
    L = leaflet.default
  }
  if (!showMap.value) return

  await nextTick()

  const container = document.getElementById('locations-map')

  if (!container) return

  // Destroy previous map
  if (map) {
    map.remove()
    map = null
  }

  map = L.map('locations-map', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([33.8547, 35.8623], 8)

  // Google Maps style tiles
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; OpenStreetMap & CARTO',
      maxZoom: 20
    }
  ).addTo(map)

  markers = []

  displayLocations.value.forEach(location => {

    if (!location.latitude || !location.longitude)
      return

    const status = getStatusKey(location)

    let color = '#198754'

    switch (status) {

      case 'yellow':
        color = '#ffc107'
        break

      case 'red':
        color = '#dc3545'
        break

      default:
        color = '#198754'
    }

    const marker = L.circleMarker(
      [
        Number(location.latitude),
        Number(location.longitude)
      ],
      {
        radius: 10,
        color,
        fillColor: color,
        fillOpacity: 1,
        weight: 3
      }
    )
      .addTo(map)

      .bindPopup(`
        <div style="min-width:220px">

            <h5 class="mb-2">
                ${location.name}
            </h5>

            <div class="mb-2">

                <span
                    class="badge bg-${getStatusBootstrapColor(status)}"
                >
                    ${status.toUpperCase()}
                </span>

            </div>



            <div class="mt-3">

                <a
                    href="/location/${location.slug}"
                    class="btn btn-success btn-sm w-100"
                >
                    View Details
                </a>

            </div>

        </div>
      `)

    markers.push(marker)

  })

  if (markers.length) {

    const group = L.featureGroup(markers)

    map.fitBounds(group.getBounds(), {
      padding: [40, 40]
    })

  }

}

// ===========================================
// WATCHERS
// ===========================================

watch(displayLocations, () => {

  drawMap()

})

watch(showMap, () => {

  if (showMap.value) {

    drawMap()

  }

})

// ===========================================
// LIFECYCLE
// ===========================================

onMounted(() => {

  drawMap()

})
</script>

<style scoped>

.enhanced-locations-status{
    padding:20px 0;
}

/* ===============================
   Dashboard Cards
================================= */

.stat-card{

    border-radius:18px;

    padding:22px;

    display:flex;

    align-items:center;

    gap:18px;

    box-shadow:0 8px 25px rgba(0,0,0,.08);

    transition:.3s;

}

.stat-card:hover{

    transform:translateY(-5px);

}

.stat-icon{

    width:65px;

    height:65px;

    border-radius:16px;

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:1.8rem;

}

.stat-content{

    flex:1;

}

.stat-value{

    font-size:2.3rem;

    font-weight:700;

    line-height:1;

}

.stat-label{

    color:#666;

}

/* ===============================
   MAP
================================= */

.map-preview{

    background:#fff;

    border-radius:18px;

    overflow:hidden;

    box-shadow:0 8px 25px rgba(0,0,0,.08);

}

.map-header{

    background:linear-gradient(135deg,#0b5d1e,#1d9c45);

    padding:18px 25px;

}

#locations-map{

    width:100%;

    height:550px;

    border-radius:0;

}

/* ===============================
   Section Header
================================= */

.section-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    gap:20px;

    flex-wrap:wrap;

}

.section-title{

    font-size:2rem;

    font-weight:700;

}

.section-controls{

    display:flex;

    align-items:center;

    gap:15px;

    flex-wrap:wrap;

}

/* ===============================
   Search
================================= */

.search-box{

    position:relative;

}

.search-box i{

    position:absolute;

    left:14px;

    top:50%;

    transform:translateY(-50%);

    color:#999;

}

.search-input{

    width:260px;

    padding:10px 15px 10px 42px;

    border:2px solid #ddd;

    border-radius:12px;

    transition:.3s;

}

.search-input:focus{

    outline:none;

    border-color:#198754;

    box-shadow:0 0 0 4px rgba(25,135,84,.1);

}

/* ===============================
   Filters
================================= */

.filter-buttons{

    display:flex;

    gap:10px;

    flex-wrap:wrap;

}

.filter-btn{

    border:none;

    border-radius:12px;

    padding:10px 18px;

    background:#fff;

    border:2px solid #ddd;

    transition:.3s;

    cursor:pointer;

    font-weight:600;

}

.filter-btn:hover{

    border-color:#198754;

    color:#198754;

}

.filter-btn.active{

    background:#198754;

    color:#fff;

    border-color:#198754;

}

/* ===============================
   Leaflet Popup
================================= */

:deep(.leaflet-popup-content){

    margin:15px;

    font-family:inherit;

}

:deep(.leaflet-popup-content h5){

    font-weight:700;

}

:deep(.leaflet-popup-content-wrapper){

    border-radius:15px;

}

:deep(.leaflet-popup-tip){

    background:#fff;

}

/* ===============================
   Responsive
================================= */

@media(max-width:992px){

    .section-header{

        flex-direction:column;

        align-items:flex-start;

    }

    .section-controls{

        width:100%;

        flex-direction:column;

    }

    .search-input{

        width:100%;

    }

    #locations-map{

        height:450px;

    }

}

@media(max-width:768px){

    .stat-card{

        padding:18px;

    }

    .stat-value{

        font-size:1.8rem;

    }

    #locations-map{

        height:380px;

    }

}

</style>