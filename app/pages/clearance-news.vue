<template>
  <Breadcrumbs />
  <div class="clearance-news-page">
    <div class="page-header py-5 bg-dark">
      <div class="container">
        <h1 class="mb-2 text-white">Flight Clearance & Notices</h1>
        <p class="text-white-50">Official updates from LASF and aviation authorities</p>
      </div>
    </div>

    <div class="container pb-5 mt-n4">
      <div class="row">
        <div class="col-lg-12">
          
          <div v-if="pending" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Synchronizing flight notices...</p>
          </div>

          <div v-else>
            <div v-if="emergencyNotice" class="emergency-notice alert alert-danger mb-4 shadow-sm border-start border-5 border-danger">
              <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-3 fs-1"></i>
                <div>
                  <h4 class="mb-1 fw-bold">{{ emergencyNotice.title }}</h4>
                  <p class="mb-2 fs-5">{{ emergencyNotice.content }}</p>
                  <div class="d-flex flex-wrap gap-3">
                    <small class="fw-bold">
                      <i class="bi bi-clock me-1"></i>
                      Posted: {{ formatDate(emergencyNotice.published_at || emergencyNotice.created_at) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div class="category-filters mb-4">
              <div class="btn-group flex-wrap shadow-sm bg-white p-2 rounded-pill" role="group">
                <button 
                  class="btn rounded-pill px-4 me-2"
                  :class="activeCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'"
                  @click="activeCategory = 'all'"
                >
                  All Notices <span class="badge ms-1 bg-white text-primary">{{ newsItems?.length || 0 }}</span>
                </button>
                <button 
                  v-for="category in categoriesList" 
                  :key="category.id"
                  class="btn rounded-pill px-4 me-2"
                  :class="activeCategory === category.name ? 'btn-primary' : 'btn-outline-primary'"
                  @click="activeCategory = category.name"
                >
                  {{ category.name }}
                </button>
              </div>
            </div>

            <div class="news-list" v-if="filteredNews.length > 0">
              <div v-for="item in filteredNews" :key="item.id" class="news-card mb-4">
                <div class="card shadow-sm border-0">
                  <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span class="badge py-2 px-3 text-uppercase" :class="getCategoryClass(item.categories?.[0]?.name)">
                          {{ item.categories?.[0]?.name || 'Notice' }}
                        </span>
                        <span v-if="isHighPriority(item)" class="badge bg-danger ms-2 py-2 px-3">
                          <i class="bi bi-exclamation-circle me-1"></i>High Priority
                        </span>
                      </div>
                      <small class="text-muted fw-bold">
                        <i class="bi bi-calendar3 me-1"></i>
                        {{ formatDate(item.published_at || item.created_at) }}
                      </small>
                    </div>
                    
                    <h4 class="card-title mb-3 fw-bold text-dark">{{ item.title }}</h4>
                    <p class="card-text fs-5 text-secondary">{{ item.content }}</p>
                    
                    <div v-if="getLocations(item).length > 0" class="affected-locations mt-4 p-3 bg-light rounded-3">
                      <h6 class="mb-2 fw-bold text-dark">
                        <i class="bi bi-geo-alt-fill me-1 text-danger"></i>Affected Locations:
                      </h6>
                      <div class="location-tags d-flex flex-wrap gap-2">
                        <span 
                          v-for="location in getLocations(item)" 
                          :key="location.id || location"
                          class="badge bg-white text-dark border py-2 px-3 shadow-sm"
                        >
                          {{ location.name || location }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-5 bg-white shadow-sm rounded-4">
              <i class="bi bi-check-circle-fill text-success fs-1 mb-3 d-block"></i>
              <h4 class="fw-bold">No Active Notices</h4>
              <p class="text-muted">There are no updates currently listed for this category.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();

// 1. Fetch Real Data from API
const { data: newsItems, pending } = await useFetch(`${config.public.apiBase}/news`, {
  key: 'clearance-page-data',
  transform: (res) => res.data || res
});

const { data: categoriesList } = await useFetch(`${config.public.apiBase}/news-categories`);

// 2. State
const activeCategory = ref('all');

// 3. Computed Logic
const emergencyNotice = computed(() => {
  // Finds items with "Restriction" category or high priority keywords
  return newsItems.value?.find(item => 
    item.categories?.[0]?.name === 'Restriction' || item.title.toLowerCase().includes('emergency')
  );
});

const filteredNews = computed(() => {
  let list = newsItems.value || [];
  
  // Exclude the one shown in emergency banner to avoid duplication
  if (emergencyNotice.value) {
    list = list.filter(i => i.id !== emergencyNotice.value.id);
  }

  if (activeCategory.value === 'all') return list;
  
  return list.filter(item => item.categories?.[0]?.name === activeCategory.value);
});

// 4. Helper Functions
const getLocations = (item) => {
  return item.affected_locations || item.affectedLocations || [];
};

const isHighPriority = (item) => {
  return item.categories?.[0]?.name === 'Restriction' || item.priority === 'high';
};

const getCategoryClass = (name) => {
  switch (name) {
    case 'Clearance': return 'bg-success';
    case 'Weather': return 'bg-info text-dark';
    case 'Restriction': return 'bg-danger';
    case 'Notice': return 'bg-warning text-dark';
    default: return 'bg-secondary';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-LB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  border-bottom: 5px solid darkgreen;
}

.mt-n4 {
  margin-top: -2.5rem;
}

.category-filters .btn {
  transition: all 0.3s ease;
  font-weight: 600;
}

.news-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 1rem 3rem rgba(0,0,0,0.1) !important;
}

.emergency-notice {
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(220, 53, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
}

.badge {
  font-weight: 700;
  letter-spacing: 0.5px;
}
.category-filters .btn{
  background-color: darkgreen;
  border: 1px solid darkgreen;
}
</style>