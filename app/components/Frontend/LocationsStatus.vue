<template>
  <div class="enhanced-locations-status">
    <div class="row g-4 mb-5" v-if="!pending">
      <div v-for="stat in dashboardStats" :key="stat.id" class="col-md-4 col-lg-3" data-aos="fade-up">
        <div class="stat-card" :style="{ background: stat.background }">
          <div class="stat-icon" :style="{ backgroundColor: stat.iconBg, color: stat.color }">
            <i class="bi" :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="map-preview mb-5" data-aos="fade-up">
      <div class="map-header d-flex justify-content-between align-items-center">
        <h4 class="mb-0 text-white"><i class="bi bi-globe-americas me-2"></i>Lebanon Flying Locations Map</h4>
        <button class="btn btn-outline-light btn-sm" @click="showMap = !showMap">
          <i class="bi" :class="showMap ? 'bi-list' : 'bi-map'"></i>
          {{ showMap ? 'Hide Map' : 'Show Map' }}
        </button>
      </div>
      <div class="map-container" v-if="showMap">
        <div class="lebanon-map">
          <div class="map-overlay"></div>
          <div 
            v-for="loc in locations" 
            :key="loc.id"
            class="map-marker"
            :class="'marker-' + getStatusKey(loc)"
            :style="{ 
              left: calculateMapPos(loc).x + '%', 
              top: calculateMapPos(loc).y + '%' 
            }"
            @mouseenter="hoverLocation = loc.id"
            @mouseleave="hoverLocation = null"
            @click="navigateTo(`/location/${loc.slug}`)"
          >
            <div class="marker-dot"></div>
            <div class="marker-pulse"></div>
            <div class="marker-tooltip" :class="{ 'show': hoverLocation === loc.id }">
              <div class="tooltip-header">
                <span class="badge" :class="'bg-' + getStatusBootstrapColor(getStatusKey(loc))">
                  {{ getStatusKey(loc).toUpperCase() }}
                </span>
                <span v-if="loc.active_sessions_count > 0" class="badge bg-info ms-2">
                  {{ loc.active_sessions_count }} active
                </span>
              </div>
              <div class="tooltip-body">
                <h6 class="fw-bold text-dark">{{ loc.name }}</h6>
                <small class="text-muted">{{ loc.region }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="locations-grid">
      <div class="section-header mb-5">
        <h3 class="section-title">
          {{ limit > 0 ? 'Featured Locations' : 'All Flying Locations' }}
        </h3>
        <div class="section-controls" v-if="limit === 0">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input v-model="searchQuery" type="text" placeholder="Search locations..." class="search-input">
          </div>
          <div class="filter-buttons">
            <button 
              v-for="filter in filterOptions" :key="filter.id"
              class="filter-btn" :class="{ 'active': activeFilter === filter.id }"
              @click="activeFilter = filter.id"
            >
              <i :class="filter.icon"></i> {{ filter.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="row g-4" v-if="displayLocations.length > 0">
        <div v-for="loc in displayLocations" :key="loc.id" class="col-xl-4 col-lg-6">
          <LocationCard :location="loc" />
        </div>
      </div>

      <div v-else-if="!pending" class="text-center py-5 bg-white rounded-4 shadow-sm">
        <i class="bi bi-airplane-engines fs-1 text-muted"></i>
        <h4 class="mt-3">No matching locations found</h4>
        <button v-if="limit === 0" class="btn btn-link" @click="resetFilters">Reset filters</button>
      </div>

      <div v-if="limit > 0 && locations.length > limit" class="text-center mt-5">
        <NuxtLink to="/location" class="btn btn-success btn-lg px-5 rounded-pill shadow-lg hover-up">
          Explore All Locations <i class="bi bi-arrow-right ms-2"></i>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import LocationCard from './LocationCard.vue';

const props = defineProps({
  limit: {
    type: Number,
    default: 0 
  }
});

const config = useRuntimeConfig();
const searchQuery = ref('');
const activeFilter = ref('all');
const showMap = ref(true);
const hoverLocation = ref(null);

// 1. Fetch Data
const { data: locationsData, pending } = await useFetch(`${config.public.apiBase}/flying-locations`, {
  transform: (res) => res.data || res
});

const locations = computed(() => locationsData.value || []);

// 2. Logic for Display (Filtering + Limiting)
const displayLocations = computed(() => {
  let list = locations.value.filter(loc => {
    const status = getStatusKey(loc);
    const matchesSearch = loc.name?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesFilter = activeFilter.value === 'all' || status === activeFilter.value;
    return matchesSearch && matchesFilter;
  });

  // Apply limit if passed (e.g., from homepage)
  if (props.limit > 0) {
    return list.slice(0, props.limit);
  }
  return list;
});

// 3. Helpers
const getStatusKey = (loc) => {
  const s = loc?.clearance_statuses?.[0]?.status || 'green';
  return s === 'green' ? 'cleared' : 'closed';
};

const getStatusBootstrapColor = (key) => key === 'cleared' ? 'success' : 'danger';

const calculateMapPos = (loc) => {
  if (!loc?.longitude || !loc?.latitude) return { x: 50, y: 50 };
  const x = ((loc.longitude - 35.0) / 1.6) * 100;
  const y = (1 - (loc.latitude - 33.0) / 1.8) * 100;
  return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
};

const dashboardStats = computed(() => {
  const list = locations.value;
  return [
    {
      id: 1,
      value: list.filter(l => getStatusKey(l) === 'cleared').length,
      label: 'Cleared Zones',
      icon: 'bi-check-circle-fill',
      color: '#198754',
      iconBg: 'rgba(25, 135, 84, 0.1)',
      background: 'linear-gradient(135deg, rgba(25, 135, 84, 0.05) 0%, white 100%)'
    },
    {
      id: 2,
      value: list.filter(l => getStatusKey(l) === 'closed').length,
      label: 'Closed Zones',
      icon: 'bi-x-circle-fill',
      color: '#dc3545',
      iconBg: 'rgba(220, 53, 69, 0.1)',
      background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, white 100%)'
    },
    {
      id: 3,
      value: list.reduce((sum, l) => sum + (l.active_sessions_count || 0), 0),
      label: 'Live Pilots',
      icon: 'bi-people-fill',
      color: '#0d6efd',
      iconBg: 'rgba(13, 110, 253, 0.1)',
      background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.05) 0%, white 100%)'
    }
  ];
});

