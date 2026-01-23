<template>
  <Breadcrumbs />
  <div class="locations-page">
    <div class="controls-section py-5 mt-5">
      <div class="container">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-primary text-white border-0">
                <i class="bi bi-search"></i>
              </span>
              <input 
                v-model="searchQuery" 
                type="text" 
                class="form-control shadow-none" 
                placeholder="Search by name or region..."
              >
            </div>
          </div>
          <div class="col-md-3">
            <select v-model="selectedRegion" class="form-select shadow-none">
              <option value="">All Regions</option>
              <option v-for="region in regions" :key="region" :value="region">
                {{ region }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="selectedSport" class="form-select shadow-none">
              <option value="">All Sports</option>
              <option v-for="sport in sportsList" :key="sport" :value="sport">
                {{ sport }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-5">
      <div v-if="pending" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Fetching latest airspace data...</p>
      </div>

      <div v-else>
        <div class="view-toggle mb-4 d-flex justify-content-between align-items-center">
          <h4 class="mb-0 fw-bold">Flying Locations</h4>
          <div class="d-flex gap-2">
            <div class="btn-group" role="group">
              <button class="btn btn-outline-primary" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><i class="bi bi-grid-3x3-gap"></i></button>
              <button class="btn btn-outline-primary" :class="{ active: viewMode === 'map' }" @click="viewMode = 'map'"><i class="bi bi-map"></i></button>
            </div>
            <div v-if="authStore.isPilot" class="pilot-status-indicator">
              <span v-if="authStore.isPilotFlying" class="badge bg-warning text-dark">
                <i class="bi bi-airplane-engines me-1"></i> Currently Flying
              </span>
              <span v-else class="badge bg-success">
                <i class="bi bi-person-check me-1"></i> Ready to Fly
              </span>
            </div>
          </div>
        </div>

        <div v-if="viewMode === 'grid'" class="row">
          <div 
            v-for="location in filteredLocations" 
            :key="location.id" 
            class="col-xl-4 col-lg-6 mb-4"
          >
            <LocationCard :location="location" />
          </div>
        </div>

        <div v-if="viewMode === 'map'" class="map-view">
          <div class="card shadow border-0 rounded-4 overflow-hidden">
             <div class="bg-light d-flex align-items-center justify-content-center" style="height: 500px;">
                <div class="text-center">
                  <i class="bi bi-map fs-1 text-primary"></i>
                  <p class="fw-bold mt-3">Interactive Airspace Map</p>
                  <small class="text-muted">Currently tracking {{ filteredLocations.length }} zones</small>
                </div>
             </div>
          </div>
        </div>

        <div v-if="filteredLocations.length === 0" class="text-center py-5">
          <i class="bi bi-airplane-engines fs-1 text-muted"></i>
          <h4 class="mt-3">No matching locations found</h4>
          <button class="btn btn-primary mt-2" @click="resetFilters">Clear All Filters</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LocationCard from '~/components/Frontend/LocationCard.vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const searchQuery = ref('')
const selectedRegion = ref('')
const selectedSport = ref('')
const viewMode = ref('grid')

// Fetch dynamic data from Laravel Backend
const { data: locations, pending, refresh } = await useAsyncData('flying-locations', () => 
  $fetch(`${config.public.apiBase}/flying-locations`)
)

// Computed Regions for Filter
const regions = computed(() => {
  if (!locations.value) return []
  const allRegions = locations.value.map(loc => loc.region)
  return [...new Set(allRegions)].filter(Boolean).sort()
})

// Computed Sports for Filter
const sportsList = computed(() => {
  if (!locations.value) return []
  const sports = locations.value.flatMap(loc => loc.sports.map(s => s.name))
  return [...new Set(sports)].sort()
})

// Dynamic Filtering Logic
const filteredLocations = computed(() => {
  if (!locations.value) return []
  
  return locations.value.filter(loc => {
    const matchesSearch = !searchQuery.value || 
      loc.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      loc.region.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesRegion = !selectedRegion.value || loc.region === selectedRegion.value
    
    const matchesSport = !selectedSport.value || 
      loc.sports.some(s => s.name === selectedSport.value)
    
    return matchesSearch && matchesRegion && matchesSport
  })
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedRegion.value = ''
  selectedSport.value = ''
}

// Check pilot session on mount
onMounted(async () => {
  if (authStore.isAuthenticated && authStore.isPilot) {
    await authStore.refreshActiveSession()
  }
  
  const interval = setInterval(refresh, 300000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.locations-page {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.controls-section {
  background: white;
  border-bottom: 1px solid #dee2e6;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.input-group-text {
  background: darkgreen;
  color: white;
  border: 1px solid darkgreen;
}

.form-control, .form-select {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px 15px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: darkgreen;
  box-shadow: 0 0 0 0.25rem rgba(0, 100, 0, 0.1);
}

.view-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-toggle .btn {
  padding: 10px 20px;
  font-size: 1.1rem;
  font-weight: 500;
  border: 2px solid darkgreen;
  color: darkgreen;
  transition: all 0.3s ease;
}

.view-toggle .btn:hover {
  background: rgba(0, 100, 0, 0.1);
}

.view-toggle .btn.active {
  background: darkgreen;
  color: white;
  border-color: darkgreen;
}

.pilot-status-indicator .badge {
  font-size: 0.9rem;
  padding: 8px 12px;
  border-radius: 20px;
}

/* Map View */
.map-container {
  min-height: 500px;
  border-radius: 15px;
  overflow: hidden;
}

/* No Results */
.text-center i.bi-emoji-frown {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Responsive Design */
@media (max-width: 992px) {
  .controls-section {
    padding-top: 30px;
    padding-bottom: 30px;
  }
  
  .view-toggle {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .controls-section .row > div {
    margin-bottom: 15px;
  }
}
</style>