const filterOptions = [
  { id: 'all', name: 'All', icon: 'bi-grid' },
  { id: 'cleared', name: 'Cleared', icon: 'bi-check-circle' },
  { id: 'closed', name: 'Closed', icon: 'bi-x-circle' }
];

const resetFilters = () => { searchQuery.value = ''; activeFilter.value = 'all'; };
</script>

<style scoped>
.enhanced-locations-status {
  padding: 20px 0;
}

.stat-card {
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
  color: #333;
}

.stat-label {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 0.85rem;
  font-weight: 600;
}

.map-preview {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.map-header {
  background: linear-gradient(135deg, darkgreen 0%, #fff 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-container {
  padding: 24px;
}

.lebanon-map {
  position: relative;
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #e3fde9 0%, #7a9f80 100%);
  border-radius: 12px;
  overflow: hidden;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2390caf9' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.5;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 2;
}

.marker-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.marker-cleared .marker-dot {
  background: #198754;
  box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.3);
}

.marker-restricted .marker-dot {
  background: #ffc107;
  box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.3);
}

.marker-closed .marker-dot {
  background: #dc3545;
  box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.3);
}

/* 1. Ensure the active marker is above all other markers on the map */
.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  /* Lower base z-index */
  z-index: 5; 
  transition: z-index 0.3s;
}

.map-marker:hover {
  /* Higher z-index on hover so this dot's tooltip is never hidden by another dot */
  z-index: 99; 
}

/* 2. The Pulse Animation */
.marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  opacity: 0;
  /* Keep pulse at the back */
  z-index: 1; 
}

/* 3. The Dot itself */
.marker-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: relative;
  /* Dot sits above pulse */
  z-index: 2; 
}

/* 4. The Tooltip (Popup) */
.marker-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  /* High z-index to stay above pulse and dot */
  z-index: 10; 
}

.marker-tooltip.show {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-5px);
}
.tooltip-header {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.tooltip-body h6 {
  margin: 0;
  font-size: 1rem;
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.4rem;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  padding: 10px 16px 10px 40px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  width: 250px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: darkgreen;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.filter-btn[data-v-e33f81de] {
    padding: 8px 8px;
    border: 2px solid #e9ecef;
    background: white;
    border-radius: 12px;
    color: #000;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    cursor: pointer;
    font-size: 1.6rem;
}

.filter-btn:hover {
  border-color: darkgreen;
  color: darkgreen;
}

.filter-btn.active {
  background: darkgreen;
  border-color: darkgreen;
  color: white;
}

.empty-locations {
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  color: #6c757d;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .section-controls {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .filter-buttons {
    justify-content: center;
  }
}
.map-header h4{
  color:white;
}
</style>